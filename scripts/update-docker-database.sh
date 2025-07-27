#!/bin/bash

# 🐳 Update Docker Database
# Script này update database trong Docker container

echo "🐳 Updating Docker Database..."

# 1. Kiểm tra container có đang chạy không
echo "1️⃣ Kiểm tra container status..."
if ! docker compose ps | grep -q "aninhi-discord-bot.*Up"; then
    echo "❌ Container aninhi-discord-bot không đang chạy!"
    echo "   Chạy: docker compose up -d aninhi-bot"
    exit 1
fi

# 2. Update database schema
echo "2️⃣ Update database schema..."
docker compose exec aninhi-bot npx prisma db push --force-reset

# 3. Kiểm tra kết quả
if [ $? -eq 0 ]; then
    echo "✅ Database đã được update thành công!"
else
    echo "❌ Có lỗi khi update database!"
    exit 1
fi

# 4. Restart bot để áp dụng thay đổi
echo "3️⃣ Restart bot..."
docker compose restart aninhi-bot

# 5. Kiểm tra bot có hoạt động không
echo "4️⃣ Kiểm tra bot status..."
sleep 5
if docker compose ps | grep -q "aninhi-discord-bot.*Up"; then
    echo "✅ Bot đã restart thành công!"
else
    echo "❌ Bot không thể restart!"
    exit 1
fi

# 6. Test Achievement table
echo "5️⃣ Test Achievement table..."
docker compose exec aninhi-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.achievement.count();
    console.log('✅ Achievement table exists, count:', count);
    
    const achievement = await prisma.achievement.create({
      data: {
        name: 'Test Achievement',
        link: 'https://example.com/badge.png',
        target: '123456789',
        type: 0,
        active: true
      }
    });
    console.log('✅ Created test achievement:', achievement.name);
    
    await prisma.achievement.delete({ where: { id: achievement.id } });
    console.log('✅ Deleted test achievement');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

test();
"

if [ $? -eq 0 ]; then
    echo "✅ Achievement table hoạt động bình thường!"
else
    echo "❌ Có lỗi với Achievement table!"
    exit 1
fi

echo "🎉 Update Docker Database hoàn tất!"
echo "📊 Để xem logs: docker compose logs -f aninhi-bot"
echo "🔧 Để vào container: docker compose exec aninhi-bot sh" 