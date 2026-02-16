package models

import (
	"time"
)

// TimeLog tracks time spent on tasks
type TimeLog struct {
	ID       string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	TaskID   string    `gorm:"not null;type:varchar(36);index" json:"taskId"`
	UserID   string    `gorm:"not null;type:varchar(36)" json:"userId"`
	UserName string    `gorm:"type:varchar(100)" json:"userName"`
	Hours    float64   `gorm:"not null" json:"hours"`
	Note     string    `gorm:"type:text" json:"note"`
	LoggedAt time.Time `gorm:"autoCreateTime" json:"loggedAt"`
}

// Sprint represents an iteration cycle
type Sprint struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID string    `gorm:"not null;type:varchar(36);index" json:"projectId"`
	Name      string    `gorm:"not null;type:varchar(200)" json:"name"`
	Goal      string    `gorm:"type:text" json:"goal"`
	StartDate string    `gorm:"type:varchar(20)" json:"startDate"`
	EndDate   string    `gorm:"type:varchar(20)" json:"endDate"`
	Status    string    `gorm:"type:varchar(20);default:Planning" json:"status"` // Planning, Active, Completed
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// WikiPage is a Markdown documentation page
type WikiPage struct {
	ID         string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID  string    `gorm:"not null;type:varchar(36);index" json:"projectId"`
	Title      string    `gorm:"not null;type:varchar(200)" json:"title"`
	Content    string    `gorm:"type:longtext" json:"content"`
	AuthorID   string    `gorm:"type:varchar(36)" json:"authorId"`
	AuthorName string    `gorm:"type:varchar(100)" json:"authorName"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// Webhook configuration
type Webhook struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID string    `gorm:"not null;type:varchar(36);index" json:"projectId"`
	Name      string    `gorm:"type:varchar(100)" json:"name"`
	URL       string    `gorm:"not null;type:varchar(500)" json:"url"`
	Events    string    `gorm:"type:varchar(500)" json:"events"` // comma-separated: task.created, task.completed, etc.
	Active    bool      `gorm:"default:true" json:"active"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
