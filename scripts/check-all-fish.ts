import { FishBreedingService } from '../src/utils/fish-breeding';
import prisma from '../src/utils/prisma';

async function checkAllFish() {
  console.log('🔍 Checking all fish in database...\n');

  try {
    // Tìm tất cả cá trong database
    const allFish = await prisma.fish.findMany({
      orderBy: [
        { generation: 'asc' },
        { level: 'desc' }
      ]
    });

    console.log(`✅ Found ${allFish.length} total fish in database:\n`);

    // Nhóm theo thế hệ
    const fishByGeneration: { [generation: number]: any[] } = {};
    allFish.forEach(fish => {
      const generation = fish.generation;
      if (!fishByGeneration[generation]) {
        fishByGeneration[generation] = [];
      }
      fishByGeneration[generation].push(fish);
    });

    // Hiển thị từng thế hệ
    Object.keys(fishByGeneration).sort((a, b) => parseInt(a) - parseInt(b)).forEach(generation => {
      const genFish = fishByGeneration[parseInt(generation)];
      console.log(`🏷️ Generation ${generation} (${genFish.length} fish):`);
      
      genFish.forEach((fish, index) => {
        const stats = JSON.parse(fish.stats || '{}');
        const totalPower = FishBreedingService.calculateTotalPower({...fish, stats});
        const totalPowerWithLevel = FishBreedingService.calculateTotalPowerWithLevel({...fish, stats});
        
        console.log(`   ${index + 1}. ${fish.species} (Lv.${fish.level}, ${fish.status})`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Stats: ${JSON.stringify(stats)}`);
        console.log(`      Total Power: ${totalPower} | With Level: ${totalPowerWithLevel}`);
        console.log(`      Value: ${fish.value} | Created: ${fish.createdAt}`);
        console.log('');
      });
    });

    // Tìm cá có stats = 0
    console.log('🔍 Looking for fish with zero stats...');
    const zeroStatsFish = allFish.filter(fish => {
      const stats = JSON.parse(fish.stats || '{}');
      const totalStats = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
      return totalStats === 0;
    });

    if (zeroStatsFish.length > 0) {
      console.log(`⚠️ Found ${zeroStatsFish.length} fish with zero stats:`);
      zeroStatsFish.forEach((fish, index) => {
        console.log(`   ${index + 1}. ${fish.species} (Gen ${fish.generation}, Lv.${fish.level})`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Raw stats: "${fish.stats}"`);
        console.log(`      Status: ${fish.status} | Created: ${fish.createdAt}`);
        console.log('');
      });
    } else {
      console.log('✅ No fish with zero stats found!');
    }

    // Tìm cá thế hệ 3 cụ thể
    console.log('🔍 Looking for Generation 3 fish specifically...');
    const gen3Fish = allFish.filter(fish => fish.generation === 3);
    
    if (gen3Fish.length > 0) {
      console.log(`✅ Found ${gen3Fish.length} Generation 3 fish:`);
      gen3Fish.forEach((fish, index) => {
        const stats = JSON.parse(fish.stats || '{}');
        const totalPower = FishBreedingService.calculateTotalPower({...fish, stats});
        console.log(`   ${index + 1}. ${fish.species} (Lv.${fish.level})`);
        console.log(`      User: ${fish.userId} | Guild: ${fish.guildId}`);
        console.log(`      Stats: ${JSON.stringify(stats)}`);
        console.log(`      Total Power: ${totalPower}`);
        console.log(`      Raw stats from DB: "${fish.stats}"`);
        console.log('');
      });
    } else {
      console.log('❌ No Generation 3 fish found in database!');
    }

  } catch (error) {
    console.error('❌ Error checking fish:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllFish(); 