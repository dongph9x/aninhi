import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

async function testDailyFeedLimitFix() {
  console.log('🧪 Testing Daily Feed Limit Fix (All Users Limited)...\n');

  // Test với admin user ID và regular user ID
  const adminUserId = '389957152153796608'; // Admin user ID
  const regularUserId = 'test-regular-user-feed-fix';
  const testGuildId = 'test-guild-daily-feed-fix';

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

    // 4. Tăng daily feed count cho admin đến giới hạn
    console.log('\n4️⃣ Testing admin reaching limit...');
    for (let i = 0; i < 20; i++) {
      await FishFeedService.incrementDailyFeedCount(adminUserId, testGuildId);
    }
    
    const adminAtLimit = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log('Admin at limit:');
    console.log(`   Can Feed: ${adminAtLimit.canFeed}`);
    console.log(`   Remaining Feeds: ${adminAtLimit.remainingFeeds}/20`);
    console.log(`   Error: ${adminAtLimit.error || 'None'}`);

    // 5. Tăng thêm 1 lần nữa để test vượt giới hạn
    console.log('\n5️⃣ Testing admin beyond limit...');
    await FishFeedService.incrementDailyFeedCount(adminUserId, testGuildId);
    
    const adminBeyondLimit = await FishFeedService.checkAndResetDailyFeedCount(adminUserId, testGuildId);
    console.log('Admin beyond limit:');
    console.log(`   Can Feed: ${adminBeyondLimit.canFeed}`);
    console.log(`   Remaining Feeds: ${adminBeyondLimit.remainingFeeds}/20`);
    console.log(`   Error: ${adminBeyondLimit.error || 'None'}`);

    // 6. So sánh với user thường
    console.log('\n6️⃣ Comparing with regular user...');
    const regularDailyCheck = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log('Regular user daily feed check:');
    console.log(`   Can Feed: ${regularDailyCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${regularDailyCheck.remainingFeeds}/20`);

    // 7. Tăng daily feed count cho user thường đến giới hạn
    console.log('\n7️⃣ Testing regular user reaching limit...');
    for (let i = 0; i < 20; i++) {
      await FishFeedService.incrementDailyFeedCount(regularUserId, testGuildId);
    }
    
    const regularAtLimit = await FishFeedService.checkAndResetDailyFeedCount(regularUserId, testGuildId);
    console.log('Regular user at limit:');
    console.log(`   Can Feed: ${regularAtLimit.canFeed}`);
    console.log(`   Remaining Feeds: ${regularAtLimit.remainingFeeds}/20`);
    console.log(`   Error: ${regularAtLimit.error || 'None'}`);

    // 8. Test với actual fish feeding (tạo test fish)
    console.log('\n8️⃣ Testing with actual fish feeding...');
    
    // Tạo test fish cho admin
    const adminTestFish = await prisma.fish.create({
      data: {
        userId: adminUserId,
        guildId: testGuildId,
        species: 'Admin Test Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        status: 'growing',
        stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
        specialTraits: JSON.stringify([])
      }
    });
    
    // Add fish to inventory
    await FishInventoryService.addFishToInventory(adminUserId, testGuildId, adminTestFish.id);
    
    // Reset admin daily feed count để test
    await prisma.user.update({
      where: { userId_guildId: { userId: adminUserId, guildId: testGuildId } },
      data: { dailyFeedCount: 0, lastFeedReset: new Date() }
    });

    // Test feedFishWithFood function (không có tham số isAdmin)
    console.log('\n9️⃣ Testing feedFishWithFood function...');
    try {
      const feedResult = await FishBreedingService.feedFishWithFood(adminUserId, adminTestFish.id, 'basic');
      console.log('Feed result:');
      console.log(`   Success: ${feedResult.success}`);
      if (!feedResult.success) {
        console.log(`   Error: ${feedResult.error}`);
      }
    } catch (error) {
      console.log(`   Error calling feedFishWithFood: ${error}`);
    }

    // 10. Tóm tắt kết quả
    console.log('\n📋 Summary:');
    console.log('   Admin user:');
    console.log(`     - Is Admin: ${isAdmin}`);
    console.log(`     - Can feed at limit: ${adminAtLimit.canFeed}`);
    console.log(`     - Error message: ${adminAtLimit.error || 'None'}`);
    
    console.log('   Regular user:');
    console.log(`     - Is Admin: ${isRegularAdmin}`);
    console.log(`     - Can feed at limit: ${regularAtLimit.canFeed}`);
    console.log(`     - Error message: ${regularAtLimit.error || 'None'}`);

    console.log('\n✅ Test completed!');
    console.log('🎯 Expected result: Both admin and regular users should be limited to 20 feeds per day');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyFeedLimitFix(); 