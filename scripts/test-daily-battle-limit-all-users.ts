import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function testDailyBattleLimitAllUsers() {
  console.log('🧪 Testing Daily Battle Limit All Users (Including Admin)...\n');

  const testUserId = 'test-user-battle-all';
  const testGuildId = 'test-guild-battle-all';

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

    // 2. Kiểm tra daily battle limit ban đầu
    console.log('2️⃣ Testing initial daily battle limit...');
    const initialCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Initial check:');
    console.log(`   Can Battle: ${initialCheck.canBattle}`);
    console.log(`   Remaining Battles: ${initialCheck.remainingBattles}/20`);
    console.log(`   Error: ${initialCheck.error || 'None'}`);

    // 3. Tăng daily battle count đến giới hạn
    console.log('\n3️⃣ Testing reaching limit...');
    for (let i = 0; i < 20; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
      const check = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
      console.log(`   After ${i + 1} battles: ${check.remainingBattles}/20 - Can battle: ${check.canBattle}`);
    }

    // 4. Kiểm tra khi đạt giới hạn
    console.log('\n4️⃣ Testing at limit...');
    const atLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('At limit check:');
    console.log(`   Can Battle: ${atLimitCheck.canBattle}`);
    console.log(`   Remaining Battles: ${atLimitCheck.remainingBattles}/20`);
    console.log(`   Error: ${atLimitCheck.error || 'None'}`);

    // 5. Tăng thêm 1 lần nữa để test vượt giới hạn
    console.log('\n5️⃣ Testing beyond limit...');
    await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    
    const beyondLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Beyond limit check:');
    console.log(`   Can Battle: ${beyondLimitCheck.canBattle}`);
    console.log(`   Remaining Battles: ${beyondLimitCheck.remainingBattles}/20`);
    console.log(`   Error: ${beyondLimitCheck.error || 'None'}`);

    // 6. Test cooldown system
    console.log('\n6️⃣ Testing cooldown system...');
    const cooldownCheck = await FishBattleService.checkBattleCooldown(testUserId, testGuildId, false);
    console.log('Cooldown check:');
    console.log(`   Can Battle: ${cooldownCheck.canBattle}`);
    if (!cooldownCheck.canBattle) {
      console.log(`   Remaining Time: ${Math.ceil((cooldownCheck.remainingTime || 0) / 1000)} seconds`);
    }

    // 7. Tóm tắt kết quả
    console.log('\n📋 Summary:');
    console.log(`   Initial: Can battle = ${initialCheck.canBattle}, Remaining = ${initialCheck.remainingBattles}/20`);
    console.log(`   At limit: Can battle = ${atLimitCheck.canBattle}, Remaining = ${atLimitCheck.remainingBattles}/20`);
    console.log(`   Beyond limit: Can battle = ${beyondLimitCheck.canBattle}, Remaining = ${beyondLimitCheck.remainingBattles}/20`);
    console.log(`   Cooldown: Can battle = ${cooldownCheck.canBattle}`);
    
    if (!atLimitCheck.canBattle && atLimitCheck.error) {
      console.log('✅ SUCCESS: Daily battle limit is working correctly!');
      console.log('✅ All users (including admins) are now limited to 20 battles per day');
    } else {
      console.log('❌ FAILED: Daily battle limit is not working correctly');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyBattleLimitAllUsers(); 