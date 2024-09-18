package templates

import (
	"html/template"

	"github.com/warrenulrich/lockeroo/pkg/assets"
)

var Templates *template.Template

func InitTemplates() error {
	templateFS, err := assets.GetTemplateFS()
	if err != nil {
		return err
	}
	Templates, err = template.ParseFS(templateFS, "*.html")
	if err != nil {
		return err
	}
	return nil
}
