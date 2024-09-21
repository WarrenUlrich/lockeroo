{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell rec {
  buildInputs = [
    pkgs.go
    pkgs.typescript
    pkgs.nodejs
    pkgs.yarn
    pkgs.esbuild        # for minifying js
    pkgs.clean-css-cli  # for minifying css
    pkgs.html-minifier
  ];
}
