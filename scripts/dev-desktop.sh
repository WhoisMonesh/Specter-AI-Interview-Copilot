#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR/apps/desktop"

echo "=================================================="
echo "⚡ Starting Specter AI Desktop Copilot (Dev Mode)..."
echo "=================================================="

# Check if node_modules exists, otherwise install
if [ ! -d "node_modules" ]; then
  echo "Installing desktop dependencies..."
  npm install
fi

# Run dev script
node scripts/dev.js
