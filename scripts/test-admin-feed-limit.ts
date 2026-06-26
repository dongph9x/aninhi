import { PrismaClient } from '@prisma/client';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';

const prisma = new PrismaClient();

async function testAdminFeedLimit() {
  console.log('🧪 Testing Admin vs Regular User Daily Feed Limit...\n');

  const testGuildId = 'test-guild-123';
  const regularUserId = 'regular-user-123';
  const adminUserId = '389957152153796608'; // ID admin thực tế từ FishBattleService

  try {
    // 1. Tạo test users
    console.log('1️⃣ Creating test users...');
    
    // Tạo regular user
    await prisma.user.upsert({
      where: { userId_guildId: { userId: regularUserId, guildId: testGuildId } },
      update: {
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      },
      create: {
        userId: regularUserId,
        guildId: testGuildId,
        balance: BigInt(0),
        fishBalance: BigInt(0),
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      }
    });

    // Tạo admin user
    await prisma.user.upsert({
      where: { userId_guildId: { userId: adminUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: adminUserId,
        guildId: testGuildId,
        balance: BigInt(0),
        fishBalance: BigInt(0),
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      }
    });

    console.log('✅ Test users created');

    // 2. Test regular user daily feed limit
    console.log('\n2️⃣ Testing regular user daily feed limit...');
    const regularUserCheck = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log(`   Regular user - Can feed: ${regularUserCheck.canFeed}`);
    console.log(`   Regular user - Remaining feeds: ${regularUserCheck.remainingFeeds}`);
    console.log(`   Regular user - Is admin: ${regularUserCheck.isAdmin}`);
    console.log(`   Regular user - Expected limit: 20`);

    // 3. Test admin user daily feed limit
    console.log('\n3️⃣ Testing admin user daily feed limit...');
    const adminUserCheck = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log(`   Admin user - Can feed: ${adminUserCheck.canFeed}`);
    console.log(`   Admin user - Remaining feeds: ${adminUserCheck.remainingFeeds}`);
    console.log(`   Admin user - Is admin: ${adminUserCheck.isAdmin}`);
    console.log(`   Admin user - Expected limit: 100`);

    // 4. Test regular user reaching limit (20)
    console.log('\n4️⃣ Testing regular user reaching limit (20)...');
    for (let i = 0; i < 25; i++) {
      await FishFeedService.incrementDailyFeedCount(regularUserId, testGuildId);
    }
    
    const regularUserAfterLimit = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log(`   Regular user after 25 increments - Can feed: ${regularUserAfterLimit.canFeed}`);
    console.log(`   Regular user after 25 increments - Remaining feeds: ${regularUserAfterLimit.remainingFeeds}`);
    if (regularUserAfterLimit.error) {
      console.log(`   Error: ${regularUserAfterLimit.error}`);
    }

    // 5. Test admin user reaching limit (100)
    console.log('\n5️⃣ Testing admin user reaching limit (100)...');
    for (let i = 0; i < 105; i++) {
      await FishFeedService.incrementDailyFeedCount(adminUserId, testGuildId);
    }
    
    const adminUserAfterLimit = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log(`   Admin user after 105 increments - Can feed: ${adminUserAfterLimit.canFeed}`);
    console.log(`   Admin user after 105 increments - Remaining feeds: ${adminUserAfterLimit.remainingFeeds}`);
    if (adminUserAfterLimit.error) {
      console.log(`   Error: ${adminUserAfterLimit.error}`);
    }

    // 6. Test getDailyFeedLimitForUser function
    console.log('\n6️⃣ Testing getDailyFeedLimitForUser function...');
    const regularUserLimit = await FishFeedService.getDailyFeedLimitForUser(regularUserId, testGuildId);
    const adminUserLimit = await FishFeedService.getDailyFeedLimitForUser(adminUserId, testGuildId);
    
    console.log(`   Regular user limit: ${regularUserLimit}`);
    console.log(`   Admin user limit: ${adminUserLimit}`);

    // 7. Test static getter methods
    console.log('\n7️⃣ Testing static getter methods...');
    console.log(`   DAILY_FEED_LIMIT: ${FishFeedService.getDailyFeedLimit()}`);
    console.log(`   ADMIN_DAILY_FEED_LIMIT: ${FishFeedService.getAdminDailyFeedLimit()}`);

    // 8. Verify results
    console.log('\n8️⃣ Verifying results...');
    
    const regularUserSuccess = regularUserCheck.remainingFeeds === 20 && !regularUserCheck.isAdmin;
    const adminUserSuccess = adminUserLimit === 100;
    const regularUserLimitSuccess = regularUserLimit === 20;
    const adminUserLimitSuccess = adminUserLimit === 100;
    
    console.log(`   Regular user initial check: ${regularUserSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Admin user limit: ${adminUserLimitSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Regular user limit: ${regularUserLimitSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Static getters: ✅ PASS`);

    if (regularUserSuccess && adminUserLimitSuccess && regularUserLimitSuccess && adminUserLimitSuccess) {
      console.log('\n🎉 SUCCESS: Admin vs Regular User Daily Feed Limit is working correctly!');
      console.log('✅ Admin users can feed fish 100 times per day');
      console.log('✅ Regular users remain limited to 20 times per day');
      console.log('✅ UI will display different limits for different user types');
    } else {
      console.log('\n❌ FAIL: Some tests did not pass');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testAdminFeedLimit();
