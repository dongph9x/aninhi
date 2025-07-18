import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-456';
const testGuildId = 'test-guild-456';

async function testSameGenerationBreeding() {
  console.log('🧪 Testing Same Generation Breeding System...\n');

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

    // 2. Tạo cá thế hệ 1
    console.log('📝 Creating Generation 1 fish...');
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
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()),
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
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()),
        status: 'adult',
      }
    });

    // Thêm vào inventory
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen1Fish1.id);
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen1Fish2.id);

    console.log(`✅ Created Gen 1 fish: ${gen1Fish1.species} and ${gen1Fish2.species}\n`);

    // 3. Test lai tạo cùng thế hệ 1
    console.log('🔄 Testing same generation breeding (Gen 1 + Gen 1)...');
    const breedingResult1 = await FishBreedingService.breedFish(testUserId, gen1Fish1.id, gen1Fish2.id);
    
    if (breedingResult1.success && breedingResult1.offspring) {
      console.log(`✅ Breeding successful! Created: ${breedingResult1.offspring.name}`);
      console.log(`   Generation: ${breedingResult1.offspring.generation}`);
      console.log(`   Stats: ${JSON.stringify(breedingResult1.offspring.stats)}`);
      
      // Thêm cá con vào inventory
      await FishInventoryService.addFishToInventory(testUserId, testGuildId, breedingResult1.offspring.id);
    } else {
      console.log(`❌ Breeding failed: ${breedingResult1.error}\n`);
      return;
    }

    // 4. Tạo thêm cá thế hệ 2 để test
    console.log('📝 Creating additional Generation 2 fish...');
    const gen2Fish1 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Thunder Shark',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 2,
        specialTraits: JSON.stringify(['Bred', 'Thunder']),
        stats: JSON.stringify(FishBreedingService.generateRandomStats()),
        status: 'adult',
      }
    });

    const gen2Fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Ice Leviathan',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3500,
        generation: 2,
        specialTraits: JSON.stringify(['Bred', 'Ice']),
        stats: JSON.stringify(FishBreedingService.generateRandomStats()),
        status: 'adult',
      }
    });

    // Thêm vào inventory
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen2Fish1.id);
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, gen2Fish2.id);

    console.log(`✅ Created Gen 2 fish: ${gen2Fish1.species} and ${gen2Fish2.species}\n`);

    // 5. Test lai tạo cùng thế hệ 2
    console.log('🔄 Testing same generation breeding (Gen 2 + Gen 2)...');
    const breedingResult2 = await FishBreedingService.breedFish(testUserId, gen2Fish1.id, gen2Fish2.id);
    
    if (breedingResult2.success && breedingResult2.offspring) {
      console.log(`✅ Breeding successful! Created: ${breedingResult2.offspring.name}`);
      console.log(`   Generation: ${breedingResult2.offspring.generation}`);
      console.log(`   Stats: ${JSON.stringify(breedingResult2.offspring.stats)}`);
      
      // Thêm cá con vào inventory
      await FishInventoryService.addFishToInventory(testUserId, testGuildId, breedingResult2.offspring.id);
    } else {
      console.log(`❌ Breeding failed: ${breedingResult2.error}\n`);
    }

    // 6. Test lai tạo khác thế hệ (sẽ bị từ chối)
    console.log('🔄 Testing different generation breeding (should fail)...');
    
    // Tạo thêm cá thế hệ 1
    const gen1Fish3 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Fire Salamander',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 4000,
        generation: 1,
        specialTraits: JSON.stringify(['Caught', 'Fire']),
        stats: JSON.stringify(FishBreedingService.generateEmptyStats()),
        status: 'adult',
      }
    });

    // Tạo thêm cá thế hệ 2
    const gen2Fish3 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Wind Eagle',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 4500,
        generation: 2,
        specialTraits: JSON.stringify(['Bred', 'Wind']),
        stats: JSON.stringify(FishBreedingService.generateRandomStats()),
        status: 'adult',
      }
    });

    // Thử lai tạo khác thế hệ
    const breedingResult3 = await FishBreedingService.breedFish(testUserId, gen1Fish3.id, gen2Fish3.id);
    
    if (!breedingResult3.success) {
      console.log(`✅ Correctly rejected different generation breeding: ${breedingResult3.error}`);
    } else {
      console.log(`❌ Should have rejected different generation breeding!`);
    }

    // 7. Hiển thị tổng kết
    console.log('\n📊 Summary:');
    const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    
    console.log(`   Total fish in inventory: ${inventory.items.length}`);
    
    // Nhóm theo thế hệ
    const fishByGeneration: { [generation: number]: any[] } = {};
    inventory.items.forEach((item: any) => {
      const generation = item.fish.generation;
      if (!fishByGeneration[generation]) {
        fishByGeneration[generation] = [];
      }
      fishByGeneration[generation].push(item.fish);
    });

    Object.keys(fishByGeneration).sort((a, b) => parseInt(a) - parseInt(b)).forEach(generation => {
      const genFish = fishByGeneration[parseInt(generation)];
      console.log(`   Generation ${generation}: ${genFish.length} fish`);
      genFish.forEach(fish => {
        const stats = JSON.parse(fish.stats || '{}');
        const totalStats = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0);
        console.log(`     - ${fish.species} (Lv.${fish.level}): Total Stats: ${totalStats}`);
      });
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

testSameGenerationBreeding(); 