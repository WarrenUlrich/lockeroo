// pkg/middleware/session.go
package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"time"
)

// SessionMiddleware validates user sessions.
func SessionMiddleware(db *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the session ID from the cookies
		cookie, err := r.Cookie("session_id")
		if err != nil {
			if err == http.ErrNoCookie {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		// Fetch the session from the database
		var userID int
		var expiresAt time.Time
		err = db.QueryRow("SELECT user_id, expires_at FROM sessions WHERE session_id = ?", cookie.Value).Scan(&userID, &expiresAt)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Check if the session has expired
		if time.Now().After(expiresAt) {
			http.Error(w, "Session expired", http.StatusUnauthorized)
			return
		}

		// Set the user ID in the request context
		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
