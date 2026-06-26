import prisma from '../src/utils/prisma';

async function fixFishInventory() {
  console.log('🔧 Fixing Fish Inventory...\n');

  try {
    const guildId = '1362234245392765201';
    const buyerId = '876543210987654321';

    console.log('📋 Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- Buyer ID: ${buyerId}\n`);

    // 1. Lấy fish của buyer
    console.log('1️⃣ Getting buyer fish...');
    
    const buyerFish = await prisma.fish.findMany({
      where: {
        userId: buyerId,
        guildId
      }
    });

    console.log(`- Found ${buyerFish.length} fish owned by buyer`);
    buyerFish.forEach((fish, index) => {
      console.log(`  ${index + 1}. ${fish.species} (ID: ${fish.id})`);
    });

    if (buyerFish.length === 0) {
      console.log('❌ No fish found for buyer');
      return;
    }

    console.log('\n✅ Fish retrieval completed\n');

    // 2. Kiểm tra inventory hiện tại
    console.log('2️⃣ Checking current inventory...');
    
    let buyerInventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId: buyerId, guildId } },
      include: {
        items: {
          include: {
            fish: true
          }
        }
      }
    });

    if (buyerInventory) {
      console.log(`- Existing inventory found (ID: ${buyerInventory.id})`);
      console.log(`- Current items: ${buyerInventory.items.length}`);
      console.log(`- Capacity: ${buyerInventory.capacity}`);
    } else {
      console.log('- No inventory found, will create new one');
    }

    console.log('\n✅ Inventory check completed\n');

    // 3. Tạo inventory nếu chưa có
    if (!buyerInventory) {
      console.log('3️⃣ Creating new inventory...');
      
      buyerInventory = await prisma.fishInventory.create({
        data: {
          userId: buyerId,
          guildId,
          capacity: 10
        },
        include: {
          items: {
            include: {
              fish: true
            }
          }
        }
      });

      console.log(`- Created inventory with ID: ${buyerInventory.id}`);
    }

    console.log('\n✅ Inventory creation completed\n');

    // 4. Thêm fish vào inventory
    console.log('4️⃣ Adding fish to inventory...');
    
    for (const fish of buyerFish) {
      // Kiểm tra xem fish đã có trong inventory chưa
      const existingItem = await prisma.fishInventoryItem.findUnique({
        where: { fishId: fish.id }
      });

      if (existingItem) {
        console.log(`- ${fish.species} already in inventory`);
      } else {
        await prisma.fishInventoryItem.create({
          data: {
            fishInventoryId: buyerInventory!.id,
            fishId: fish.id
          }
        });
        console.log(`- Added ${fish.species} to inventory`);
      }
    }

    console.log('\n✅ Fish addition completed\n');

    // 5. Kiểm tra kết quả
    console.log('5️⃣ Checking final result...');
    
    const finalInventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId: buyerId, guildId } },
      include: {
        items: {
          include: {
            fish: true
          }
        }
      }
    });

    if (finalInventory) {
      console.log(`- Final inventory items: ${finalInventory.items.length}`);
      console.log(`- Capacity: ${finalInventory.capacity}`);
      
      finalInventory.items.forEach((item, index) => {
        const fish = item.fish;
        const stats = fish.stats ? JSON.parse(fish.stats) : {};
        const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
        
        console.log(`  ${index + 1}. ${fish.species} (Lv.${fish.level}, Gen.${fish.generation})`);
        console.log(`     Power: ${totalPower} | Rarity: ${fish.rarity}`);
        console.log(`     Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`);
      });
    }

    console.log('\n✅ Final check completed\n');

    console.log('🎉 Fish inventory fixed successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Fish owned: ${buyerFish.length}`);
    console.log(`- Inventory items: ${finalInventory?.items.length || 0}`);
    console.log('- All fish are now properly in inventory');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixFishInventory().catch(console.error); 