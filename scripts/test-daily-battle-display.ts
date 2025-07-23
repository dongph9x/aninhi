import { FishBattleService } from '../src/utils/fish-battle';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishBreedingService } from '../src/utils/fish-breeding';
import prisma from '../src/utils/prisma';

async function testDailyBattleDisplay() {
  console.log('🧪 Testing Daily Battle Limit Display...\n');

  const testUserId = 'test-user-daily-battle-display';
  const testGuildId = 'test-guild-daily-battle-display';

  try {
    // 1. Tạo user test
    console.log('1️⃣ Creating test user...');
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: BigInt(0),
        fishBalance: BigInt(0),
        dailyStreak: 0,
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      }
    });
    console.log('✅ Test user created\n');

    // 2. Test hiển thị daily battle limit ban đầu
    console.log('2️⃣ Testing initial daily battle limit display...');
    const initialCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Initial daily battle info:');
    console.log(`   Can battle: ${initialCheck.canBattle}`);
    console.log(`   Remaining battles: ${initialCheck.remainingBattles}/20`);
    console.log(`   Error: ${initialCheck.error || 'None'}`);
    console.log('✅ Initial display test completed\n');

    // 3. Test hiển thị sau khi đấu 5 lần
    console.log('3️⃣ Testing display after 5 battles...');
    for (let i = 1; i <= 5; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    }
    
    const after5Battles = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('After 5 battles:');
    console.log(`   Can battle: ${after5Battles.canBattle}`);
    console.log(`   Remaining battles: ${after5Battles.remainingBattles}/20`);
    console.log(`   Error: ${after5Battles.error || 'None'}`);
    console.log('✅ After 5 battles test completed\n');

    // 4. Test hiển thị khi đạt giới hạn
    console.log('4️⃣ Testing display at maximum limit...');
    // Tăng thêm 15 lần nữa để đạt 20 lần
    for (let i = 6; i <= 20; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    }
    
    const atMaxLimit = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('At maximum limit:');
    console.log(`   Can battle: ${atMaxLimit.canBattle}`);
    console.log(`   Remaining battles: ${atMaxLimit.remainingBattles}/20`);
    console.log(`   Error: ${atMaxLimit.error || 'None'}`);
    console.log('✅ Maximum limit test completed\n');

    // 5. Test hiển thị sau khi reset ngày mới
    console.log('5️⃣ Testing display after new day reset...');
    // Giả lập ngày mới
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await prisma.user.update({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      data: { lastBattleReset: yesterday }
    });

    const afterReset = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('After reset for new day:');
    console.log(`   Can battle: ${afterReset.canBattle}`);
    console.log(`   Remaining battles: ${afterReset.remainingBattles}/20`);
    console.log(`   Error: ${afterReset.error || 'None'}`);
    console.log('✅ Reset test completed\n');

    // 6. Test mô phỏng hiển thị trong lệnh fishbattle
    console.log('6️⃣ Simulating fishbattle command display...');
    console.log('📋 Embed fields that would be displayed:');
    console.log(`   ⏰ Giới Hạn Đấu Cá Hôm Nay: ✅ Còn **${afterReset.remainingBattles}/20** lần đấu cá`);
    console.log('✅ Fishbattle display simulation completed\n');

    // 7. Test với admin user
    console.log('7️⃣ Testing with admin user...');
    const adminUserId = '389957152153796608'; // ID trong danh sách admin
    const adminCheck = await FishBattleService.checkAndResetDailyBattleCount(adminUserId, testGuildId);
    console.log('Admin user daily battle info:');
    console.log(`   Can battle: ${adminCheck.canBattle}`);
    console.log(`   Remaining battles: ${adminCheck.remainingBattles}/20`);
    console.log(`   Error: ${adminCheck.error || 'None'}`);
    console.log('✅ Admin test completed\n');

    console.log('🎉 All daily battle display tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.user.deleteMany({
      where: { userId: testUserId, guildId: testGuildId }
    });
    console.log('✅ Cleanup completed');
    
    await prisma.$disconnect();
  }
}

testDailyBattleDisplay(); 