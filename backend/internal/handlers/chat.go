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

func GetMessages(c *gin.Context) {
	channel := c.DefaultQuery("channel", "general")
	limit := 200

	var messages []models.Message
	if err := config.DB.Where("channel = ?", channel).
		Order("created_at ASC").
		Limit(limit).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func SendMessage(c *gin.Context) {
	var input struct {
		SenderID     string `json:"senderId" binding:"required"`
		SenderName   string `json:"senderName" binding:"required"`
		SenderAvatar string `json:"senderAvatar"`
		Content      string `json:"content" binding:"required"`
		MsgType      string `json:"msgType"`
		FileName     string `json:"fileName"`
		Channel      string `json:"channel"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	channel := input.Channel
	if channel == "" {
		channel = "general"
	}
	msgType := input.MsgType
	if msgType == "" {
		msgType = "text"
	}

	message := models.Message{
		ID:           uuid.New().String(),
		SenderID:     input.SenderID,
		SenderName:   input.SenderName,
		SenderAvatar: input.SenderAvatar,
		Content:      input.Content,
		MsgType:      msgType,
		FileName:     input.FileName,
		Channel:      channel,
	}

	if err := config.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusOK, message)
}

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Create uploads directory if not exists
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	newName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	savePath := filepath.Join(uploadDir, newName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      "/uploads/" + newName,
		"fileName": file.Filename,
	})
}
