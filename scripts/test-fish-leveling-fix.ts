import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testFishLevelingFix() {
  console.log('🧪 Testing Fish Leveling Fix...\n');

  const testUserId = 'test_user_leveling';
  const testGuildId = 'test_guild_leveling';

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

    // 2. Tạo cá test với level 9 và exp gần max
    console.log('\n2. Creating test fish at level 9...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Leveling Fish',
        level: 9,
        experience: 95, // Gần max exp cho level 9 (cần 100)
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Test']),
        status: 'growing',
      },
    });
    console.log('✅ Test fish created:', testFish.species, '- Level:', testFish.level, '- Exp:', testFish.experience);

    // 3. Test cho cá ăn để lên level 10
    console.log('\n3. Testing feed to level 10...');
    const feedResult1 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Feed result 1:', feedResult1.success);
    if (feedResult1.success) {
      console.log('   - Level:', feedResult1.fish.level);
      console.log('   - Exp:', feedResult1.fish.experience);
      console.log('   - Status:', feedResult1.fish.status);
      console.log('   - Experience to next:', feedResult1.fish.experienceToNext);
      console.log('   - Leveled up:', feedResult1.leveledUp);
      console.log('   - Became adult:', feedResult1.becameAdult);
    }

    // 4. Test cho cá ăn thêm khi đã level 10
    console.log('\n4. Testing feed at level 10...');
    const feedResult2 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Feed result 2:', feedResult2.success);
    if (feedResult2.success) {
      console.log('   - Level:', feedResult2.fish.level);
      console.log('   - Exp:', feedResult2.fish.experience);
      console.log('   - Status:', feedResult2.fish.status);
      console.log('   - Experience to next:', feedResult2.fish.experienceToNext);
      console.log('   - Leveled up:', feedResult2.leveledUp);
      console.log('   - Became adult:', feedResult2.becameAdult);
    } else {
      console.log('   - Error:', feedResult2.error);
    }

    // 5. Test cho cá ăn thêm lần nữa
    console.log('\n5. Testing feed again at level 10...');
    const feedResult3 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Feed result 3:', feedResult3.success);
    if (feedResult3.success) {
      console.log('   - Level:', feedResult3.fish.level);
      console.log('   - Exp:', feedResult3.fish.experience);
      console.log('   - Status:', feedResult3.fish.status);
      console.log('   - Experience to next:', feedResult3.fish.experienceToNext);
    } else {
      console.log('   - Error:', feedResult3.error);
    }

    // 6. Kiểm tra thông tin cá cuối cùng
    console.log('\n6. Final fish info...');
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

    console.log('\n🎉 Fish leveling fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishLevelingFix(); 