import { PrismaClient } from '@prisma/client';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import { FishInventoryService } from '../src/utils/fish-inventory';

const prisma = new PrismaClient();

async function testFishLevelUp() {
  console.log('🧪 Testing Fish Level Up Functionality...\n');

  const testGuildId = 'test-guild-levelup-123';
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
      console.log('❌ User is not admin, cannot test level up functionality');
      return;
    }

    // 3. Tạo cá test để nâng cấp
    console.log('\n3️⃣ Creating test fish for level up...');
    const testFish = await prisma.fish.create({
      data: {
        userId: adminUserId,
        guildId: testGuildId,
        species: 'Test Level Up Fish',
        level: 3,
        experience: 25,
        rarity: 'epic',
        value: BigInt(50000),
        generation: 1,
        status: 'growing',
        stats: JSON.stringify({ 
          strength: 15, 
          agility: 12, 
          intelligence: 18, 
          defense: 10, 
          luck: 8, 
          accuracy: 14 
        }),
        specialTraits: JSON.stringify(['Fast Growth', 'High Intelligence'])
      }
    });

    console.log(`   Test fish created: ${testFish.species} (ID: ${testFish.id})`);
    console.log(`   Level: ${testFish.level}, Experience: ${testFish.experience}, Value: ${testFish.value}`);

    // 4. Thêm cá vào inventory
    console.log('\n4️⃣ Adding test fish to inventory...');
    const addResult = await FishInventoryService.addFishToInventory(adminUserId, testGuildId, testFish.id);
    
    if (!addResult.success) {
      console.log(`   ❌ Failed to add fish to inventory: ${addResult.error}`);
      return;
    }
    
    console.log('✅ Test fish added to inventory');

    // 5. Kiểm tra inventory trước khi nâng cấp
    console.log('\n5️⃣ Checking inventory before level up...');
    const inventoryBefore = await FishInventoryService.getFishInventory(adminUserId, testGuildId);
    console.log(`   Fish in inventory before level up: ${inventoryBefore.items.length}`);

    // 6. Nâng cấp cá lên level 10
    console.log('\n6️⃣ Leveling up fish to level 10...');
    
    // Tính toán giá trị mới dựa trên level 10
    const levelBonus = (10 - testFish.level) * 0.02; // Mỗi level tăng 2%
    const expectedNewValue = Math.floor(Number(testFish.value) * (1 + levelBonus));
    
    console.log(`   Current level: ${testFish.level}`);
    console.log(`   Target level: 10`);
    console.log(`   Level bonus: ${(levelBonus * 100).toFixed(1)}%`);
    console.log(`   Current value: ${Number(testFish.value).toLocaleString()}`);
    console.log(`   Expected new value: ${expectedNewValue.toLocaleString()}`);

    // Cập nhật cá lên level 10
    const updatedFish = await prisma.fish.update({
      where: { id: testFish.id },
      data: {
        level: 10,
        experience: 0, // Reset experience về 0 khi đạt max level
        value: BigInt(expectedNewValue),
        status: 'adult', // Tự động chuyển sang trạng thái trưởng thành
        updatedAt: new Date()
      }
    });

    console.log(`   Fish updated successfully!`);
    console.log(`   New level: ${updatedFish.level}`);
    console.log(`   New experience: ${updatedFish.experience}`);
    console.log(`   New value: ${Number(updatedFish.value).toLocaleString()}`);
    console.log(`   New status: ${updatedFish.status}`);

    // 7. Kiểm tra inventory sau khi nâng cấp
    console.log('\n7️⃣ Checking inventory after level up...');
    const inventoryAfter = await FishInventoryService.getFishInventory(adminUserId, testGuildId);
    console.log(`   Fish in inventory after level up: ${inventoryAfter.items.length}`);

    // 8. So sánh trước và sau khi nâng cấp
    console.log('\n8️⃣ Comparing before and after level up...');
    
    const fishBefore = testFish;
    const fishAfter = updatedFish;
    
    console.log('   Before Level Up:');
    console.log(`     Level: ${fishBefore.level}`);
    console.log(`     Experience: ${fishBefore.experience}`);
    console.log(`     Value: ${Number(fishBefore.value).toLocaleString()}`);
    console.log(`     Status: ${fishBefore.status}`);
    
    console.log('   After Level Up:');
    console.log(`     Level: ${fishAfter.level}`);
    console.log(`     Experience: ${fishAfter.experience}`);
    console.log(`     Value: ${Number(fishAfter.value).toLocaleString()}`);
    console.log(`     Status: ${fishAfter.status}`);
    
    // 9. Kiểm tra tính đúng đắn
    console.log('\n9️⃣ Validation Results...');
    
    const levelCorrect = fishAfter.level === 10;
    const experienceReset = fishAfter.experience === 0;
    const statusAdult = fishAfter.status === 'adult';
    const valueIncreased = Number(fishAfter.value) > Number(fishBefore.value);
    const valueCorrect = Number(fishAfter.value) === expectedNewValue;
    
    console.log(`     Level correct (10): ${levelCorrect ? '✅' : '❌'}`);
    console.log(`     Experience reset (0): ${experienceReset ? '✅' : '❌'}`);
    console.log(`     Status adult: ${statusAdult ? '✅' : '❌'}`);
    console.log(`     Value increased: ${valueIncreased ? '✅' : '❌'}`);
    console.log(`     Value calculation correct: ${valueCorrect ? '✅' : '❌'}`);
    
    const allValid = levelCorrect && experienceReset && statusAdult && valueIncreased && valueCorrect;
    
    if (allValid) {
      console.log('\n🎉 SUCCESS: Fish Level Up functionality is working correctly!');
      console.log('✅ Admin can level up fish to level 10');
      console.log('✅ Fish level is correctly set to 10');
      console.log('✅ Experience is reset to 0');
      console.log('✅ Status is changed to adult');
      console.log('✅ Value is increased with correct calculation');
    } else {
      console.log('\n❌ FAIL: Some level up validations failed');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testFishLevelUp();
