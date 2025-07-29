#!/bin/bash

echo "🚀 Starting VPS Update Process..."
echo "=================================="

# 1. Pull code mới
echo "📥 Pulling latest code..."
cd ~/aninhi
git pull origin main
echo "✅ Code updated"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# 3. Stop containers
echo "🛑 Stopping containers..."
docker-compose down
echo "✅ Containers stopped"

# 4. Rebuild containers
echo "🔨 Rebuilding containers..."
docker-compose build --no-cache
echo "✅ Containers rebuilt"

# 5. Start containers
echo "🚀 Starting containers..."
docker-compose up -d
echo "✅ Containers started"

# 6. Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# 7. Check container status
echo "📊 Checking container status..."
docker ps

# 8. Create WarningRecord table if needed
echo "🔧 Setting up WarningRecord table..."
docker exec -it aninhi-discord-bot npx tsx scripts/test-warning-docker.ts

echo "🎉 VPS Update Completed Successfully!"
echo "======================================"