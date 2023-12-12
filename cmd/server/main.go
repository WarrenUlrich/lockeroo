package main

import (
	"embed"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed embed/webapp
var embeddedFS embed.FS

func main() {
	fmt.Println("Starting")
	templateFS, err := fs.Sub(embeddedFS, "embed/webapp/templates")
	if err != nil {
		log.Printf("Error creating sub filesystem for templates: %v", err)
		os.Exit(1)
	}

	staticFS, err := fs.Sub(embeddedFS, "embed/webapp/static")
	if err != nil {
		log.Printf("Error creating sub filesystem for static files: %v", err)
		os.Exit(1)
	}

	fileServer := http.FileServer(http.FS(staticFS))
	http.Handle("/static/", http.StripPrefix("/static/", fileServer))

	templates, err := template.ParseFS(templateFS, "*")
	if err != nil {
		log.Printf("Error parsing templates: %v", err)
		os.Exit(1)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		templates.ExecuteTemplate(w, "index.html", nil)
	})

	log.Println("Starting server on :8080")
	err = http.ListenAndServe(":5001", nil)
	if err != nil {
		log.Printf("Error starting server: %v", err)
		os.Exit(1)
	}
}
