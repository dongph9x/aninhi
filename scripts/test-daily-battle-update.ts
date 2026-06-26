import { FishBattleService } from '../src/utils/fish-battle';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishBreedingService } from '../src/utils/fish-breeding';
import prisma from '../src/utils/prisma';

async function testDailyBattleUpdate() {
  console.log('🧪 Testing Daily Battle Limit Update...\\n');

  const testUserId = 'test-user-daily-battle-update';
  const testGuildId = 'test-guild-daily-battle-update';

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

    // 2. Tạo cá test cho user
    console.log('2️⃣ Creating test fish...');
    const userFish = await prisma.fish.create({
      data: {
        id: `test-fish-user-${Date.now()}`,
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Fish User',
        level: 10,
        experience: 100,
        rarity: 'Common',
        generation: 2,
        status: 'adult',
        value: BigInt(1000),
        stats: JSON.stringify({
          strength: 50,
          agility: 30,
          intelligence: 20,
          defense: 25,
          luck: 15
        })
      }
    });

    // 3. Tạo cá test cho đối thủ
    const opponentFish = await prisma.fish.create({
      data: {
        id: `test-fish-opponent-${Date.now()}`,
        userId: 'test-opponent',
        guildId: testGuildId,
        species: 'Test Fish Opponent',
        level: 10,
        experience: 100,
        rarity: 'Common',
        generation: 2,
        status: 'adult',
        value: BigInt(1000),
        stats: JSON.stringify({
          strength: 40,
          agility: 35,
          intelligence: 25,
          defense: 20,
          luck: 20
        })
      }
    });

    // 4. Thêm cá vào túi đấu
    console.log('3️⃣ Adding fish to battle inventory...');
    await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, userFish.id);

    // 5. Kiểm tra daily battle limit ban đầu
    console.log('4️⃣ Checking initial daily battle limit...');
    const initialCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log(`   Initial daily battle limit: ${initialCheck.remainingBattles}/20`);

    // 6. Thực hiện đấu cá
    console.log('5️⃣ Performing battle...');
    const battleResult = await FishBattleService.battleFish(testUserId, testGuildId, userFish.id, opponentFish.id);
    
    if ('success' in battleResult && !battleResult.success) {
      console.log(`   ❌ Battle failed: ${battleResult.error}`);
      return;
    }

    const result = battleResult as any;
    const isUserWinner = result.winner.id === userFish.id;
    console.log(`   ✅ Battle completed! Winner: ${result.winner.name}`);
    console.log(`   🏆 User won: ${isUserWinner}`);
    console.log(`   💰 Reward: ${isUserWinner ? result.rewards.winner : result.rewards.loser} FishCoin`);

    // 7. Kiểm tra daily battle limit sau khi đấu
    console.log('6️⃣ Checking daily battle limit after battle...');
    const updatedCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
    console.log(`   Updated daily battle limit: ${updatedCheck.remainingBattles}/20`);

    // 8. Kiểm tra sự thay đổi
    const difference = initialCheck.remainingBattles - updatedCheck.remainingBattles;
    console.log(`   📊 Difference: ${difference} battles used`);

    if (difference === 1) {
      console.log('   ✅ Daily battle count correctly decreased by 1!');
    } else {
      console.log('   ❌ Daily battle count not updated correctly!');
    }

    // 9. Thực hiện thêm một trận đấu nữa để kiểm tra
    console.log('\\n7️⃣ Performing second battle...');
    const battleResult2 = await FishBattleService.battleFish(testUserId, testGuildId, userFish.id, opponentFish.id);
    
    if ('success' in battleResult2 && !battleResult2.success) {
      console.log(`   ❌ Second battle failed: ${battleResult2.error}`);
    } else {
      const result2 = battleResult2 as any;
      const isUserWinner2 = result2.winner.id === userFish.id;
      console.log(`   ✅ Second battle completed! Winner: ${result2.winner.name}`);
      console.log(`   🏆 User won: ${isUserWinner2}`);
      console.log(`   💰 Reward: ${isUserWinner2 ? result2.rewards.winner : result2.rewards.loser} FishCoin`);

      // 10. Kiểm tra daily battle limit sau trận đấu thứ 2
      const finalCheck = await FishBattleService.checkAndResetDailyBattleCount(testUserId, testGuildId);
      console.log(`   Final daily battle limit: ${finalCheck.remainingBattles}/20`);
      
      const totalUsed = initialCheck.remainingBattles - finalCheck.remainingBattles;
      console.log(`   📊 Total battles used: ${totalUsed}`);
      
      if (totalUsed === 2) {
        console.log('   ✅ Daily battle count correctly updated for both battles!');
      } else {
        console.log('   ❌ Daily battle count not updated correctly for multiple battles!');
      }
    }

    console.log('\\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\\n🧹 Cleaning up test data...');
    try {
      await prisma.battleHistory.deleteMany({
        where: { userId: testUserId, guildId: testGuildId }
      });
      await prisma.battleFishInventory.deleteMany({
        where: { userId: testUserId, guildId: testGuildId }
      });
      await prisma.fish.deleteMany({
        where: { 
          OR: [
            { id: { startsWith: 'test-fish-user-' } },
            { id: { startsWith: 'test-fish-opponent-' } }
          ]
        }
      });
      await prisma.user.delete({
        where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
      });
      console.log('   ✅ Test data cleaned up!');
    } catch (cleanupError) {
      console.error('   ❌ Cleanup failed:', cleanupError);
    }
    
    await prisma.$disconnect();
  }
}

testDailyBattleUpdate(); 