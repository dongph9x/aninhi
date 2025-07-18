#!/bin/bash

# Script để backup database trước khi rebuild Docker
# Sử dụng: ./scripts/backup-before-rebuild.sh

set -e

# Tạo timestamp cho backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/database_backup_${TIMESTAMP}.db"

echo "🔄 Bắt đầu backup database..."

# Tạo thư mục backup nếu chưa có
mkdir -p "$BACKUP_DIR"

# Kiểm tra xem database có tồn tại không
if [ -f "./data/database.db" ]; then
    echo "📁 Tìm thấy database tại ./data/database.db"
    
    # Copy database
    cp "./data/database.db" "$BACKUP_FILE"
    
    # Kiểm tra file size
    FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
    
    if [ "$FILE_SIZE" -gt 0 ]; then
        echo "✅ Backup thành công: $BACKUP_FILE"
        echo "📊 Kích thước: ${FILE_SIZE} bytes"
        
        # Tạo symlink cho backup mới nhất
        ln -sf "$BACKUP_FILE" "${BACKUP_DIR}/database_backup_latest.db"
        echo "🔗 Backup mới nhất: ${BACKUP_DIR}/database_backup_latest.db"
    else
        echo "❌ Backup thất bại: File rỗng"
        exit 1
    fi
else
    echo "⚠️  Không tìm thấy database tại ./data/database.db"
    echo "📝 Tạo database trống..."
    mkdir -p "./data"
    touch "./data/database.db"
fi

echo ""
echo "🚀 Bây giờ bạn có thể chạy: docker compose up -d --build"
echo "📋 Để restore database sau này:"
echo "   cp ${BACKUP_FILE} ./data/database.db"
echo "" 