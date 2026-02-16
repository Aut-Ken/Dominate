package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ==================== TIME TRACKING ====================

func GetTimeLogs(c *gin.Context) {
	taskID := c.Query("task_id")
	var logs []models.TimeLog
	query := config.DB.Order("logged_at DESC")
	if taskID != "" {
		query = query.Where("task_id = ?", taskID)
	}
	query.Find(&logs)
	c.JSON(http.StatusOK, logs)
}

func AddTimeLog(c *gin.Context) {
	var input struct {
		TaskID   string  `json:"taskId"`
		UserID   string  `json:"userId"`
		UserName string  `json:"userName"`
		Hours    float64 `json:"hours"`
		Note     string  `json:"note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log := models.TimeLog{
		ID:       uuid.New().String(),
		TaskID:   input.TaskID,
		UserID:   input.UserID,
		UserName: input.UserName,
		Hours:    input.Hours,
		Note:     input.Note,
	}
	config.DB.Create(&log)

	// Fire webhook
	go fireWebhooks(log.TaskID, "time.logged", map[string]interface{}{
		"taskId": log.TaskID, "user": log.UserName, "hours": log.Hours,
	})

	c.JSON(http.StatusOK, log)
}

func GetTimeStats(c *gin.Context) {
	userID := c.Query("user_id")
	projectID := c.Query("project_id")

	type TimeStat struct {
		TotalHours float64 `json:"totalHours"`
		TaskCount  int     `json:"taskCount"`
	}
	var stat TimeStat

	query := config.DB.Model(&models.TimeLog{})
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if projectID != "" {
		query = query.Joins("JOIN tasks ON tasks.id = time_logs.task_id").Where("tasks.project_id = ?", projectID)
	}
	query.Select("COALESCE(SUM(hours),0) as total_hours, COUNT(DISTINCT task_id) as task_count").Scan(&stat)

	c.JSON(http.StatusOK, stat)
}

// ==================== SPRINT MANAGEMENT ====================

func GetSprints(c *gin.Context) {
	projectID := c.Query("project_id")
	var sprints []models.Sprint
	query := config.DB.Order("created_at DESC")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&sprints)
	c.JSON(http.StatusOK, sprints)
}

func CreateSprint(c *gin.Context) {
	var input struct {
		ProjectID string `json:"projectId"`
		Name      string `json:"name"`
		Goal      string `json:"goal"`
		StartDate string `json:"startDate"`
		EndDate   string `json:"endDate"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sprint := models.Sprint{
		ID:        uuid.New().String(),
		ProjectID: input.ProjectID,
		Name:      input.Name,
		Goal:      input.Goal,
		StartDate: input.StartDate,
		EndDate:   input.EndDate,
		Status:    "Planning",
	}
	config.DB.Create(&sprint)
	c.JSON(http.StatusOK, sprint)
}

func UpdateSprint(c *gin.Context) {
	id := c.Param("id")
	var sprint models.Sprint
	if err := config.DB.First(&sprint, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sprint not found"})
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&sprint).Updates(updates)
	config.DB.First(&sprint, "id = ?", id)
	c.JSON(http.StatusOK, sprint)
}

// ==================== WIKI / MARKDOWN DOCS ====================

func GetWikiPages(c *gin.Context) {
	projectID := c.Query("project_id")
	var pages []models.WikiPage
	query := config.DB.Order("updated_at DESC")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&pages)
	c.JSON(http.StatusOK, pages)
}

func GetWikiPage(c *gin.Context) {
	id := c.Param("id")
	var page models.WikiPage
	if err := config.DB.First(&page, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		return
	}
	c.JSON(http.StatusOK, page)
}

func CreateWikiPage(c *gin.Context) {
	var input struct {
		ProjectID  string `json:"projectId"`
		Title      string `json:"title"`
		Content    string `json:"content"`
		AuthorID   string `json:"authorId"`
		AuthorName string `json:"authorName"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	page := models.WikiPage{
		ID:         uuid.New().String(),
		ProjectID:  input.ProjectID,
		Title:      input.Title,
		Content:    input.Content,
		AuthorID:   input.AuthorID,
		AuthorName: input.AuthorName,
	}
	config.DB.Create(&page)
	c.JSON(http.StatusOK, page)
}

func UpdateWikiPage(c *gin.Context) {
	id := c.Param("id")
	var page models.WikiPage
	if err := config.DB.First(&page, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&page).Updates(updates)
	config.DB.First(&page, "id = ?", id)
	c.JSON(http.StatusOK, page)
}

func DeleteWikiPage(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.WikiPage{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== WEBHOOKS ====================

func GetWebhooks(c *gin.Context) {
	projectID := c.Query("project_id")
	var webhooks []models.Webhook
	query := config.DB
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&webhooks)
	c.JSON(http.StatusOK, webhooks)
}

func CreateWebhook(c *gin.Context) {
	var input struct {
		ProjectID string `json:"projectId"`
		Name      string `json:"name"`
		URL       string `json:"url"`
		Events    string `json:"events"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	wh := models.Webhook{
		ID:        uuid.New().String(),
		ProjectID: input.ProjectID,
		Name:      input.Name,
		URL:       input.URL,
		Events:    input.Events,
		Active:    true,
	}
	config.DB.Create(&wh)
	c.JSON(http.StatusOK, wh)
}

func DeleteWebhook(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Webhook{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func ToggleWebhook(c *gin.Context) {
	id := c.Param("id")
	var wh models.Webhook
	if err := config.DB.First(&wh, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Webhook not found"})
		return
	}
	config.DB.Model(&wh).Update("active", !wh.Active)
	wh.Active = !wh.Active
	c.JSON(http.StatusOK, wh)
}

// ==================== BURNDOWN DATA ====================

func GetBurndownData(c *gin.Context) {
	sprintID := c.Query("sprint_id")
	projectID := c.Query("project_id")

	// Get sprint dates
	var sprint models.Sprint
	if sprintID != "" {
		config.DB.First(&sprint, "id = ?", sprintID)
	} else if projectID != "" {
		config.DB.Where("project_id = ? AND status = ?", projectID, "Active").First(&sprint)
	}

	if sprint.ID == "" {
		c.JSON(http.StatusOK, gin.H{"points": []interface{}{}, "sprint": nil})
		return
	}

	// Count tasks in sprint's project
	var totalTasks int64
	config.DB.Model(&models.Task{}).Where("project_id = ?", sprint.ProjectID).Count(&totalTasks)

	var doneTasks int64
	config.DB.Model(&models.Task{}).Where("project_id = ? AND status = ?", sprint.ProjectID, "Done").Count(&doneTasks)

	// Generate burndown points
	startDate, _ := time.Parse("2006-01-02", sprint.StartDate)
	endDate, _ := time.Parse("2006-01-02", sprint.EndDate)
	totalDays := int(endDate.Sub(startDate).Hours()/24) + 1
	if totalDays <= 0 {
		totalDays = 14
	}

	type BurndownPoint struct {
		Day    int     `json:"day"`
		Date   string  `json:"date"`
		Ideal  float64 `json:"ideal"`
		Actual float64 `json:"actual"`
	}

	points := make([]BurndownPoint, 0)
	now := time.Now()
	for i := 0; i < totalDays; i++ {
		day := startDate.AddDate(0, 0, i)
		idealRemaining := float64(totalTasks) - (float64(totalTasks) * float64(i) / float64(totalDays-1))

		var actual float64
		if day.Before(now) || day.Equal(now) {
			// Simplified: linearly interpolate actual based on done ratio
			progress := float64(i) / float64(totalDays-1)
			actual = float64(totalTasks) - (float64(doneTasks) * progress * 1.2)
			if actual < float64(totalTasks-doneTasks) {
				actual = float64(totalTasks - doneTasks)
			}
		} else {
			actual = -1 // means no data yet
		}

		points = append(points, BurndownPoint{
			Day:    i + 1,
			Date:   day.Format("Jan 2"),
			Ideal:  idealRemaining,
			Actual: actual,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"points":     points,
		"sprint":     sprint,
		"totalTasks": totalTasks,
		"doneTasks":  doneTasks,
	})
}

// ==================== AI ASSISTANT (MiniMax M2.5) ====================

// MiniMax API 配置
var (
	MiniMaxAPIKey = "" // 用户自行填写，或通过环境变量 MINIMAX_API_KEY 设置
	MiniMaxModel  = "MiniMax-M2.5"
	MiniMaxURL    = "https://api.minimax.chat/v1/text/chatcompletion_v2"
)

func init() {
	// 从环境变量读取 API Key
	if key := getEnv("MINIMAX_API_KEY"); key != "" {
		MiniMaxAPIKey = key
	}
}

func getEnv(key string) string {
	// 使用 os 包直接获取
	val, _ := os.LookupEnv(key)
	return val
}

// 收集项目上下文数据，提供给 AI 作为参考
func collectProjectContext() string {
	var projects []models.Project
	config.DB.Find(&projects)

	var tasks []models.Task
	config.DB.Find(&tasks)

	var sprints []models.Sprint
	config.DB.Order("created_at DESC").Limit(10).Find(&sprints)

	var timeLogs []models.TimeLog
	config.DB.Order("logged_at DESC").Limit(20).Find(&timeLogs)

	// 统计数据
	totalTasks := len(tasks)
	todoCount := 0
	inProgressCount := 0
	reviewCount := 0
	doneCount := 0
	for _, t := range tasks {
		switch t.Status {
		case "To Do":
			todoCount++
		case "In Progress":
			inProgressCount++
		case "Review":
			reviewCount++
		case "Done":
			doneCount++
		}
	}

	// 生成上下文摘要
	ctx := fmt.Sprintf("## 项目概况\n\n共 %d 个项目，%d 个任务\n\n", len(projects), totalTasks)

	// 项目列表
	ctx += "### 项目列表\n"
	for _, p := range projects {
		ctx += fmt.Sprintf("- **%s** (状态: %s, 成员数: %d)\n", p.Name, p.Status, p.MemberCount)
	}

	// 任务统计
	ctx += fmt.Sprintf("\n### 任务统计\n- 待办: %d\n- 进行中: %d\n- 审核中: %d\n- 已完成: %d\n- 完成率: %.1f%%\n",
		todoCount, inProgressCount, reviewCount, doneCount,
		func() float64 {
			if totalTasks == 0 {
				return 0
			}
			return float64(doneCount) / float64(totalTasks) * 100
		}())

	// 高优先级任务
	ctx += "\n### 高优先级任务\n"
	highCount := 0
	for _, t := range tasks {
		if t.Priority == "High" && t.Status != "Done" {
			dueDateStr := ""
			if !t.DueDate.IsZero() {
				dueDateStr = t.DueDate.Format("2006-01-02")
			}
			ctx += fmt.Sprintf("- [%s] %s (分配给: %s, 截止: %s)\n", t.Status, t.Title, t.AssigneeName, dueDateStr)
			highCount++
			if highCount >= 10 {
				break
			}
		}
	}
	if highCount == 0 {
		ctx += "- 暂无高优先级未完成任务\n"
	}

	// Sprint 信息
	if len(sprints) > 0 {
		ctx += "\n### 当前 Sprint\n"
		for _, s := range sprints {
			if s.Status == "Active" {
				ctx += fmt.Sprintf("- **%s** (%s → %s): %s\n", s.Name, s.StartDate, s.EndDate, s.Goal)
			}
		}
	}

	// 近期时间记录
	if len(timeLogs) > 0 {
		totalHours := 0.0
		for _, tl := range timeLogs {
			totalHours += tl.Hours
		}
		ctx += fmt.Sprintf("\n### 近期工作量\n- 最近记录: %.1f 小时 (共 %d 条记录)\n", totalHours, len(timeLogs))
	}

	return ctx
}

// 调用 MiniMax API
func callMiniMaxAPI(messages []map[string]string) (string, error) {
	if MiniMaxAPIKey == "" {
		return "", fmt.Errorf("MiniMax API Key 未配置，请设置环境变量 MINIMAX_API_KEY")
	}

	body := map[string]interface{}{
		"model":       MiniMaxModel,
		"messages":    messages,
		"max_tokens":  2048,
		"temperature": 0.7,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", MiniMaxURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+MiniMaxAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API 请求失败: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("解析响应失败: %v", err)
	}

	// 解析 MiniMax 响应
	if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					return content, nil
				}
			}
		}
	}

	// 如果有错误信息
	if errMsg, ok := result["base_resp"].(map[string]interface{}); ok {
		if msg, ok := errMsg["status_msg"].(string); ok && msg != "" {
			return "", fmt.Errorf("API 错误: %s", msg)
		}
	}

	return "", fmt.Errorf("无法解析 AI 响应")
}

// AIAssist - 单次 AI 辅助（兼容旧接口）
func AIAssist(c *gin.Context) {
	var input struct {
		Prompt string `json:"prompt"`
		Type   string `json:"type"` // "describe", "suggestions", "review"
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 如果没配置 API Key，使用模板响应
	if MiniMaxAPIKey == "" {
		response := generateAIResponse(input.Prompt, input.Type)
		c.JSON(http.StatusOK, gin.H{"response": response})
		return
	}

	// 构建消息
	projectCtx := collectProjectContext()
	systemPrompt := fmt.Sprintf(`你是 Dominate 项目管理助手，一个专业、友好的 AI。你可以帮助团队跟进项目进度、分析任务状态、提供建议。

以下是当前项目数据：

%s

请根据用户的请求类型（%s）给出专业、具体的回复。使用 Markdown 格式。`, projectCtx, input.Type)

	messages := []map[string]string{
		{"role": "system", "content": systemPrompt},
		{"role": "user", "content": input.Prompt},
	}

	result, err := callMiniMaxAPI(messages)
	if err != nil {
		// 降级到模板响应
		response := generateAIResponse(input.Prompt, input.Type)
		c.JSON(http.StatusOK, gin.H{"response": response, "fallback": true})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": result})
}

// AIChat - 多轮对话式 AI 跟进
func AIChat(c *gin.Context) {
	var input struct {
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
		ProjectID string `json:"projectId"` // 可选，针对特定项目
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if MiniMaxAPIKey == "" {
		c.JSON(http.StatusOK, gin.H{
			"response": "⚠️ AI 功能未启用。请在 Settings 中配置 MiniMax API Key 后使用。\n\n设置方式：Settings > AI 配置 > 填入 API Key",
		})
		return
	}

	// 收集项目上下文
	projectCtx := collectProjectContext()

	// 如果指定了项目，获取更详细的信息
	projectDetail := ""
	if input.ProjectID != "" {
		var project models.Project
		if err := config.DB.First(&project, "id = ?", input.ProjectID).Error; err == nil {
			var projectTasks []models.Task
			config.DB.Where("project_id = ?", input.ProjectID).Find(&projectTasks)

			projectDetail = fmt.Sprintf("\n\n## 当前聚焦的项目: %s\n", project.Name)
			for _, t := range projectTasks {
				projectDetail += fmt.Sprintf("- [%s][%s] %s", t.Status, t.Priority, t.Title)
				if t.AssigneeName != "" {
					projectDetail += fmt.Sprintf(" (@%s)", t.AssigneeName)
				}
				if !t.DueDate.IsZero() {
					projectDetail += fmt.Sprintf(" 截止: %s", t.DueDate.Format("2006-01-02"))
				}
				projectDetail += "\n"
			}
		}
	}

	systemPrompt := fmt.Sprintf(`你是 Dominate 项目管理 AI 助手。你的职责是：

1. **跟进项目进度** - 分析任务状态、完成率、瓶颈
2. **提供建议** - 对项目管理、优先级排序、资源分配给出专业建议  
3. **风险预警** - 识别延期风险、工作量不均等问题
4. **辅助决策** - 帮助团队做出更好的规划决策

以下是实时项目数据：

%s%s

回复规则：
- 使用中文回复
- 使用 Markdown 格式
- 引用具体的任务名称和数据
- 给出可操作的建议
- 保持专业但友好的语气`, projectCtx, projectDetail)

	// 构建消息列表
	messages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}
	for _, m := range input.Messages {
		messages = append(messages, map[string]string{
			"role":    m.Role,
			"content": m.Content,
		})
	}

	result, err := callMiniMaxAPI(messages)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"response": fmt.Sprintf("AI 响应失败: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": result})
}

// SetAPIKey - 通过 API 设置 MiniMax Key
func SetAPIKey(c *gin.Context) {
	var input struct {
		APIKey string `json:"apiKey"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	MiniMaxAPIKey = input.APIKey
	c.JSON(http.StatusOK, gin.H{"message": "API Key 已更新", "configured": MiniMaxAPIKey != ""})
}

// GetAIStatus - 获取 AI 配置状态
func GetAIStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"configured": MiniMaxAPIKey != "",
		"model":      MiniMaxModel,
	})
}

// 保留模板响应作为 fallback
func generateAIResponse(prompt, responseType string) string {
	switch responseType {
	case "describe":
		return fmt.Sprintf("## Task Description\n\n**Objective:** %s\n\n### Acceptance Criteria\n- [ ] Feature implemented as specified\n- [ ] Unit tests written and passing\n- [ ] Code reviewed by at least one team member\n- [ ] Documentation updated\n\n### Technical Notes\nConsider edge cases and error handling. Ensure backwards compatibility.", prompt)
	case "suggestions":
		return fmt.Sprintf("## 🤖 AI Suggestions\n\n1. Break down into smaller sub-tasks\n2. Add proper error handling\n3. Write unit tests for core logic\n4. Document the implementation approach\n5. Consider performance implications\n6. Review for security vulnerabilities\n\n> 💡 配置 MiniMax API Key 后可获得更智能的建议")
	case "review":
		return fmt.Sprintf("## 📋 Code Review Checklist\n\nFor: *%s*\n\n### Code Quality\n- [ ] Follows project coding standards\n- [ ] No code duplication\n- [ ] Functions are small and focused\n\n### Testing\n- [ ] Unit tests cover happy path\n- [ ] Edge cases are tested\n\n> 💡 配置 MiniMax API Key 后可获得更智能的审查建议", prompt)
	default:
		return "配置 MiniMax API Key 后即可使用 AI 功能。"
	}
}

// ==================== WEBHOOK TRIGGER HELPER ====================

func fireWebhooks(relatedID string, event string, payload map[string]interface{}) {
	// Find task's project
	var task models.Task
	config.DB.First(&task, "id = ?", relatedID)
	if task.ProjectID == "" {
		return
	}

	var webhooks []models.Webhook
	config.DB.Where("project_id = ? AND active = ?", task.ProjectID, true).Find(&webhooks)

	for _, wh := range webhooks {
		events := strings.Split(wh.Events, ",")
		for _, e := range events {
			if strings.TrimSpace(e) == event || strings.TrimSpace(e) == "*" {
				// Fire webhook
				payload["event"] = event
				payload["timestamp"] = time.Now().Format(time.RFC3339)
				body, _ := json.Marshal(payload)
				go func(url string) {
					resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
					if err == nil {
						resp.Body.Close()
					}
				}(wh.URL)
				break
			}
		}
	}
}
