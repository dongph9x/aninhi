import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';

async function testFishCoinSystem() {
  console.log('🧪 Testing FishCoin System...\n');

  const testUserId = 'test_user_fishcoin';
  const testGuildId = 'test_guild_fishcoin';

  try {
    // 1. Tạo test user
    console.log('1. Creating test user...');
    const user = await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
        fishBalance: 0,
        dailyStreak: 0,
      },
    });
    console.log('✅ User created:', user.userId);
    console.log('   AniCoin balance:', user.balance.toString());
    console.log('   FishCoin balance:', user.fishBalance.toString());

    // 2. Test thêm FishCoin
    console.log('\n2. Testing add FishCoin...');
    await fishCoinDB.addFishCoin(testUserId, testGuildId, 1000, 'Test add FishCoin');
    const balanceAfterAdd = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('✅ Added 1000 FishCoin');
    console.log('   New balance:', balanceAfterAdd.toString());

    // 3. Test trừ FishCoin
    console.log('\n3. Testing subtract FishCoin...');
    await fishCoinDB.subtractFishCoin(testUserId, testGuildId, 200, 'Test subtract FishCoin');
    const balanceAfterSubtract = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('✅ Subtracted 200 FishCoin');
    console.log('   New balance:', balanceAfterSubtract.toString());

    // 4. Test chuyển FishCoin
    console.log('\n4. Testing transfer FishCoin...');
    const targetUserId = 'test_user_target';
    const targetGuildId = testGuildId;
    
    // Tạo user đích
    await prisma.user.upsert({
      where: { userId_guildId: { userId: targetUserId, guildId: targetGuildId } },
      update: {},
      create: {
        userId: targetUserId,
        guildId: targetGuildId,
        balance: 0,
        fishBalance: 0,
        dailyStreak: 0,
      },
    });

    const transferResult = await fishCoinDB.transferFishCoin(
      testUserId,
      targetUserId,
      testGuildId,
      300,
      'Test transfer FishCoin'
    );
    
    if (transferResult.success) {
      console.log('✅ Transferred 300 FishCoin');
      const senderBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
      const receiverBalance = await fishCoinDB.getFishBalance(targetUserId, testGuildId);
      console.log('   Sender balance:', senderBalance.toString());
      console.log('   Receiver balance:', receiverBalance.toString());
    } else {
      console.log('❌ Transfer failed:', transferResult.message);
    }

    // 5. Test lịch sử giao dịch
    console.log('\n5. Testing transaction history...');
    const transactions = await fishCoinDB.getFishTransactions(testUserId, testGuildId, 10);
    console.log('✅ Found', transactions.length, 'transactions');
    transactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    // 6. Test kiểm tra balance
    console.log('\n6. Testing balance check...');
    const hasEnough = await fishCoinDB.hasEnoughFishCoin(testUserId, testGuildId, 100);
    const hasNotEnough = await fishCoinDB.hasEnoughFishCoin(testUserId, testGuildId, 10000);
    console.log('✅ Has enough for 100:', hasEnough);
    console.log('✅ Has enough for 10000:', hasNotEnough);

    // 7. Test top users
    console.log('\n7. Testing top users...');
    const topUsers = await fishCoinDB.getTopFishCoinUsers(testGuildId, 5);
    console.log('✅ Top FishCoin users:');
    topUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. User ${user.userId}: ${user.fishBalance.toString()} FishCoin`);
    });

    // 8. Test lỗi không đủ FishCoin
    console.log('\n8. Testing insufficient FishCoin...');
    try {
      await fishCoinDB.subtractFishCoin(testUserId, testGuildId, 10000, 'Test insufficient');
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly failed with insufficient FishCoin');
    }

    // 9. Kiểm tra dữ liệu cuối cùng
    console.log('\n9. Final data check...');
    const finalUser = await fishCoinDB.getUser(testUserId, testGuildId);
    console.log('✅ Final user data:');
    console.log('   AniCoin:', finalUser.balance.toString());
    console.log('   FishCoin:', finalUser.fishBalance.toString());

    console.log('\n✅ All FishCoin system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishCoinSystem(); 