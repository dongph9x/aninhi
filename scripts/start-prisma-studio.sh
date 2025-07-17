#!/bin/bash

echo "🔍 Starting Prisma Studio..."
echo "📊 Database: ./data/database.db"
echo "🌐 URL: http://localhost:5555"
echo ""

# Kiểm tra xem database có tồn tại không
if [ ! -f "./data/database.db" ]; then
    echo "❌ Database file not found: ./data/database.db"
    echo "Please make sure the database exists."
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

# Chạy Prisma Studio
npx prisma studio --hostname 0.0.0.0 --port 5555 