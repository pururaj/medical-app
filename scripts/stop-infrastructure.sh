#!/bin/bash

# Stop infrastructure services

set -e

echo "🛑 Stopping Medical App Infrastructure..."
echo ""

cd "$(dirname "$0")/.."

docker-compose down

echo ""
echo "✅ Infrastructure stopped successfully!"
echo ""
echo "💡 To start infrastructure again: ./scripts/start-infrastructure.sh"
echo "💡 To remove all data volumes: docker-compose down -v"
