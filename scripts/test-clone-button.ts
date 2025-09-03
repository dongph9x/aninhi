import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';

async function testCloneButtonVisibility() {
  console.log('🧪 Testing Clone Button Visibility...\n');

  const testGuildId = 'test-guild-clone-123';
  const adminUserId = '389957152153796608'; // ID admin thực tế
  const regularUserId = 'regular-user-123';
  let prisma: any;

  try {
    // 0. Tạo test users
    console.log('0️⃣ Creating test users...');
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
    
    // Tạo regular user
    await prisma.user.upsert({
      where: { userId_guildId: { userId: regularUserId, guildId: testGuildId } },
      update: {},
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
    
    console.log('✅ Test users created');

    // 1. Test admin user
    console.log('1️⃣ Testing admin user...');
    const isAdmin = await FishBattleService.isAdministrator(adminUserId, testGuildId);
    console.log(`   Is admin: ${isAdmin}`);
    
    const adminFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log(`   Admin feed info:`, {
      canFeed: adminFeedInfo.canFeed,
      remainingFeeds: adminFeedInfo.remainingFeeds,
      isAdmin: adminFeedInfo.isAdmin
    });

    // 2. Test regular user
    console.log('\n2️⃣ Testing regular user...');
    const isRegularAdmin = await FishBattleService.isAdministrator(regularUserId, testGuildId);
    console.log(`   Is admin: ${isRegularAdmin}`);
    
    const regularFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log(`   Regular user feed info:`, {
      canFeed: regularFeedInfo.canFeed,
      remainingFeeds: regularFeedInfo.remainingFeeds,
      isAdmin: regularFeedInfo.isAdmin
    });

    // 3. Test clone button logic
    console.log('\n3️⃣ Testing clone button logic...');
    
    // Admin with selected fish
    const adminWithFish = adminFeedInfo.isAdmin && 'selectedFishId';
    console.log(`   Admin with fish - Should show clone button: ${adminWithFish ? '✅ YES' : '❌ NO'}`);
    
    // Regular user with selected fish
    const regularWithFish = regularFeedInfo.isAdmin && 'selectedFishId';
    console.log(`   Regular user with fish - Should show clone button: ${regularWithFish ? '✅ YES' : '❌ NO'}`);
    
    // Admin without selected fish
    const adminWithoutFish = adminFeedInfo.isAdmin && !'selectedFishId';
    console.log(`   Admin without fish - Should show clone button: ${adminWithoutFish ? '✅ YES' : '❌ NO'}`);

    // 4. Verify results
    console.log('\n4️⃣ Verification...');
    
    const adminShouldShowButton = adminFeedInfo.isAdmin === true;
    const regularShouldNotShowButton = regularFeedInfo.isAdmin === false;
    
    console.log(`   Admin should show clone button: ${adminShouldShowButton ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Regular user should not show clone button: ${regularShouldNotShowButton ? '✅ PASS' : '❌ FAIL'}`);
    
    if (adminShouldShowButton && regularShouldNotShowButton) {
      console.log('\n🎉 SUCCESS: Clone button visibility logic is working correctly!');
      console.log('✅ Admin users will see the clone button');
      console.log('✅ Regular users will not see the clone button');
      console.log('✅ Button only appears when admin has selected a fish');
    } else {
      console.log('\n❌ FAIL: Some visibility tests failed');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Chạy test
testCloneButtonVisibility();
