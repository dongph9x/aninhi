import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';
import { SeasonalFishingService } from '../src/utils/seasonal-fishing';

async function testFishingCooldownFix() {
  console.log('⏱️ Testing Fishing Cooldown Fix...\n');

  const testUserId = 'test_user_cooldown_fix';
  const testGuildId = 'test_guild_cooldown_fix';

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
        fishBalance: 1000n,
      },
    });
    console.log('✅ User created:', user.userId);

    // 2. Tạo fishing data với cần câu và mồi
    console.log('\n2. Creating fishing data with rod and bait...');
    const fishingData = await prisma.fishingData.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {
        currentRod: "basic",
        currentBait: "basic",
        lastFished: new Date(0), // Cho phép câu ngay lập tức
      },
      create: {
        userId: testUserId,
        guildId: testGuildId,
        currentRod: "basic",
        currentBait: "basic",
        totalFish: 0,
        totalEarnings: 0,
        biggestFish: "",
        biggestValue: 0,
        rarestFish: "",
        rarestRarity: "",
        fishingTime: 0,
        lastFished: new Date(0), // Cho phép câu ngay lập tức
      },
    });
    console.log('✅ Fishing data created with rod and bait');

    // 3. Tạo cần câu basic
    console.log('\n3. Creating basic rod...');
    const rod = await prisma.fishingRod.upsert({
      where: { 
        fishingDataId_rodType: { 
          fishingDataId: fishingData.id, 
          rodType: 'basic' 
        } 
      },
      update: { durability: 10 },
      create: {
        fishingDataId: fishingData.id,
        rodType: 'basic',
        durability: 10,
      },
    });
    console.log('✅ Basic rod created with durability:', rod.durability);

    // 4. Tạo mồi basic
    console.log('\n4. Creating basic bait...');
    const bait = await prisma.fishingBait.upsert({
      where: { 
        fishingDataId_baitType: { 
          fishingDataId: fishingData.id, 
          baitType: 'basic' 
        } 
      },
      update: { quantity: 10 },
      create: {
        fishingDataId: fishingData.id,
        baitType: 'basic',
        quantity: 10,
      },
    });
    console.log('✅ Basic bait created with quantity:', bait.quantity);

    // 5. Test cooldown hoạt động
    console.log('\n5. Testing cooldown functionality...');
    
    // Lấy cooldown hiện tại
    const currentCooldown = SeasonalFishingService.getSeasonalCooldown();
    console.log(`   Current seasonal cooldown: ${currentCooldown} seconds`);

    // Test lần đầu - có thể câu
    console.log('\n   Test 1: First fishing attempt');
    const canFish1 = await FishingService.canFish(testUserId, testGuildId, false);
    console.log(`   Can fish 1: ${canFish1.canFish}`);
    if (!canFish1.canFish) {
      console.log(`   Reason: ${canFish1.message}`);
    }

    if (canFish1.canFish) {
      // Thực hiện câu cá
      console.log('   Executing fishing...');
      const fishResult = await FishingService.fish(testUserId, testGuildId, false);
      console.log(`   Caught fish: ${fishResult.fish.name} (${fishResult.fish.rarity})`);
      console.log(`   Fish value: ${fishResult.value} AniCoin`);
    }

    // Test lần thứ 2 - không thể câu (cooldown)
    console.log('\n   Test 2: Second fishing attempt (should be blocked by cooldown)');
    const canFish2 = await FishingService.canFish(testUserId, testGuildId, false);
    console.log(`   Can fish 2: ${canFish2.canFish}`);
    if (!canFish2.canFish) {
      console.log(`   Reason: ${canFish2.message}`);
      console.log(`   Remaining time: ${Math.ceil(canFish2.remainingTime / 1000)} seconds`);
    }

    // Test Admin bypass
    console.log('\n   Test 3: Admin fishing attempt (should bypass cooldown)');
    const canFishAdmin = await FishingService.canFish(testUserId, testGuildId, true);
    console.log(`   Can fish (Admin): ${canFishAdmin.canFish}`);
    if (canFishAdmin.canFish) {
      console.log('   Admin can fish despite cooldown (bypass working)');
    }

    // 6. Test auto-switch không bypass cooldown
    console.log('\n6. Testing auto-switch without cooldown bypass...');
    
    // Tạo cần câu thứ 2 để test auto-switch
    const rod2 = await prisma.fishingRod.upsert({
      where: { 
        fishingDataId_rodType: { 
          fishingDataId: fishingData.id, 
          rodType: 'copper' 
        } 
      },
      update: { durability: 5 },
      create: {
        fishingDataId: fishingData.id,
        rodType: 'copper',
        durability: 5,
      },
    });
    console.log('✅ Copper rod created for auto-switch test');

    // Hết độ bền cần câu basic
    await prisma.fishingRod.update({
      where: { id: rod.id },
      data: { durability: 0 }
    });
    console.log('✅ Basic rod durability set to 0');

    // Test auto-switch
    const canFishAfterSwitch = await FishingService.canFish(testUserId, testGuildId, false);
    console.log(`   Can fish after auto-switch: ${canFishAfterSwitch.canFish}`);
    if (!canFishAfterSwitch.canFish) {
      console.log(`   Reason: ${canFishAfterSwitch.message}`);
      console.log(`   Remaining time: ${Math.ceil(canFishAfterSwitch.remainingTime / 1000)} seconds`);
    }

    console.log('\n✅ Cooldown fix test completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Cooldown: ${currentCooldown} seconds`);
    console.log(`   - First attempt: ${canFish1.canFish ? 'Allowed' : 'Blocked'}`);
    console.log(`   - Second attempt: ${canFish2.canFish ? 'Allowed' : 'Blocked'}`);
    console.log(`   - Admin bypass: ${canFishAdmin.canFish ? 'Working' : 'Not working'}`);
    console.log(`   - Auto-switch: ${canFishAfterSwitch.canFish ? 'Allowed' : 'Blocked'}`);

  } catch (error) {
    console.error('❌ Error during cooldown fix test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishingCooldownFix();