import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testBattleFishInventory() {
  console.log('🧪 Testing Battle Fish Inventory System...\n');

  const testUserId = 'test_user_battle_inventory';
  const testGuildId = 'test_guild_battle_inventory';

  try {
    // 1. Tạo test user
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
    console.log('✅ User created:', user.userId);

    // 2. Tạo cá thế hệ 1 (không thể đấu)
    console.log('\n2. Creating generation 1 fish (should not be eligible)...');
    const gen1Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 1 Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Gen1']),
        stats: JSON.stringify({
          strength: 50,
          agility: 50,
          intelligence: 50,
          defense: 50,
          luck: 50
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 1 fish created:', gen1Fish.species);

    // 3. Tạo cá thế hệ 2 (có thể đấu)
    console.log('\n3. Creating generation 2 fish (should be eligible)...');
    const gen2Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 2 Battle Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 2000,
        generation: 2,
        specialTraits: JSON.stringify(['Gen2', 'Battle']),
        stats: JSON.stringify({
          strength: 70,
          agility: 60,
          intelligence: 65,
          defense: 55,
          luck: 60
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 2 fish created:', gen2Fish.species);

    // 4. Tạo cá thế hệ 3 (có thể đấu)
    console.log('\n4. Creating generation 3 fish (should be eligible)...');
    const gen3Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 3 Elite Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 3,
        specialTraits: JSON.stringify(['Gen3', 'Elite']),
        stats: JSON.stringify({
          strength: 80,
          agility: 75,
          intelligence: 70,
          defense: 65,
          luck: 70
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 3 fish created:', gen3Fish.species);

    // 5. Test thêm cá thế hệ 1 (sẽ thất bại)
    console.log('\n5. Testing add generation 1 fish (should fail)...');
    const addGen1Result = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen1Fish.id);
    console.log('❌ Gen 1 add result:', addGen1Result.success, addGen1Result.error);

    // 6. Test thêm cá thế hệ 2 (sẽ thành công)
    console.log('\n6. Testing add generation 2 fish (should succeed)...');
    const addGen2Result = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen2Fish.id);
    console.log('✅ Gen 2 add result:', addGen2Result.success);
    if (addGen2Result.success) {
      console.log('   - Added fish:', addGen2Result.inventoryItem.fish.name);
    }

    // 7. Test thêm cá thế hệ 3 (sẽ thành công)
    console.log('\n7. Testing add generation 3 fish (should succeed)...');
    const addGen3Result = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen3Fish.id);
    console.log('✅ Gen 3 add result:', addGen3Result.success);
    if (addGen3Result.success) {
      console.log('   - Added fish:', addGen3Result.inventoryItem.fish.name);
    }

    // 8. Test lấy battle inventory
    console.log('\n8. Testing get battle inventory...');
    const inventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    console.log('✅ Battle inventory items:', inventory.items.length);
    inventory.items.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.fish.name} - Gen ${item.fish.generation} - Level ${item.fish.level}`);
    });

    // 9. Test lấy cá có thể thêm vào túi đấu
    console.log('\n9. Testing get eligible battle fish...');
    const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
    console.log('✅ Eligible fish count:', eligibleFish.length);
    eligibleFish.forEach((fish: any, index: number) => {
      console.log(`   ${index + 1}. ${fish.name} - Gen ${fish.generation} - Level ${fish.level}`);
    });

    // 10. Test xóa cá khỏi túi đấu
    console.log('\n10. Testing remove fish from battle inventory...');
    const removeResult = await BattleFishInventoryService.removeFishFromBattleInventory(testUserId, testGuildId, gen2Fish.id);
    console.log('✅ Remove result:', removeResult.success);

    // 11. Kiểm tra inventory sau khi xóa
    console.log('\n11. Checking inventory after removal...');
    const finalInventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    console.log('✅ Final battle inventory items:', finalInventory.items.length);

    console.log('\n🎉 Battle Fish Inventory tests completed!');

  } catch (error) {
    console.error('❌ Error testing battle fish inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBattleFishInventory(); 