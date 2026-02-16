package models

import (
	"time"
)

type Message struct {
	ID           string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SenderID     string    `gorm:"not null;type:varchar(36)" json:"senderId"`
	SenderName   string    `gorm:"not null" json:"senderName"`
	SenderAvatar string    `json:"senderAvatar"`
	Content      string    `gorm:"not null;type:text" json:"content"`
	MsgType      string    `gorm:"not null;default:text" json:"msgType"` // text, file, image
	FileName     string    `json:"fileName"`
	Channel      string    `gorm:"not null;default:general" json:"channel"`
	CreatedAt    time.Time `json:"createdAt"`
}
