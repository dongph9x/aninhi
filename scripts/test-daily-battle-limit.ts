import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function testDailyBattleLimit() {
  console.log('🧪 Testing Daily Battle Limit System...\n');

  const testUserId = 'test-user-daily-battle';
  const testGuildId = 'test-guild-daily-battle';

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

    // 2. Test kiểm tra daily battle limit ban đầu
    console.log('2️⃣ Testing initial daily battle limit check...');
    const initialCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Initial check result:', initialCheck);
    console.log('✅ Initial check completed\n');

    // 3. Test tăng daily battle count
    console.log('3️⃣ Testing daily battle count increment...');
    for (let i = 1; i <= 5; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
      const check = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
      console.log(`After ${i} battles:`, check);
    }
    console.log('✅ Increment test completed\n');

    // 4. Test giới hạn tối đa
    console.log('4️⃣ Testing maximum limit...');
    // Tăng thêm 15 lần nữa để đạt 20 lần
    for (let i = 6; i <= 20; i++) {
      await FishBattleService.incrementDailyBattleCount(testUserId, testGuildId);
    }
    
    const maxCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('At maximum limit:', maxCheck);
    console.log('✅ Maximum limit test completed\n');

    // 5. Test thêm 1 lần nữa (sẽ bị từ chối)
    console.log('5️⃣ Testing beyond limit...');
    const beyondLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('Beyond limit check:', beyondLimitCheck);
    console.log('✅ Beyond limit test completed\n');

    // 6. Test reset cho ngày mới
    console.log('6️⃣ Testing reset for new day...');
    // Giả lập ngày mới bằng cách cập nhật lastBattleReset
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await prisma.user.update({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      data: { lastBattleReset: yesterday }
    });

    const resetCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log('After reset for new day:', resetCheck);
    console.log('✅ Reset test completed\n');

    // 7. Kiểm tra database state
    console.log('7️⃣ Checking final database state...');
    const finalUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    console.log('Final user state:', {
      dailyBattleCount: finalUser?.dailyBattleCount,
      lastBattleReset: finalUser?.lastBattleReset
    });
    console.log('✅ Database state check completed\n');

    console.log('🎉 All tests completed successfully!');

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
testDailyBattleLimit(); 