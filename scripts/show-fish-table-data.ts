import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showFishTableData() {
  console.log('🐟 Hiển Thị Dữ Liệu Bảng Fish\n');

  try {
    // 1. Đếm tổng số cá
    console.log('1️⃣ Thống Kê Tổng Quan:');
    const totalFish = await prisma.fish.count();
    console.log(`   📊 Tổng số cá: ${totalFish}`);

    if (totalFish === 0) {
      console.log('   ✅ Bảng Fish trống');
      return;
    }

    // 2. Hiển thị tất cả cá
    console.log('\n2️⃣ Tất Cả Cá Trong Bảng Fish:');
    
    const allFish = await prisma.fish.findMany({
      orderBy: [
        { generation: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    allFish.forEach((fish, index) => {
      console.log(`\n   🐟 Cá ${index + 1}:`);
      console.log(`      ID: ${fish.id}`);
      console.log(`      User ID: ${fish.userId}`);
      console.log(`      Guild ID: ${fish.guildId}`);
      console.log(`      Species: ${fish.species}`);
      console.log(`      Generation: ${fish.generation}`);
      console.log(`      Level: ${fish.level}`);
      console.log(`      Experience: ${fish.experience}`);
      console.log(`      Rarity: ${fish.rarity}`);
      console.log(`      Value: ${fish.value.toLocaleString()} coins`);
      console.log(`      Status: ${fish.status}`);
      console.log(`      Special Traits: ${fish.specialTraits || 'Không có'}`);
      console.log(`      Stats: ${fish.stats || 'Không có'}`);
      console.log(`      Created At: ${fish.createdAt.toLocaleString()}`);
      console.log(`      Updated At: ${fish.updatedAt.toLocaleString()}`);
    });

    // 3. Thống kê theo generation
    console.log('\n3️⃣ Thống Kê Theo Generation:');
    
    const fishByGeneration = await prisma.fish.groupBy({
      by: ['generation'],
      _count: {
        id: true
      },
      orderBy: {
        generation: 'asc'
      }
    });

    fishByGeneration.forEach(group => {
      console.log(`   Gen ${group.generation}: ${group._count.id} con cá`);
    });

    // 4. Thống kê theo rarity
    console.log('\n4️⃣ Thống Kê Theo Rarity:');
    
    const fishByRarity = await prisma.fish.groupBy({
      by: ['rarity'],
      _count: {
        id: true
      },
      orderBy: {
        rarity: 'asc'
      }
    });

    fishByRarity.forEach(group => {
      console.log(`   ${group.rarity}: ${group._count.id} con cá`);
    });

    // 5. Thống kê theo status
    console.log('\n5️⃣ Thống Kê Theo Status:');
    
    const fishByStatus = await prisma.fish.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      orderBy: {
        status: 'asc'
      }
    });

    fishByStatus.forEach(group => {
      console.log(`   ${group.status}: ${group._count.id} con cá`);
    });

    // 6. Kiểm tra mối quan hệ với inventory
    console.log('\n6️⃣ Kiểm Tra Mối Quan Hệ Với Inventory:');
    
    const fishWithInventory = await prisma.fish.findMany({
      include: {
        inventoryItem: true,
        battleInventoryItem: true,
        marketListing: true
      }
    });

    fishWithInventory.forEach((fish, index) => {
      console.log(`\n   🐟 Cá ${index + 1} (${fish.species}):`);
      console.log(`      📦 Trong FishInventory: ${fish.inventoryItem ? 'Có' : 'Không'}`);
      console.log(`      ⚔️ Trong BattleFishInventory: ${fish.battleInventoryItem ? 'Có' : 'Không'}`);
      console.log(`      🏪 Trong FishMarket: ${fish.marketListing ? 'Có' : 'Không'}`);
    });

    // 7. Raw SQL query để kiểm tra
    console.log('\n7️⃣ Raw SQL Query (Để Kiểm Tra):');
    
    try {
      const rawFish = await prisma.$queryRaw`SELECT * FROM Fish LIMIT 5`;
      console.log('   ✅ Raw SQL query thành công');
      console.log(`   📋 Kết quả: ${JSON.stringify(rawFish, null, 2)}`);
    } catch (error) {
      console.log('   ❌ Raw SQL query thất bại:', error);
    }

  } catch (error) {
    console.error('❌ Lỗi khi hiển thị dữ liệu bảng Fish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
showFishTableData(); 