#!/usr/bin/env bash
set -e

echo "=================================================="
echo "🔑 GitHub Authentication & Private Setup for Specter AI"
echo "=================================================="
echo "This will connect your GitHub account via gh CLI."
echo "Options:"
echo " 1) Web Browser login (generates 8-character device code)"
echo " 2) Personal Access Token (PAT)"
echo "=================================================="

if command -v gh &> /dev/null; then
  echo "Launching: gh auth login --web -h github.com -p https"
  gh auth login --web -h github.com -p https
  echo "Verifying authentication status..."
  gh auth status
else
  echo "Error: gh CLI is not installed. Please run: brew install gh"
fi
