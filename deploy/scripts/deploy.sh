#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  Manual deploy script (run on the server or trigger via SSH)
# Usage: bash deploy.sh [image-tag]
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/medical-app"
COMPOSE="docker compose -f $APP_DIR/deploy/docker-compose.prod.yml --env-file $APP_DIR/deploy/.env"
IMAGE_TAG="${1:-latest}"

echo "── Deploying Medical App (tag: $IMAGE_TAG) ──"

cd "$APP_DIR"

# Export tag so compose picks it up
export IMAGE_TAG

# Login to GHCR (token must be set in .env as GHCR_TOKEN)
source "$APP_DIR/deploy/.env"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

# Start infrastructure (DBs, MQ, Redis) if not running
$COMPOSE up -d \
  patient-db appointment-db doctor-db auth-db \
  inventory-db pharmacy-db lab-db \
  rabbitmq redis

echo "⏳ Waiting for databases to be healthy..."
sleep 10

# Pull latest service images
$COMPOSE pull \
  auth-service api-gateway patient-service appointment-service \
  doctor-service inventory-service pharmacy-service lab-service

# Recreate services with new images
$COMPOSE up -d --force-recreate \
  auth-service api-gateway patient-service appointment-service \
  doctor-service inventory-service pharmacy-service lab-service

# Show running containers
echo ""
echo "── Running containers ──"
$COMPOSE ps

# Prune old images
docker image prune -f

echo ""
echo "✅ Deploy complete — $(date)"
