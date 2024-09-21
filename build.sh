#!/usr/bin/env bash

set -euo pipefail

# Directories
WEBAPP_DIR="./webapp"
SERVER_DIR="./cmd/server"
EMBED_DIR="./pkg/assets/embed"
BIN_DIR="./bin"

# Ensure the build and embed directories are clean
echo "Cleaning build directories..."
rm -rf "$EMBED_DIR"
mkdir -p "$EMBED_DIR" "$BIN_DIR"

# Build React frontend
echo "Building web app..."
cd "$WEBAPP_DIR"
yarn install
yarn build
cd ..

# Copy React build output to embed directory
echo "Copying React build output..."
cp -r "$WEBAPP_DIR/build/"* "$EMBED_DIR"

# Gzip compress certain files in the EMBED_DIR
# echo "Gzipping files in $EMBED_DIR..."
# find "$EMBED_DIR" -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.json' \) -exec gzip -9 {} \; -exec mv {}.gz {} \;

# Build Go backend
echo "Building Go server..."
# cd "$SERVER_DIR"
go build -o "../$BIN_DIR/myproject" $SERVER_DIR
cd ..

echo "Build completed successfully."
