#!/bin/bash

# Script backup database từ Docker container
CONTAINER_NAME="aninhi-discord-bot"
BACKUP_DIR="./backup-from-docker"
TIMESTAMP=$(date -u +%Y-%m-%dT%H-%M-%S-%3NZ)

echo "🐳 Backup database từ Docker container..."

# Kiểm tra container có đang chạy không
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME không đang chạy!"
    echo "💡 Hãy chạy: docker-compose up -d"
    exit 1
fi

# Tạo thư mục backup
mkdir -p "$BACKUP_DIR"

# Copy database trực tiếp từ container
echo "📋 Copying database file..."
docker cp "$CONTAINER_NAME:/app/data/database.db" "$BACKUP_DIR/database-$TIMESTAMP.db"

if [ $? -eq 0 ]; then
    echo "✅ Backup thành công: $BACKUP_DIR/database-$TIMESTAMP.db"
    echo "📊 Kích thước: $(du -h "$BACKUP_DIR/database-$TIMESTAMP.db" | cut -f1)"
else
    echo "❌ Backup thất bại!"
    exit 1
fi

# Copy thư mục backup từ container (nếu có)
echo "📁 Copying backup folder..."
docker cp "$CONTAINER_NAME:/app/data/backup/" "$BACKUP_DIR/container-backups/"

if [ $? -eq 0 ]; then
    echo "✅ Đã copy thư mục backup từ container"
else
    echo "⚠️  Không có thư mục backup trong container"
fi

echo "🎉 Hoàn thành backup từ Docker!"
echo "📂 Files được lưu trong: $BACKUP_DIR/" 