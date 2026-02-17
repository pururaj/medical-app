#!/bin/bash

# Setup and install frontend dependencies

set -e

echo "📦 Setting up Frontend..."
echo ""

cd "$(dirname "$0")/../frontend/medical-app-ui"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

echo "📥 Installing dependencies..."
npm install

echo ""
echo "✅ Frontend setup completed!"
echo ""
echo "💡 To start the dev server: cd frontend/medical-app-ui && npm start"
echo "💡 To run tests: cd frontend/medical-app-ui && npm test"
echo "💡 To build for production: cd frontend/medical-app-ui && npm run build"
