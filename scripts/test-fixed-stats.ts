import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishBreedingService } from '../src/utils/fish-breeding';
import prisma from '../src/utils/prisma';

const testUserId = '389957152153796608';
const testGuildId = '1005280612845891615';

async function testFixedStats() {
  console.log('🧪 Testing Fixed Stats Parsing...\n');

  try {
    // 1. Tìm cá thế hệ 3 có vấn đề
    console.log('🔍 Finding the problematic Generation 3 fish...');
    const problemFish = await prisma.fish.findFirst({
      where: {
        userId: testUserId,
        guildId: testGuildId,
        generation: 3,
        species: 'Young Little Mini'
      }
    });

    if (!problemFish) {
      console.log('❌ Problem fish not found!');
      return;
    }

    console.log(`✅ Found problem fish: ${problemFish.species}`);
    console.log(`   Raw stats from DB: "${problemFish.stats}"`);
    console.log(`   Parsed stats: ${JSON.stringify(JSON.parse(problemFish.stats || '{}'))}`);
    console.log(`   Total Power: ${FishBreedingService.calculateTotalPower({...problemFish, stats: JSON.parse(problemFish.stats || '{}')})}\n`);

    // 2. Test BattleFishInventoryService với cá này
    console.log('🧪 Testing BattleFishInventoryService...');
    
    // Thêm cá vào battle inventory
    const addResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, problemFish.id);
    
    if (addResult.success && addResult.inventoryItem) {
      console.log('✅ Successfully added fish to battle inventory');
      console.log(`   Fish name: ${addResult.inventoryItem.fish.name}`);
      console.log(`   Fish stats: ${JSON.stringify(addResult.inventoryItem.fish.stats)}`);
      console.log(`   Stats type: ${typeof addResult.inventoryItem.fish.stats}`);
      console.log(`   Total Power: ${FishBreedingService.calculateTotalPower(addResult.inventoryItem.fish)}`);
    } else {
      console.log(`❌ Failed to add fish: ${addResult.error}`);
    }

    // 3. Test getBattleFishInventory
    console.log('\n🧪 Testing getBattleFishInventory...');
    const inventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    
    console.log(`✅ Battle inventory has ${inventory.items.length} fish`);
    inventory.items.forEach((item: any, index: number) => {
      const fish = item.fish;
      const stats = fish.stats;
      const totalPower = FishBreedingService.calculateTotalPower(fish);
      
      console.log(`   ${index + 1}. ${fish.name} (Gen ${fish.generation})`);
      console.log(`      Stats: ${JSON.stringify(stats)}`);
      console.log(`      Stats type: ${typeof stats}`);
      console.log(`      Total Power: ${totalPower}`);
      console.log(`      Is stats object: ${typeof stats === 'object' && stats !== null}`);
      console.log('');
    });

    // 4. Test getEligibleBattleFish
    console.log('🧪 Testing getEligibleBattleFish...');
    const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
    
    console.log(`✅ Found ${eligibleFish.length} eligible fish`);
    eligibleFish.slice(0, 3).forEach((fish: any, index: number) => {
      const stats = fish.stats;
      const totalPower = FishBreedingService.calculateTotalPower(fish);
      
      console.log(`   ${index + 1}. ${fish.name} (Gen ${fish.generation})`);
      console.log(`      Stats: ${JSON.stringify(stats)}`);
      console.log(`      Stats type: ${typeof stats}`);
      console.log(`      Total Power: ${totalPower}`);
      console.log(`      Is stats object: ${typeof stats === 'object' && stats !== null}`);
      console.log('');
    });

    // 5. Test power calculation
    console.log('🧪 Testing power calculation...');
    const testFish = {
      ...problemFish,
      stats: JSON.parse(problemFish.stats || '{}')
    };
    
    const totalPower = FishBreedingService.calculateTotalPower(testFish);
    const totalPowerWithLevel = FishBreedingService.calculateTotalPowerWithLevel(testFish);
    
    console.log(`✅ Power calculation results:`);
    console.log(`   Total Power (stats only): ${totalPower}`);
    console.log(`   Total Power (with level): ${totalPowerWithLevel}`);
    console.log(`   Level bonus: ${totalPowerWithLevel - totalPower}`);

    // 6. Cleanup - xóa cá khỏi battle inventory
    console.log('\n🧹 Cleaning up...');
    if (addResult.success && addResult.inventoryItem) {
      const removeResult = await BattleFishInventoryService.removeFishFromBattleInventory(testUserId, testGuildId, problemFish.id);
      if (removeResult.success) {
        console.log('✅ Successfully removed fish from battle inventory');
      } else {
        console.log(`❌ Failed to remove fish: ${removeResult.error}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedStats(); 