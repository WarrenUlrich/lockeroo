package assets

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed embed/*
var embeddedFS embed.FS

// ServeStaticFiles serves the React app and its static files
func ServeStaticFiles() http.Handler {
	// Create a file system from the embedded files, stripping the "embed" prefix
	fsEmbed, err := fs.Sub(embeddedFS, "embed")
	if err != nil {
		panic("Failed to create embedded filesystem: " + err.Error())
	}

	// Create a FileServer to serve static files from the embedded filesystem
	fileServer := http.FileServer(http.FS(fsEmbed))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Normalize the path
		requestPath := r.URL.Path

		// If the path is "/" or any non-static route, serve index.html for React routing
		if requestPath == "/" || !isStaticAsset(requestPath) {
			// Serve the index.html file for client-side routing
			indexFile, err := fs.ReadFile(embeddedFS, "embed/index.html")
			if err != nil {
				http.Error(w, "Index file not found", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write(indexFile)
			return
		}

		// If it's a static asset, serve it
		fileServer.ServeHTTP(w, r)
	})
}

// isStaticAsset checks if the request is for a static file (like JS, CSS, media)
func isStaticAsset(urlPath string) bool {
	// List of static asset extensions
	extensions := []string{".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".json", ".txt", ".map"}

	// Check if the URL path contains "/static/" (a common pattern for React apps)
	if strings.Contains(urlPath, "/static/") {
		return true
	}

	// Check if the request ends with any of the known static asset extensions
	for _, ext := range extensions {
		if strings.HasSuffix(urlPath, ext) {
			return true
		}
	}

	return false
}

// // pkg/assets/assets.go
// package assets

// import (
// 	"embed"
// 	"io/fs"
// )

// //go:embed embed/*
// var embeddedFS embed.FS

// // GetEmbedFS returns the embedded filesystem.
// func GetEmbedFS() (fs.FS, error) {
// 	embedFS, err := fs.Sub(embeddedFS, "embed")
// 	if err != nil {
// 		return nil, err
// 	}
// 	return embedFS, nil
// }

// // GetTemplateFS returns the embedded template filesystem.
// func GetTemplateFS() (fs.FS, error) {
// 	embedFS, err := GetEmbedFS()
// 	if err != nil {
// 		return nil, err
// 	}
// 	templateFS, err := fs.Sub(embedFS, "html")
// 	if err != nil {
// 		return nil, err
// 	}
// 	return templateFS, nil
// }
