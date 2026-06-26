import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

async function checkFishInventoryAfterBuy() {
  console.log('📦 Checking Fish Inventory After Purchase...\n');

  try {
    const guildId = '1362234245392765201';
    const buyerId = '876543210987654321';

    console.log('📋 Test Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- Buyer ID: ${buyerId}\n`);

    // 1. Kiểm tra fish trực tiếp từ database
    console.log('1️⃣ Checking fish in database...');
    
    const fishInDatabase = await prisma.fish.findMany({
      where: {
        userId: buyerId,
        guildId
      }
    });

    console.log(`- Fish owned by buyer: ${fishInDatabase.length}`);
    fishInDatabase.forEach((fish, index) => {
      console.log(`  ${index + 1}. ${fish.species} (ID: ${fish.id})`);
      console.log(`     Level: ${fish.level}, Gen: ${fish.generation}, Status: ${fish.status}`);
    });

    console.log('\n✅ Database check completed\n');

    // 2. Kiểm tra fish inventory
    console.log('2️⃣ Checking fish inventory...');
    
    const fishInventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId: buyerId, guildId } },
      include: {
        items: {
          include: {
            fish: true
          }
        }
      }
    });

    if (fishInventory) {
      console.log(`- Inventory capacity: ${fishInventory.capacity}`);
      console.log(`- Inventory items: ${fishInventory.items.length}`);
      
      fishInventory.items.forEach((item, index) => {
        const fish = item.fish;
        console.log(`  ${index + 1}. ${fish.species} (ID: ${fish.id})`);
        console.log(`     Level: ${fish.level}, Gen: ${fish.generation}, Status: ${fish.status}`);
      });
    } else {
      console.log('- No fish inventory found');
    }

    console.log('\n✅ Inventory check completed\n');

    // 3. Kiểm tra FishInventoryService
    console.log('3️⃣ Checking FishInventoryService...');
    
    const serviceInventory = await FishInventoryService.getFishInventory(buyerId, guildId);
    console.log(`- Service inventory items: ${serviceInventory.items.length}`);
    console.log(`- Service inventory capacity: ${serviceInventory.capacity}`);
    
    serviceInventory.items.forEach((item, index) => {
      const fish = item.fish;
      console.log(`  ${index + 1}. ${fish.name} (ID: ${fish.id})`);
      console.log(`     Level: ${fish.level}, Gen: ${fish.generation}, Status: ${fish.status}`);
    });

    console.log('\n✅ Service check completed\n');

    // 4. Tạo inventory nếu chưa có
    if (fishInDatabase.length > 0 && !fishInventory) {
      console.log('4️⃣ Creating fish inventory...');
      
      const newInventory = await prisma.fishInventory.create({
        data: {
          userId: buyerId,
          guildId,
          capacity: 10
        }
      });

      console.log(`- Created inventory with ID: ${newInventory.id}`);

      // Thêm fish vào inventory
      for (const fish of fishInDatabase) {
        await prisma.fishInventoryItem.create({
          data: {
            fishInventoryId: newInventory.id,
            fishId: fish.id
          }
        });
        console.log(`- Added ${fish.species} to inventory`);
      }

      console.log('\n✅ Inventory creation completed\n');
    }

    // 5. Kiểm tra lại sau khi tạo inventory
    console.log('5️⃣ Re-checking after inventory creation...');
    
    const finalInventory = await FishInventoryService.getFishInventory(buyerId, guildId);
    console.log(`- Final inventory items: ${finalInventory.items.length}`);
    
    finalInventory.items.forEach((item, index) => {
      const fish = item.fish;
      const stats = fish.stats || {};
      const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
      
      console.log(`  ${index + 1}. ${fish.name} (Lv.${fish.level}, Gen.${fish.generation})`);
      console.log(`     Power: ${totalPower} | Rarity: ${fish.rarity}`);
      console.log(`     Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`);
    });

    console.log('\n✅ Final check completed\n');

    console.log('🎉 Inventory check completed!');
    console.log('\n📝 Summary:');
    console.log(`- Fish owned: ${fishInDatabase.length}`);
    console.log(`- Inventory items: ${finalInventory.items.length}`);
    console.log('- All purchased fish should now be in inventory');

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkFishInventoryAfterBuy().catch(console.error); 