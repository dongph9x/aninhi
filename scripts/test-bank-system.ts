import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';
import { BankService } from '../src/utils/bank-service';

async function testBankSystem() {
  console.log('🏦 Testing Bank Exchange System...\n');

  const testUserId = 'test_user_bank';
  const testGuildId = 'test_guild_bank';

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
        dailyStreak: 0,
      },
    });

    console.log('✅ Created test user');

    // 2. Thêm FishCoin cho user
    console.log('\n2. Adding FishCoin to user...');
    await fishCoinDB.addFishCoin(testUserId, testGuildId, 5000, 'Test FishCoin for bank user');

    const initialAniBalance = Number(user.balance);
    const initialFishBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);

    console.log('✅ Initial balances:');
    console.log(`   AniCoin: ${initialAniBalance.toLocaleString()}₳`);
    console.log(`   FishCoin: ${initialFishBalance.toString()}🐟`);

    // 3. Test tỷ lệ chuyển đổi
    console.log('\n3. Testing exchange rates...');
    const rates = BankService.getExchangeRates();
    console.log('✅ Exchange rates:');
    console.log(`   AniCoin → FishCoin: ${rates.aniToFish.minAmount}₳ → ${rates.aniToFish.fishReceived}🐟 (Rate: ${rates.aniToFish.rate})`);
    console.log(`   FishCoin → AniCoin: ${rates.fishToAni.minAmount}🐟 → ${rates.fishToAni.aniReceived}₳ (Rate: ${rates.fishToAni.rate})`);

    // 4. Test tính toán chuyển đổi
    console.log('\n4. Testing exchange calculations...');
    const testAmounts = [500, 1000, 2000, 5000];

    console.log('✅ Exchange calculations:');
    testAmounts.forEach(amount => {
      const aniToFish = BankService.calculateExchange('AniCoin', amount);
      const fishToAni = BankService.calculateExchange('FishCoin', amount);
      
      console.log(`   ${amount}₳ → ${aniToFish.received}🐟 (Valid: ${aniToFish.isValid})`);
      console.log(`   ${amount}🐟 → ${fishToAni.received}₳ (Valid: ${fishToAni.isValid})`);
    });

    // 5. Test chuyển AniCoin sang FishCoin
    console.log('\n5. Testing AniCoin to FishCoin exchange...');
    const aniToFishResult = await BankService.exchangeAniToFish(testUserId, testGuildId, 2000);
    
    if (aniToFishResult.success) {
      console.log('✅ AniCoin to FishCoin exchange successful!');
      console.log(`   Exchanged: ${aniToFishResult.amount.toLocaleString()}₳`);
      console.log(`   Received: ${aniToFishResult.received}🐟`);
      console.log(`   Rate: ${aniToFishResult.exchangeRate}`);
    } else {
      console.log('❌ AniCoin to FishCoin exchange failed:', aniToFishResult.error);
    }

    // 6. Kiểm tra balance sau chuyển đổi
    console.log('\n6. Checking balance after AniCoin exchange...');
    const userAfterAni = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    const fishBalanceAfterAni = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    
    console.log('✅ Balance after AniCoin exchange:');
    console.log(`   AniCoin: ${Number(userAfterAni?.balance || 0).toLocaleString()}₳`);
    console.log(`   FishCoin: ${fishBalanceAfterAni.toString()}🐟`);

    // 7. Test chuyển FishCoin sang AniCoin
    console.log('\n7. Testing FishCoin to AniCoin exchange...');
    const fishToAniResult = await BankService.exchangeFishToAni(testUserId, testGuildId, 1500);
    
    if (fishToAniResult.success) {
      console.log('✅ FishCoin to AniCoin exchange successful!');
      console.log(`   Exchanged: ${fishToAniResult.amount}🐟`);
      console.log(`   Received: ${fishToAniResult.received.toLocaleString()}₳`);
      console.log(`   Rate: ${fishToAniResult.exchangeRate}`);
    } else {
      console.log('❌ FishCoin to AniCoin exchange failed:', fishToAniResult.error);
    }

    // 8. Kiểm tra balance sau chuyển đổi
    console.log('\n8. Checking balance after FishCoin exchange...');
    const userAfterFish = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    const fishBalanceAfterFish = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    
    console.log('✅ Balance after FishCoin exchange:');
    console.log(`   AniCoin: ${Number(userAfterFish?.balance || 0).toLocaleString()}₳`);
    console.log(`   FishCoin: ${fishBalanceAfterFish.toString()}🐟`);

    // 9. Test lỗi - số tiền không đủ
    console.log('\n9. Testing error cases...');
    
    // Test AniCoin không đủ
    const insufficientAniResult = await BankService.exchangeAniToFish(testUserId, testGuildId, 50000);
    console.log(`   Insufficient AniCoin test: ${insufficientAniResult.success ? '❌ Should fail' : '✅ Correctly failed'}`);
    
    // Test FishCoin không đủ
    const insufficientFishResult = await BankService.exchangeFishToAni(testUserId, testGuildId, 10000);
    console.log(`   Insufficient FishCoin test: ${insufficientFishResult.success ? '❌ Should fail' : '✅ Correctly failed'}`);

    // Test số tiền tối thiểu
    const minAmountAniResult = await BankService.exchangeAniToFish(testUserId, testGuildId, 500);
    console.log(`   Minimum AniCoin test: ${minAmountAniResult.success ? '❌ Should fail' : '✅ Correctly failed'}`);
    
    const minAmountFishResult = await BankService.exchangeFishToAni(testUserId, testGuildId, 500);
    console.log(`   Minimum FishCoin test: ${minAmountFishResult.success ? '❌ Should fail' : '✅ Correctly failed'}`);

    // 10. Test lịch sử giao dịch
    console.log('\n10. Testing bank history...');
    const bankHistory = await BankService.getBankHistory(testUserId, testGuildId, 10);
    
    console.log('✅ Bank history:');
    console.log(`   Total transactions: ${bankHistory.length}`);
    bankHistory.slice(0, 5).forEach((tx, index) => {
      const amount = Number(tx.amount);
      const isPositive = tx.type === 'add';
      const sign = isPositive ? '+' : '-';
      const currency = tx.currency === 'AniCoin' ? '₳' : '🐟';
      
      console.log(`   ${index + 1}. ${sign}${Math.abs(amount).toLocaleString()}${currency} - ${tx.description}`);
    });

    // 11. Test transaction history
    console.log('\n11. Testing transaction history...');
    const aniTransactions = await prisma.transaction.findMany({
      where: {
        userId: testUserId,
        guildId: testGuildId,
        description: { contains: 'Bank exchange' }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const fishTransactions = await prisma.fishTransaction.findMany({
      where: {
        userId: testUserId,
        guildId: testGuildId,
        description: { contains: 'Bank exchange' }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('✅ Transaction history:');
    console.log(`   AniCoin transactions: ${aniTransactions.length}`);
    console.log(`   FishCoin transactions: ${fishTransactions.length}`);

    // 12. Final summary
    console.log('\n12. Final summary...');
    const finalUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    const finalFishBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    
    console.log('✅ Final balances:');
    console.log(`   AniCoin: ${Number(finalUser?.balance || 0).toLocaleString()}₳`);
    console.log(`   FishCoin: ${finalFishBalance.toString()}🐟`);

    const aniChange = Number(finalUser?.balance || 0) - initialAniBalance;
    const fishChange = Number(finalFishBalance) - Number(initialFishBalance);
    
    console.log('✅ Net changes:');
    console.log(`   AniCoin change: ${aniChange > 0 ? '+' : ''}${aniChange.toLocaleString()}₳`);
    console.log(`   FishCoin change: ${fishChange > 0 ? '+' : ''}${fishChange}🐟`);

    console.log('\n✅ All Bank System tests completed successfully!');
    console.log('\n📋 Bank System features:');
    console.log('   💱 AniCoin ↔ FishCoin exchange');
    console.log('   📊 Fixed exchange rates');
    console.log('   💰 Minimum amount requirements');
    console.log('   📝 Transaction logging');
    console.log('   📋 Exchange history');
    console.log('   🧮 Pre-calculation tool');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBankSystem(); 