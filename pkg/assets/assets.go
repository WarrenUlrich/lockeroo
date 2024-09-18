// pkg/assets/assets.go
package assets

import (
	"embed"
	"io/fs"
)

//go:embed embed/*
var embeddedFS embed.FS

// GetEmbedFS returns the embedded filesystem.
func GetEmbedFS() (fs.FS, error) {
	embedFS, err := fs.Sub(embeddedFS, "embed")
	if err != nil {
		return nil, err
	}
	return embedFS, nil
}

// GetTemplateFS returns the embedded template filesystem.
func GetTemplateFS() (fs.FS, error) {
	embedFS, err := GetEmbedFS()
	if err != nil {
		return nil, err
	}
	templateFS, err := fs.Sub(embedFS, "html")
	if err != nil {
		return nil, err
	}
	return templateFS, nil
}
