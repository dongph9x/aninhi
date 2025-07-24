import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGen2FishData() {
  console.log('🐟 Kiểm Tra Dữ Liệu Cá Gen 2\n');

  try {
    // 1. Đếm tổng số cá theo generation
    console.log('1️⃣ Thống Kê Theo Generation:');
    
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

    // 2. Kiểm tra cá gen 2 chi tiết
    console.log('\n2️⃣ Chi Tiết Cá Gen 2:');
    
    const gen2Fish = await prisma.fish.findMany({
      where: {
        generation: 2
      },
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        level: true,
        rarity: true,
        value: true,
        stats: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Chỉ lấy 10 con đầu tiên
    });

    if (gen2Fish.length === 0) {
      console.log('   ❌ Không có cá gen 2 nào trong database');
    } else {
      console.log(`   ✅ Tìm thấy ${gen2Fish.length} con cá gen 2 (hiển thị 10 con đầu):`);
      
      gen2Fish.forEach((fish, index) => {
        const stats = fish.stats ? JSON.parse(fish.stats) : {};
        console.log(`\n   ${index + 1}. ${fish.species} (ID: ${fish.id})`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Level: ${fish.level} | Rarity: ${fish.rarity} | Status: ${fish.status}`);
        console.log(`      Value: ${fish.value.toLocaleString()}`);
        console.log(`      Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`);
        console.log(`      Created: ${fish.createdAt.toLocaleString()}`);
      });
    }

    // 3. Kiểm tra breeding history
    console.log('\n3️⃣ Lịch Sử Lai Tạo:');
    
    const breedingHistory = await prisma.breedingHistory.findMany({
      select: {
        id: true,
        userId: true,
        guildId: true,
        parent1Id: true,
        parent2Id: true,
        offspringId: true,
        bredAt: true,
        success: true,
        notes: true
      },
      orderBy: {
        bredAt: 'desc'
      },
      take: 10
    });

    if (breedingHistory.length === 0) {
      console.log('   ❌ Không có lịch sử lai tạo nào');
    } else {
      console.log(`   ✅ Tìm thấy ${breedingHistory.length} lần lai tạo (hiển thị 10 lần đầu):`);
      
      breedingHistory.forEach((record, index) => {
        console.log(`\n   ${index + 1}. Parent1 ID: ${record.parent1Id} + Parent2 ID: ${record.parent2Id}`);
        console.log(`      → Offspring ID: ${record.offspringId}`);
        console.log(`      User: ${record.userId} | Guild: ${record.guildId}`);
        console.log(`      Success: ${record.success} | Notes: ${record.notes || 'None'}`);
        console.log(`      Bred At: ${record.bredAt.toLocaleString()}`);
      });
    }

    // 4. Kiểm tra cá gen 2 trong fish inventory
    console.log('\n4️⃣ Cá Gen 2 Trong Fish Inventory:');
    
    const gen2InInventory = await prisma.fish.findMany({
      where: {
        generation: 2,
        inventoryItem: {
          isNot: null
        }
      },
      include: {
        inventoryItem: {
          include: {
            fishInventory: true
          }
        }
      },
      take: 5
    });

    if (gen2InInventory.length === 0) {
      console.log('   ❌ Không có cá gen 2 nào trong fish inventory');
    } else {
      console.log(`   ✅ Tìm thấy ${gen2InInventory.length} con cá gen 2 trong inventory (hiển thị 5 con đầu):`);
      
      gen2InInventory.forEach((fish, index) => {
        console.log(`\n   ${index + 1}. ${fish.species}`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Level: ${fish.level} | Status: ${fish.status}`);
        console.log(`      Inventory ID: ${fish.inventoryItem?.fishInventory.id}`);
      });
    }

    // 5. Kiểm tra cá gen 2 trong battle inventory
    console.log('\n5️⃣ Cá Gen 2 Trong Battle Inventory:');
    
    const gen2InBattleInventory = await prisma.fish.findMany({
      where: {
        generation: 2,
        battleInventoryItem: {
          isNot: null
        }
      },
      include: {
        battleInventoryItem: {
          include: {
            battleFishInventory: true
          }
        }
      },
      take: 5
    });

    if (gen2InBattleInventory.length === 0) {
      console.log('   ❌ Không có cá gen 2 nào trong battle inventory');
    } else {
      console.log(`   ✅ Tìm thấy ${gen2InBattleInventory.length} con cá gen 2 trong battle inventory (hiển thị 5 con đầu):`);
      
      gen2InBattleInventory.forEach((fish, index) => {
        console.log(`\n   ${index + 1}. ${fish.species}`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Level: ${fish.level} | Status: ${fish.status}`);
        console.log(`      Battle Inventory ID: ${fish.battleInventoryItem?.battleFishInventory.id}`);
      });
    }

    // 6. Tóm tắt
    console.log('\n6️⃣ Tóm Tắt:');
    console.log(`   📊 Tổng số cá gen 2: ${fishByGeneration.find(g => g.generation === 2)?._count.id || 0}`);
    console.log(`   📊 Tổng số lần lai tạo: ${breedingHistory.length}`);
    console.log(`   📊 Cá gen 2 trong inventory: ${gen2InInventory.length}`);
    console.log(`   📊 Cá gen 2 trong battle inventory: ${gen2InBattleInventory.length}`);

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGen2FishData(); 