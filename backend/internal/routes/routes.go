package routes

import (
	"dominate-backend/internal/handlers"

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
		}

		api.GET("/projects", handlers.GetProjects)
		api.POST("/projects", handlers.CreateProject)

		api.GET("/tasks", handlers.GetTasks)
		api.POST("/tasks", handlers.CreateTask)
		api.PUT("/tasks/:id", handlers.UpdateTask)

		api.GET("/team", handlers.GetTeamMembers)
	}
}
