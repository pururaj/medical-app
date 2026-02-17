#!/bin/bash

# Start API Gateway locally

set -e

echo "🚀 Starting API Gateway..."
echo ""

cd "$(dirname "$0")/../backend/api-gateway"

echo "▶️  Running api-gateway on port 8080..."
./mvnw spring-boot:run

echo ""
echo "📝 API Gateway started!"
echo "   - Gateway: http://localhost:8080"
echo "   - Health: http://localhost:8080/actuator/health"
echo "   - Routes: http://localhost:8080/actuator/gateway/routes"
