package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := config.DB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}
	c.JSON(http.StatusOK, members)
}

func UpdateAvatar(c *gin.Context) {
	id := c.Param("id")
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	uploadDir := "uploads/avatars"
	os.MkdirAll(uploadDir, os.ModePerm)

	ext := filepath.Ext(file.Filename)
	newName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	savePath := filepath.Join(uploadDir, newName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
		return
	}

	avatarURL := "/uploads/avatars/" + newName
	config.DB.Model(&models.TeamMember{}).Where("id = ?", id).Update("avatar", avatarURL)

	c.JSON(http.StatusOK, gin.H{"avatar": avatarURL})
}
