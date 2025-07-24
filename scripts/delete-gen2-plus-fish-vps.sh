#!/bin/bash

# Script xóa cá gen 2+ và gen 1 level > 5 trên VPS
# Container ID: c8203bcf3da3

echo "🗑️ Xóa Cá Gen 2+ & Gen 1 Level > 5 (VPS Docker)"
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

# Xác nhận xóa
echo ""
echo "2️⃣ Xác Nhận Xóa:"
echo "   ⚠️  Bạn sắp xóa TẤT CẢ cá gen 2+ và gen 1 level > 5!"
echo "   ⚠️  Hành động này KHÔNG THỂ HOÀN TÁC!"
echo "   ⚠️  Tất cả dữ liệu cá gen 2+ và gen 1 level > 5 sẽ bị mất vĩnh viễn!"
echo ""
read -p "   Bạn có chắc chắn muốn tiếp tục? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "   ❌ Đã hủy bỏ"
    exit 0
fi

# Chạy script xóa trong container
echo ""
echo "3️⃣ Bắt Đầu Xóa:"

docker exec $CONTAINER_ID node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteGen2PlusFish() {
  try {
    console.log('🗑️ Xóa Cá Gen 2+ & Gen 1 Level > 5 (VPS Database)');
    console.log('');

    // Kết nối database
    await prisma.\$connect();
    console.log('✅ Kết nối database thành công');

    // Thống kê trước khi xóa
    console.log('📊 Thống Kê Trước Khi Xóa:');
    const fishByGeneration = await prisma.fish.groupBy({
      by: ['generation'],
      _count: { id: true },
      orderBy: { generation: 'asc' }
    });

    fishByGeneration.forEach(group => {
      console.log(\`   Gen \${group.generation}: \${group._count.id} con cá\`);
    });

    // Tìm cá gen 2+ và gen 1 level > 5
    console.log('');
    console.log('🔍 Tìm Cá Gen 2+ & Gen 1 Level > 5:');
    const fishToDelete = await prisma.fish.findMany({
      where: { 
        OR: [
          { generation: { gte: 2 } },
          { 
            AND: [
              { generation: 1 },
              { level: { gt: 5 } }
            ]
          }
        ]
      },
      select: {
        id: true, userId: true, guildId: true, species: true,
        generation: true, level: true, rarity: true, value: true
      },
      orderBy: [{ generation: 'desc' }, { level: 'desc' }]
    });

    if (fishToDelete.length === 0) {
      console.log('   ✅ Không có cá gen 2+ hoặc gen 1 level > 5 nào để xóa');
      return;
    }

    console.log(\`   📊 Tìm thấy \${fishToDelete.length} con cá để xóa:\`);
    
    // Nhóm theo generation và level
    const fishByCategory = fishToDelete.reduce((acc, fish) => {
      let category = \`Gen \${fish.generation}\`;
      if (fish.generation === 1 && fish.level > 5) {
        category = \`Gen 1 Level > 5\`;
      }
      if (!acc[category]) acc[category] = [];
      acc[category].push(fish);
      return acc;
    }, {});

    Object.entries(fishByCategory).forEach(([category, fishes]) => {
      console.log(\`\n   \${category} (\${fishes.length} con):\`);
      fishes.slice(0, 3).forEach((fish, index) => {
        console.log(\`     \${index + 1}. \${fish.species} - Level \${fish.level} - \${fish.rarity} - \${fish.value.toString()} coins\`);
      });
      if (fishes.length > 3) {
        console.log(\`     ... và \${fishes.length - 3} con khác\`);
      }
    });

    // Bắt đầu xóa
    console.log('');
    console.log('🗑️ Bắt Đầu Xóa...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const fish of fishToDelete) {
      try {
        await prisma.fish.delete({ where: { id: fish.id } });
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(\`   ✅ Đã xóa \${deletedCount}/\${fishToDelete.length} con cá\`);
        }
      } catch (error) {
        errorCount++;
        console.error(\`   ❌ Lỗi khi xóa cá \${fish.id}:\`, error.message);
      }
    }

    // Thống kê sau khi xóa
    console.log('');
    console.log('📊 Thống Kê Sau Khi Xóa:');
    const remainingFish = await prisma.fish.groupBy({
      by: ['generation'],
      _count: { id: true },
      orderBy: { generation: 'asc' }
    });

    console.log('   Cá còn lại:');
    remainingFish.forEach(group => {
      console.log(\`     Gen \${group.generation}: \${group._count.id} con cá\`);
    });

    // Tóm tắt kết quả
    console.log('');
    console.log('📋 Tóm Tắt Kết Quả:');
    console.log(\`   ✅ Đã xóa thành công: \${deletedCount} con cá\`);
    console.log(\`   ❌ Lỗi khi xóa: \${errorCount} con cá\`);
    console.log(\`   📊 Tổng cộng: \${fishToDelete.length} con cá (gen 2+ & gen 1 level > 5)\`);
    
    if (deletedCount === fishToDelete.length) {
      console.log('   🎉 Xóa thành công 100%!');
    } else {
      console.log(\`   ⚠️  Xóa thành công \${Math.round((deletedCount / fishToDelete.length) * 100)}%\`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

deleteGen2PlusFish();
"

echo ""
echo "✅ Hoàn thành xóa cá gen 2+ & gen 1 level > 5!" 