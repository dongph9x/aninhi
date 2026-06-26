#!/bin/bash

# 🐳 Docker Migration Fix Script
# Sửa lỗi "The column `isCloned` does not exist in the current database"

echo "🚀 Starting Docker Migration Fix..."

# 1. Stop containers if running
echo "📦 Stopping containers..."
docker compose down

# 2. Remove old database volume (WARNING: This will delete all data!)
echo "🗑️  Removing old database volume..."
docker volume rm aninhi_postgres_data 2>/dev/null || echo "Volume not found, continuing..."

# 3. Build and start containers
echo "🔨 Building and starting containers..."
docker compose up -d --build

# 4. Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# 5. Run Prisma migrations
echo "🔄 Running Prisma migrations..."
docker compose exec app npx prisma migrate deploy

# 6. Generate Prisma client
echo "🔧 Generating Prisma client..."
docker compose exec app npx prisma generate

# 7. Check migration status
echo "📊 Checking migration status..."
docker compose exec app npx prisma migrate status

echo "✅ Migration fix completed!"
echo "🎯 The isCloned column should now exist in the database."
echo "🚀 You can now run the application without the column error."
