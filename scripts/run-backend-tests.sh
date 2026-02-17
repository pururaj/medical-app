#!/bin/bash

# Run all backend service tests

set -e

echo "🧪 Running Backend Tests..."
echo ""

cd "$(dirname "$0")/../backend"

# Build parent and shared library first
echo "📦 Building shared library..."
cd shared-library
./mvnw clean install -DskipTests
cd ..

echo ""
echo "🧪 Running tests for all services..."
echo ""

# Array of services
services=("patient-service" "api-gateway")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        echo "▶️  Testing $service..."
        cd "$service"
        ./mvnw test
        echo "✅ $service tests passed"
        echo ""
        cd ..
    fi
done

echo "✅ All backend tests passed!"
echo ""
echo "📊 To view coverage reports, check target/site/jacoco/index.html in each service directory"
