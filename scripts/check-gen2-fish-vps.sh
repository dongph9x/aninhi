#!/bin/bash

# Script kiểm tra user có cá gen 2 và cá gen 1 level > 5 trên VPS
# Container ID: c8203bcf3da3

echo "🔍 Kiểm Tra User Có Cá Gen 2 & Gen 1 Level > 5 (VPS Docker)"
echo ""

CONTAINER_ID="c8203bcf3da3"

# Kiểm tra container
echo "1️⃣ Kiểm Tra Container:"
if ! docker ps --format "{{.ID}}" | grep -q "$CONTAINER_ID"; then
    echo "   ❌ Container $CONTAINER_ID không đang chạy"
    echo "   💡 Chạy: docker start $CONTAINER_ID"
    exit 1
fi

echo "   ✅ Container $CONTAINER_ID đang chạy"

# Chạy script trong container
echo ""
echo "2️⃣ Chạy Script Trong Container:"

docker exec $CONTAINER_ID node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGen2Fish() {
  try {
    console.log('🔍 Kiểm Tra User Có Cá Gen 2 & Gen 1 Level > 5 (VPS Database)');
    console.log('');

    // Kết nối database
    await prisma.\$connect();
    console.log('✅ Kết nối database thành công');

    // Thống kê tổng quan
    const totalUsers = await prisma.user.count();
    const totalFish = await prisma.fish.count();
    console.log(\`👥 Tổng số user: \${totalUsers}\`);
    console.log(\`🐟 Tổng số cá: \${totalFish}\`);

    // Thống kê theo generation
    console.log('');
    console.log('📊 Thống Kê Theo Generation:');
    const fishByGeneration = await prisma.fish.groupBy({
      by: ['generation'],
      _count: { id: true },
      orderBy: { generation: 'asc' }
    });

    fishByGeneration.forEach(group => {
      console.log(\`   Gen \${group.generation}: \${group._count.id} con cá\`);
    });

    // Tìm cá gen 2
    console.log('');
    console.log('🔍 Tìm Cá Gen 2:');
    const gen2Fish = await prisma.fish.findMany({
      where: { generation: 2 },
      select: {
        id: true, userId: true, guildId: true, species: true,
        level: true, rarity: true, value: true, status: true
      },
      orderBy: [{ userId: 'asc' }, { createdAt: 'desc' }]
    });

    if (gen2Fish.length === 0) {
      console.log('   ✅ Không có cá gen 2 nào');
    } else {
      console.log(\`   📊 Tìm thấy \${gen2Fish.length} con cá gen 2:\`);
      gen2Fish.forEach((fish, index) => {
        console.log(\`\n   🐟 Cá \${index + 1}:\`);
        console.log(\`      ID: \${fish.id}\`);
        console.log(\`      User: \${fish.userId}\`);
        console.log(\`      Guild: \${fish.guildId}\`);
        console.log(\`      Species: \${fish.species}\`);
        console.log(\`      Level: \${fish.level}\`);
        console.log(\`      Rarity: \${fish.rarity}\`);
        console.log(\`      Value: \${fish.value.toString()} coins\`);
        console.log(\`      Status: \${fish.status}\`);
      });
    }

    // Tìm cá gen 1 level > 5
    console.log('');
    console.log('🔍 Tìm Cá Gen 1 Level > 5:');
    const gen1HighLevelFish = await prisma.fish.findMany({
      where: { 
        generation: 1,
        level: { gt: 5 }
      },
      select: {
        id: true, userId: true, guildId: true, species: true,
        level: true, rarity: true, value: true, status: true
      },
      orderBy: [{ level: 'desc' }, { userId: 'asc' }]
    });

    if (gen1HighLevelFish.length === 0) {
      console.log('   ✅ Không có cá gen 1 level > 5 nào');
    } else {
      console.log(\`   📊 Tìm thấy \${gen1HighLevelFish.length} con cá gen 1 level > 5:\`);
      gen1HighLevelFish.forEach((fish, index) => {
        console.log(\`\n   🐟 Cá \${index + 1}:\`);
        console.log(\`      ID: \${fish.id}\`);
        console.log(\`      User: \${fish.userId}\`);
        console.log(\`      Guild: \${fish.guildId}\`);
        console.log(\`      Species: \${fish.species}\`);
        console.log(\`      Level: \${fish.level}\`);
        console.log(\`      Rarity: \${fish.rarity}\`);
        console.log(\`      Value: \${fish.value.toString()} coins\`);
        console.log(\`      Status: \${fish.status}\`);
      });
    }

    // Tìm cá gen 3+
    console.log('');
    console.log('🔍 Tìm Cá Gen 3+:');
    const gen3PlusFish = await prisma.fish.findMany({
      where: { generation: { gte: 3 } },
      select: {
        id: true, userId: true, guildId: true, species: true,
        generation: true, level: true, rarity: true, value: true, status: true
      },
      orderBy: [{ userId: 'asc' }, { generation: 'desc' }]
    });

    if (gen3PlusFish.length === 0) {
      console.log('   ✅ Không có cá gen 3+ nào');
    } else {
      console.log(\`   📊 Tìm thấy \${gen3PlusFish.length} con cá gen 3+:\`);
      gen3PlusFish.forEach((fish, index) => {
        console.log(\`\n   🐟 Cá \${index + 1} (Gen \${fish.generation}):\`);
        console.log(\`      ID: \${fish.id}\`);
        console.log(\`      User: \${fish.userId}\`);
        console.log(\`      Guild: \${fish.guildId}\`);
        console.log(\`      Species: \${fish.species}\`);
        console.log(\`      Level: \${fish.level}\`);
        console.log(\`      Rarity: \${fish.rarity}\`);
        console.log(\`      Value: \${fish.value.toString()} coins\`);
        console.log(\`      Status: \${fish.status}\`);
      });
    }

    // Thống kê tổng hợp
    console.log('');
    console.log('📊 Thống Kê Tổng Hợp:');
    const totalGen2 = gen2Fish.length;
    const totalGen1HighLevel = gen1HighLevelFish.length;
    const totalGen3Plus = gen3PlusFish.length;
    
    console.log(\`   🐟 Cá Gen 2: \${totalGen2} con\`);
    console.log(\`   🐟 Cá Gen 1 Level > 5: \${totalGen1HighLevel} con\`);
    console.log(\`   🐟 Cá Gen 3+: \${totalGen3Plus} con\`);
    console.log(\`   📋 Tổng cộng: \${totalGen2 + totalGen1HighLevel + totalGen3Plus} con cá cần chú ý\`);

    // Kiểm tra breeding history
    console.log('');
    console.log('🔍 Kiểm Tra Breeding History:');
    const breedingHistory = await prisma.breedingHistory.findMany({
      select: {
        id: true, userId: true, guildId: true, parent1Id: true,
        parent2Id: true, offspringId: true, bredAt: true, success: true
      },
      orderBy: { bredAt: 'desc' }
    });

    if (breedingHistory.length === 0) {
      console.log('   ✅ Không có lịch sử lai tạo nào');
    } else {
      console.log(\`   📊 Có \${breedingHistory.length} lần lai tạo:\`);
      breedingHistory.slice(0, 3).forEach((record, index) => {
        console.log(\`\n   \${index + 1}. User: \${record.userId} (Guild: \${record.guildId})\`);
        console.log(\`      🐟 Parent 1: \${record.parent1Id}\`);
        console.log(\`      🐟 Parent 2: \${record.parent2Id}\`);
        console.log(\`      🐟 Offspring: \${record.offspringId}\`);
        console.log(\`      ✅ Success: \${record.success}\`);
        console.log(\`      📅 Bred At: \${record.bredAt.toLocaleString()}\`);
      });
      
      if (breedingHistory.length > 3) {
        console.log(\`      ... và \${breedingHistory.length - 3} lần khác\`);
      }
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

checkGen2Fish();
"

echo ""
echo "✅ Hoàn thành kiểm tra!" 