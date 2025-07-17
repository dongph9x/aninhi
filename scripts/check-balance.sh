#!/bin/bash

echo "💰 Checking balance for user 389957152153796608..."
echo ""

# Kiểm tra từ database file
echo "📊 From database file:"
HOST_BALANCE=$(sqlite3 ./data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';")
echo "Host database: $HOST_BALANCE"

# Kiểm tra từ container database
echo "🐳 From container database:"
CONTAINER_BALANCE=$(sqlite3 ./data/database.db.latest "SELECT balance FROM User WHERE userId = '389957152153796608';")
echo "Container database: $CONTAINER_BALANCE"

# Kiểm tra từ Prisma database
echo "🔍 From Prisma database:"
PRISMA_BALANCE=$(sqlite3 ./prisma/data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';")
echo "Prisma database: $PRISMA_BALANCE"

echo ""
echo "📋 Summary:"
echo "Host: $HOST_BALANCE"
echo "Container: $CONTAINER_BALANCE"
echo "Prisma: $PRISMA_BALANCE"

if [ "$HOST_BALANCE" = "$CONTAINER_BALANCE" ] && [ "$CONTAINER_BALANCE" = "$PRISMA_BALANCE" ]; then
    echo "✅ All databases are synchronized!"
else
    echo "❌ Database mismatch detected!"
    echo "Please run: npm run db:sync:container"
fi 