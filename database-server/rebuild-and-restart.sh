#!/bin/bash
# Rebuild and restart database server containers

echo "Stopping database containers..."
docker compose down

echo ""
echo "Rebuilding and starting database containers..."
docker compose up -d --build

echo ""
echo "Cleaning up old adventurertavern-database images..."
docker images --filter "dangling=true" --filter "label=com.docker.compose.project=database-server" --format "{{.ID}}" | xargs -r docker rmi

echo ""
echo "Done!"