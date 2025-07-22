import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishBattleService } from '../src/utils/fish-battle';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';

async function testBattleFishCoin() {
  console.log('⚔️ Testing Fish Battle with FishCoin...\n');

  const testUserId1 = 'test_user_battle_1';
  const testUserId2 = 'test_user_battle_2';
  const testGuildId = 'test_guild_battle';

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
          dailyStreak: 0,
        },
      })
    ]);

    console.log('✅ Created 2 test users');

    // 2. Thêm FishCoin cho users
    console.log('\n2. Adding FishCoin to users...');
    await fishCoinDB.addFishCoin(testUserId1, testGuildId, 10000, 'Test FishCoin for battle user 1');
    await fishCoinDB.addFishCoin(testUserId2, testGuildId, 5000, 'Test FishCoin for battle user 2');

    const balance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const balance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    console.log('✅ Added FishCoin:');
    console.log(`   User 1: ${balance1.toString()} FishCoin`);
    console.log(`   User 2: ${balance2.toString()} FishCoin`);

    // 3. Tạo cá test để đấu
    console.log('\n3. Creating test fish for battle...');
    const testFish1 = await prisma.fish.create({
      data: {
        userId: testUserId1,
        guildId: testGuildId,
        species: 'Cá Đấu Test 1',
        level: 10,
        experience: 100,
        rarity: 'rare',
        value: 3000n,
        generation: 2,
        specialTraits: JSON.stringify(['Battle Test 1']),
        status: 'adult',
        stats: JSON.stringify({ strength: 40, agility: 35, intelligence: 30, defense: 35, luck: 20 })
      }
    });

    const testFish2 = await prisma.fish.create({
      data: {
        userId: testUserId2,
        guildId: testGuildId,
        species: 'Cá Đấu Test 2',
        level: 10,
        experience: 100,
        rarity: 'rare',
        value: 2500n,
        generation: 2,
        specialTraits: JSON.stringify(['Battle Test 2']),
        status: 'adult',
        stats: JSON.stringify({ strength: 35, agility: 40, intelligence: 25, defense: 30, luck: 25 })
      }
    });

    console.log('✅ Created 2 test fish for battle');

    // 4. Thêm cá vào battle inventory
    console.log('\n4. Adding fish to battle inventory...');
    const inventory1 = await BattleFishInventoryService.getOrCreateBattleFishInventory(testUserId1, testGuildId);
    const inventory2 = await BattleFishInventoryService.getOrCreateBattleFishInventory(testUserId2, testGuildId);

    await prisma.battleFishInventoryItem.create({
      data: {
        battleFishInventoryId: inventory1.id,
        fishId: testFish1.id
      }
    });

    await prisma.battleFishInventoryItem.create({
      data: {
        battleFishInventoryId: inventory2.id,
        fishId: testFish2.id
      }
    });

    console.log('✅ Added fish to battle inventory');

    // 5. Test battle
    console.log('\n5. Testing fish battle...');
    const battleResult = await FishBattleService.battleFish(testUserId1, testGuildId, testFish1.id, testFish2.id);
    
    if ('success' in battleResult && !battleResult.success) {
      console.log('❌ Battle failed:', battleResult.error);
      return;
    }

    const result = battleResult as any;
    const isUser1Winner = result.winner.id === testFish1.id;
    const reward = isUser1Winner ? result.rewards.winner : result.rewards.loser;

    console.log('✅ Battle completed successfully!');
    console.log(`   Winner: ${result.winner.name}`);
    console.log(`   Loser: ${result.loser.name}`);
    console.log(`   Winner Power: ${result.winnerPower}`);
    console.log(`   Loser Power: ${result.loserPower}`);
    console.log(`   User 1 Reward: ${reward} FishCoin`);
    console.log(`   User 1 Won: ${isUser1Winner}`);

    // 6. Kiểm tra balance sau battle
    console.log('\n6. Checking balance after battle...');
    const balanceAfter1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const balanceAfter2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    
    console.log('✅ Balance after battle:');
    console.log(`   User 1: ${balanceAfter1.toString()} FishCoin (${isUser1Winner ? '+' : ''}${reward})`);
    console.log(`   User 2: ${balanceAfter2.toString()} FishCoin`);

    // 7. Test battle stats
    console.log('\n7. Testing battle stats...');
    const stats1 = await FishBattleService.getBattleStats(testUserId1, testGuildId);
    const stats2 = await FishBattleService.getBattleStats(testUserId2, testGuildId);
    
    console.log('✅ Battle stats:');
    console.log(`   User 1: ${stats1.wins}W/${stats1.totalBattles}L (${stats1.winRate}%) - ${stats1.totalEarnings} FishCoin`);
    console.log(`   User 2: ${stats2.wins}W/${stats2.totalBattles}L (${stats2.winRate}%) - ${stats2.totalEarnings} FishCoin`);

    // 8. Test recent battles
    console.log('\n8. Testing recent battles...');
    const recentBattles1 = await FishBattleService.getRecentBattles(testUserId1, testGuildId, 3);
    const recentBattles2 = await FishBattleService.getRecentBattles(testUserId2, testGuildId, 3);
    
    console.log('✅ Recent battles:');
    console.log(`   User 1: ${recentBattles1.length} battles`);
    recentBattles1.forEach((battle, index) => {
      console.log(`     ${index + 1}. ${battle.userWon ? 'Won' : 'Lost'} - ${battle.reward} FishCoin`);
    });
    
    console.log(`   User 2: ${recentBattles2.length} battles`);
    recentBattles2.forEach((battle, index) => {
      console.log(`     ${index + 1}. ${battle.userWon ? 'Won' : 'Lost'} - ${battle.reward} FishCoin`);
    });

    // 9. Test transaction history
    console.log('\n9. Testing transaction history...');
    const transactions1 = await fishCoinDB.getFishTransactions(testUserId1, testGuildId, 5);
    const transactions2 = await fishCoinDB.getFishTransactions(testUserId2, testGuildId, 5);
    
    console.log('✅ Transaction history:');
    console.log(`   User 1: ${transactions1.length} transactions`);
    transactions1.slice(0, 3).forEach((tx, index) => {
      console.log(`     ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });
    
    console.log(`   User 2: ${transactions2.length} transactions`);
    transactions2.slice(0, 3).forEach((tx, index) => {
      console.log(`     ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    // 10. Final summary
    console.log('\n10. Final summary...');
    const finalBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const finalBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    
    console.log('✅ Final balances:');
    console.log(`   User 1: ${finalBalance1.toString()} FishCoin`);
    console.log(`   User 2: ${finalBalance2.toString()} FishCoin`);

    console.log('\n✅ All Fish Battle FishCoin tests completed successfully!');
    console.log('\n📋 Fish Battle now uses FishCoin for:');
    console.log('   ⚔️ Battle rewards');
    console.log('   🏆 Winner/loser rewards');
    console.log('   📊 Battle statistics');
    console.log('   💰 All battle transactions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBattleFishCoin(); 