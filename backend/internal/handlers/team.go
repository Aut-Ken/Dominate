package handlers

import (
	"net/http"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := config.DB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}
	c.JSON(http.StatusOK, members)
}
