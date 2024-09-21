// cmd/server/main.go
package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/warrenulrich/lockeroo/pkg/api"
	"github.com/warrenulrich/lockeroo/pkg/db"
	"github.com/warrenulrich/lockeroo/pkg/middleware"
)

func main() {
	// Command-line flags
	dbPath := flag.String("dbpath", "./data/database.db", "Path to the SQLite database")
	addr := flag.String("addr", ":8080", "HTTP network address")
	flag.Parse()

	// Initialize the database
	database, err := db.InitDB(*dbPath)
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer database.Close()

	// Create a new HTTP server
	publicMux := http.NewServeMux()

	// Initialize handlers
	handlers := &api.Handlers{
		DB: database,
	}

	// Public routes
	// publicMux.Handle("/", assets.ServeStaticFiles())
	publicMux.HandleFunc("/auth/login", handlers.HandleLogin)
	publicMux.HandleFunc("/auth/signup", handlers.HandleSignup)

	// Protected routes
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/auth/status", handlers.AuthStatusHandler)
	protectedMux.HandleFunc("/auth/logout", handlers.LogoutHandler)

	mainMux := http.NewServeMux()

	// mainMux.Handle("/", publicMux)
	mainMux.Handle("/auth/login", publicMux)
	mainMux.Handle("/auth/signup", publicMux)

	mainMux.Handle("/auth/status", middleware.SessionMiddleware(database, protectedMux))
	mainMux.Handle("/auth/logout", middleware.SessionMiddleware(database, protectedMux))

	// Start the HTTP server
	log.Printf("Starting server on %s", *addr)
	if err := http.ListenAndServe(*addr, mainMux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
