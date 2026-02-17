#!/bin/bash

# Start infrastructure services (databases, message queue, cache)
# This script starts PostgreSQL, RabbitMQ, Redis, and pgAdmin

set -e

echo "🚀 Starting Medical App Infrastructure..."
echo ""

cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Starting infrastructure services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Infrastructure started successfully!"
echo ""
echo "📝 Service URLs:"
echo "   - PostgreSQL (patient-db):   localhost:5432"
echo "   - PostgreSQL (appointment-db): localhost:5433"
echo "   - PostgreSQL (doctor-db):      localhost:5434"
echo "   - PostgreSQL (medical-records-db): localhost:5435"
echo "   - PostgreSQL (billing-db):     localhost:5436"
echo "   - RabbitMQ Management:         http://localhost:15672 (admin/admin)"
echo "   - Redis:                       localhost:6379"
echo "   - pgAdmin:                     http://localhost:5050 (admin@medicalapp.com/admin)"
echo ""
echo "💡 To stop infrastructure: ./scripts/stop-infrastructure.sh"
