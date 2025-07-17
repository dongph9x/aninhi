#!/bin/bash

echo "📤 Exporting database from Prisma cache..."
echo ""

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q "aninhi-discord-bot"; then
    echo "❌ Container aninhi-discord-bot is not running"
    echo "Please start the container first: docker compose up -d"
    exit 1
fi

# Tạo thư mục export nếu chưa có
mkdir -p ./exports

# Copy database từ container về host
echo "📋 Copying Prisma database from container..."
docker cp aninhi-discord-bot:/app/prisma/data/database.db ./exports/database-export-$(date +%Y%m%d-%H%M%S).db

# Copy data database cũng để so sánh
echo "📋 Copying data database from container..."
docker cp aninhi-discord-bot:/app/data/database.db ./exports/data-database-$(date +%Y%m%d-%H%M%S).db

# Kiểm tra files đã export
echo ""
echo "📊 Exported files:"
ls -la ./exports/database-export-*.db
ls -la ./exports/data-database-*.db

# Kiểm tra balance từ database đã export
echo ""
echo "💰 Balance verification from exported database:"
EXPORTED_BALANCE=$(sqlite3 ./exports/database-export-$(date +%Y%m%d)*.db "SELECT balance FROM User WHERE userId = '389957152153796608';" 2>/dev/null | head -1)
DATA_BALANCE=$(sqlite3 ./exports/data-database-$(date +%Y%m%d)*.db "SELECT balance FROM User WHERE userId = '389957152153796608';" 2>/dev/null | head -1)

echo "Prisma database balance: $EXPORTED_BALANCE"
echo "Data database balance: $DATA_BALANCE"

# Tạo file info
echo ""
echo "📝 Creating export info..."
cat > ./exports/export-info-$(date +%Y%m%d-%H%M%S).txt << EOF
Database Export Information
==========================
Export Time: $(date)
Container: aninhi-discord-bot
User ID: 389957152153796608

Prisma Database:
- Balance: $EXPORTED_BALANCE
- File: database-export-$(date +%Y%m%d)*.db

Data Database:
- Balance: $DATA_BALANCE
- File: data-database-$(date +%Y%m%d)*.db

Export Commands:
- Prisma DB: docker cp aninhi-discord-bot:/app/prisma/data/database.db ./exports/
- Data DB: docker cp aninhi-discord-bot:/app/data/database.db ./exports/
EOF

echo "✅ Database export completed!"
echo "📁 Location: ./exports/"
echo "📄 Info file: export-info-$(date +%Y%m%d)*.txt" 