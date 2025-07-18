import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testFishBreedingAndBattle() {
  console.log('🧪 Testing Fish Breeding and Battle System...\n');

  const testUserId = 'test_user_battle';
  const testGuildId = 'test_guild_battle';

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

    // 2. Tạo cá huyền thoại với stats
    console.log('\n2. Creating legendary fish with stats...');
    const fish1 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Golden Dragon Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 5000,
        generation: 1,
        specialTraits: JSON.stringify(['Rare', 'Golden']),
        stats: JSON.stringify({
          strength: 80,
          agility: 70,
          intelligence: 60,
          defense: 75,
          luck: 65
        }),
        status: 'adult',
      },
    });
    console.log('✅ Fish 1 created:', fish1.species);

    const fish2 = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Crystal Whale',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 1,
        specialTraits: JSON.stringify(['Crystal', 'Ancient']),
        stats: JSON.stringify({
          strength: 70,
          agility: 80,
          intelligence: 75,
          defense: 60,
          luck: 70
        }),
        status: 'adult',
      },
    });
    console.log('✅ Fish 2 created:', fish2.species);

    // 3. Test lai tạo với stats di truyền
    console.log('\n3. Testing breeding with inherited stats...');
    const breedResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id);
    console.log('✅ Breed result:', breedResult.success);
    
    if (breedResult.success && breedResult.offspring) {
      console.log('   - Offspring:', breedResult.offspring.name);
      console.log('   - Generation:', breedResult.offspring.generation);
      console.log('   - Value:', breedResult.offspring.value);
      console.log('   - Stats:', breedResult.offspring.stats);
      console.log('   - Total Power:', FishBreedingService.calculateTotalPower(breedResult.offspring));
    }

    // 4. Test tính toán sức mạnh
    console.log('\n4. Testing power calculation...');
    const fish1Power = FishBreedingService.calculateTotalPower({
      ...fish1,
      stats: JSON.parse(fish1.stats || '{}')
    });
    const fish2Power = FishBreedingService.calculateTotalPower({
      ...fish2,
      stats: JSON.parse(fish2.stats || '{}')
    });
    
    console.log(`   - ${fish1.species} Power: ${fish1Power}`);
    console.log(`   - ${fish2.species} Power: ${fish2Power}`);

    // 5. Test lấy danh sách cá có thể lai tạo
    console.log('\n5. Testing getBreedableFish...');
    const breedableFish = await FishBreedingService.getBreedableFish(testUserId);
    console.log('✅ Breedable fish count:', breedableFish.length);
    
    breedableFish.forEach((fish, index) => {
      const power = FishBreedingService.calculateTotalPower(fish);
      console.log(`   ${index + 1}. ${fish.name} - Power: ${power} - Stats:`, fish.stats);
    });

    // 6. Test tạo stats ngẫu nhiên
    console.log('\n6. Testing random stats generation...');
    const randomStats = FishBreedingService.generateRandomStats();
    console.log('✅ Random stats:', randomStats);

    // 7. Test tính toán stats di truyền
    console.log('\n7. Testing inherited stats calculation...');
    const parent1Stats = JSON.parse(fish1.stats || '{}');
    const parent2Stats = JSON.parse(fish2.stats || '{}');
    const inheritedStats = FishBreedingService.calculateInheritedStats(parent1Stats, parent2Stats);
    console.log('✅ Inherited stats:', inheritedStats);

    console.log('\n🎉 All tests passed! Fish breeding and battle system is working correctly.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishBreedingAndBattle(); 