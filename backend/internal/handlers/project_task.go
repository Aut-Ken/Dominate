package handlers

import (
	"net/http"
	"time"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// --- Project Handlers ---

func GetProjects(c *gin.Context) {
	var projects []models.Project
	if err := config.DB.Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func CreateProject(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project := models.Project{
		ID:          uuid.New().String(),
		Name:        input.Name,
		Description: input.Description,
		InviteCode:  uuid.New().String()[:6], // Simple random code
		Status:      "Active",
		MemberCount: 1, // Creator
	}

	if err := config.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusOK, project)
}

// --- Task Handlers ---

func GetTasks(c *gin.Context) {
	var tasks []models.Task
	projectId := c.Query("project_id")

	query := config.DB
	if projectId != "" {
		query = query.Where("project_id = ?", projectId)
	}

	if err := query.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func CreateTask(c *gin.Context) {
	var input struct {
		ProjectID   string `json:"project_id" binding:"required"`
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
		Status      string `json:"status"`
		AssigneeID  string `json:"assignee_id"`
		DueDate     string `json:"due_date"`
		Type        string `json:"type"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task := models.Task{
		ID:          uuid.New().String(),
		ProjectID:   input.ProjectID,
		Title:       input.Title,
		Description: input.Description,
		Priority:    input.Priority,
		Status:      input.Status,
		AssigneeID:  input.AssigneeID,
		Type:        input.Type,
	}

	if input.DueDate != "" {
		parsedTime, err := time.Parse("2006-01-02", input.DueDate)
		if err == nil {
			task.DueDate = parsedTime
		}
	}

	// Fetch assignee details if provided
	if input.AssigneeID != "" {
		var member models.TeamMember
		if err := config.DB.Where("user_id = ?", input.AssigneeID).First(&member).Error; err == nil {
			task.AssigneeName = member.Name
			task.AssigneeAvatar = member.Avatar
		}
	}

	if err := config.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var input map[string]interface{}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Model(&models.Task{}).Where("id = ?", id).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task updated"})
}
