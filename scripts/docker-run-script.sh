#!/bin/bash

# Script để copy và chạy script trong Docker
echo "🐳 Running script in Docker container..."

# Tên container
CONTAINER_NAME="aninhi-discord-bot"

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Container $CONTAINER_NAME is not running!"
    echo "Please start the container first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ Container $CONTAINER_NAME is running"

# Lấy script name từ argument
if [ -z "$1" ]; then
    echo "❌ Please provide script name!"
    echo "Usage: $0 <script-name>"
    echo "Examples:"
    echo "  $0 show-data-stats"
    echo "  $0 clear-all-data"
    echo "  $0 clear-test-data"
    exit 1
fi

SCRIPT_NAME=$1
SCRIPT_FILE="scripts/${SCRIPT_NAME}.ts"

# Kiểm tra file có tồn tại không
if [ ! -f "$SCRIPT_FILE" ]; then
    echo "❌ Script file not found: $SCRIPT_FILE"
    exit 1
fi

echo "📁 Copying script to container..."
docker cp "$SCRIPT_FILE" "$CONTAINER_NAME:/app/$SCRIPT_NAME.ts"

echo "🚀 Running script..."
docker exec $CONTAINER_NAME npx tsx "$SCRIPT_NAME.ts"

echo "✅ Operation completed!" 