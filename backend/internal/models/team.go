package models

import (
	"time"

	"gorm.io/gorm"
)

type TeamMember struct {
	ID         string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID     string         `gorm:"type:varchar(36);unique" json:"userId"`
	Name       string         `gorm:"not null" json:"name"`
	Role       string         `json:"role"`
	Avatar     string         `json:"avatar"`
	Status     string         `json:"status"` // 'Online' | 'Offline' | 'Away'
	Department string         `json:"department"`
	Location   string         `json:"location"` // 'Remote' | 'In-Office'
	TasksCount int            `gorm:"default:0" json:"tasksCount"`
	Email      string         `json:"email"`
	Bio        string         `json:"bio"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
