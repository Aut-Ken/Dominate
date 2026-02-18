package routes

import (
	"dominate-backend/internal/handlers"
	"dominate-backend/internal/ws"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.PUT("/password", handlers.ChangePassword)
		}

		api.GET("/projects", handlers.GetProjects)
		api.POST("/projects", handlers.CreateProject)
		api.POST("/projects/join", handlers.JoinProject)

		api.GET("/tasks", handlers.GetTasks)
		api.POST("/tasks", handlers.CreateTask)
		api.PUT("/tasks/:id", handlers.UpdateTask)
		api.DELETE("/tasks/:id", handlers.DeleteTask)

		api.GET("/team", handlers.GetTeamMembers)
		api.PUT("/team/:id/avatar", handlers.UpdateAvatar)

		api.GET("/messages", handlers.GetMessages)
		api.POST("/messages", handlers.SendMessage)
		api.POST("/upload", handlers.UploadFile)

		api.GET("/comments", handlers.GetComments)
		api.POST("/comments", handlers.AddComment)

		api.GET("/search", handlers.Search)

		// Time Tracking
		api.GET("/timelogs", handlers.GetTimeLogs)
		api.POST("/timelogs", handlers.AddTimeLog)
		api.GET("/timelogs/stats", handlers.GetTimeStats)

		// Sprints
		api.GET("/sprints", handlers.GetSprints)
		api.POST("/sprints", handlers.CreateSprint)
		api.PUT("/sprints/:id", handlers.UpdateSprint)

		// Wiki
		api.GET("/wiki", handlers.GetWikiPages)
		api.GET("/wiki/:id", handlers.GetWikiPage)
		api.POST("/wiki", handlers.CreateWikiPage)
		api.PUT("/wiki/:id", handlers.UpdateWikiPage)
		api.DELETE("/wiki/:id", handlers.DeleteWikiPage)

		// Webhooks
		api.GET("/webhooks", handlers.GetWebhooks)
		api.POST("/webhooks", handlers.CreateWebhook)
		api.DELETE("/webhooks/:id", handlers.DeleteWebhook)
		api.PUT("/webhooks/:id/toggle", handlers.ToggleWebhook)

		// Burndown
		api.GET("/burndown", handlers.GetBurndownData)

		// AI
		api.POST("/ai/assist", handlers.AIAssist)
		api.POST("/ai/chat", handlers.AIChat)
		api.POST("/ai/key", handlers.SetAPIKey)
		api.GET("/ai/status", handlers.GetAIStatus)

		// Activity Logs
		api.GET("/activity", handlers.GetActivityLogs)

		// Attachments
		api.POST("/attachments", handlers.UploadAttachment)
		api.GET("/attachments", handlers.GetAttachments)
		api.GET("/attachments/:id/download", handlers.DownloadAttachment)
		api.DELETE("/attachments/:id", handlers.DeleteAttachment)

		// Task Templates
		api.GET("/templates", handlers.GetTaskTemplates)
		api.POST("/templates", handlers.CreateTaskTemplate)
		api.DELETE("/templates/:id", handlers.DeleteTaskTemplate)

		// Tags
		api.GET("/tags", handlers.GetTags)
		api.POST("/tags", handlers.CreateTag)
		api.PUT("/tags/:id", handlers.UpdateTag)
		api.DELETE("/tags/:id", handlers.DeleteTag)

		// Notifications
		api.GET("/notifications", handlers.GetNotifications)
		api.PUT("/notifications/:id/read", handlers.MarkNotificationRead)
		api.PUT("/notifications/read-all", handlers.MarkAllNotificationsRead)
		api.GET("/notifications/unread-count", handlers.GetUnreadCount)

		// Task Dependencies
		api.GET("/dependencies", handlers.GetTaskDependencies)
		api.POST("/dependencies", handlers.AddTaskDependency)
		api.DELETE("/dependencies/:id", handlers.RemoveTaskDependency)

		// RBAC
		api.GET("/roles", handlers.GetProjectRoles)
		api.POST("/roles", handlers.SetProjectRole)
		api.DELETE("/roles/:id", handlers.DeleteProjectRole)

		// Gantt
		api.GET("/gantt", handlers.GetGanttData)

		// Dashboard Stats
		api.GET("/stats/dashboard", handlers.GetDashboardStats)

		// Data Export
		api.GET("/export/csv", handlers.ExportTasksCSV)
		api.GET("/export/json", handlers.ExportTasksJSON)
	}

	// WebSocket
	r.GET("/ws", ws.HandleWebSocket)

	// Online count
	api.GET("/online", func(c *gin.Context) {
		c.JSON(200, gin.H{"count": ws.GetOnlineCount()})
	})

	// Serve uploaded files
	r.Static("/uploads", "./uploads")
}
