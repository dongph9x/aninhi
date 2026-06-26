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

# Backup luôn các file cấu hình runtime (maintenance, admin fishing bypass, channel restrictions)
for CONFIG_FILE in maintenance-mode.json admin-fishing-bypass.json channel-restrictions.json; do
    if [ -f "./data/$CONFIG_FILE" ]; then
        cp "./data/$CONFIG_FILE" "$BACKUP_DIR/${CONFIG_FILE%.json}-$TIMESTAMP.json"
    fi
done

# Giữ lại 10 bản backup mới nhất của mỗi loại, xóa bản cũ hơn
ls -t "$BACKUP_DIR"/database-*.db 2>/dev/null | tail -n +11 | xargs -r rm --
for CONFIG_FILE in maintenance-mode admin-fishing-bypass channel-restrictions; do
    ls -t "$BACKUP_DIR"/$CONFIG_FILE-*.json 2>/dev/null | tail -n +11 | xargs -r rm --
done

echo "🎉 Hoàn thành backup!" 