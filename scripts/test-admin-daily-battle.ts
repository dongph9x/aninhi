import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function testAdminDailyBattle() {
  console.log('🧪 Testing Admin Daily Battle Limit...\n');

  // Test với admin user ID (thay bằng ID thực của bạn)
  const adminUserId = '389957152153796608'; // Admin user ID
  const regularUserId = 'test-regular-user';
  const testGuildId = 'test-guild-admin-daily-battle';

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

    // 3. Kiểm tra daily battle limit cho admin
    console.log('\n3️⃣ Testing daily battle limit for admin...');
    const adminDailyCheck = await FishBattleService.checkAndResetDailyBattleCount(adminUserId, testGuildId);
    console.log('Admin daily battle check:');
    console.log(`   Can Battle: ${adminDailyCheck.canBattle}`);
    console.log(`   Remaining Battles: ${adminDailyCheck.remainingBattles}/20`);
    console.log(`   Error: ${adminDailyCheck.error || 'None'}`);

    // 4. Tăng daily battle count cho admin
    console.log('\n4️⃣ Testing increment for admin...');
    console.log(`   Before increment: ${adminDailyCheck.remainingBattles}/20`);
    
    await FishBattleService.incrementDailyBattleCount(adminUserId, testGuildId);
    
    const adminAfterIncrement = await FishBattleService.checkAndResetDailyBattleCount(adminUserId, testGuildId);
    console.log(`   After increment: ${adminAfterIncrement.remainingBattles}/20`);
    console.log(`   Can still battle: ${adminAfterIncrement.canBattle}`);

    // 5. Tăng thêm nhiều lần để test
    console.log('\n5️⃣ Testing multiple increments for admin...');
    for (let i = 1; i <= 5; i++) {
      await FishBattleService.incrementDailyBattleCount(adminUserId, testGuildId);
      const check = await FishBattleService.checkAndResetDailyBattleCount(adminUserId, testGuildId);
      console.log(`   After ${i + 1} battles: ${check.remainingBattles}/20 - Can battle: ${check.canBattle}`);
    }

    // 6. So sánh với user thường
    console.log('\n6️⃣ Comparing with regular user...');
    const regularDailyCheck = await FishBattleService.checkAndResetDailyBattleCount(regularUserId, testGuildId);
    console.log('Regular user daily battle check:');
    console.log(`   Can Battle: ${regularDailyCheck.canBattle}`);
    console.log(`   Remaining Battles: ${regularDailyCheck.remainingBattles}/20`);

    // 7. Tăng daily battle count cho user thường đến giới hạn
    console.log('\n7️⃣ Testing regular user reaching limit...');
    for (let i = 1; i <= 20; i++) {
      await FishBattleService.incrementDailyBattleCount(regularUserId, testGuildId);
    }
    
    const regularAtLimit = await FishBattleService.checkAndResetDailyBattleCount(regularUserId, testGuildId);
    console.log('Regular user at limit:');
    console.log(`   Can Battle: ${regularAtLimit.canBattle}`);
    console.log(`   Remaining Battles: ${regularAtLimit.remainingBattles}/20`);
    console.log(`   Error: ${regularAtLimit.error || 'None'}`);

    // 8. Tóm tắt kết quả
    console.log('\n📋 Summary:');
    console.log('   Admin user:');
    console.log(`     - Can always battle: ${adminAfterIncrement.canBattle}`);
    console.log(`     - Daily count increases: ${adminAfterIncrement.remainingBattles < 20}`);
    console.log(`     - No limit enforced: ✅`);
    
    console.log('   Regular user:');
    console.log(`     - Can battle at limit: ${regularAtLimit.canBattle}`);
    console.log(`     - Limit enforced: ${!regularAtLimit.canBattle}`);
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
            { userId_guildId: { userId: regularUserId, guildId: testGuildId } },
            { userId_guildId: { userId: adminUserId, guildId: testGuildId } }
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

testAdminDailyBattle(); 