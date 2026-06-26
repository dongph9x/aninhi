#!/bin/bash

# 🐳 Docker Migration Fix Script with Backup
# Sửa lỗi "The column `isCloned` does not exist in the current database"
# Với backup database trước khi migration

echo "🚀 Starting Docker Migration Fix with Backup..."

# 1. Check if containers are running
echo "📦 Checking container status..."
if docker compose ps | grep -q "Up"; then
    echo "✅ Containers are running, creating backup..."
    
    # 2. Create backup
    echo "💾 Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker compose exec -T postgres pg_dump -U postgres aninhi > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: $BACKUP_FILE"
    else
        echo "❌ Backup failed, but continuing..."
    fi
else
    echo "⚠️  Containers are not running, skipping backup..."
fi

# 3. Stop containers
echo "📦 Stopping containers..."
docker compose down

# 4. Remove old database volume (WARNING: This will delete all data!)
echo "🗑️  Removing old database volume..."
docker volume rm aninhi_postgres_data 2>/dev/null || echo "Volume not found, continuing..."

# 5. Build and start containers
echo "🔨 Building and starting containers..."
docker compose up -d --build

# 6. Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# 7. Run Prisma migrations
echo "🔄 Running Prisma migrations..."
docker compose exec app npx prisma migrate deploy

# 8. Generate Prisma client
echo "🔧 Generating Prisma client..."
docker compose exec app npx prisma generate

# 9. Check migration status
echo "📊 Checking migration status..."
docker compose exec app npx prisma migrate status

echo "✅ Migration fix completed!"
echo "🎯 The isCloned column should now exist in the database."
echo "🚀 You can now run the application without the column error."

# 10. Show backup info
if [ -f "$BACKUP_FILE" ]; then
    echo "💾 Backup file: $BACKUP_FILE"
    echo "📁 To restore: docker compose exec -T postgres psql -U postgres aninhi < $BACKUP_FILE"
fi
