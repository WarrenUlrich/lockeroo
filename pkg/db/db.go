// pkg/db/db.go
package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// InitDB initializes the database and creates tables if they don't exist.
func InitDB(dbPath string) (*sql.DB, error) {
	// Ensure the database directory exists
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		return nil, fmt.Errorf("creating database directory: %w", err)
	}

	// Open the SQLite database
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	// Enable foreign key constraints
	if _, err := db.Exec(`PRAGMA foreign_keys = ON`); err != nil {
		return nil, fmt.Errorf("enabling foreign keys: %w", err)
	}

	// Create necessary tables
	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("creating tables: %w", err)
	}

	return db, nil
}

// createTables creates the required tables in the database.
func createTables(db *sql.DB) error {
	tableCreationQueries := []string{
		`CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            email_verified INTEGER DEFAULT 0,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
		`CREATE TABLE IF NOT EXISTS saved_passwords (
            password_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            site_name TEXT NOT NULL,
            site_url TEXT,
            site_username TEXT,
            encrypted_password TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );`,
		`CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );`,
	}

	for _, query := range tableCreationQueries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("executing query: %w", err)
		}
	}

	return nil
}

type User struct {
	UserID        int       `db:"user_id"`
	Username      string    `db:"username"`
	Email         string    `db:"email"`
	EmailVerified bool      `db:"email_verified"`
	PasswordHash  string    `db:"password_hash"`
	CreatedAt     time.Time `db:"created_at"`
}

type SavedPassword struct {
	PasswordID        int       `db:"password_id"`
	UserID            int       `db:"user_id"`
	SiteName          string    `db:"site_name"`
	SiteURL           string    `db:"site_url"`
	SiteUsername      string    `db:"site_username"`
	EncryptedPassword string    `db:"encrypted_password"`
	Notes             string    `db:"notes"`
	CreatedAt         time.Time `db:"created_at"`
}

type Session struct {
	SessionID string    `db:"session_id"`
	UserID    int       `db:"user_id"`
	ExpiresAt time.Time `db:"expires_at"`
}
