#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR/apps/website"

PORT=3000
echo "=================================================="
echo "🌐 Launching Specter AI Website Preview on http://localhost:$PORT"
echo "=================================================="

# Use python built-in http server
python3 -m http.server $PORT
