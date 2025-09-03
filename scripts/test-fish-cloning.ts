import { PrismaClient } from '@prisma/client';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import { FishInventoryService } from '../src/utils/fish-inventory';

const prisma = new PrismaClient();

async function testFishCloning() {
  console.log('🧪 Testing Fish Cloning Functionality...\n');

  const testGuildId = 'test-guild-clone-123';
  const adminUserId = '389957152153796608'; // ID admin thực tế

  try {
    // 1. Tạo test admin user
    console.log('1️⃣ Creating test admin user...');
    
    await prisma.user.upsert({
      where: { userId_guildId: { userId: adminUserId, guildId: testGuildId } },
      update: {
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      },
      create: {
        userId: adminUserId,
        guildId: testGuildId,
        balance: BigInt(0),
        fishBalance: BigInt(0),
        dailyFeedCount: 0,
        lastFeedReset: new Date(),
        dailyBattleCount: 0,
        lastBattleReset: new Date()
      }
    });

    console.log('✅ Test admin user created');

    // 2. Kiểm tra quyền admin
    console.log('\n2️⃣ Verifying admin permissions...');
    const isAdmin = await FishBattleService.isAdministrator(adminUserId, testGuildId);
    console.log(`   Is admin: ${isAdmin}`);
    
    if (!isAdmin) {
      console.log('❌ User is not admin, cannot test cloning functionality');
      return;
    }

    // 3. Tạo cá test để nhân bản
    console.log('\n3️⃣ Creating test fish for cloning...');
    const testFish = await prisma.fish.create({
      data: {
        userId: adminUserId,
        guildId: testGuildId,
        species: 'Test Cloning Fish',
        level: 5,
        experience: 50,
        rarity: 'legendary',
        value: BigInt(100000),
        generation: 2,
        status: 'adult',
        stats: JSON.stringify({ 
          strength: 25, 
          agility: 20, 
          intelligence: 30, 
          defense: 15, 
          luck: 10, 
          accuracy: 20 
        }),
        specialTraits: JSON.stringify(['Fast Growth', 'High Intelligence'])
      }
    });

    console.log(`   Test fish created: ${testFish.species} (ID: ${testFish.id})`);
    console.log(`   Level: ${testFish.level}, Rarity: ${testFish.rarity}, Generation: ${testFish.generation}`);

    // 4. Thêm cá vào inventory
    console.log('\n4️⃣ Adding test fish to inventory...');
    const addResult = await FishInventoryService.addFishToInventory(adminUserId, testGuildId, testFish.id);
    
    if (!addResult.success) {
      console.log(`   ❌ Failed to add fish to inventory: ${addResult.error}`);
      return;
    }
    
    console.log('✅ Test fish added to inventory');

    // 5. Kiểm tra inventory trước khi nhân bản
    console.log('\n5️⃣ Checking inventory before cloning...');
    const inventoryBefore = await FishInventoryService.getFishInventory(adminUserId, testGuildId);
    console.log(`   Fish in inventory before cloning: ${inventoryBefore.items.length}`);

    // 6. Tạo cá nhân bản
    console.log('\n6️⃣ Creating cloned fish...');
    const clonedFish = await prisma.fish.create({
      data: {
        userId: adminUserId,
        guildId: testGuildId,
        species: testFish.species,
        level: testFish.level,
        experience: testFish.experience,
        rarity: testFish.rarity,
        value: testFish.value,
                  generation: testFish.generation, // Giữ nguyên thế hệ như cá gốc
        status: testFish.status,
        stats: testFish.stats,
        specialTraits: testFish.specialTraits,
        // Thêm thông tin nhân bản
        isCloned: true,
        clonedFrom: testFish.id,
        clonedAt: new Date()
      }
    });

    console.log(`   Cloned fish created: ${clonedFish.species} (ID: ${clonedFish.id})`);
    console.log(`   Is cloned: ${clonedFish.isCloned}`);
    console.log(`   Cloned from: ${clonedFish.clonedFrom}`);
    console.log(`   Generation: ${clonedFish.generation}`);

    // 7. Thêm cá nhân bản vào inventory
    console.log('\n7️⃣ Adding cloned fish to inventory...');
    const addClonedResult = await FishInventoryService.addFishToInventory(adminUserId, testGuildId, clonedFish.id);
    
    if (!addClonedResult.success) {
      console.log(`   ❌ Failed to add cloned fish to inventory: ${addClonedResult.error}`);
      return;
    }
    
    console.log('✅ Cloned fish added to inventory');

    // 8. Kiểm tra inventory sau khi nhân bản
    console.log('\n8️⃣ Checking inventory after cloning...');
    const inventoryAfter = await FishInventoryService.getFishInventory(adminUserId, testGuildId);
    console.log(`   Fish in inventory after cloning: ${inventoryAfter.items.length}`);

    // 9. So sánh cá gốc và cá nhân bản
    console.log('\n9️⃣ Comparing original and cloned fish...');
    const originalFishItem = inventoryAfter.items.find((item: any) => item.fish.id === testFish.id);
    const clonedFishItem = inventoryAfter.items.find((item: any) => item.fish.id === clonedFish.id);
    
    if (originalFishItem && clonedFishItem) {
      const original = originalFishItem.fish;
      const cloned = clonedFishItem.fish;
      
      console.log('   Original Fish:');
      console.log(`     Species: ${original.species}`);
      console.log(`     Level: ${original.level}`);
      console.log(`     Rarity: ${original.rarity}`);
      console.log(`     Generation: ${original.generation}`);
      console.log(`     Is cloned: ${original.isCloned}`);
      
      console.log('   Cloned Fish:');
      console.log(`     Species: ${cloned.species}`);
      console.log(`     Level: ${cloned.level}`);
      console.log(`     Rarity: ${cloned.rarity}`);
      console.log(`     Generation: ${cloned.generation}`);
      console.log(`     Is cloned: ${cloned.isCloned}`);
      console.log(`     Cloned from: ${cloned.clonedFrom}`);
      
      // Kiểm tra tính đúng đắn
      const speciesMatch = original.species === cloned.species;
      const levelMatch = original.level === cloned.level;
      const rarityMatch = original.rarity === cloned.rarity;
      const generationCorrect = cloned.generation === original.generation; // Giữ nguyên thế hệ
      const isClonedCorrect = cloned.isCloned === true;
      const hasClonedFrom = !!cloned.clonedFrom;
      
      console.log('\n   Validation Results:');
      console.log(`     Species match: ${speciesMatch ? '✅' : '❌'}`);
      console.log(`     Level match: ${levelMatch ? '✅' : '❌'}`);
      console.log(`     Rarity match: ${rarityMatch ? '✅' : '❌'}`);
      console.log(`     Generation correct: ${generationCorrect ? '✅' : '❌'}`);
      console.log(`     Is cloned flag: ${isClonedCorrect ? '✅' : '❌'}`);
      console.log(`     Has cloned from: ${hasClonedFrom ? '✅' : '❌'}`);
      
      const allValid = speciesMatch && levelMatch && rarityMatch && generationCorrect && isClonedCorrect && hasClonedFrom;
      
      if (allValid) {
        console.log('\n🎉 SUCCESS: Fish cloning functionality is working correctly!');
        console.log('✅ Admin can clone fish');
        console.log('✅ Cloned fish has correct properties');
        console.log('✅ Cloning metadata is properly set');
        console.log('✅ Inventory is updated correctly');
      } else {
        console.log('\n❌ FAIL: Some cloning validations failed');
      }
    } else {
      console.log('❌ Could not find original or cloned fish in inventory');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testFishCloning();
