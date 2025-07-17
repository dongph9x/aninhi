#!/bin/bash

echo "🔄 Syncing database from Docker container to host..."
echo ""

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q "aninhi-discord-bot"; then
    echo "❌ Container aninhi-discord-bot is not running"
    echo "Please start the container first: docker compose up -d"
    exit 1
fi

# Backup database hiện tại trên host
echo "📦 Creating backup of current host database..."
cp ./data/database.db ./data/database.db.backup-$(date +%s)

# Copy database từ container về host
echo "📋 Copying database from container to host..."
docker cp aninhi-discord-bot:/app/data/database.db ./data/database.db

# Kiểm tra xem copy có thành công không
if [ ! -f "./data/database.db" ]; then
    echo "❌ Failed to copy database from container"
    exit 1
fi

# Sync sang prisma/data
echo "🔄 Syncing to prisma/data..."
mkdir -p ./prisma/data
cp ./data/database.db ./prisma/data/database.db

# Kiểm tra kích thước files
echo ""
echo "📊 Database file sizes:"
echo "Host database (./data/database.db): $(du -h ./data/database.db | cut -f1)"
echo "Prisma database (./prisma/data/database.db): $(du -h ./prisma/data/database.db | cut -f1)"

# Kiểm tra số lượng users
echo ""
echo "👥 User count verification:"
HOST_USERS=$(sqlite3 ./data/database.db "SELECT COUNT(*) FROM User;")
PRISMA_USERS=$(sqlite3 ./prisma/data/database.db "SELECT COUNT(*) FROM User;")

echo "Host database users: $HOST_USERS"
echo "Prisma database users: $PRISMA_USERS"

# Kiểm tra balance của user cụ thể
echo ""
echo "💰 Balance verification for user 389957152153796608:"
HOST_BALANCE=$(sqlite3 ./data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';")
PRISMA_BALANCE=$(sqlite3 ./prisma/data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';")

echo "Host database balance: $HOST_BALANCE"
echo "Prisma database balance: $PRISMA_BALANCE"

if [ "$HOST_USERS" = "$PRISMA_USERS" ] && [ "$HOST_BALANCE" = "$PRISMA_BALANCE" ]; then
    echo "✅ Database sync successful!"
    echo "🎉 All databases are now synchronized"
else
    echo "❌ Database sync failed - data doesn't match"
    exit 1
fi

# Cleanup temporary file
rm -f ./data/database.db.container

echo ""
echo "🚀 Ready to use Prisma Studio!"
echo "Run: npm run db:studio:host" 