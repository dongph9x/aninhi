import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';

async function testAdminFishingNoRequirements() {
  console.log('🎣 Testing Admin Fishing No Requirements...\n');

  const testUserId = 'test_user_admin_fishing';
  const testGuildId = 'test_guild_admin_fishing';

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

    // 2. Tạo fishing data với không có cần câu và mồi
    console.log('\n2. Creating fishing data without rod and bait...');
    const fishingData = await prisma.fishingData.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {
        currentRod: "", // Không có cần câu
        currentBait: "", // Không có mồi
      },
      create: {
        userId: testUserId,
        guildId: testGuildId,
        currentRod: "", // Không có cần câu
        currentBait: "", // Không có mồi
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
    console.log('✅ Fishing data created without rod and bait');

    // 3. Test canFish với Admin (isAdmin = true)
    console.log('\n3. Testing canFish with Admin (isAdmin = true)...');
    const canFishAdmin = await FishingService.canFish(testUserId, testGuildId, true);
    console.log('✅ Admin canFish result:', canFishAdmin.canFish);
    console.log('   - Message:', canFishAdmin.message);
    console.log('   - Remaining time:', canFishAdmin.remainingTime);

    // 4. Test canFish với normal user (isAdmin = false)
    console.log('\n4. Testing canFish with normal user (isAdmin = false)...');
    const canFishNormal = await FishingService.canFish(testUserId, testGuildId, false);
    console.log('✅ Normal canFish result:', canFishNormal.canFish);
    console.log('   - Message:', canFishNormal.message);
    console.log('   - Remaining time:', canFishNormal.remainingTime);

    // 5. Test câu cá với Admin
    console.log('\n5. Testing fishing with Admin...');
    const fishingResultAdmin = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Admin fishing result:');
    console.log('   - Fish:', fishingResultAdmin.fish.name);
    console.log('   - Rarity:', fishingResultAdmin.fish.rarity);
    console.log('   - Value:', fishingResultAdmin.value);
    console.log('   - New balance:', fishingResultAdmin.newBalance);

    // 6. Kiểm tra fishing data sau khi câu cá
    console.log('\n6. Checking fishing data after admin fishing...');
    const updatedFishingData = await prisma.fishingData.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      include: {
        rods: true,
        baits: true,
        fish: true
      }
    });
    
    if (updatedFishingData) {
      console.log('✅ Updated fishing data:');
      console.log('   - Current rod:', updatedFishingData.currentRod);
      console.log('   - Current bait:', updatedFishingData.currentBait);
      console.log('   - Total fish:', updatedFishingData.totalFish);
      console.log('   - Total earnings:', updatedFishingData.totalEarnings);
      console.log('   - Rods count:', updatedFishingData.rods.length);
      console.log('   - Baits count:', updatedFishingData.baits.length);
      console.log('   - Fish count:', updatedFishingData.fish.length);
    }

    // 7. Test câu cá thêm lần nữa với Admin
    console.log('\n7. Testing additional admin fishing...');
    const fishingResultAdmin2 = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Admin fishing result 2:');
    console.log('   - Fish:', fishingResultAdmin2.fish.name);
    console.log('   - Rarity:', fishingResultAdmin2.fish.rarity);
    console.log('   - Value:', fishingResultAdmin2.value);
    console.log('   - New balance:', fishingResultAdmin2.newBalance);

    // 8. Tóm tắt kết quả
    console.log('\n📊 Summary:');
    console.log('   - Admin canFish:', canFishAdmin.canFish);
    console.log('   - Normal canFish:', canFishNormal.canFish);
    console.log('   - Admin fishing 1:', fishingResultAdmin.fish.name, `(${fishingResultAdmin.fish.rarity})`);
    console.log('   - Admin fishing 2:', fishingResultAdmin2.fish.name, `(${fishingResultAdmin2.fish.rarity})`);
    
    if (canFishAdmin.canFish && !canFishNormal.canFish) {
      console.log('   ✅ Admin bypass rod and bait requirements: YES');
    } else {
      console.log('   ❌ Admin bypass rod and bait requirements: NO');
    }

    console.log('\n🎉 Admin Fishing No Requirements test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFishingNoRequirements(); 