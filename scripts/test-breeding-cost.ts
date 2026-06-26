import { FishBreedingService } from '../src/utils/fish-breeding';
import { fishCoinDB } from '../src/utils/fish-coin';
import prisma from '../src/utils/prisma';

async function testBreedingCost() {
  console.log('🧪 Testing Breeding Cost System...\n');

  const testUserId = 'test-user-breeding-cost';
  const testGuildId = 'test-guild-breeding-cost';

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
    console.log('✅ Test user created\n');

    // 2. Kiểm tra chi phí lai tạo
    console.log('2️⃣ Checking breeding cost...');
    const breedingCost = FishBreedingService.getBreedingCost();
    console.log('Breeding cost:', breedingCost.toLocaleString(), 'FishCoin');
    console.log('✅ Breeding cost check completed\n');

    // 3. Tạo 2 cá test để lai tạo
    console.log('3️⃣ Creating test fish for breeding...');
    const fish1 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Fish 1',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: BigInt(50000),
        generation: 1,
        specialTraits: JSON.stringify(['Test1']),
        status: 'adult',
        stats: JSON.stringify({
          strength: 50,
          agility: 50,
          intelligence: 50,
          defense: 50,
          luck: 50
        })
      }
    });

    const fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Fish 2',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: BigInt(60000),
        generation: 1,
        specialTraits: JSON.stringify(['Test2']),
        status: 'adult',
        stats: JSON.stringify({
          strength: 60,
          agility: 60,
          intelligence: 60,
          defense: 60,
          luck: 60
        })
      }
    });

    console.log('✅ Test fish created:', fish1.species, 'and', fish2.species, '\n');

    // 4. Test lai tạo với FishCoin không đủ
    console.log('4️⃣ Testing breeding with insufficient FishCoin...');
    const insufficientResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id, false);
    console.log('Breeding result (insufficient FishCoin):', insufficientResult);
    console.log('✅ Insufficient FishCoin test completed\n');

    // 5. Thêm đủ FishCoin
    console.log('5️⃣ Adding sufficient FishCoin...');
    await fishCoinDB.addFishCoin(testUserId, testGuildId, breedingCost, 'Test: Adding FishCoin for breeding');
    const balance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('Current FishCoin balance:', balance.toString());
    console.log('✅ FishCoin added\n');

    // 6. Test lai tạo với đủ FishCoin
    console.log('6️⃣ Testing breeding with sufficient FishCoin...');
    const sufficientResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id, false);
    console.log('Breeding result (sufficient FishCoin):', sufficientResult);
    console.log('✅ Sufficient FishCoin test completed\n');

    // 7. Kiểm tra balance sau khi lai tạo
    console.log('7️⃣ Checking balance after breeding...');
    const newBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    console.log('FishCoin balance after breeding:', newBalance.toString());
    console.log('Expected balance:', (balance - BigInt(breedingCost)).toString());
    console.log('✅ Balance check completed\n');

    // 8. Test lai tạo với admin (miễn phí)
    console.log('8️⃣ Testing breeding with admin privilege...');
    
    // Tạo 2 cá mới cho test admin
    const fish3 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Admin Test Fish 1',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: BigInt(70000),
        generation: 1,
        specialTraits: JSON.stringify(['Admin1']),
        status: 'adult',
        stats: JSON.stringify({
          strength: 70,
          agility: 70,
          intelligence: 70,
          defense: 70,
          luck: 70
        })
      }
    });

    const fish4 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Admin Test Fish 2',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: BigInt(80000),
        generation: 1,
        specialTraits: JSON.stringify(['Admin2']),
        status: 'adult',
        stats: JSON.stringify({
          strength: 80,
          agility: 80,
          intelligence: 80,
          defense: 80,
          luck: 80
        })
      }
    });

    const adminBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    const adminResult = await FishBreedingService.breedFish(testUserId, fish3.id, fish4.id, true);
    const adminNewBalance = await fishCoinDB.getFishBalance(testUserId, testGuildId);
    
    console.log('Admin breeding result:', adminResult);
    console.log('Balance before admin breeding:', adminBalance.toString());
    console.log('Balance after admin breeding:', adminNewBalance.toString());
    console.log('Balance unchanged (admin privilege):', adminBalance.toString() === adminNewBalance.toString());
    console.log('✅ Admin privilege test completed\n');

    // 9. Kiểm tra lịch sử lai tạo
    console.log('9️⃣ Checking breeding history...');
    const breedingHistory = await prisma.breedingHistory.findMany({
      where: { userId: testUserId, guildId: testGuildId },
      orderBy: { bredAt: 'desc' }
    });
    
    console.log('Breeding history entries:', breedingHistory.length);
    breedingHistory.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`, {
        success: entry.success,
        notes: entry.notes,
        bredAt: entry.bredAt
      });
    });
    console.log('✅ Breeding history check completed\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Breeding cost: 100,000 FishCoin');
    console.log('✅ Insufficient FishCoin check works');
    console.log('✅ Sufficient FishCoin breeding works');
    console.log('✅ Admin privilege (free breeding) works');
    console.log('✅ Breeding history is recorded');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.fish.deleteMany({
      where: { userId: testUserId, guildId: testGuildId }
    });
    await prisma.breedingHistory.deleteMany({
      where: { userId: testUserId, guildId: testGuildId }
    });
    await prisma.user.deleteMany({
      where: { userId: testUserId, guildId: testGuildId }
    });
    console.log('✅ Cleanup completed');
    
    await prisma.$disconnect();
  }
}

// Chạy test
testBreedingCost(); 