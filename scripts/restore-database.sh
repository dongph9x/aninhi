#!/bin/bash

# Script restore database từ file backup (chạy trên host, nơi docker-compose.yml đang đứng)
BACKUP_DIR="./data/backup"
CURRENT_DB="data/database.db"

if [ -z "$1" ]; then
    echo "❌ Vui lòng chỉ định file backup!"
    echo "💡 Cách dùng: ./scripts/restore-database.sh <tên-file-backup>"
    echo "📁 Files backup có sẵn:"
    ls -la "$BACKUP_DIR"/*.db 2>/dev/null || echo "   Không có file backup nào"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File backup không tồn tại: $BACKUP_FILE"
    echo "📁 Files backup có sẵn:"
    ls -la "$BACKUP_DIR"/*.db 2>/dev/null || echo "   Không có file backup nào"
    exit 1
fi

# Dừng bot trước khi ghi đè database (tránh ghi đè trong lúc bot đang đọc/viết)
echo "🛑 Dừng bot..."
docker compose -f docker-compose.yml down 2>/dev/null || echo "Bot không đang chạy"

# Backup file hiện tại trước khi restore
if [ -f "$CURRENT_DB" ]; then
    echo "💾 Backup file hiện tại..."
    cp "$CURRENT_DB" "$CURRENT_DB.backup-$(date +%Y%m%d-%H%M%S)"
fi

# Restore từ backup
echo "📋 Restoring database..."
cp "$BACKUP_FILE" "$CURRENT_DB"

if [ $? -eq 0 ]; then
    echo "✅ Restore thành công!"
    echo "📊 Kích thước: $(du -h "$CURRENT_DB" | cut -f1)"
    echo "🕐 Thời gian: $(date)"

    read -p "🚀 Có muốn khởi động lại bot không? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Khởi động bot..."
        docker compose -f docker-compose.yml up -d
        echo "✅ Bot đã được khởi động!"
    else
        echo "💡 Để khởi động bot: docker compose -f docker-compose.yml up -d"
    fi
else
    echo "❌ Restore thất bại!"
    exit 1
fi
