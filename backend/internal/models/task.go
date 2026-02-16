package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID             string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID      string         `gorm:"type:varchar(36);not null" json:"projectId"`
	Title          string         `gorm:"not null" json:"title"`
	Description    string         `json:"description"`
	Priority       string         `json:"priority"`                           // 'High' | 'Medium' | 'Low'
	Status         string         `json:"status"`                             // 'To Do' | 'In Progress' | 'Review' | 'Done'
	AssigneeID     string         `gorm:"type:varchar(36)" json:"assigneeId"` // UserID of assignee
	AssigneeName   string         `json:"assignee"`                           // Snapshot for easier querying, mapped to 'assignee' in frontend
	AssigneeAvatar string         `json:"assigneeAvatar"`                     // Snapshot
	DueDate        time.Time      `json:"dueDate"`
	Tags           string         `json:"tags"` // Comma separated tags
	Type           string         `json:"type"` // 'task' | 'mission'
	CommentsCount  int            `gorm:"default:0" json:"commentsCount"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
