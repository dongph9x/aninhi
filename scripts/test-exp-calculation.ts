import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testExpCalculation() {
  console.log('🧪 Testing Experience Calculation...\n');

  const testUserId = 'test_user_exp';
  const testGuildId = 'test_guild_exp';

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
      },
    });
    console.log('✅ User created:', user.userId);

    // 2. Tạo cá test với level 1
    console.log('\n2. Creating test fish at level 1...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Exp Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Test']),
        status: 'growing',
      },
    });
    console.log('✅ Test fish created:', testFish.species, '- Level:', testFish.level, '- Exp:', testFish.experience);

    // 3. Test logic tính exp cho từng level
    console.log('\n3. Testing exp calculation for each level...');
    
    for (let level = 1; level <= 10; level++) {
      // Cập nhật level của cá
      await prisma.fish.update({
        where: { id: testFish.id },
        data: { level: level, experience: 0 }
      });

      // Lấy thông tin cá
      const fishInfo = await FishBreedingService.getFishById(testUserId, testFish.id);
      if (fishInfo) {
        console.log(`   Level ${level}: ${fishInfo.experience}/${fishInfo.experienceToNext} exp needed`);
      }
    }

    // 4. Test cho cá ăn để lên level
    console.log('\n4. Testing feeding to level up...');
    
    // Reset về level 1
    await prisma.fish.update({
      where: { id: testFish.id },
      data: { level: 1, experience: 0, status: 'growing' }
    });

    let currentLevel = 1;
    while (currentLevel < 5) { // Test đến level 5
      const fishInfo = await FishBreedingService.getFishById(testUserId, testFish.id);
      if (!fishInfo) break;

      console.log(`\n   Current: Level ${fishInfo.level}, Exp: ${fishInfo.experience}/${fishInfo.experienceToNext}`);
      
      // Cho cá ăn
      const feedResult = await FishBreedingService.feedFish(testUserId, testFish.id, true);
      if (feedResult.success) {
        console.log(`   Feed: +${feedResult.experienceGained} exp`);
        console.log(`   Result: Level ${feedResult.fish.level}, Exp: ${feedResult.fish.experience}/${feedResult.fish.experienceToNext}`);
        
        if (feedResult.leveledUp) {
          console.log(`   🎉 Leveled up to ${feedResult.fish.level}!`);
          currentLevel = feedResult.fish.level;
        }
      } else {
        console.log(`   Error: ${feedResult.error}`);
        break;
      }
    }

    // 5. Kiểm tra thông tin cá cuối cùng
    console.log('\n5. Final fish info...');
    const finalFish = await FishBreedingService.getFishById(testUserId, testFish.id);
    if (finalFish) {
      console.log('✅ Final fish info:');
      console.log('   - Name:', finalFish.name);
      console.log('   - Level:', finalFish.level);
      console.log('   - Exp:', finalFish.experience);
      console.log('   - Status:', finalFish.status);
      console.log('   - Experience to next:', finalFish.experienceToNext);
      console.log('   - Can breed:', finalFish.canBreed);
    }

    console.log('\n🎉 Experience calculation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExpCalculation(); 