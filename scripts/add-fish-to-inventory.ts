import prisma from '../src/utils/prisma';
import { FishInventoryService } from '../src/utils/fish-inventory';

async function addFishToInventory() {
  console.log('🐟 Adding fish to inventory for testing...\n');

  const testUserId = 'test_user_battle';
  const testGuildId = 'test_guild_battle';

  try {
    // 1. Tìm tất cả cá trong database
    console.log('1. Finding all fish in database...');
    const allFish = await prisma.fish.findMany({
      where: {
        userId: testUserId,
        guildId: testGuildId
      }
    });
    console.log(`✅ Found ${allFish.length} fish in database`);

    // 2. Kiểm tra inventory hiện tại
    console.log('\n2. Checking current inventory...');
    const currentInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    console.log(`✅ Current inventory has ${currentInventory.items.length} items`);

    // 3. Thêm tất cả cá vào inventory
    console.log('\n3. Adding fish to inventory...');
    for (const fish of allFish) {
      const addResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish.id);
      if (addResult.success) {
        console.log(`✅ Added ${fish.species} (Level ${fish.level}, Status: ${fish.status})`);
      } else {
        console.log(`❌ Failed to add ${fish.species}: ${addResult.error}`);
      }
    }

    // 4. Kiểm tra inventory sau khi thêm
    console.log('\n4. Checking final inventory...');
    const finalInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
    console.log(`✅ Final inventory has ${finalInventory.items.length} items`);
    
    const adultFish = finalInventory.items.filter((item: any) => item.fish.status === 'adult');
    console.log(`✅ Adult fish: ${adultFish.length}`);
    
    finalInventory.items.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.fish.name} - Level ${item.fish.level} - Status: ${item.fish.status}`);
    });

    console.log('\n🎉 Fish inventory setup completed!');

  } catch (error) {
    console.error('❌ Error adding fish to inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFishToInventory(); 