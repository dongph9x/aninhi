import { PrismaClient } from '@prisma/client';
import { FishBattleService } from '../src/utils/fish-battle';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';

const prisma = new PrismaClient();

async function testBotOpponent() {
  console.log('🤖 Testing BOT Opponent Functionality...\n');

  const testGuildId = 'test-guild-bot-opponent-123';
  const testUserId = 'test-user-bot-opponent-456';

  try {
    // 1. Tạo test user
    console.log('1️⃣ Creating test user...');
    
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      },
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: BigInt(0),
        fishBalance: BigInt(0),
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      }
    });

    console.log('✅ Test user created');

    // 2. Tạo test fish để đấu
    console.log('\n2️⃣ Creating test fish for battle...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Battle Fish',
        level: 10,
        experience: 0,
        rarity: 'epic',
        value: BigInt(100000),
        generation: 2,
        status: 'adult',
        stats: JSON.stringify({ 
          strength: 25, 
          agility: 20, 
          intelligence: 22, 
          defense: 18, 
          luck: 15, 
          accuracy: 20 
        }),
        specialTraits: JSON.stringify(['Battle Ready', 'High Strength'])
      }
    });

    console.log(`   Test fish created: ${testFish.species} (ID: ${testFish.id})`);
    console.log(`   Level: ${testFish.level}, Status: ${testFish.status}, Generation: ${testFish.generation}`);

    // 3. Thêm cá vào battle inventory
    console.log('\n3️⃣ Adding test fish to battle inventory...');
    const addResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, testFish.id);
    
    if (!addResult.success) {
      console.log(`   ❌ Failed to add fish to battle inventory: ${addResult.error}`);
      return;
    }
    
    console.log('✅ Test fish added to battle inventory');

    // 4. Kiểm tra battle inventory
    console.log('\n4️⃣ Checking battle inventory...');
    const inventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    console.log(`   Fish in battle inventory: ${inventory.items.length}`);

    // 5. Tìm đối thủ (sẽ tạo BOT vì không có đối thủ thực tế)
    console.log('\n5️⃣ Finding opponent (should create BOT)...');
    
    const opponentResult = await FishBattleService.findRandomOpponent(testUserId, testGuildId, testFish.id);
    
    if (!opponentResult.success) {
      console.log(`   ❌ Failed to find opponent: ${opponentResult.error}`);
      return;
    }

    console.log(`   ✅ Opponent found: ${opponentResult.opponent.name} (ID: ${opponentResult.opponent.id})`);
    console.log(`   Is BOT: ${opponentResult.isBot || false}`);
    console.log(`   Species: ${opponentResult.opponent.species}`);
    console.log(`   Level: ${opponentResult.opponent.level}`);
    console.log(`   Status: ${opponentResult.opponent.status}`);
    console.log(`   Generation: ${opponentResult.opponent.generation}`);
    console.log(`   Rarity: ${opponentResult.opponent.rarity}`);

    // 6. Kiểm tra stats của BOT opponent
    console.log('\n6️⃣ Checking BOT opponent stats...');
    const botStats = opponentResult.opponent.stats || {};
    console.log(`   💪 Strength: ${botStats.strength || 0}`);
    console.log(`   🏃 Agility: ${botStats.agility || 0}`);
    console.log(`   🧠 Intelligence: ${botStats.intelligence || 0}`);
    console.log(`   🛡️ Defense: ${botStats.defense || 0}`);
    console.log(`   🍀 Luck: ${botStats.luck || 0}`);
    console.log(`   🎯 Accuracy: ${botStats.accuracy || 0}`);

    // 7. Kiểm tra traits của BOT opponent
    console.log('\n7️⃣ Checking BOT opponent traits...');
    const botTraits = opponentResult.opponent.traits || [];
    console.log(`   Traits: ${botTraits.join(', ')}`);

    // 8. Kiểm tra sức mạnh của BOT opponent
    console.log('\n8️⃣ Checking BOT opponent power...');
    const { FishBreedingService } = await import('../src/utils/fish-breeding');
    const botPower = FishBreedingService.calculateTotalPowerWithLevel(opponentResult.opponent);
    const userPower = FishBreedingService.calculateTotalPowerWithLevel(testFish);
    
    console.log(`   User fish power: ${Math.floor(userPower)}`);
    console.log(`   BOT opponent power: ${Math.floor(botPower)}`);
    console.log(`   Power difference: ${Math.floor(Math.abs(botPower - userPower))}`);
    console.log(`   Power ratio: ${(botPower / userPower).toFixed(2)}`);

    // 9. Kiểm tra tính đúng đắn của BOT opponent
    console.log('\n9️⃣ Validating BOT opponent...');
    
    const isBot = opponentResult.isBot === true;
    const hasValidId = opponentResult.opponent.id.startsWith('bot_');
    const hasValidStats = botStats.strength > 0 && botStats.agility > 0;
    const hasValidLevel = opponentResult.opponent.level === 10;
    const hasValidStatus = opponentResult.opponent.status === 'adult';
    const hasValidGeneration = opponentResult.opponent.generation === 2;
    const hasValidTraits = botTraits.length > 0;
    const powerReasonable = botPower > 0 && botPower < userPower * 1.5; // BOT không quá mạnh (giới hạn 1.5x)

    console.log(`     Is BOT: ${isBot ? '✅' : '❌'}`);
    console.log(`     Has valid ID: ${hasValidId ? '✅' : '❌'}`);
    console.log(`     Has valid stats: ${hasValidStats ? '✅' : '❌'}`);
    console.log(`     Has valid level (10): ${hasValidLevel ? '✅' : '❌'}`);
    console.log(`     Has valid status (adult): ${hasValidStatus ? '✅' : '❌'}`);
    console.log(`     Has valid generation (2): ${hasValidGeneration ? '✅' : '❌'}`);
    console.log(`     Has valid traits: ${hasValidTraits ? '✅' : '❌'}`);
    console.log(`     Power is reasonable: ${powerReasonable ? '✅' : '❌'}`);

    const allValid = isBot && hasValidId && hasValidStats && hasValidLevel && 
                    hasValidStatus && hasValidGeneration && hasValidTraits && powerReasonable;

    if (allValid) {
      console.log('\n🎉 SUCCESS: BOT Opponent functionality is working correctly!');
      console.log('✅ BOT opponent is created when no real opponents are found');
      console.log('✅ BOT opponent has balanced stats');
      console.log('✅ BOT opponent has valid properties');
      console.log('✅ BOT opponent power is reasonable compared to user fish');
    } else {
      console.log('\n❌ FAIL: Some BOT opponent validations failed');
    }

    // 10. Test battle với BOT opponent
    console.log('\n🔟 Testing battle with BOT opponent...');
    
    try {
      const battleResult = await FishBattleService.battleFish(
        testUserId, 
        testGuildId, 
        testFish.id, 
        opponentResult.opponent.id,
        opponentResult.opponent // Truyền opponentData cho BOT
      );

      if ('success' in battleResult && !battleResult.success) {
        console.log(`   ❌ Battle failed: ${battleResult.error}`);
      } else {
        const result = battleResult as any;
        console.log(`   ✅ Battle completed successfully!`);
        console.log(`   Winner: ${result.winner.name}`);
        console.log(`   Loser: ${result.loser.name}`);
        console.log(`   Winner power: ${Math.floor(result.winnerPower)}`);
        console.log(`   Loser power: ${Math.floor(result.loserPower)}`);
        console.log(`   Battle log entries: ${result.battleLog.length}`);
      }
    } catch (battleError) {
      console.log(`   ❌ Battle error: ${battleError}`);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testBotOpponent();
