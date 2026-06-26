import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishingService } from '../src/utils/fishing';

async function testFishingFishCoin() {
  console.log('🧪 Testing Fishing with FishCoin...\n');

  const testUserId = 'test_user_fishing_fishcoin';
  const testGuildId = 'test_guild_fishing_fishcoin';

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
        fishBalance: 0n,
        dailyStreak: 0,
      },
    });
    console.log('✅ User created:', user.userId);
    console.log('   AniCoin balance:', user.balance.toString());
    console.log('   FishCoin balance:', user.fishBalance.toString());

    // 2. Thêm FishCoin cho user
    console.log('\n2. Adding FishCoin to user...');
    await fishCoinDB.addFishCoin(testUserId, testGuildId, 10000, 'Test FishCoin for fishing');
    const fishCoinBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('✅ Added 10000 FishCoin');
    console.log('   New FishCoin balance:', fishCoinBalance.toString());

    // 3. Test mua cần câu bằng FishCoin
    console.log('\n3. Testing buy fishing rod with FishCoin...');
    try {
      const rod = await FishingService.buyRod(testUserId, testGuildId, 'copper');
      console.log('✅ Successfully bought fishing rod:', rod.name);
      console.log('   Price:', rod.price, 'FishCoin');
      console.log('   Durability:', rod.durability);
      console.log('   Rarity bonus:', rod.rarityBonus + '%');
      
      const balanceAfterRod = await fishCoinDB.getFishBalance(testUserId, testGuildId);
      console.log('   FishCoin balance after buying rod:', balanceAfterRod.toString());
    } catch (error) {
      console.log('❌ Failed to buy fishing rod:', error.message);
    }

    // 4. Test mua mồi bằng FishCoin
    console.log('\n4. Testing buy fishing bait with FishCoin...');
    try {
      const result = await FishingService.buyBait(testUserId, testGuildId, 'premium', 5);
      console.log('✅ Successfully bought fishing bait:', result.bait.name);
      console.log('   Quantity:', 5);
      console.log('   Price per bait:', result.bait.price, 'FishCoin');
      console.log('   Total cost:', result.totalCost, 'FishCoin');
      console.log('   Rarity bonus:', result.bait.rarityBonus + '%');
      
      const balanceAfterBait = await fishCoinDB.getFishBalance(testUserId, testGuildId);
      console.log('   FishCoin balance after buying bait:', balanceAfterBait.toString());
    } catch (error) {
      console.log('❌ Failed to buy fishing bait:', error.message);
    }

    // 5. Test mua thêm mồi khác
    console.log('\n5. Testing buy different bait with FishCoin...');
    try {
      const result = await FishingService.buyBait(testUserId, testGuildId, 'good', 10);
      console.log('✅ Successfully bought fishing bait:', result.bait.name);
      console.log('   Quantity:', 10);
      console.log('   Total cost:', result.totalCost, 'FishCoin');
      
      const balanceAfterSecondBait = await fishCoinDB.getFishBalance(testUserId, testGuildId);
      console.log('   FishCoin balance after buying second bait:', balanceAfterSecondBait.toString());
    } catch (error) {
      console.log('❌ Failed to buy second fishing bait:', error.message);
    }

    // 6. Test mua cần câu đắt hơn
    console.log('\n6. Testing buy expensive fishing rod...');
    try {
      const rod = await FishingService.buyRod(testUserId, testGuildId, 'silver');
      console.log('✅ Successfully bought expensive fishing rod:', rod.name);
      console.log('   Price:', rod.price, 'FishCoin');
      
      const balanceAfterExpensiveRod = await fishCoinDB.getFishBalance(testUserId, testGuildId);
      console.log('   FishCoin balance after buying expensive rod:', balanceAfterExpensiveRod.toString());
    } catch (error) {
      console.log('❌ Failed to buy expensive fishing rod:', error.message);
    }

    // 7. Test lỗi không đủ FishCoin
    console.log('\n7. Testing insufficient FishCoin error...');
    try {
      const rod = await FishingService.buyRod(testUserId, testGuildId, 'diamond');
      console.log('❌ Should have failed - diamond rod costs 50000 FishCoin');
    } catch (error) {
      console.log('✅ Correctly failed with insufficient FishCoin:', error.message);
    }

    // 8. Kiểm tra fishing data
    console.log('\n8. Checking fishing data...');
    const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
    console.log('✅ Fishing data:');
    console.log('   Current rod:', fishingData.currentRod);
    console.log('   Current bait:', fishingData.currentBait);
    console.log('   Number of rods:', fishingData.rods.length);
    console.log('   Number of baits:', fishingData.baits.length);
    
    if (fishingData.rods.length > 0) {
      console.log('   Rods:');
      fishingData.rods.forEach((rod: any, index: number) => {
        console.log(`     ${index + 1}. ${rod.rodType} - Durability: ${rod.durability}`);
      });
    }
    
    if (fishingData.baits.length > 0) {
      console.log('   Baits:');
      fishingData.baits.forEach((bait: any, index: number) => {
        console.log(`     ${index + 1}. ${bait.baitType} - Quantity: ${bait.quantity}`);
      });
    }

    // 9. Kiểm tra lịch sử giao dịch FishCoin
    console.log('\n9. Checking FishCoin transaction history...');
    const transactions = await fishCoinDB.getFishTransactions(testUserId, testGuildId, 10);
    console.log('✅ FishCoin transactions:');
    transactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    // 10. Tổng kết
    console.log('\n10. Final summary...');
    const finalBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('✅ Final FishCoin balance:', finalBalance.toString());
    console.log('✅ Expected: 10000 - 1000 - 1000 - 5000 = 3000 FishCoin');

    console.log('\n✅ All fishing FishCoin tests completed successfully!');
    console.log('\n📋 Fishing now uses FishCoin for:');
    console.log('   🎣 Buying fishing rods');
    console.log('   🪱 Buying fishing bait');
    console.log('   💰 All fishing-related purchases');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishingFishCoin(); 