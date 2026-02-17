#!/bin/bash

# Start patient service locally

set -e

echo "🚀 Starting Patient Service..."
echo ""

cd "$(dirname "$0")/../backend/patient-service"

# Check if infrastructure is running
if ! docker ps | grep -q patient-db; then
    echo "⚠️  Patient database is not running!"
    echo "💡 Start infrastructure first: ./scripts/start-infrastructure.sh"
    exit 1
fi

echo "▶️  Running patient-service on port 8081..."
./mvnw spring-boot:run

echo ""
echo "📝 Patient Service started!"
echo "   - API: http://localhost:8081/api/v1/patients"
echo "   - Swagger UI: http://localhost:8081/swagger-ui.html"
echo "   - Health: http://localhost:8081/actuator/health"
