package models

import "time"

// ==================== 活动日志 ====================
type ActivityLog struct {
	ID         string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID  string    `gorm:"type:varchar(36);index" json:"projectId"`
	UserID     string    `gorm:"type:varchar(36)" json:"userId"`
	UserName   string    `gorm:"type:varchar(100)" json:"userName"`
	Action     string    `gorm:"type:varchar(50)" json:"action"` // created, updated, completed, commented, uploaded, deleted
	Target     string    `gorm:"type:varchar(50)" json:"target"` // task, project, sprint, wiki, attachment
	TargetID   string    `gorm:"type:varchar(36)" json:"targetId"`
	TargetName string    `gorm:"type:varchar(200)" json:"targetName"`
	Detail     string    `gorm:"type:text" json:"detail"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== 文件附件 ====================
type Attachment struct {
	ID           string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID    string    `gorm:"type:varchar(36);index" json:"projectId"`
	TaskID       string    `gorm:"type:varchar(36);index" json:"taskId"` // optional, "" for project-level
	FileName     string    `gorm:"type:varchar(255)" json:"fileName"`
	FilePath     string    `gorm:"type:varchar(500)" json:"filePath"`
	FileSize     int64     `json:"fileSize"`
	FileType     string    `gorm:"type:varchar(50)" json:"fileType"` // image, document, archive, other
	UploaderID   string    `gorm:"type:varchar(36)" json:"uploaderId"`
	UploaderName string    `gorm:"type:varchar(100)" json:"uploaderName"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== 任务模板 ====================
type TaskTemplate struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string    `gorm:"type:varchar(100)" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Priority    string    `gorm:"type:varchar(20);default:Medium" json:"priority"`
	Tags        string    `gorm:"type:varchar(500)" json:"tags"`
	Checklist   string    `gorm:"type:text" json:"checklist"`       // JSON array of checklist items
	Category    string    `gorm:"type:varchar(50)" json:"category"` // bug, feature, improvement, etc.
	CreatorID   string    `gorm:"type:varchar(36)" json:"creatorId"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== 标签 ====================
type Tag struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID string    `gorm:"type:varchar(36);index" json:"projectId"`
	Name      string    `gorm:"type:varchar(50)" json:"name"`
	Color     string    `gorm:"type:varchar(20)" json:"color"` // hex color
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== 通知 ====================
type Notification struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID    string    `gorm:"type:varchar(36);index" json:"userId"`
	Type      string    `gorm:"type:varchar(50)" json:"type"` // task_assigned, task_completed, comment_added, mention
	Title     string    `gorm:"type:varchar(200)" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	Link      string    `gorm:"type:varchar(200)" json:"link"` // e.g. task id to navigate to
	Read      bool      `gorm:"default:false" json:"read"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== 任务依赖 ====================
type TaskDependency struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	TaskID      string    `gorm:"type:varchar(36);index" json:"taskId"`                 // the task
	DependsOnID string    `gorm:"type:varchar(36);index" json:"dependsOnId"`            // depends on this task
	Type        string    `gorm:"type:varchar(20);default:finish_to_start" json:"type"` // finish_to_start, start_to_start
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ==================== RBAC 角色 ====================
type ProjectRole struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	ProjectID string    `gorm:"type:varchar(36);index" json:"projectId"`
	UserID    string    `gorm:"type:varchar(36);index" json:"userId"`
	Role      string    `gorm:"type:varchar(20);default:member" json:"role"` // owner, admin, member, viewer
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
