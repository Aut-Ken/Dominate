package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Username     string         `gorm:"unique;not null" json:"username"`
	PasswordHash string         `gorm:"not null" json:"-"`
	Roles        string         `json:"roles"` // Comma-separated roles (e.g., "admin,user")
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	TeamMember TeamMember `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"team_member"`
}
