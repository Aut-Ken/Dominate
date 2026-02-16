package main

import (
	"fmt"
	"log"
	"time"

	"dominate-backend/internal/config"
	"dominate-backend/internal/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	config.Connect()

	// Auto Migrate
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.TeamMember{},
		&models.Project{},
		&models.Task{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 1. Create Users
	users := []struct {
		Username string
		Password string
		Name     string
		Role     string
	}{
		{"admin", "password123", "Alex Morgan", "admin"},
		{"sarah", "password123", "Sarah Connor", "user"},
		{"john", "password123", "John Doe", "user"},
	}

	var createdUsers []models.User

	for _, u := range users {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		userID := uuid.New().String()

		user := models.User{
			ID:           userID,
			Username:     u.Username,
			PasswordHash: string(hashedPassword),
			Roles:        u.Role,
		}

		// Check if user exists
		var count int64
		config.DB.Model(&models.User{}).Where("username = ?", u.Username).Count(&count)
		if count == 0 {
			if err := config.DB.Create(&user).Error; err != nil {
				log.Printf("Failed to create user %s: %v", u.Username, err)
			} else {
				fmt.Printf("Created user: %s\n", u.Username)
				createdUsers = append(createdUsers, user)

				// Create Team Member Profile
				member := models.TeamMember{
					ID:         uuid.New().String(),
					UserID:     userID,
					Name:       u.Name,
					Status:     "Online",
					Location:   "Remote",
					Avatar:     "https://picsum.photos/seed/" + u.Username + "/100/100",
					Email:      u.Username + "@dominate.com",
					Department: "Engineering",
				}
				config.DB.Create(&member)
			}
		} else {
			// Fetch existing user to link data
			config.DB.Where("username = ?", u.Username).First(&user)
			createdUsers = append(createdUsers, user)
		}
	}

	if len(createdUsers) == 0 {
		log.Println("No users created or found. Exiting.")
		return
	}

	// 2. Create Project
	projectID := uuid.New().String()
	project := models.Project{
		ID:          projectID,
		Name:        "Dominate Platform V1",
		Description: "The next gen task management system.",
		InviteCode:  "DOM123",
		Status:      "Active",
		MemberCount: 3,
	}

	if err := config.DB.Create(&project).Error; err != nil {
		log.Printf("Failed to create project: %v (might already exist)", err)
		// Try to find existing project to attach tasks
		var existingProject models.Project
		if err := config.DB.Where("name = ?", project.Name).First(&existingProject).Error; err == nil {
			projectID = existingProject.ID
		}
	} else {
		fmt.Println("Created project: Dominate Platform V1")
	}

	// 3. Create Tasks
	tasks := []models.Task{
		{
			ID:             uuid.New().String(),
			ProjectID:      projectID,
			Title:          "Design Database Schema",
			Description:    "Define the tables for Users, Projects, and Tasks.",
			Priority:       "High",
			Status:         "Done",
			AssigneeID:     createdUsers[0].ID,
			AssigneeName:   "Alex Morgan",
			AssigneeAvatar: "https://picsum.photos/seed/admin/100/100",
			DueDate:        time.Now().AddDate(0, 0, -2),
			Type:           "task",
		},
		{
			ID:             uuid.New().String(),
			ProjectID:      projectID,
			Title:          "Implement Auth API",
			Description:    "JWT based login and register.",
			Priority:       "High",
			Status:         "Review",
			AssigneeID:     createdUsers[0].ID,
			AssigneeName:   "Alex Morgan",
			AssigneeAvatar: "https://picsum.photos/seed/admin/100/100",
			DueDate:        time.Now().AddDate(0, 0, 1),
			Type:           "task",
		},
		{
			ID:             uuid.New().String(),
			ProjectID:      projectID,
			Title:          "Frontend Integration",
			Description:    "Connect React app to Golang backend.",
			Priority:       "Medium",
			Status:         "In Progress",
			AssigneeID:     createdUsers[1].ID, // Sarah
			AssigneeName:   "Sarah Connor",
			AssigneeAvatar: "https://picsum.photos/seed/sarah/100/100",
			DueDate:        time.Now().AddDate(0, 0, 3),
			Type:           "task",
		},
		{
			ID:             uuid.New().String(),
			ProjectID:      projectID,
			Title:          "Write Documentation",
			Description:    "Update README and Architecture docs.",
			Priority:       "Low",
			Status:         "To Do",
			AssigneeID:     createdUsers[2].ID, // John
			AssigneeName:   "John Doe",
			AssigneeAvatar: "https://picsum.photos/seed/john/100/100",
			DueDate:        time.Now().AddDate(0, 0, 5),
			Type:           "task",
		},
	}

	for _, t := range tasks {
		if err := config.DB.Create(&t).Error; err != nil {
			log.Printf("Failed to create task %s: %v", t.Title, err)
		} else {
			fmt.Printf("Created task: %s\n", t.Title)
		}
	}

	fmt.Println("Seeding completed successfully!")
}
