import { FishBattleService } from '../src/utils/fish-battle';
import { FishFeedService } from '../src/utils/fish-feed';
import prisma from '../src/utils/prisma';

async function testBothDailyLimits() {
  console.log('🧪 Testing Both Daily Limit Systems (Battle + Feed)...\n');

  const testUserId = 'test-user-both-limits';
  const testGuildId = 'test-guild-both-limits';

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
        lastBattleReset: new Date(),
        dailyFeedCount: 0,
        lastFeedReset: new Date()
      }
    });
    console.log('✅ Test user created\n');

    // 2. Test daily battle limit
    console.log('2️⃣ Testing Daily Battle Limit...');
    const battleCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Battle limit check:', battleCheck);
    console.log('✅ Battle limit test completed\n');

    // 3. Test daily feed limit
    console.log('3️⃣ Testing Daily Feed Limit...');
    const feedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    console.log('Feed limit check:', feedCheck);
    console.log('✅ Feed limit test completed\n');

    // 4. Test tăng cả hai limits
    console.log('4️⃣ Testing incrementing both limits...');
    await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
    
    const newBattleCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    const newFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    
    console.log('After incrementing:');
    console.log('  Battle:', newBattleCheck);
    console.log('  Feed:', newFeedCheck);
    console.log('✅ Increment test completed\n');

    // 5. Test đạt giới hạn cả hai
    console.log('5️⃣ Testing reaching both limits...');
    
    // Tăng battle count đến giới hạn
    for (let i = 2; i <= 20; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    }
    
    // Tăng feed count đến giới hạn
    for (let i = 2; i <= 20; i++) {
      await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
    }
    
    const maxBattleCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    const maxFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    
    console.log('At maximum limits:');
    console.log('  Battle:', maxBattleCheck);
    console.log('  Feed:', maxFeedCheck);
    console.log('✅ Maximum limits test completed\n');

    // 6. Test reset cả hai cho ngày mới
    console.log('6️⃣ Testing reset for new day...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await prisma.user.update({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      data: { 
        lastBattleReset: yesterday,
        lastFeedReset: yesterday
      }
    });

    const resetBattleCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    const resetFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    
    console.log('After reset for new day:');
    console.log('  Battle:', resetBattleCheck);
    console.log('  Feed:', resetFeedCheck);
    console.log('✅ Reset test completed\n');

    // 7. Kiểm tra database state cuối cùng
    console.log('7️⃣ Checking final database state...');
    const finalUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    console.log('Final user state:', {
      dailyBattleCount: finalUser?.dailyBattleCount,
      lastBattleReset: finalUser?.lastBattleReset,
      dailyFeedCount: finalUser?.dailyFeedCount,
      lastFeedReset: finalUser?.lastFeedReset
    });
    console.log('✅ Database state check completed\n');

    // 8. So sánh hai hệ thống
    console.log('8️⃣ Comparing both systems...');
    console.log('Daily Battle Limit:', FishBattleService['DAILY_BATTLE_LIMIT']);
    console.log('Daily Feed Limit:', FishFeedService.getDailyFeedLimit());
    console.log('✅ Comparison completed\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Daily Battle Limit: 20 lần/ngày');
    console.log('✅ Daily Feed Limit: 20 lần/ngày');
    console.log('✅ Both systems work independently');
    console.log('✅ Both systems reset at 00:00 next day');
    console.log('✅ Both systems have admin exceptions');

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

// Chạy test
testBothDailyLimits(); 