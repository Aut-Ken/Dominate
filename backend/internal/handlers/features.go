package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ==================== GLOBAL SEARCH ====================

func Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusOK, gin.H{"tasks": []interface{}{}, "projects": []interface{}{}, "wiki": []interface{}{}})
		return
	}

	like := "%" + q + "%"

	var tasks []models.Task
	config.DB.Where("title LIKE ? OR description LIKE ?", like, like).Limit(20).Find(&tasks)

	var projects []models.Project
	config.DB.Where("name LIKE ? OR description LIKE ?", like, like).Limit(10).Find(&projects)

	var wiki []models.WikiPage
	config.DB.Where("title LIKE ? OR content LIKE ?", like, like).Limit(10).Find(&wiki)

	c.JSON(http.StatusOK, gin.H{
		"tasks":    tasks,
		"projects": projects,
		"wiki":     wiki,
	})
}

// ==================== ACTIVITY LOG ====================

// LogActivity 记录活动日志（内部调用）
func LogActivity(projectID, userID, userName, action, target, targetID, targetName, detail string) {
	log := models.ActivityLog{
		ID:         uuid.New().String(),
		ProjectID:  projectID,
		UserID:     userID,
		UserName:   userName,
		Action:     action,
		Target:     target,
		TargetID:   targetID,
		TargetName: targetName,
		Detail:     detail,
	}
	config.DB.Create(&log)
}

func GetActivityLogs(c *gin.Context) {
	projectID := c.Query("project_id")
	limit := 50

	var logs []models.ActivityLog
	query := config.DB.Order("created_at DESC").Limit(limit)
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&logs)
	c.JSON(http.StatusOK, logs)
}

// ==================== FILE ATTACHMENTS ====================

func UploadAttachment(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	projectID := c.PostForm("projectId")
	taskID := c.PostForm("taskId")
	uploaderID := c.PostForm("uploaderId")
	uploaderName := c.PostForm("uploaderName")

	// Determine file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	fileType := "other"
	switch {
	case ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp" || ext == ".svg":
		fileType = "image"
	case ext == ".pdf" || ext == ".doc" || ext == ".docx" || ext == ".txt" || ext == ".md" || ext == ".xls" || ext == ".xlsx" || ext == ".pptx":
		fileType = "document"
	case ext == ".zip" || ext == ".rar" || ext == ".7z" || ext == ".tar" || ext == ".gz":
		fileType = "archive"
	}

	// Save file
	id := uuid.New().String()
	savePath := filepath.Join("uploads", "attachments", id+ext)
	os.MkdirAll(filepath.Dir(savePath), 0755)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	attachment := models.Attachment{
		ID:           id,
		ProjectID:    projectID,
		TaskID:       taskID,
		FileName:     file.Filename,
		FilePath:     savePath,
		FileSize:     file.Size,
		FileType:     fileType,
		UploaderID:   uploaderID,
		UploaderName: uploaderName,
	}
	config.DB.Create(&attachment)

	// Log activity
	go LogActivity(projectID, uploaderID, uploaderName, "uploaded", "attachment", id, file.Filename, fmt.Sprintf("Uploaded file: %s", file.Filename))

	c.JSON(http.StatusOK, attachment)
}

func GetAttachments(c *gin.Context) {
	projectID := c.Query("project_id")
	taskID := c.Query("task_id")

	var attachments []models.Attachment
	query := config.DB.Order("created_at DESC")
	if taskID != "" {
		query = query.Where("task_id = ?", taskID)
	} else if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&attachments)
	c.JSON(http.StatusOK, attachments)
}

func DownloadAttachment(c *gin.Context) {
	id := c.Param("id")
	var attachment models.Attachment
	if err := config.DB.First(&attachment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attachment not found"})
		return
	}

	file, err := os.Open(attachment.FilePath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found on disk"})
		return
	}
	defer file.Close()

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", attachment.FileName))
	c.Header("Content-Type", "application/octet-stream")
	io.Copy(c.Writer, file)
}

func DeleteAttachment(c *gin.Context) {
	id := c.Param("id")
	var attachment models.Attachment
	if err := config.DB.First(&attachment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attachment not found"})
		return
	}
	os.Remove(attachment.FilePath)
	config.DB.Delete(&attachment)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== TASK TEMPLATES ====================

func GetTaskTemplates(c *gin.Context) {
	var templates []models.TaskTemplate
	config.DB.Order("created_at DESC").Find(&templates)
	c.JSON(http.StatusOK, templates)
}

func CreateTaskTemplate(c *gin.Context) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
		Tags        string `json:"tags"`
		Checklist   string `json:"checklist"`
		Category    string `json:"category"`
		CreatorID   string `json:"creatorId"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tmpl := models.TaskTemplate{
		ID:          uuid.New().String(),
		Name:        input.Name,
		Description: input.Description,
		Priority:    input.Priority,
		Tags:        input.Tags,
		Checklist:   input.Checklist,
		Category:    input.Category,
		CreatorID:   input.CreatorID,
	}
	config.DB.Create(&tmpl)
	c.JSON(http.StatusOK, tmpl)
}

func DeleteTaskTemplate(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.TaskTemplate{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== TAGS ====================

func GetTags(c *gin.Context) {
	projectID := c.Query("project_id")
	var tags []models.Tag
	query := config.DB.Order("name ASC")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&tags)
	c.JSON(http.StatusOK, tags)
}

func CreateTag(c *gin.Context) {
	var input struct {
		ProjectID string `json:"projectId"`
		Name      string `json:"name"`
		Color     string `json:"color"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tag := models.Tag{
		ID:        uuid.New().String(),
		ProjectID: input.ProjectID,
		Name:      input.Name,
		Color:     input.Color,
	}
	config.DB.Create(&tag)
	c.JSON(http.StatusOK, tag)
}

func UpdateTag(c *gin.Context) {
	id := c.Param("id")
	var tag models.Tag
	if err := config.DB.First(&tag, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&tag).Updates(updates)
	config.DB.First(&tag, "id = ?", id)
	c.JSON(http.StatusOK, tag)
}

func DeleteTag(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Tag{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== NOTIFICATIONS ====================

func GetNotifications(c *gin.Context) {
	userID := c.Query("user_id")
	var notifications []models.Notification
	query := config.DB.Order("created_at DESC").Limit(50)
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	query.Find(&notifications)
	c.JSON(http.StatusOK, notifications)
}

func MarkNotificationRead(c *gin.Context) {
	id := c.Param("id")
	config.DB.Model(&models.Notification{}).Where("id = ?", id).Update("read", true)
	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}

func MarkAllNotificationsRead(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id required"})
		return
	}
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND read = ?", userID, false).Update("read", true)
	c.JSON(http.StatusOK, gin.H{"message": "All marked as read"})
}

// CreateNotification 创建通知（内部调用）
func CreateNotification(userID, notifType, title, message, link string) {
	notif := models.Notification{
		ID:      uuid.New().String(),
		UserID:  userID,
		Type:    notifType,
		Title:   title,
		Message: message,
		Link:    link,
	}
	config.DB.Create(&notif)
}

func GetUnreadCount(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id required"})
		return
	}
	var count int64
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND read = ?", userID, false).Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// ==================== TASK DEPENDENCIES ====================

func GetTaskDependencies(c *gin.Context) {
	taskID := c.Query("task_id")
	projectID := c.Query("project_id")

	var deps []models.TaskDependency
	if taskID != "" {
		config.DB.Where("task_id = ? OR depends_on_id = ?", taskID, taskID).Find(&deps)
	} else if projectID != "" {
		config.DB.Where("task_id IN (SELECT id FROM tasks WHERE project_id = ?)", projectID).Find(&deps)
	}
	c.JSON(http.StatusOK, deps)
}

func AddTaskDependency(c *gin.Context) {
	var input struct {
		TaskID      string `json:"taskId"`
		DependsOnID string `json:"dependsOnId"`
		Type        string `json:"type"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.TaskID == input.DependsOnID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task cannot depend on itself"})
		return
	}

	var existing models.TaskDependency
	if err := config.DB.Where("task_id = ? AND depends_on_id = ?", input.TaskID, input.DependsOnID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dependency already exists"})
		return
	}

	depType := input.Type
	if depType == "" {
		depType = "finish_to_start"
	}

	dep := models.TaskDependency{
		ID:          uuid.New().String(),
		TaskID:      input.TaskID,
		DependsOnID: input.DependsOnID,
		Type:        depType,
	}
	config.DB.Create(&dep)
	c.JSON(http.StatusOK, dep)
}

func RemoveTaskDependency(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.TaskDependency{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== RBAC ====================

func GetProjectRoles(c *gin.Context) {
	projectID := c.Query("project_id")
	var roles []models.ProjectRole
	config.DB.Where("project_id = ?", projectID).Find(&roles)
	c.JSON(http.StatusOK, roles)
}

func SetProjectRole(c *gin.Context) {
	var input struct {
		ProjectID string `json:"projectId"`
		UserID    string `json:"userId"`
		Role      string `json:"role"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validRoles := map[string]bool{"owner": true, "admin": true, "member": true, "viewer": true}
	if !validRoles[input.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}

	var existing models.ProjectRole
	err := config.DB.Where("project_id = ? AND user_id = ?", input.ProjectID, input.UserID).First(&existing).Error
	if err == nil {
		config.DB.Model(&existing).Update("role", input.Role)
		existing.Role = input.Role
		c.JSON(http.StatusOK, existing)
	} else {
		role := models.ProjectRole{
			ID:        uuid.New().String(),
			ProjectID: input.ProjectID,
			UserID:    input.UserID,
			Role:      input.Role,
		}
		config.DB.Create(&role)
		c.JSON(http.StatusOK, role)
	}
}

func DeleteProjectRole(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.ProjectRole{}, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// ==================== GANTT DATA ====================

func GetGanttData(c *gin.Context) {
	projectID := c.Query("project_id")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "project_id required"})
		return
	}

	var tasks []models.Task
	config.DB.Where("project_id = ?", projectID).Order("created_at ASC").Find(&tasks)

	var deps []models.TaskDependency
	config.DB.Where("task_id IN (SELECT id FROM tasks WHERE project_id = ?)", projectID).Find(&deps)

	type GanttTask struct {
		ID        string `json:"id"`
		Title     string `json:"title"`
		Status    string `json:"status"`
		Priority  string `json:"priority"`
		Assignee  string `json:"assignee"`
		StartDate string `json:"startDate"`
		DueDate   string `json:"dueDate"`
		Progress  int    `json:"progress"`
	}

	ganttTasks := make([]GanttTask, 0)
	for _, t := range tasks {
		progress := 0
		switch t.Status {
		case "In Progress":
			progress = 50
		case "Review":
			progress = 80
		case "Done":
			progress = 100
		}

		startDate := t.CreatedAt.Format("2006-01-02")
		dueDate := ""
		if !t.DueDate.IsZero() {
			dueDate = t.DueDate.Format("2006-01-02")
		} else {
			dueDate = time.Now().AddDate(0, 0, 7).Format("2006-01-02")
		}

		ganttTasks = append(ganttTasks, GanttTask{
			ID:        t.ID,
			Title:     t.Title,
			Status:    t.Status,
			Priority:  t.Priority,
			Assignee:  t.AssigneeName,
			StartDate: startDate,
			DueDate:   dueDate,
			Progress:  progress,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks":        ganttTasks,
		"dependencies": deps,
	})
}

// ==================== DASHBOARD STATS ====================

func GetDashboardStats(c *gin.Context) {
	type DayCount struct {
		Day   string `json:"day"`
		Count int    `json:"count"`
	}

	var completionTrend []DayCount
	now := time.Now()
	for i := 13; i >= 0; i-- {
		day := now.AddDate(0, 0, -i)
		dayStr := day.Format("2006-01-02")
		nextDayStr := day.AddDate(0, 0, 1).Format("2006-01-02")

		var count int64
		config.DB.Model(&models.Task{}).Where("status = ? AND updated_at >= ? AND updated_at < ?", "Done", dayStr, nextDayStr).Count(&count)

		completionTrend = append(completionTrend, DayCount{
			Day:   day.Format("Jan 2"),
			Count: int(count),
		})
	}

	type PriorityCount struct {
		Priority string `json:"priority"`
		Count    int64  `json:"count"`
	}
	var priorityDist []PriorityCount
	for _, p := range []string{"High", "Medium", "Low"} {
		var count int64
		config.DB.Model(&models.Task{}).Where("priority = ? AND status != ?", p, "Done").Count(&count)
		priorityDist = append(priorityDist, PriorityCount{Priority: p, Count: count})
	}

	type MemberLoad struct {
		Name      string `json:"name"`
		Active    int64  `json:"active"`
		Completed int64  `json:"completed"`
	}
	var members []models.TeamMember
	config.DB.Find(&members)
	var workload []MemberLoad
	for _, m := range members {
		var active, completed int64
		config.DB.Model(&models.Task{}).Where("assignee_id = ? AND status != ?", m.UserID, "Done").Count(&active)
		config.DB.Model(&models.Task{}).Where("assignee_id = ? AND status = ?", m.UserID, "Done").Count(&completed)
		if active+completed > 0 {
			workload = append(workload, MemberLoad{Name: m.Name, Active: active, Completed: completed})
		}
	}

	var overdueCount int64
	config.DB.Model(&models.Task{}).Where("due_date < ? AND status != ?", now, "Done").Count(&overdueCount)

	c.JSON(http.StatusOK, gin.H{
		"completionTrend":      completionTrend,
		"priorityDistribution": priorityDist,
		"teamWorkload":         workload,
		"overdueCount":         overdueCount,
	})
}

// ==================== MISSING LEGACY HANDLERS ====================

func ChangePassword(c *gin.Context) {
	var input struct {
		UserID      string `json:"userId"`
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, "id = ?", input.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := verifyPassword(user.PasswordHash, input.OldPassword); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid old password"})
		return
	}

	hashed, err := hashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	config.DB.Model(&user).Update("password_hash", hashed)
	c.JSON(http.StatusOK, gin.H{"message": "Password changed"})
}

func GetComments(c *gin.Context) {
	taskID := c.Query("task_id")
	var comments []models.Comment
	query := config.DB.Order("created_at ASC")
	if taskID != "" {
		query = query.Where("task_id = ?", taskID)
	}
	query.Find(&comments)
	c.JSON(http.StatusOK, comments)
}

func AddComment(c *gin.Context) {
	var input struct {
		TaskID   string `json:"taskId"`
		UserID   string `json:"userId"`
		UserName string `json:"userName"`
		Avatar   string `json:"avatar"`
		Content  string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		ID:           uuid.New().String(),
		TaskID:       input.TaskID,
		AuthorID:     input.UserID,
		AuthorName:   input.UserName,
		AuthorAvatar: input.Avatar,
		Content:      input.Content,
	}
	config.DB.Create(&comment)

	// Update task comment count
	config.DB.Model(&models.Task{}).Where("id = ?", input.TaskID).UpdateColumn("comments_count", config.DB.Raw("comments_count + 1"))

	c.JSON(http.StatusOK, comment)
}

func JoinProject(c *gin.Context) {
	var input struct {
		InviteCode string `json:"inviteCode"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var project models.Project
	if err := config.DB.Where("invite_code = ?", input.InviteCode).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid invite code"})
		return
	}

	// Increment member count
	config.DB.Model(&project).UpdateColumn("member_count", config.DB.Raw("member_count + 1"))
	project.MemberCount++

	c.JSON(http.StatusOK, project)
}

// ==================== DATA EXPORT ====================

func ExportTasksCSV(c *gin.Context) {
	projectID := c.Query("project_id")
	var tasks []models.Task
	query := config.DB.Order("created_at DESC")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&tasks)

	c.Header("Content-Disposition", "attachment; filename=tasks_export.csv")
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Writer.WriteString("\xEF\xBB\xBF") // UTF-8 BOM for Excel

	c.Writer.WriteString("ID,Title,Description,Status,Priority,Assignee,Due Date,Created At\n")
	for _, t := range tasks {
		dueDate := ""
		if !t.DueDate.IsZero() {
			dueDate = t.DueDate.Format("2006-01-02")
		}
		line := fmt.Sprintf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
			t.ID, escapeCsv(t.Title), escapeCsv(t.Description), t.Status, t.Priority,
			t.AssigneeName, dueDate, t.CreatedAt.Format("2006-01-02 15:04:05"))
		c.Writer.WriteString(line)
	}
}

func ExportTasksJSON(c *gin.Context) {
	projectID := c.Query("project_id")
	var tasks []models.Task
	query := config.DB.Order("created_at DESC")
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	query.Find(&tasks)

	c.Header("Content-Disposition", "attachment; filename=tasks_export.json")
	c.JSON(http.StatusOK, tasks)
}

func escapeCsv(s string) string {
	return strings.ReplaceAll(s, "\"", "\"\"")
}
