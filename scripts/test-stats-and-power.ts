import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-789';
const testGuildId = 'test-guild-789';

async function testStatsAndPower() {
  console.log('🧪 Testing Stats and Power System...\n');

  try {
    // 1. Tạo user test
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
        dailyStreak: 0
      }
    });

    // 2. Tạo cá thế hệ 1 (không có stats)
    console.log('📝 Creating Generation 1 fish (no stats)...');
    const gen1Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Golden Dragon Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 5000,
        generation: 1,
        specialTraits: JSON.stringify(['Caught', 'Golden']),
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()),
        status: 'growing',
      }
    });

    // Thêm vào inventory
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen1Fish.id || '');

    console.log(`✅ Created Gen 1 fish: ${gen1Fish.species}`);
    console.log(`   Initial stats: ${JSON.stringify(JSON.parse(gen1Fish.stats))}`);
    console.log(`   Total Power: ${FishBreedingService.calculateTotalPower({...gen1Fish, stats: JSON.parse(gen1Fish.stats)})}`);
    console.log(`   Total Power with Level: ${FishBreedingService.calculateTotalPowerWithLevel({...gen1Fish, stats: JSON.parse(gen1Fish.stats)})}\n`);

    // 3. Test cho cá thế hệ 1 ăn (không tăng stats)
    console.log('🍽️ Testing feeding Gen 1 fish (should not increase stats)...');
    
    for (let i = 0; i < 3; i++) {
      const feedResult = await FishBreedingService.feedFish(testUserId, gen1Fish.id || '', true);
      if (feedResult.success && feedResult.fish) {
        console.log(`   Level ${feedResult.fish.level}: Stats ${JSON.stringify(feedResult.fish.stats)}`);
        console.log(`   Total Power: ${FishBreedingService.calculateTotalPower(feedResult.fish)}`);
        console.log(`   Total Power with Level: ${FishBreedingService.calculateTotalPowerWithLevel(feedResult.fish)}`);
        console.log(`   Leveled up: ${feedResult.leveledUp}\n`);
      } else {
        console.log(`❌ Feeding failed: ${feedResult.error}\n`);
      }
    }

    // 4. Tạo cá thế hệ 2 (có stats)
    console.log('📝 Creating Generation 2 fish (with stats)...');
    const gen2Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Thunder Shark',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 2,
        specialTraits: JSON.stringify(['Bred', 'Thunder']),
        stats: JSON.stringify(FishBreedingService.generateRandomStats()),
        status: 'growing',
      }
    });

    // Thêm vào inventory
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen2Fish.id || '');

    console.log(`✅ Created Gen 2 fish: ${gen2Fish.species}`);
    console.log(`   Initial stats: ${JSON.stringify(JSON.parse(gen2Fish.stats))}`);
    console.log(`   Total Power: ${FishBreedingService.calculateTotalPower({...gen2Fish, stats: JSON.parse(gen2Fish.stats)})}`);
    console.log(`   Total Power with Level: ${FishBreedingService.calculateTotalPowerWithLevel({...gen2Fish, stats: JSON.parse(gen2Fish.stats)})}\n`);

    // 5. Test cho cá thế hệ 2 ăn (sẽ tăng stats)
    console.log('🍽️ Testing feeding Gen 2 fish (should increase stats)...');
    
    for (let i = 0; i < 5; i++) {
      const feedResult = await FishBreedingService.feedFish(testUserId, gen2Fish.id || '', true);
      if (feedResult.success && feedResult.fish) {
        console.log(`   Level ${feedResult.fish.level}: Stats ${JSON.stringify(feedResult.fish.stats)}`);
        console.log(`   Total Power: ${FishBreedingService.calculateTotalPower(feedResult.fish)}`);
        console.log(`   Total Power with Level: ${FishBreedingService.calculateTotalPowerWithLevel(feedResult.fish)}`);
        console.log(`   Leveled up: ${feedResult.leveledUp}`);
        console.log(`   Stats increased: ${feedResult.leveledUp ? 'Yes' : 'No'}\n`);
      } else {
        console.log(`❌ Feeding failed: ${feedResult.error}\n`);
      }
    }

    // 6. Hiển thị tổng kết
    console.log('📊 Summary:');
    const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    
    inventory.items.forEach((item: any) => {
      const fish = item.fish;
      const stats = JSON.parse(fish.stats || '{}');
      const totalPower = FishBreedingService.calculateTotalPower(fish);
      const totalPowerWithLevel = FishBreedingService.calculateTotalPowerWithLevel(fish);
      
      console.log(`   ${fish.species} (Gen ${fish.generation}, Lv.${fish.level}):`);
      console.log(`     Stats: ${JSON.stringify(stats)}`);
      console.log(`     Total Power (stats only): ${totalPower}`);
      console.log(`     Total Power (with level): ${totalPowerWithLevel}`);
      console.log(`     Level bonus: ${totalPowerWithLevel - totalPower}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup - xóa theo thứ tự để tránh foreign key constraint
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Xóa các bản ghi con trước
      await prisma.battleFishInventoryItem.deleteMany({
        where: {
          fish: {
            userId: testUserId,
            guildId: testGuildId
          }
        }
      });
      
      await prisma.fishInventoryItem.deleteMany({
        where: {
          fish: {
            userId: testUserId,
            guildId: testGuildId
          }
        }
      });
      
      await prisma.battleHistory.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      await prisma.breedingHistory.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      // Xóa cá
      await prisma.fish.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      // Xóa inventory
      await prisma.battleFishInventory.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      await prisma.fishInventory.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      // Xóa user cuối cùng
      await prisma.user.deleteMany({ 
        where: { userId: testUserId, guildId: testGuildId } 
      });
      
      console.log('✅ Cleanup completed successfully');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error (non-critical):', cleanupError);
    }
    
    await prisma.$disconnect();
  }
}

testStatsAndPower(); 