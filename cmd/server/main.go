// cmd/server/main.go
package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/warrenulrich/lockeroo/pkg/api"
	"github.com/warrenulrich/lockeroo/pkg/assets"
	"github.com/warrenulrich/lockeroo/pkg/db"
	"github.com/warrenulrich/lockeroo/pkg/middleware"
	"github.com/warrenulrich/lockeroo/pkg/templates"
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

	// Initialize templates
	if err := templates.InitTemplates(); err != nil {
		log.Fatalf("Error initializing templates: %v", err)
	}

	// Prepare embedded file systems
	embedFS, err := assets.GetEmbedFS()
	if err != nil {
		log.Fatalf("Error accessing embedded files: %v", err)
	}

	// Create a new HTTP server
	publicMux := http.NewServeMux()

	// Serve static files
	fileServer := http.FileServer(http.FS(embedFS))
	publicMux.Handle("/css/", fileServer)
	publicMux.Handle("/js/", fileServer)
	publicMux.Handle("/images/", fileServer)

	// Initialize handlers
	handlers := &api.Handlers{
		DB:        database,
		Templates: templates.Templates,
	}

	// Public routes
	publicMux.HandleFunc("/", handlers.IndexHandler)
	publicMux.HandleFunc("/auth/login", handlers.HandleLogin)
	publicMux.HandleFunc("/auth/signup", handlers.HandleSignup)

	// Protected routes
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/auth/status", handlers.AuthStatusHandler)
	protectedMux.HandleFunc("/auth/logout", handlers.LogoutHandler)
	
	mainMux := http.NewServeMux()

	mainMux.Handle("/", publicMux)
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
