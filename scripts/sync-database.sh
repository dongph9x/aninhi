#!/bin/bash

echo "🔄 Syncing database files..."
echo ""

# Kiểm tra xem database files có tồn tại không
if [ ! -f "./data/database.db" ]; then
    echo "❌ Main database not found: ./data/database.db"
    exit 1
fi

# Tạo thư mục prisma/data nếu chưa có
mkdir -p ./prisma/data

# Copy database từ data/ sang prisma/data/
echo "📋 Copying database from ./data/ to ./prisma/data/"
cp ./data/database.db ./prisma/data/database.db

# Kiểm tra kích thước files
echo ""
echo "📊 Database file sizes:"
echo "Main database (./data/database.db): $(du -h ./data/database.db | cut -f1)"
echo "Prisma database (./prisma/data/database.db): $(du -h ./prisma/data/database.db | cut -f1)"

# Kiểm tra số lượng users
echo ""
echo "👥 User count verification:"
MAIN_USERS=$(sqlite3 ./data/database.db "SELECT COUNT(*) FROM User;")
PRISMA_USERS=$(sqlite3 ./prisma/data/database.db "SELECT COUNT(*) FROM User;")

echo "Main database users: $MAIN_USERS"
echo "Prisma database users: $PRISMA_USERS"

if [ "$MAIN_USERS" = "$PRISMA_USERS" ]; then
    echo "✅ Database sync successful!"
else
    echo "❌ Database sync failed - user counts don't match"
    exit 1
fi

echo ""
echo "🎉 Database synchronization completed!" 