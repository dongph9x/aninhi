import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFishTableStructure() {
  console.log('🔍 Kiểm Tra Cấu Trúc Bảng Fish Và Cá Gen 2\n');

  try {
    // 1. Kiểm tra cấu trúc bảng Fish
    console.log('1️⃣ Cấu Trúc Bảng Fish:');
    console.log('   📋 Bảng: Fish');
    console.log('   📋 Trường generation: Int (mặc định = 1)');
    console.log('   📋 Cá gen 1: Từ câu cá (fishing)');
    console.log('   📋 Cá gen 2+: Từ lai tạo (breeding)');
    console.log('   📋 Mối quan hệ: Fish -> FishInventoryItem -> FishInventory -> User');

    // 2. Kiểm tra tất cả cá hiện tại
    console.log('\n2️⃣ Tất Cả Cá Trong Database:');
    
    const allFish = await prisma.fish.findMany({
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        generation: true,
        level: true,
        rarity: true,
        value: true,
        status: true,
        createdAt: true
      },
      orderBy: [
        { generation: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (allFish.length === 0) {
      console.log('   ✅ Không có cá nào trong database');
    } else {
      console.log(`   📊 Tổng cộng: ${allFish.length} con cá`);
      
      // Nhóm theo generation
      const fishByGeneration = allFish.reduce((acc, fish) => {
        if (!acc[fish.generation]) {
          acc[fish.generation] = [];
        }
        acc[fish.generation].push(fish);
        return acc;
      }, {} as Record<number, any[]>);

      Object.entries(fishByGeneration).forEach(([gen, fishes]) => {
        console.log(`\n   🐟 Gen ${gen} (${fishes.length} con):`);
        fishes.forEach((fish, index) => {
          console.log(`     ${index + 1}. ${fish.species} - Level ${fish.level} - ${fish.rarity} - ${fish.value.toLocaleString()} coins - ${fish.status}`);
          console.log(`        User: ${fish.userId} | Guild: ${fish.guildId} | ID: ${fish.id}`);
        });
      });
    }

    // 3. Kiểm tra mối quan hệ với FishInventory
    console.log('\n3️⃣ Mối Quan Hệ Với FishInventory:');
    
    const fishWithInventory = await prisma.fish.findMany({
      include: {
        inventoryItem: {
          include: {
            fishInventory: {
              include: {
                user: {
                  select: {
                    userId: true,
                    guildId: true,
                    balance: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { generation: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (fishWithInventory.length === 0) {
      console.log('   ✅ Không có cá nào trong inventory');
    } else {
      console.log(`   📊 Cá trong inventory: ${fishWithInventory.length} con`);
      
      fishWithInventory.forEach((fish, index) => {
        console.log(`\n   ${index + 1}. ${fish.species} (Gen ${fish.generation})`);
        console.log(`      📦 Trong inventory: ${fish.inventoryItem ? 'Có' : 'Không'}`);
        if (fish.inventoryItem) {
          console.log(`      👤 User: ${fish.inventoryItem.fishInventory.user.userId}`);
          console.log(`      🏠 Guild: ${fish.inventoryItem.fishInventory.user.guildId}`);
          console.log(`      💰 Balance: ${fish.inventoryItem.fishInventory.user.balance.toLocaleString()} coins`);
        }
      });
    }

    // 4. Kiểm tra mối quan hệ với BattleFishInventory
    console.log('\n4️⃣ Mối Quan Hệ Với BattleFishInventory:');
    
    const fishWithBattleInventory = await prisma.fish.findMany({
      include: {
        battleInventoryItem: {
          include: {
            battleFishInventory: {
              include: {
                user: {
                  select: {
                    userId: true,
                    guildId: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { generation: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    const battleFish = fishWithBattleInventory.filter(fish => fish.battleInventoryItem);
    
    if (battleFish.length === 0) {
      console.log('   ✅ Không có cá nào trong battle inventory');
    } else {
      console.log(`   📊 Cá trong battle inventory: ${battleFish.length} con`);
      
      battleFish.forEach((fish, index) => {
        console.log(`\n   ${index + 1}. ${fish.species} (Gen ${fish.generation})`);
        console.log(`      ⚔️ Trong battle inventory: Có`);
        console.log(`      👤 User: ${fish.battleInventoryItem!.battleFishInventory.user.userId}`);
        console.log(`      🏠 Guild: ${fish.battleInventoryItem!.battleFishInventory.user.guildId}`);
      });
    }

    // 5. Kiểm tra mối quan hệ với FishMarket
    console.log('\n5️⃣ Mối Quan Hệ Với FishMarket:');
    
    const fishInMarket = await prisma.fish.findMany({
      include: {
        marketListing: true
      },
      where: {
        marketListing: {
          isNot: null
        }
      },
      orderBy: [
        { generation: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (fishInMarket.length === 0) {
      console.log('   ✅ Không có cá nào đang bán trên market');
    } else {
      console.log(`   📊 Cá đang bán trên market: ${fishInMarket.length} con`);
      
      fishInMarket.forEach((fish, index) => {
        console.log(`\n   ${index + 1}. ${fish.species} (Gen ${fish.generation})`);
        console.log(`      💰 Giá: ${fish.marketListing!.price.toLocaleString()} coins`);
        console.log(`      🕒 Hết hạn: ${fish.marketListing!.expiresAt.toLocaleString()}`);
      });
    }

    // 6. Tóm tắt về cá gen 2
    console.log('\n6️⃣ Tóm Tắt Về Cá Gen 2:');
    console.log('   📋 Bảng chính: Fish');
    console.log('   📋 Trường generation = 2');
    console.log('   📋 Được tạo từ: Breeding (lai tạo)');
    console.log('   📋 Lưu trữ: Cùng bảng với cá gen 1');
    console.log('   📋 Mối quan hệ:');
    console.log('      - Fish -> FishInventoryItem -> FishInventory -> User');
    console.log('      - Fish -> BattleFishInventoryItem -> BattleFishInventory -> User');
    console.log('      - Fish -> FishMarket (nếu đang bán)');
    console.log('   📋 Dữ liệu bổ sung:');
    console.log('      - BreedingHistory: Lưu lịch sử lai tạo');
    console.log('      - stats: JSON string chứa stats của cá');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra cấu trúc bảng Fish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
checkFishTableStructure(); 