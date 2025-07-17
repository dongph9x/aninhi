#!/bin/bash

echo "🔄 Syncing Prisma Database (the one bot actually uses)..."
echo ""

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q "aninhi-discord-bot"; then
    echo "❌ Container aninhi-discord-bot is not running"
    exit 1
fi

# Backup database hiện tại trên host
echo "📦 Creating backup of current host database..."
cp ./data/database.db ./data/database.db.backup-$(date +%s)

# Copy database từ container về host (từ prisma/data)
echo "📋 Copying Prisma database from container to host..."
docker cp aninhi-discord-bot:/app/prisma/data/database.db ./data/database.db

# Sync sang prisma/data trên host
echo "🔄 Syncing to host prisma/data..."
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

# Kiểm tra updatedAt
echo ""
echo "🕐 Updated At verification:"
HOST_UPDATED=$(sqlite3 ./data/database.db "SELECT updatedAt FROM User WHERE userId = '389957152153796608';")
PRISMA_UPDATED=$(sqlite3 ./prisma/data/database.db "SELECT updatedAt FROM User WHERE userId = '389957152153796608';")

echo "Host database updatedAt: $HOST_UPDATED"
echo "Prisma database updatedAt: $PRISMA_UPDATED"

if [ "$HOST_USERS" = "$PRISMA_USERS" ] && [ "$HOST_BALANCE" = "$PRISMA_BALANCE" ]; then
    echo "✅ Database sync successful!"
    echo "🎉 All databases are now synchronized"
    echo "📊 Current balance: $HOST_BALANCE"
else
    echo "❌ Database sync failed - data doesn't match"
    exit 1
fi

# Cleanup temporary files
rm -f ./data/database.prisma
rm -f ./data/database.db.container

echo ""
echo "🚀 Ready to use Prisma Studio!"
echo "Run: npm run db:studio:correct" 