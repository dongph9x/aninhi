#!/bin/bash

echo "🔍 Checking Prisma Cache and Connection Info..."
echo ""

# Kiểm tra Prisma client files
echo "📁 Prisma Client Files:"
docker exec aninhi-discord-bot ls -la /app/node_modules/.prisma/client/ | head -10

echo ""
echo "📊 Prisma Client Size:"
docker exec aninhi-discord-bot du -h /app/node_modules/.prisma/client/

echo ""
echo "🔧 Prisma Schema in Cache:"
docker exec aninhi-discord-bot cat /app/node_modules/.prisma/client/schema.prisma | head -20

echo ""
echo "📦 Package.json in Cache:"
docker exec aninhi-discord-bot cat /app/node_modules/.prisma/client/package.json

echo ""
echo "🌐 DATABASE_URL in Container:"
docker exec aninhi-discord-bot env | grep DATABASE

echo ""
echo "💾 Database File Info:"
docker exec aninhi-discord-bot ls -la /app/data/database.db

echo ""
echo "🔄 Testing Prisma Connection:"
docker exec aninhi-discord-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔗 Connecting to database...');
    await prisma.\$connect();
    console.log('✅ Connected successfully');
    
    console.log('📊 Database URL:', process.env.DATABASE_URL);
    
    console.log('👥 Testing user query...');
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId: '389957152153796608', guildId: '1005280612845891615' } }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  - User ID:', user.userId);
      console.log('  - Guild ID:', user.guildId);
      console.log('  - Balance:', user.balance);
      console.log('  - Updated At:', user.updatedAt);
    } else {
      console.log('❌ User not found');
    }
    
    console.log('🔍 Checking connection pool...');
    console.log('  - Connection count:', prisma._client._connectionCount);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
    console.log('🔌 Disconnected');
  }
})();
" 