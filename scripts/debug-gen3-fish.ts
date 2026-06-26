import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

const testUserId = 'debug-user-123';
const testGuildId = 'debug-guild-123';

async function debugGen3Fish() {
  console.log('🔍 Debugging Generation 3 Fish Stats Issue...\n');

  try {
    // 1. Tạo user test
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
        dailyStreak: 0
      }
    });

    // 2. Tìm tất cả cá trong database
    console.log('📊 Checking all fish in database...');
    const allFish = await prisma.fish.findMany({
      where: { userId: testUserId },
      orderBy: { generation: 'asc' }
    });

    console.log(`✅ Found ${allFish.length} fish in database:`);
    allFish.forEach((fish, index) => {
      const stats = JSON.parse(fish.stats || '{}');
      const totalPower = FishBreedingService.calculateTotalPower({...fish, stats});
      console.log(`   ${index + 1}. ${fish.species} (Gen ${fish.generation}, Lv.${fish.level})`);
      console.log(`      Stats: ${JSON.stringify(stats)}`);
      console.log(`      Total Power: ${totalPower}`);
      console.log(`      Status: ${fish.status}`);
      console.log(`      Created: ${fish.createdAt}`);
      console.log('');
    });

    // 3. Kiểm tra cá thế hệ 3 cụ thể
    console.log('🔍 Checking Generation 3 fish specifically...');
    const gen3Fish = allFish.filter(fish => fish.generation === 3);
    
    if (gen3Fish.length > 0) {
      gen3Fish.forEach((fish, index) => {
        console.log(`   Gen 3 Fish ${index + 1}: ${fish.species}`);
        console.log(`      Raw stats from DB: "${fish.stats}"`);
        console.log(`      Parsed stats: ${JSON.stringify(JSON.parse(fish.stats || '{}'))}`);
        console.log(`      Is stats null/empty: ${!fish.stats || fish.stats === '{}'}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No Generation 3 fish found!');
    }

    // 4. Kiểm tra lịch sử lai tạo
    console.log('📜 Checking breeding history...');
    const breedingHistory = await prisma.breedingHistory.findMany({
      where: { userId: testUserId },
      orderBy: { bredAt: 'desc' }
    });

    console.log(`✅ Found ${breedingHistory.length} breeding records:`);
    breedingHistory.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.notes}`);
      console.log(`      Success: ${record.success}`);
      console.log(`      Bred at: ${record.bredAt}`);
      console.log('');
    });

    // 5. Test tạo cá thế hệ 3 mới để so sánh
    console.log('🧪 Testing creation of new Generation 3 fish...');
    
    // Tạo cá thế hệ 2 với stats
    const gen2Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Gen 2 Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 2000,
        generation: 2,
        specialTraits: JSON.stringify(['Test', 'Gen2']),
        stats: JSON.stringify({
          strength: 50,
          agility: 50,
          intelligence: 50,
          defense: 50,
          luck: 50
        }),
        status: 'adult',
      }
    });

    console.log(`✅ Created test Gen 2 fish: ${gen2Fish.species}`);
    console.log(`   Stats: ${gen2Fish.stats}`);

    // Tạo cá thế hệ 3 từ Gen 2
    const gen3TestFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Gen 3 Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 3,
        specialTraits: JSON.stringify(['Test', 'Gen3']),
        stats: JSON.stringify({
          strength: 60,
          agility: 60,
          intelligence: 60,
          defense: 60,
          luck: 60
        }),
        status: 'adult',
      }
    });

    console.log(`✅ Created test Gen 3 fish: ${gen3TestFish.species}`);
    console.log(`   Stats: ${gen3TestFish.stats}`);
    console.log(`   Parsed stats: ${JSON.stringify(JSON.parse(gen3TestFish.stats || '{}'))}`);

    // 6. So sánh với cá thế hệ 3 hiện có
    console.log('\n🔍 Comparing with existing Gen 3 fish...');
    const existingGen3 = allFish.filter(fish => fish.generation === 3);
    const newGen3 = gen3TestFish;
    
    console.log('Existing Gen 3 fish:');
    existingGen3.forEach((fish, index) => {
      console.log(`   ${index + 1}. ${fish.species}: "${fish.stats}"`);
    });
    
    console.log(`New Gen 3 fish: ${newGen3.species}: "${newGen3.stats}"`);

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGen3Fish(); 