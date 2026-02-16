package handlers

import (
	"net/http"
	"strings"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// --- Comment Handlers ---

func GetComments(c *gin.Context) {
	taskID := c.Query("task_id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id is required"})
		return
	}

	var comments []models.Comment
	if err := config.DB.Where("task_id = ?", taskID).Order("created_at ASC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func AddComment(c *gin.Context) {
	var input struct {
		TaskID       string `json:"taskId" binding:"required"`
		AuthorID     string `json:"authorId" binding:"required"`
		AuthorName   string `json:"authorName" binding:"required"`
		AuthorAvatar string `json:"authorAvatar"`
		Content      string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		ID:           uuid.New().String(),
		TaskID:       input.TaskID,
		AuthorID:     input.AuthorID,
		AuthorName:   input.AuthorName,
		AuthorAvatar: input.AuthorAvatar,
		Content:      input.Content,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
		return
	}

	// Increment comments count on the task
	config.DB.Model(&models.Task{}).Where("id = ?", input.TaskID).Update("comments_count", config.DB.Raw("comments_count + 1"))

	c.JSON(http.StatusOK, comment)
}

// --- Search Handler ---

func Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"projects": []interface{}{}, "tasks": []interface{}{}, "members": []interface{}{}})
		return
	}

	like := "%" + strings.ToLower(query) + "%"

	var projects []models.Project
	config.DB.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", like, like).Limit(5).Find(&projects)

	var tasks []models.Task
	config.DB.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", like, like).Limit(10).Find(&tasks)

	var members []models.TeamMember
	config.DB.Where("LOWER(name) LIKE ? OR LOWER(role) LIKE ? OR LOWER(department) LIKE ?", like, like, like).Limit(5).Find(&members)

	c.JSON(http.StatusOK, gin.H{
		"projects": projects,
		"tasks":    tasks,
		"members":  members,
	})
}

// --- Join Project Handler ---

func JoinProject(c *gin.Context) {
	var input struct {
		InviteCode string `json:"inviteCode" binding:"required"`
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
	config.DB.Model(&project).Update("member_count", project.MemberCount+1)
	project.MemberCount++

	c.JSON(http.StatusOK, project)
}

// --- Change Password Handler ---

func ChangePassword(c *gin.Context) {
	var input struct {
		UserID      string `json:"userId" binding:"required"`
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", input.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Import bcrypt is in auth.go, we need it here too
	// Verify old password
	if err := verifyPassword(user.PasswordHash, input.OldPassword); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash new password
	newHash, err := hashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	config.DB.Model(&user).Update("password_hash", newHash)
	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// --- Update Avatar Handler ---

func UpdateAvatar(c *gin.Context) {
	id := c.Param("id")

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No avatar file uploaded"})
		return
	}

	// Reuse upload logic
	ext := ""
	if idx := strings.LastIndex(file.Filename, "."); idx != -1 {
		ext = file.Filename[idx:]
	}
	newName := "avatar_" + id + ext
	savePath := "uploads/" + newName

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
		return
	}

	avatarURL := "/uploads/" + newName
	config.DB.Model(&models.TeamMember{}).Where("id = ? OR user_id = ?", id, id).Update("avatar", avatarURL)

	c.JSON(http.StatusOK, gin.H{"avatar": avatarURL})
}
