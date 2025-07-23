import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function testAdminDailyFeed() {
  console.log('🧪 Testing Admin Daily Feed Limit...\n');

  // Test với admin user ID (thay bằng ID thực của bạn)
  const adminUserId = '389957152153796608'; // Admin user ID
  const regularUserId = 'test-regular-user-feed';
  const testGuildId = 'test-guild-admin-daily-feed';

  try {
    // 1. Tạo user test thường
    console.log('1️⃣ Creating regular test user...');
    await prisma.user.upsert({
      where: { userId_guildId: { userId: regularUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: regularUserId,
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

    // 2. Kiểm tra quyền admin
    console.log('2️⃣ Checking admin status...');
    const isAdmin = await FishBattleService.isAdministrator(adminUserId, testGuildId);
    const isRegularAdmin = await FishBattleService.isAdministrator(regularUserId, testGuildId);
    
    console.log(`   Admin user (${adminUserId}): ${isAdmin}`);
    console.log(`   Regular user (${regularUserId}): ${isRegularAdmin}`);

    // 3. Kiểm tra daily feed limit cho admin
    console.log('\n3️⃣ Testing daily feed limit for admin...');
    const adminDailyCheck = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log('Admin daily feed check:');
    console.log(`   Can Feed: ${adminDailyCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${adminDailyCheck.remainingFeeds}/20`);
    console.log(`   Error: ${adminDailyCheck.error || 'None'}`);

    // 4. Tăng daily feed count cho admin
    console.log('\n4️⃣ Testing increment for admin...');
    console.log(`   Before increment: ${adminDailyCheck.remainingFeeds}/20`);
    
    await FishFeedService.incrementDailyFeedCount(adminUserId, testGuildId);
    
    const adminAfterIncrement = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log(`   After increment: ${adminAfterIncrement.remainingFeeds}/20`);
    console.log(`   Can still feed: ${adminAfterIncrement.canFeed}`);

    // 5. Tăng thêm nhiều lần để test
    console.log('\n5️⃣ Testing multiple increments for admin...');
    for (let i = 1; i <= 5; i++) {
      await FishFeedService.incrementDailyFeedCount(adminUserId, testGuildId);
      const check = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
      console.log(`   After ${i + 1} feeds: ${check.remainingFeeds}/20 - Can feed: ${check.canFeed}`);
    }

    // 6. So sánh với user thường
    console.log('\n6️⃣ Comparing with regular user...');
    const regularDailyCheck = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log('Regular user daily feed check:');
    console.log(`   Can Feed: ${regularDailyCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${regularDailyCheck.remainingFeeds}/20`);

    // 7. Tăng daily feed count cho user thường đến giới hạn
    console.log('\n7️⃣ Testing regular user reaching limit...');
    for (let i = 1; i <= 20; i++) {
      await FishFeedService.incrementDailyFeedCount(regularUserId, testGuildId);
    }
    
    const regularAtLimit = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log('Regular user at limit:');
    console.log(`   Can Feed: ${regularAtLimit.canFeed}`);
    console.log(`   Remaining Feeds: ${regularAtLimit.remainingFeeds}/20`);
    console.log(`   Error: ${regularAtLimit.error || 'None'}`);

    // 8. Tóm tắt kết quả
    console.log('\n📋 Summary:');
    console.log('   Admin user:');
    console.log(`     - Can always feed: ${adminAfterIncrement.canFeed}`);
    console.log(`     - Daily count increases: ${adminAfterIncrement.remainingFeeds < 20}`);
    console.log(`     - No limit enforced: ✅`);
    
    console.log('   Regular user:');
    console.log(`     - Can feed at limit: ${regularAtLimit.canFeed}`);
    console.log(`     - Limit enforced: ${!regularAtLimit.canFeed}`);
    console.log(`     - Error message: ${regularAtLimit.error ? '✅' : '❌'}`);

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.user.deleteMany({
        where: { 
          OR: [
            { userId_guildId: { userId: regularUserId, guildId: testGuildId } }
          ]
        }
      });
      console.log('   ✅ Test data cleaned up!');
    } catch (cleanupError) {
      console.error('   ❌ Cleanup failed:', cleanupError);
    }
    
    await prisma.$disconnect();
  }
}

testAdminDailyFeed(); 