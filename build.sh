#!/usr/bin/env bash

set -euo pipefail

# Directories
WEBAPP_DIR="./webapp"
STATIC_DIR="$WEBAPP_DIR/static"
SRC_DIR="$WEBAPP_DIR/src"
EMBED_DIR="./pkg/assets/embed"
BIN_DIR="./bin"
SCRIPTS_DIR="./scripts"

# Ensure the build and embed directories are clean
echo "Cleaning build directories..."
rm -rf "$EMBED_DIR"
mkdir -p "$EMBED_DIR" "$BIN_DIR"

# Build JavaScript
echo "Building TypeScript..."
tsc --project "$WEBAPP_DIR/tsconfig.json"

# Minify JavaScript
echo "Minifying JavaScript files..."
find "$WEBAPP_DIR/static/js" -name '*.js' -type f | while read -r js_file; do
    rel_path="${js_file#$WEBAPP_DIR/static/js/}"
    dest_file="$EMBED_DIR/js/$rel_path"
    mkdir -p "$(dirname "$dest_file")"
    esbuild "$js_file" --minify --outfile="$dest_file"
done


# Minify CSS
echo "Minifying CSS files..."
find "$STATIC_DIR/css" -name '*.css' -type f | while read -r css_file; do
    rel_path="${css_file#$STATIC_DIR/}"
    dest_file="$EMBED_DIR/$rel_path"
    mkdir -p "$(dirname "$dest_file")"
    cleancss -o "$dest_file" "$css_file"
done

# Minify HTML
echo "Minifying HTML templates..."
find "$STATIC_DIR/html" -name '*.html' -type f | while read -r html_file; do
    rel_path="${html_file#$STATIC_DIR/html/}"
    dest_file="$EMBED_DIR/html/$rel_path"
    mkdir -p "$(dirname "$dest_file")"
    html-minifier \
        --collapse-whitespace \
        --remove-comments \
        --minify-css true \
        --minify-js true \
        -o "$dest_file" "$html_file"
done

# Copy Images
echo "Copying image files..."
find "$STATIC_DIR/images" -type f | while read -r image_file; do
    rel_path="${image_file#$STATIC_DIR/}"
    dest_file="$EMBED_DIR/$rel_path"
    mkdir -p "$(dirname "$dest_file")"
    cp "$image_file" "$dest_file"
done

echo "Building Go server..."
go build -o "$BIN_DIR/lockeroo" ./cmd/server

echo "Build completed successfully."
