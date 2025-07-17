#!/bin/bash

echo "🔄 Resetting Prisma client cache..."
echo ""

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q "aninhi-discord-bot"; then
    echo "❌ Container aninhi-discord-bot is not running"
    exit 1
fi

# Stop container
echo "🛑 Stopping container..."
docker compose stop

# Xóa Prisma cache trong container
echo "🧹 Cleaning Prisma cache..."
docker exec aninhi-discord-bot rm -rf /app/node_modules/.prisma 2>/dev/null || true

# Restart container
echo "🚀 Restarting container..."
docker compose up -d

# Đợi container khởi động
echo "⏳ Waiting for container to start..."
sleep 10

# Sync database từ container về host
echo "🔄 Syncing database from container..."
docker cp aninhi-discord-bot:/app/data/database.db ./data/database.db
cp ./data/database.db ./prisma/data/database.db

# Kiểm tra balance
echo ""
echo "💰 Checking balance for user 389957152153796608:"
CONTAINER_BALANCE=$(docker exec aninhi-discord-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId: '389957152153796608', guildId: '1005280612845891615' } }
    });
    console.log(user ? user.balance : 'User not found');
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>/dev/null)

HOST_BALANCE=$(sqlite3 ./data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';")

echo "Container balance: $CONTAINER_BALANCE"
echo "Host database balance: $HOST_BALANCE"

if [ "$CONTAINER_BALANCE" = "$HOST_BALANCE" ]; then
    echo "✅ Balance synchronized!"
else
    echo "❌ Balance mismatch detected"
fi

echo ""
echo "🎉 Prisma cache reset completed!"
echo "Try running n.balance again" 