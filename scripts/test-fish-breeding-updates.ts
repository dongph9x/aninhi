import { FishBreedingService } from '../src/utils/fish-breeding';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-123';
const testGuildId = 'test-guild-123';

async function testFishBreedingUpdates() {
  console.log('🧪 Testing Fish Breeding System Updates...\n');

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

    // 2. Tạo cá huyền thoại thế hệ 1 (không có stats)
    console.log('📝 Creating Generation 1 fish (no stats)...');
    const gen1Fish1 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Golden Dragon Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 5000,
        generation: 1,
        specialTraits: JSON.stringify(['Caught', 'Golden']),
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()), // Không có stats
        status: 'adult',
      }
    });

    const gen1Fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Crystal Phoenix Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 6000,
        generation: 1,
        specialTraits: JSON.stringify(['Caught', 'Crystal']),
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()), // Không có stats
        status: 'adult',
      }
    });

    console.log(`✅ Created Gen 1 fish: ${gen1Fish1.species} and ${gen1Fish2.species}`);
    console.log(`   Gen 1 stats: ${JSON.stringify(JSON.parse(gen1Fish1.stats))}\n`);

    // 3. Lai tạo để tạo cá thế hệ 2
    console.log('🔄 Breeding fish to create Generation 2...');
    const breedingResult = await FishBreedingService.breedFish(testUserId, gen1Fish1.id || '', gen1Fish2.id || '');
    
    if (breedingResult.success && breedingResult.offspring) {
      console.log(`✅ Breeding successful! Created: ${breedingResult.offspring.name}`);
      console.log(`   Generation: ${breedingResult.offspring.generation}`);
      console.log(`   Stats: ${JSON.stringify(breedingResult.offspring.stats)}`);
      console.log(`   Traits: ${JSON.stringify(breedingResult.offspring.traits)}`);
      
      // Kiểm tra cá bố mẹ đã bị xóa
      const parent1Exists = await prisma.fish.findFirst({ where: { id: gen1Fish1.id } });
      const parent2Exists = await prisma.fish.findFirst({ where: { id: gen1Fish2.id } });
      console.log(`   Parent 1 deleted: ${!parent1Exists}`);
      console.log(`   Parent 2 deleted: ${!parent2Exists}\n`);
    } else {
      console.log(`❌ Breeding failed: ${breedingResult.error}\n`);
      return;
    }

    // 4. Tạo thêm cá thế hệ 2 để test
    console.log('📝 Creating additional Generation 2 fish for testing...');
    const gen2Fish1 = await prisma.fish.create({
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
        stats: JSON.stringify(FishBreedingService.generateRandomStats()), // Có stats
        status: 'growing',
      }
    });

    const gen2Fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Ice Leviathan',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 3500,
        generation: 2,
        specialTraits: JSON.stringify(['Bred', 'Ice']),
        stats: JSON.stringify(FishBreedingService.generateRandomStats()), // Có stats
        status: 'growing',
      }
    });

    console.log(`✅ Created Gen 2 fish: ${gen2Fish1.species} and ${gen2Fish2.species}`);
    console.log(`   Gen 2 stats: ${JSON.stringify(JSON.parse(gen2Fish1.stats))}\n`);

    // 5. Test cho cá ăn và lên cấp (chỉ cá thế hệ 2+ mới tăng stats)
    console.log('🍽️ Testing feeding and level up (stats increase for Gen 2+)...');
    
    // Cho cá thế hệ 2 ăn (admin mode để bypass cooldown)
    const feedResult = await FishBreedingService.feedFish(testUserId, gen2Fish1.id, true);
    if (feedResult.success && feedResult.fish) {
      console.log(`✅ Fed ${gen2Fish1.species}: Level ${feedResult.fish.level}, Exp: ${feedResult.fish.experience}`);
      console.log(`   Stats after feeding: ${JSON.stringify(feedResult.fish.stats)}`);
      console.log(`   Leveled up: ${feedResult.leveledUp}`);
      console.log(`   Became adult: ${feedResult.becameAdult}\n`);
    } else {
      console.log(`❌ Feeding failed: ${feedResult.error}\n`);
    }

    // 6. Test battle fish inventory (chỉ cá thế hệ 2+ mới được đấu)
    console.log('⚔️ Testing battle fish inventory validation...');
    
    // Thử thêm cá thế hệ 1 vào túi đấu (sẽ bị từ chối)
    const addGen1Result = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen1Fish1.id || '');
    console.log(`   Adding Gen 1 fish: ${addGen1Result.success ? '✅' : '❌'} ${addGen1Result.error || 'Success'}`);

    // Thêm cá thế hệ 2 vào túi đấu (sẽ thành công nếu trưởng thành)
    const addGen2Result = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen2Fish1.id || '');
    console.log(`   Adding Gen 2 fish: ${addGen2Result.success ? '✅' : '❌'} ${addGen2Result.error || 'Success'}`);

    // Lấy danh sách cá có thể đấu
    const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
    console.log(`   Eligible battle fish: ${eligibleFish.length} fish\n`);

    // 7. Lai tạo cá thế hệ 2 để tạo cá thế hệ 3
    console.log('🔄 Breeding Generation 2 fish to create Generation 3...');
    
    // Cho cá thế hệ 2 ăn để trưởng thành
    await FishBreedingService.feedFish(testUserId, gen2Fish1.id, true);
    await FishBreedingService.feedFish(testUserId, gen2Fish2.id, true);
    
    // Cập nhật trạng thái thành adult
    await prisma.fish.updateMany({
      where: { 
        id: { in: [gen2Fish1.id, gen2Fish2.id] },
        userId: testUserId 
      },
      data: { status: 'adult' }
    });

    const breedingResult2 = await FishBreedingService.breedFish(testUserId, gen2Fish1.id || '', gen2Fish2.id || '');
    
    if (breedingResult2.success && breedingResult2.offspring) {
      console.log(`✅ Breeding successful! Created: ${breedingResult2.offspring.name}`);
      console.log(`   Generation: ${breedingResult2.offspring.generation}`);
      console.log(`   Stats: ${JSON.stringify(breedingResult2.offspring.stats)}`);
      console.log(`   Traits: ${JSON.stringify(breedingResult2.offspring.traits)}`);
      
      // Kiểm tra cá bố mẹ đã bị xóa
      const parent1Exists = await prisma.fish.findFirst({ where: { id: gen2Fish1.id } });
      const parent2Exists = await prisma.fish.findFirst({ where: { id: gen2Fish2.id } });
      console.log(`   Parent 1 deleted: ${!parent1Exists}`);
      console.log(`   Parent 2 deleted: ${!parent2Exists}\n`);
    } else {
      console.log(`❌ Breeding failed: ${breedingResult2.error}\n`);
    }

    // 8. Hiển thị tổng kết
    console.log('📊 Summary:');
    const allFish = await prisma.fish.findMany({
      where: { userId: testUserId, guildId: testGuildId },
      orderBy: { generation: 'asc' }
    });

    console.log(`   Total fish: ${allFish.length}`);
    allFish.forEach(fish => {
      const stats = JSON.parse(fish.stats || '{}');
      const totalStats = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0);
      console.log(`   - ${fish.species} (Gen ${fish.generation}): Level ${fish.level}, Total Stats: ${totalStats}`);
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

testFishBreedingUpdates(); 