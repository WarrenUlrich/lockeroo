#!/usr/bin/env bash

SRC_DIR="./webapp"
DEST_DIR="./cmd/server/embed/webapp"
JS_DIR="$SRC_DIR/static/compiled-js"
CSS_DIR="$SRC_DIR/static/css"
TEMPLATES_DIR="$SRC_DIR/templates"
BIN_DIR="./bin"

# Create directories if they don't exist
mkdir -p "$DEST_DIR/static/compiled-js"
mkdir -p "$DEST_DIR/static/css"
mkdir -p "$DEST_DIR/templates"
mkdir -p "$BIN_DIR"

echo "Building TypeScript..."
tsc --project ./webapp

# JS Minification
for file in "$JS_DIR"/*.js; do
    if [[ -f $file ]]; then
        echo "Minifying $file..."
        minified_file="$DEST_DIR/static/compiled-js/$(basename $file)"
        esbuild "$file" --minify --outfile="$minified_file"
    fi
done

# CSS Minification
for file in "$CSS_DIR"/*.css; do
    if [[ -f $file ]]; then
        echo "Minifying $file..."
        minified_file="$DEST_DIR/static/css/$(basename $file)"
        cleancss -o "$minified_file" "$file"
    fi
done

# HTML Minification
for file in "$TEMPLATES_DIR"/*.html; do
    if [[ -f $file ]]; then
        echo "Minifying $file..."
        minified_file="$DEST_DIR/templates/$(basename $file)"
        html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true -o "$minified_file" "$file"
    fi
done

echo "Building and running server..."
go run ./cmd/server