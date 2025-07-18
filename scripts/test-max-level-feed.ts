import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testMaxLevelFeed() {
  console.log('🧪 Testing Max Level Feed...\n');

  const testUserId = 'test_user_maxlevel';
  const testGuildId = 'test_guild_maxlevel';

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

    // 2. Tạo cá test đã level 10 và trưởng thành
    console.log('\n2. Creating max level adult fish...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Max Level Fish',
        level: 10,
        experience: 5,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Max Level']),
        status: 'adult',
      },
    });
    console.log('✅ Max level fish created:', testFish.species, '- Level:', testFish.level, '- Status:', testFish.status);

    // 3. Test cho cá ăn khi đã max level
    console.log('\n3. Testing feed at max level...');
    const feedResult = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Feed result:', feedResult.success);
    if (feedResult.success) {
      console.log('   - Level:', feedResult.fish.level);
      console.log('   - Exp:', feedResult.fish.experience);
      console.log('   - Status:', feedResult.fish.status);
      console.log('   - Experience to next:', feedResult.fish.experienceToNext);
      console.log('   - Leveled up:', feedResult.leveledUp);
      console.log('   - Became adult:', feedResult.becameAdult);
    } else {
      console.log('   - Error:', feedResult.error);
    }

    // 4. Test cho cá ăn thêm lần nữa
    console.log('\n4. Testing feed again at max level...');
    const feedResult2 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Feed result 2:', feedResult2.success);
    if (feedResult2.success) {
      console.log('   - Level:', feedResult2.fish.level);
      console.log('   - Exp:', feedResult2.fish.experience);
      console.log('   - Status:', feedResult2.fish.status);
      console.log('   - Experience to next:', feedResult2.fish.experienceToNext);
    } else {
      console.log('   - Error:', feedResult2.error);
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

    console.log('\n🎉 Max level feed test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMaxLevelFeed(); 