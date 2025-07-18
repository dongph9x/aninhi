import { FishBattleService } from '../src/utils/fish-battle';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

async function testFishBattleCommand() {
  console.log('🧪 Testing Fish Battle Command...\n');

  const testUserId = 'test_user_battle';
  const testGuildId = 'test_guild_battle';

  try {
    // 1. Kiểm tra inventory
    console.log('1. Checking fish inventory...');
    const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    const adultFish = inventory.items.filter((item: any) => item.fish.status === 'adult');
    console.log(`✅ Found ${adultFish.length} adult fish`);

    if (adultFish.length === 0) {
      console.log('❌ No adult fish found for battle!');
      return;
    }

    // 2. Test tìm đối thủ
    console.log('\n2. Testing find random opponent...');
    const selectedFish = adultFish[0].fish;
    const opponentResult = await FishBattleService.findRandomOpponent(testUserId, testGuildId, selectedFish.id);
    
    if (opponentResult.success) {
      console.log('✅ Found opponent:', opponentResult.opponent?.name);
      console.log('   - Opponent power:', opponentResult.opponentPower);
      console.log('   - User fish power:', opponentResult.userPower);
    } else {
      console.log('❌ No opponent found:', opponentResult.error);
    }

    // 3. Test battle stats
    console.log('\n3. Testing battle stats...');
    const stats = await FishBattleService.getBattleStats(testUserId, testGuildId);
    console.log('✅ Battle stats:', {
      totalBattles: stats.totalBattles,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.winRate,
      totalEarnings: stats.totalEarnings
    });

    // 4. Test leaderboard
    console.log('\n4. Testing leaderboard...');
    const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 5);
    console.log(`✅ Leaderboard has ${leaderboard.length} entries`);

    // 5. Test recent battles
    console.log('\n5. Testing recent battles...');
    const recentBattles = await FishBattleService.getRecentBattles(testUserId, testGuildId, 3);
    console.log(`✅ Recent battles: ${recentBattles.length} battles`);

    console.log('\n🎉 Fish battle command tests completed!');

  } catch (error) {
    console.error('❌ Error testing fish battle command:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishBattleCommand(); 