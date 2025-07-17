#!/bin/bash

echo "🔍 Starting Prisma Studio with correct database..."
echo "📊 Database: ./prisma/data/database.db"
echo "🌐 URL: http://localhost:5555"
echo ""

# Kiểm tra xem database có tồn tại không
if [ ! -f "./prisma/data/database.db" ]; then
    echo "❌ Database file not found: ./prisma/data/database.db"
    echo "Please run: npm run db:sync:container"
    exit 1
fi

# Kiểm tra xem Prisma đã được generate chưa
if [ ! -d "./node_modules/.prisma" ]; then
    echo "📦 Generating Prisma client..."
    npx prisma generate
fi

echo "🚀 Starting Prisma Studio..."
echo "Press Ctrl+C to stop"
echo ""

# Set DATABASE_URL và chạy Prisma Studio
export DATABASE_URL="file:./prisma/data/database.db"
npx prisma studio --hostname 0.0.0.0 --port 5555 