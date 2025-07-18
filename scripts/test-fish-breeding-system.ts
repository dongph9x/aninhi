import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';

async function testFishBreedingSystem() {
  console.log('🧪 Testing Fish Breeding System...\n');

  const testUserId = 'test_user_123';
  const testGuildId = 'test_guild_456';

  try {
    // 1. Test tạo user
    console.log('1. Creating test user...');
    const user = await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
      },
    });
    console.log('✅ User created/updated:', user.userId);

    // 2. Test tạo cá huyền thoại
    console.log('\n2. Creating legendary fish...');
    const fish1 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Golden Dragon Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 5000,
        generation: 1,
        specialTraits: JSON.stringify(['Rare', 'Golden']),
        status: 'growing',
      },
    });
    console.log('✅ Fish 1 created:', fish1.species);

    const fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Crystal Whale',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 1,
        specialTraits: JSON.stringify(['Crystal', 'Ancient']),
        status: 'growing',
      },
    });
    console.log('✅ Fish 2 created:', fish2.species);

    // 3. Test FishInventoryService
    console.log('\n3. Testing FishInventoryService...');
    
    // Lấy hoặc tạo inventory
    const inventory = await FishInventoryService.getOrCreateFishInventory(testUserId, testGuildId);
    console.log('✅ Inventory created:', inventory.id);

    // Thêm cá vào inventory
    const addResult1 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
    console.log('✅ Fish 1 added to inventory:', addResult1.success);

    const addResult2 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
    console.log('✅ Fish 2 added to inventory:', addResult2.success);

    // Lấy inventory
    const fishInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    console.log('✅ Fish inventory items:', fishInventory.items.length);

    // 4. Test FishBreedingService
    console.log('\n4. Testing FishBreedingService...');
    
    // Lấy collection
    const collection = await FishBreedingService.getUserFishCollection(testUserId);
    console.log('✅ Fish collection:', collection.length);

    // Cho cá ăn (fish1)
    console.log('\n5. Testing feed fish...');
    const feedResult = await FishBreedingService.feedFish(testUserId, fish1.id, true); // Admin bypass
    console.log('✅ Feed result:', feedResult.success);
    if (feedResult.success) {
      console.log('   - Experience gained:', feedResult.experienceGained);
      console.log('   - Leveled up:', feedResult.leveledUp);
      console.log('   - New value:', feedResult.newValue);
    }

    // Cho cá ăn thêm để lên level 10
    console.log('\n6. Feeding fish to level 10...');
    let currentFish = await FishBreedingService.getFishById(testUserId, fish1.id);
    while (currentFish && currentFish.level < 10) {
      const feedResult = await FishBreedingService.feedFish(testUserId, fish1.id, true);
      if (feedResult.success) {
        console.log(`   - Level ${feedResult.fish.level}, Exp: ${feedResult.fish.experience}/${feedResult.fish.experienceToNext}`);
        currentFish = feedResult.fish;
      } else {
        console.log('   - Feed failed:', feedResult.error);
        break;
      }
    }

    // Cho cá thứ 2 ăn để lên level 10
    console.log('\n7. Feeding second fish to level 10...');
    currentFish = await FishBreedingService.getFishById(testUserId, fish2.id);
    while (currentFish && currentFish.level < 10) {
      const feedResult = await FishBreedingService.feedFish(testUserId, fish2.id, true);
      if (feedResult.success) {
        console.log(`   - Level ${feedResult.fish.level}, Exp: ${feedResult.fish.experience}/${feedResult.fish.experienceToNext}`);
        currentFish = feedResult.fish;
      } else {
        console.log('   - Feed failed:', feedResult.error);
        break;
      }
    }

    // 8. Test breeding
    console.log('\n8. Testing breeding...');
    const breedResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id);
    console.log('✅ Breed result:', breedResult.success);
    if (breedResult.success) {
      console.log('   - Offspring:', breedResult.offspring.name);
      console.log('   - Generation:', breedResult.offspring.generation);
      console.log('   - Value:', breedResult.offspring.value);

      // Thêm cá con vào inventory
      const addOffspringResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, breedResult.offspring.id);
      console.log('✅ Offspring added to inventory:', addOffspringResult.success);
    }

    // 9. Test sell fish
    console.log('\n9. Testing sell fish...');
    const sellResult = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, fish2.id);
    console.log('✅ Sell result:', sellResult.success);
    if (sellResult.success) {
      console.log('   - Coins earned:', sellResult.coinsEarned);
      console.log('   - New balance:', sellResult.newBalance);
    }

    // 10. Final inventory check
    console.log('\n10. Final inventory check...');
    const finalInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    console.log('✅ Final inventory items:', finalInventory.items.length);
    
    finalInventory.items.forEach((item: any, index: number) => {
      const fish = item.fish;
      console.log(`   ${index + 1}. ${fish.name} - Level ${fish.level} - ${fish.status} - ${fish.value} coins`);
    });

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishBreedingSystem(); 