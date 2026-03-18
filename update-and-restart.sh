#!/bin/bash
# Update code and restart Docker containers

echo "Pulling latest code..."
git pull

echo ""
echo "Updating submodules..."
git submodule update --init --recursive

echo ""
echo "Pulling latest images..."
docker compose pull

echo ""
echo "Stopping Docker containers..."
docker compose down

echo ""
echo "Starting Docker containers..."
docker compose up -d --pull never

echo ""
echo "Cleaning up old honywen/adv-tavern images..."
docker images --filter "dangling=true" --format "{{.Repository}}:{{.ID}}" | grep "^honywen/adv-tavern:" | cut -d':' -f2 | xargs -r docker rmi

echo ""
echo "Done!"