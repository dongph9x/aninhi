#!/bin/bash

# 🐳 Safe Database Update
# Script này update database một cách an toàn, không mất data

echo "🐳 Safe Database Update..."

# 1. Kiểm tra container có đang chạy không
echo "1️⃣ Kiểm tra container status..."
if ! docker compose ps | grep -q "aninhi-discord-bot.*Up"; then
    echo "❌ Container aninhi-discord-bot không đang chạy!"
    echo "   Chạy: docker compose up -d aninhi-bot"
    exit 1
fi

# 2. Backup database hiện tại
echo "2️⃣ Backup database hiện tại..."
backup_file="database-export-$(date +%Y%m%d-%H%M%S).db"
docker compose exec aninhi-bot cp /app/prisma/data/database.db "./exports/$backup_file"
echo "✅ Database đã được backup: $backup_file"

# 3. Kiểm tra data hiện tại
echo "3️⃣ Kiểm tra data hiện tại..."
docker compose exec aninhi-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const fishCount = await prisma.fish.count();
    const systemSettingsCount = await prisma.systemSettings.count();
    
    console.log('📊 Data hiện tại:');
    console.log('👥 Users:', userCount);
    console.log('🐟 Fishes:', fishCount);
    console.log('⚙️  SystemSettings:', systemSettingsCount);
    
    if (userCount === 0 && fishCount === 0) {
      console.log('⚠️  Database có vẻ trống!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

checkData();
"

if [ $? -ne 0 ]; then
    echo "❌ Database có vẻ trống hoặc có lỗi!"
    echo "💡 Bạn có muốn khôi phục từ backup cũ không?"
    read -p "Khôi phục từ backup? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Khôi phục từ backup cũ..."
        docker compose exec aninhi-bot cp /app/exports/database-export-20250727-150159.db /app/prisma/data/database.db
        echo "✅ Đã khôi phục từ backup cũ"
    else
        echo "❌ Đã hủy bỏ!"
        exit 1
    fi
fi

# 4. Kiểm tra bảng Achievement
echo "4️⃣ Kiểm tra bảng Achievement..."
docker compose exec aninhi-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAchievement() {
  try {
    const count = await prisma.achievement.count();
    console.log('✅ Achievement table đã tồn tại, count:', count);
    return true;
  } catch (error) {
    if (error.code === 'P2021') {
      console.log('❌ Achievement table chưa tồn tại');
      return false;
    } else {
      console.error('❌ Error khác:', error.message);
      return false;
    }
  } finally {
    await prisma.\$disconnect();
  }
}

checkAchievement().then(exists => {
  if (exists) {
    console.log('🎉 Tất cả bảng đã tồn tại!');
    process.exit(0);
  } else {
    console.log('🔧 Cần thêm bảng Achievement...');
    process.exit(1);
  }
});
"

if [ $? -eq 0 ]; then
    echo "✅ Tất cả bảng đã tồn tại, không cần update!"
    exit 0
fi

# 5. Thêm bảng thiếu
echo "5️⃣ Thêm bảng thiếu..."
docker compose exec aninhi-bot npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Bảng đã được thêm thành công!"
else
    echo "❌ Có lỗi khi thêm bảng!"
    echo "🔄 Khôi phục từ backup..."
    docker compose exec aninhi-bot cp "/app/backups/$backup_file" /app/prisma/data/database.db
    exit 1
fi

# 6. Kiểm tra kết quả
echo "6️⃣ Kiểm tra kết quả..."
docker compose exec aninhi-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResult() {
  try {
    const userCount = await prisma.user.count();
    const fishCount = await prisma.fish.count();
    const achievementCount = await prisma.achievement.count();
    
    console.log('📊 Kết quả sau update:');
    console.log('👥 Users:', userCount);
    console.log('🐟 Fishes:', fishCount);
    console.log('🏆 Achievements:', achievementCount);
    
    // Test Achievement table
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

checkResult();
"

if [ $? -eq 0 ]; then
    echo "✅ Update thành công!"
else
    echo "❌ Có lỗi sau update!"
    echo "🔄 Khôi phục từ backup..."
    docker compose exec aninhi-bot cp "/app/backups/$backup_file" /app/prisma/data/database.db
    exit 1
fi

# 7. Restart bot
echo "7️⃣ Restart bot..."
docker compose restart aninhi-bot

# 8. Kiểm tra bot
echo "8️⃣ Kiểm tra bot status..."
sleep 5
if docker compose ps | grep -q "aninhi-discord-bot.*Up"; then
    echo "✅ Bot đã restart thành công!"
else
    echo "❌ Bot không thể restart!"
    exit 1
fi

echo "🎉 Safe Database Update hoàn tất!"
echo "💾 Data cũ vẫn được giữ nguyên"
echo "📊 Backup file: $backup_file"
echo "📊 Để xem logs: docker compose logs -f aninhi-bot" 