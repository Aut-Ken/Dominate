package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	InviteCode  string         `gorm:"unique;not null" json:"inviteCode"`
	Description string         `json:"description"`
	Status      string         `json:"status"` // 'Active' | 'On Hold' | 'Completed'
	MemberCount int            `gorm:"default:1" json:"memberCount"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
