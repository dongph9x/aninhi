import { FishInventoryService } from '../src/utils/fish-inventory';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishBreedingService } from '../src/utils/fish-breeding';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-sell-protection';
const testGuildId = 'test-guild-sell-protection';

async function testBattleFishSellProtection() {
  console.log('🧪 Testing Battle Fish Sell Protection...\n');

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

    // 2. Tạo cá thế hệ 2 có thể đấu
    console.log('📝 Creating Generation 2 fish for testing...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Battle Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 2000,
        generation: 2,
        specialTraits: JSON.stringify(['Test', 'Battle']),
        stats: JSON.stringify({
          strength: 50,
          agility: 50,
          intelligence: 50,
          defense: 50,
          luck: 50
        }),
        status: 'adult',
      }
    });

    console.log(`✅ Created test fish: ${testFish.species}`);
    console.log(`   Stats: ${JSON.stringify(JSON.parse(testFish.stats || '{}'))}`);

    // 3. Thêm cá vào inventory thường
    console.log('\n📦 Adding fish to normal inventory...');
    const addToInventoryResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, testFish.id);
    
    if (addToInventoryResult.success) {
      console.log('✅ Fish added to normal inventory successfully');
    } else {
      console.log(`❌ Failed to add fish to inventory: ${addToInventoryResult.error}`);
      return;
    }

    // 4. Thử bán cá khi chưa có trong battle inventory (sẽ thành công)
    console.log('\n💰 Testing selling fish when NOT in battle inventory...');
    const sellResult1 = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, testFish.id);
    
    if (sellResult1.success) {
      console.log('✅ Fish sold successfully when not in battle inventory');
      console.log(`   Coins earned: ${sellResult1.coinsEarned}`);
      console.log(`   New balance: ${sellResult1.newBalance}`);
    } else {
      console.log(`❌ Failed to sell fish: ${sellResult1.error}`);
    }

    // 5. Tạo cá mới để test battle inventory
    console.log('\n📝 Creating new fish for battle inventory test...');
    const testFish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Battle Fish 2',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 2500,
        generation: 2,
        specialTraits: JSON.stringify(['Test', 'Battle2']),
        stats: JSON.stringify({
          strength: 60,
          agility: 60,
          intelligence: 60,
          defense: 60,
          luck: 60
        }),
        status: 'adult',
      }
    });

    // 6. Thêm cá vào inventory thường
    await FishInventoryService.addFishToInventory(testUserId, testGuildId, testFish2.id);

    // 7. Thêm cá vào battle inventory
    console.log('\n⚔️ Adding fish to battle inventory...');
    const addToBattleResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, testFish2.id);
    
    if (addToBattleResult.success) {
      console.log('✅ Fish added to battle inventory successfully');
    } else {
      console.log(`❌ Failed to add fish to battle inventory: ${addToBattleResult.error}`);
      return;
    }

    // 8. Thử bán cá khi đang trong battle inventory (sẽ thất bại)
    console.log('\n💰 Testing selling fish when IN battle inventory...');
    const sellResult2 = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, testFish2.id);
    
    if (!sellResult2.success) {
      console.log('✅ Protection working: Cannot sell fish in battle inventory');
      console.log(`   Error message: ${sellResult2.error}`);
    } else {
      console.log('❌ Protection failed: Fish was sold despite being in battle inventory');
    }

    // 9. Xóa cá khỏi battle inventory
    console.log('\n🗑️ Removing fish from battle inventory...');
    const removeResult = await BattleFishInventoryService.removeFishFromBattleInventory(testUserId, testGuildId, testFish2.id);
    
    if (removeResult.success) {
      console.log('✅ Fish removed from battle inventory successfully');
    } else {
      console.log(`❌ Failed to remove fish from battle inventory: ${removeResult.error}`);
    }

    // 10. Thử bán cá sau khi đã xóa khỏi battle inventory (sẽ thành công)
    console.log('\n💰 Testing selling fish after removing from battle inventory...');
    const sellResult3 = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, testFish2.id);
    
    if (sellResult3.success) {
      console.log('✅ Fish sold successfully after removing from battle inventory');
      console.log(`   Coins earned: ${sellResult3.coinsEarned}`);
      console.log(`   New balance: ${sellResult3.newBalance}`);
    } else {
      console.log(`❌ Failed to sell fish: ${sellResult3.error}`);
    }

    // 11. Test FishBreedingService.sellFish cũng có protection
    console.log('\n🧪 Testing FishBreedingService.sellFish protection...');
    
    // Tạo cá mới
    const testFish3 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Battle Fish 3',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 2,
        specialTraits: JSON.stringify(['Test', 'Battle3']),
        stats: JSON.stringify({
          strength: 70,
          agility: 70,
          intelligence: 70,
          defense: 70,
          luck: 70
        }),
        status: 'adult',
      }
    });

    // Thêm vào battle inventory
    await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, testFish3.id);

    // Thử bán qua FishBreedingService
    const sellResult4 = await FishBreedingService.sellFish(testUserId, testFish3.id);
    
    if (!sellResult4.success) {
      console.log('✅ FishBreedingService protection working: Cannot sell fish in battle inventory');
      console.log(`   Error message: ${sellResult4.error}`);
    } else {
      console.log('❌ FishBreedingService protection failed: Fish was sold despite being in battle inventory');
    }

    console.log('\n🎉 Battle Fish Sell Protection test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBattleFishSellProtection(); 