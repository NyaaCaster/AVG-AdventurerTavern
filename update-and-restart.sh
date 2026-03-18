#!/bin/bash
# Update code and restart client containers

echo "Pulling latest code..."
git pull

echo ""
echo "Updating submodules..."
git submodule update --init --recursive

echo ""
echo "Pulling latest client image..."
docker compose pull

echo ""
echo "Stopping client containers..."
docker compose down

echo ""
echo "Starting client containers..."
docker compose up -d

echo ""
echo "Cleaning up old images..."
docker image prune -f

echo ""
echo "Done!"
echo ""
echo "Note: Database server and File server are managed independently."
echo "  - Database: database-server/rebuild-and-restart.sh"
echo "  - File server: file-server/rebuild-and-restart.sh"
