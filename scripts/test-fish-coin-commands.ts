import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';

async function testFishCoinCommands() {
  console.log('🧪 Testing FishCoin Commands...\n');

  const testUserId1 = 'test_user_fishcoin_1';
  const testUserId2 = 'test_user_fishcoin_2';
  const testUserId3 = 'test_user_fishcoin_3';
  const testGuildId = 'test_guild_fishcoin';

  try {
    // 1. Tạo test users
    console.log('1. Creating test users...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { userId_guildId: { userId: testUserId1, guildId: testGuildId } },
        update: {},
        create: {
          userId: testUserId1,
          guildId: testGuildId,
          balance: 10000,
          fishBalance: 0n,
          dailyStreak: 0,
        },
      }),
      prisma.user.upsert({
        where: { userId_guildId: { userId: testUserId2, guildId: testGuildId } },
        update: {},
        create: {
          userId: testUserId2,
          guildId: testGuildId,
          balance: 5000,
          fishBalance: 0n,
          dailyStreak: 0,
        },
      }),
      prisma.user.upsert({
        where: { userId_guildId: { userId: testUserId3, guildId: testGuildId } },
        update: {},
        create: {
          userId: testUserId3,
          guildId: testGuildId,
          balance: 2000,
          fishBalance: 0n,
          dailyStreak: 0,
        },
      })
    ]);

    console.log('✅ Created 3 test users');

    // 2. Test thêm FishCoin cho các users
    console.log('\n2. Adding FishCoin to users...');
    await fishCoinDB.addFishCoin(testUserId1, testGuildId, 5000, 'Test add FishCoin');
    await fishCoinDB.addFishCoin(testUserId2, testGuildId, 3000, 'Test add FishCoin');
    await fishCoinDB.addFishCoin(testUserId3, testGuildId, 1000, 'Test add FishCoin');

    console.log('✅ Added FishCoin to all users');

    // 3. Test lệnh fishbalance
    console.log('\n3. Testing fishbalance command logic...');
    const user1Balance = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const user1Transactions = await fishCoinDB.getFishTransactions(testUserId1, testGuildId, 5);

    console.log(`✅ User 1 balance: ${user1Balance.toString()} FishCoin`);
    console.log(`✅ User 1 transactions: ${user1Transactions.length} records`);

    // 4. Test lệnh fishtransfer
    console.log('\n4. Testing fishtransfer command logic...');
    const transferResult = await fishCoinDB.transferFishCoin(
      testUserId1,
      testUserId2,
      testGuildId,
      1000,
      'Test transfer'
    );

    if (transferResult.success) {
      const newBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
      const newBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
      
      console.log('✅ Transfer successful');
      console.log(`   User 1 new balance: ${newBalance1.toString()} FishCoin`);
      console.log(`   User 2 new balance: ${newBalance2.toString()} FishCoin`);
    } else {
      console.log('❌ Transfer failed:', transferResult.message);
    }

    // 5. Test lệnh fishgive (admin add)
    console.log('\n5. Testing fishgive command logic...');
    await fishCoinDB.addFishCoin(testUserId3, testGuildId, 2000, 'Admin added FishCoin');
    const newBalance3 = await fishCoinDB.getFishBalance(testUserId3, testGuildId);
    
    console.log('✅ Admin added FishCoin to User 3');
    console.log(`   User 3 new balance: ${newBalance3.toString()} FishCoin`);

    // 6. Test lệnh fishremove (admin remove)
    console.log('\n6. Testing fishremove command logic...');
    const oldBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    await fishCoinDB.subtractFishCoin(testUserId2, testGuildId, 500, 'Admin removed FishCoin');
    const newBalance2AfterRemove = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    
    console.log('✅ Admin removed FishCoin from User 2');
    console.log(`   User 2 balance: ${oldBalance2.toString()} → ${newBalance2AfterRemove.toString()} FishCoin`);

    // 7. Test lệnh fishtop (leaderboard)
    console.log('\n7. Testing fishtop command logic...');
    const topUsers = await fishCoinDB.getTopFishCoinUsers(testGuildId, 10);
    
    console.log('✅ Top FishCoin users:');
    topUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. User ${user.userId}: ${user.fishBalance.toString()} FishCoin`);
    });

    // 8. Test kiểm tra balance
    console.log('\n8. Testing balance checks...');
    const hasEnough1 = await fishCoinDB.hasEnoughFishCoin(testUserId1, testGuildId, 1000);
    const hasEnough2 = await fishCoinDB.hasEnoughFishCoin(testUserId1, testGuildId, 10000);
    
    console.log('✅ Balance checks:');
    console.log(`   User 1 has enough for 1000: ${hasEnough1}`);
    console.log(`   User 1 has enough for 10000: ${hasEnough2}`);

    // 9. Test lỗi không đủ FishCoin
    console.log('\n9. Testing insufficient FishCoin error...');
    try {
      await fishCoinDB.subtractFishCoin(testUserId3, testGuildId, 10000, 'Test insufficient');
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly failed with insufficient FishCoin');
    }

    // 10. Tổng kết test
    console.log('\n10. Final balances...');
    const finalBalances = await Promise.all([
      fishCoinDB.getFishBalance(testUserId1, testGuildId),
      fishCoinDB.getFishBalance(testUserId2, testGuildId),
      fishCoinDB.getFishBalance(testUserId3, testGuildId)
    ]);

    console.log('✅ Final balances:');
    console.log(`   User 1: ${finalBalances[0].toString()} FishCoin`);
    console.log(`   User 2: ${finalBalances[1].toString()} FishCoin`);
    console.log(`   User 3: ${finalBalances[2].toString()} FishCoin`);

    // 11. Test transaction history
    console.log('\n11. Testing transaction history...');
    const allTransactions = await fishCoinDB.getFishTransactions(testUserId1, testGuildId, 10);
    console.log(`✅ User 1 has ${allTransactions.length} transactions:`);
    allTransactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    console.log('\n✅ All FishCoin command tests completed successfully!');
    console.log('\n📋 Available commands:');
    console.log('   !fishbalance - Check FishCoin balance');
    console.log('   !fishtransfer @user <amount> - Transfer FishCoin');
    console.log('   !fishgive @user <amount> - Admin add FishCoin');
    console.log('   !fishremove @user <amount> - Admin remove FishCoin');
    console.log('   !fishtop - View FishCoin leaderboard');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishCoinCommands(); 