#!/bin/bash

# Thư mục backup và file database
BACKUP_DIR="./data/backup"
DATABASE_FILE="./data/database.db"
TIMESTAMP=$(date -u +%Y-%m-%dT%H-%M-%S-%3NZ)

# Tạo thư mục backup nếu chưa có
mkdir -p "$BACKUP_DIR"

# Tạo file backup với timestamp
BACKUP_FILE="$BACKUP_DIR/database-$TIMESTAMP.db"

echo "🔄 Đang backup database..."
cp "$DATABASE_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup thành công: $BACKUP_FILE"
    echo "📊 Kích thước: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup thất bại!"
    exit 1
fi

# Giữ lại 10 bản backup mới nhất, xóa bản cũ hơn
ls -t "$BACKUP_DIR"/database-*.db | tail -n +11 | xargs -r rm --

echo "🎉 Hoàn thành backup!" 