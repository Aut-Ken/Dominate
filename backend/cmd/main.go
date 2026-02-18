package main

import (
	"log"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"
	"dominate-backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Connect to Database
	config.Connect()

	// 2. Auto Migrate Models
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.TeamMember{},
		&models.Project{},
		&models.Task{},
		&models.Message{},
		&models.Comment{},
		&models.TimeLog{},
		&models.Sprint{},
		&models.WikiPage{},
		&models.Webhook{},
		&models.ActivityLog{},
		&models.Attachment{},
		&models.TaskTemplate{},
		&models.Tag{},
		&models.Notification{},
		&models.TaskDependency{},
		&models.ProjectRole{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 3. Setup Router
	r := gin.Default()
	routes.SetupRoutes(r)

	// 4. Start Server
	log.Println("Server starting on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
