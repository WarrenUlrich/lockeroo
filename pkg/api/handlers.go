// pkg/api/handlers.go
package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

type Handlers struct {
	DB        *sql.DB
	Templates *template.Template
}

func (h *Handlers) HandleLogin(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie("session_id")
	if err == nil { // Cookie exists, now validate the session
		var userID int
		var expiresAt time.Time
		err = h.DB.QueryRow("SELECT user_id, expires_at FROM sessions WHERE session_id = ? AND expires_at > ?", sessionCookie.Value, time.Now()).Scan(&userID, &expiresAt)
		if err == nil {
			// Session is valid
			fmt.Fprintln(w, "Already logged in")
			return
		}
		// If there's an error, we assume the session is not valid anymore and continue with login
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err = json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	fmt.Println("creds:", creds)
	// Fetch the user from the database
	var storedHash string
	var userID int
	err = h.DB.QueryRow("SELECT user_id, password_hash FROM users WHERE username = ?", creds.Username).Scan(&userID, &storedHash)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Database query error: %v", err)
		return
	}

	// Compare the provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(creds.Password)); err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Generate a new session ID
	sessionID := uuid.NewString()
	expirationTime := time.Now().Add(24 * time.Hour)

	// Insert the session into the database
	_, err = h.DB.Exec(`
        INSERT INTO sessions (session_id, user_id, expires_at)
        VALUES (?, ?, ?)
    `, sessionID, userID, expirationTime)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Error creating session: %v", err)
		return
	}

	// Set the session ID in a cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  expirationTime,
		HttpOnly: true,
		Path:     "/",
	})

	// Return success response
	fmt.Fprintln(w, "Login successful")
}

func (h *Handlers) HandleSignup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var user struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Validate user input
	if user.Email == "" || user.Username == "" || user.Password == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Hash the password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Error hashing password: %v", err)
		return
	}

	// Insert the new user into the database
	_, err = h.DB.Exec(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    `, user.Username, user.Email, passwordHash)
	if err != nil {
		if sqliteError, ok := err.(sqlite3.Error); ok && sqliteError.ExtendedCode == sqlite3.ErrConstraintUnique {
			http.Error(w, "Username or email already exists", http.StatusConflict)
		} else {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			log.Printf("Error inserting user into database: %v", err)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *Handlers) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Get the session ID from the cookie
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	sessionID := sessionIDCookie.Value

	// Delete the session from the database
	_, err = h.DB.Exec("DELETE FROM sessions WHERE session_id = ?", sessionID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Set the expiration date in the past to delete the cookie
	expiredCookie := &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
	}

	http.SetCookie(w, expiredCookie)
	w.WriteHeader(http.StatusOK)
}

func (h *Handlers) AuthStatusHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id")
	w.Header().Set("Content-Type", "application/json")
	if userID != nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"authenticated": true})
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]bool{"authenticated": false})
	}
}

// IndexHandler serves the main page.
func (h *Handlers) IndexHandler(w http.ResponseWriter, r *http.Request) {
	if err := h.Templates.ExecuteTemplate(w, "index.html", nil); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Template execution error: %v", err)
	}
}
