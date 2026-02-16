package config

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dsn := ""

	fmt.Println("Connecting to TiDB...")

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get SQL DB:", err)
	}

	// Verify connection
	err = sqlDB.Ping()
	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("Connected to TiDB successfully!")
}
