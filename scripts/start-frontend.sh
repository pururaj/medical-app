#!/bin/bash

# Start Angular Ionic frontend

set -e

echo "🚀 Starting Frontend..."
echo ""

cd "$(dirname "$0")/../frontend/medical-app-ui"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed!"
    echo "💡 Run: ./scripts/setup-frontend.sh"
    exit 1
fi

echo "▶️  Starting Angular dev server..."
npm start

echo ""
echo "📝 Frontend started!"
echo "   - App: http://localhost:4200"
