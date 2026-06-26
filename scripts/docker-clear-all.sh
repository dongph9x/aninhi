#!/bin/bash

# Script đơn giản để clear all data trong Docker
echo "🐳 Clearing all data in Docker container..."

# Tên container (có thể thay đổi theo tên thực tế)
CONTAINER_NAME="aninhi-discord-bot"

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Container $CONTAINER_NAME is not running!"
    echo "Please start the container first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ Container $CONTAINER_NAME is running"
echo "🗑️ Clearing all data..."

# Chạy script clear all data trong container
docker exec $CONTAINER_NAME npx tsx scripts/clear-all-data.ts

echo "✅ Operation completed!" 