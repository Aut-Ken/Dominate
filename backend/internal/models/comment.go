package models

import (
	"time"
)

type Comment struct {
	ID           string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	TaskID       string    `gorm:"not null;type:varchar(36);index" json:"taskId"`
	AuthorID     string    `gorm:"not null;type:varchar(36)" json:"authorId"`
	AuthorName   string    `gorm:"not null" json:"authorName"`
	AuthorAvatar string    `json:"authorAvatar"`
	Content      string    `gorm:"not null;type:text" json:"content"`
	CreatedAt    time.Time `json:"createdAt"`
}
