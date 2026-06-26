#!/bin/bash

echo "🔧 Adding Pity System Columns to Docker Database"
echo "=================================================="

# Copy script vào container
echo "📁 Copying script to container..."
docker cp scripts/add-pity-columns-docker.ts aninhi-discord-bot:/app/scripts/

# Chạy script trong container
echo "🚀 Running script in container..."
docker exec -it aninhi-discord-bot npx tsx scripts/add-pity-columns-docker.ts

echo ""
echo "✅ Script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test fishing command: n.fishing"
echo "2. Test pity command: n.pity"
echo "3. Check if pity system works correctly" 