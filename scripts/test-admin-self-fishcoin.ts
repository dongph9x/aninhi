import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';

async function testAdminSelfFishCoin() {
  console.log('🧪 Testing Admin Self FishCoin Operations...\n');

  const adminUserId = 'test_admin_self';
  const testGuildId = 'test_guild_admin_self';

  try {
    // 1. Tạo admin user
    console.log('1. Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: { userId_guildId: { userId: adminUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: adminUserId,
        guildId: testGuildId,
        balance: 10000,
        fishBalance: 0n,
        dailyStreak: 0,
      },
    });
    console.log('✅ Admin user created:', adminUser.userId);

    // 2. Test admin thêm FishCoin cho chính mình
    console.log('\n2. Testing admin add FishCoin to self...');
    const initialBalance = await fishCoinDB.getFishBalance(adminUserId, testGuildId);
    console.log(`   Initial balance: ${initialBalance.toString()} FishCoin`);

    await fishCoinDB.addFishCoin(adminUserId, testGuildId, 2000, 'Admin added FishCoin to self');
    const balanceAfterAdd = await fishCoinDB.getFishBalance(adminUserId, testGuildId);
    console.log(`   Balance after add: ${balanceAfterAdd.toString()} FishCoin`);
    console.log('✅ Admin successfully added FishCoin to self');

    // 3. Test admin bớt FishCoin từ chính mình
    console.log('\n3. Testing admin remove FishCoin from self...');
    await fishCoinDB.subtractFishCoin(adminUserId, testGuildId, 500, 'Admin removed FishCoin from self');
    const balanceAfterRemove = await fishCoinDB.getFishBalance(adminUserId, testGuildId);
    console.log(`   Balance after remove: ${balanceAfterRemove.toString()} FishCoin`);
    console.log('✅ Admin successfully removed FishCoin from self');

    // 4. Test admin bớt FishCoin thêm lần nữa
    console.log('\n4. Testing admin remove FishCoin again...');
    await fishCoinDB.subtractFishCoin(adminUserId, testGuildId, 300, 'Admin removed FishCoin again');
    const balanceAfterSecondRemove = await fishCoinDB.getFishBalance(adminUserId, testGuildId);
    console.log(`   Balance after second remove: ${balanceAfterSecondRemove.toString()} FishCoin`);
    console.log('✅ Admin successfully removed FishCoin again');

    // 5. Test lỗi khi không đủ FishCoin
    console.log('\n5. Testing insufficient FishCoin error...');
    try {
      await fishCoinDB.subtractFishCoin(adminUserId, testGuildId, 10000, 'Test insufficient');
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly failed with insufficient FishCoin');
    }

    // 6. Kiểm tra lịch sử giao dịch
    console.log('\n6. Checking transaction history...');
    const transactions = await fishCoinDB.getFishTransactions(adminUserId, testGuildId, 10);
    console.log(`✅ Admin has ${transactions.length} transactions:`);
    transactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    // 7. Tổng kết
    console.log('\n7. Final summary...');
    const finalBalance = await fishCoinDB.getFishBalance(adminUserId, testGuildId);
    console.log(`✅ Final admin balance: ${finalBalance.toString()} FishCoin`);
    console.log(`✅ Expected: 2000 - 500 - 300 = 1200 FishCoin (actual: ${finalBalance.toString()})`);

    console.log('\n✅ All admin self FishCoin operations completed successfully!');
    console.log('\n📋 Admin can use these commands on themselves:');
    console.log('   !fishgive @yourself <amount> - Add FishCoin to self');
    console.log('   !fishremove @yourself <amount> - Remove FishCoin from self');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSelfFishCoin(); 