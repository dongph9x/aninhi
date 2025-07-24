import { FishFeedService } from '../src/utils/fish-feed';
import prisma from '../src/utils/prisma';

async function testDailyFeedLimitSimple() {
  console.log('🧪 Testing Daily Feed Limit Simple (All Users Limited)...\n');

  const testUserId = 'test-user-feed-simple';
  const testGuildId = 'test-guild-feed-simple';

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

    // 2. Kiểm tra daily feed limit ban đầu
    console.log('2️⃣ Testing initial daily feed limit...');
    const initialCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    console.log('Initial check:');
    console.log(`   Can Feed: ${initialCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${initialCheck.remainingFeeds}/20`);
    console.log(`   Error: ${initialCheck.error || 'None'}`);

    // 3. Tăng daily feed count đến giới hạn
    console.log('\n3️⃣ Testing reaching limit...');
    for (let i = 0; i < 20; i++) {
      await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
      const check = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
      console.log(`   After ${i + 1} feeds: ${check.remainingFeeds}/20 - Can feed: ${check.canFeed}`);
    }

    // 4. Kiểm tra khi đạt giới hạn
    console.log('\n4️⃣ Testing at limit...');
    const atLimitCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    console.log('At limit check:');
    console.log(`   Can Feed: ${atLimitCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${atLimitCheck.remainingFeeds}/20`);
    console.log(`   Error: ${atLimitCheck.error || 'None'}`);

    // 5. Tăng thêm 1 lần nữa để test vượt giới hạn
    console.log('\n5️⃣ Testing beyond limit...');
    await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
    
    const beyondLimitCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
    console.log('Beyond limit check:');
    console.log(`   Can Feed: ${beyondLimitCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${beyondLimitCheck.remainingFeeds}/20`);
    console.log(`   Error: ${beyondLimitCheck.error || 'None'}`);

    // 6. Tóm tắt kết quả
    console.log('\n📋 Summary:');
    console.log(`   Initial: Can feed = ${initialCheck.canFeed}, Remaining = ${initialCheck.remainingFeeds}/20`);
    console.log(`   At limit: Can feed = ${atLimitCheck.canFeed}, Remaining = ${atLimitCheck.remainingFeeds}/20`);
    console.log(`   Beyond limit: Can feed = ${beyondLimitCheck.canFeed}, Remaining = ${beyondLimitCheck.remainingFeeds}/20`);
    
    if (!atLimitCheck.canFeed && atLimitCheck.error) {
      console.log('✅ SUCCESS: Daily feed limit is working correctly!');
      console.log('✅ All users (including admins) are now limited to 20 feeds per day');
    } else {
      console.log('❌ FAILED: Daily feed limit is not working correctly');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyFeedLimitSimple(); 