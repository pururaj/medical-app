#!/bin/bash

# Build all backend services

set -e

echo "🔨 Building Backend Services..."
echo ""

cd "$(dirname "$0")/../backend"

echo "📦 Building all services with Maven..."
./mvnw clean install

echo ""
echo "✅ All backend services built successfully!"
echo ""
echo "💡 JAR files are located in target/ directories of each service"
echo "💡 To run a service: cd backend/{service-name} && ./mvnw spring-boot:run"
