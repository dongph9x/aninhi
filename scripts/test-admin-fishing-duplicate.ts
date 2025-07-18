import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';

async function testAdminFishingDuplicate() {
  console.log('🎣 Testing Admin Fishing Duplicate Issue...\n');

  const testUserId = 'test_user_admin_duplicate';
  const testGuildId = 'test_guild_admin_duplicate';

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
        lastFished: new Date(0), // Cho phép câu ngay lập tức
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

    // 3. Test canFish với Admin ngay lập tức
    console.log('\n3. Testing canFish with Admin immediately...');
    const canFishAdmin1 = await FishingService.canFish(testUserId, testGuildId, true);
    console.log('✅ Admin canFish 1:', canFishAdmin1.canFish);
    console.log('   - Message:', canFishAdmin1.message);
    console.log('   - Remaining time:', canFishAdmin1.remainingTime);

    // 4. Test câu cá lần đầu với Admin
    console.log('\n4. Testing first admin fishing...');
    const fishingResult1 = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Admin fishing 1:');
    console.log('   - Fish:', fishingResult1.fish.name);
    console.log('   - Rarity:', fishingResult1.fish.rarity);
    console.log('   - Value:', fishingResult1.value);
    console.log('   - New balance:', fishingResult1.newBalance);

    // 5. Test canFish ngay sau lần câu đầu tiên
    console.log('\n5. Testing canFish immediately after first fishing...');
    const canFishAdmin2 = await FishingService.canFish(testUserId, testGuildId, true);
    console.log('✅ Admin canFish 2:', canFishAdmin2.canFish);
    console.log('   - Message:', canFishAdmin2.message);
    console.log('   - Remaining time:', canFishAdmin2.remainingTime);

    // 6. Test câu cá lần thứ 2 ngay lập tức
    console.log('\n6. Testing second admin fishing immediately...');
    const fishingResult2 = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Admin fishing 2:');
    console.log('   - Fish:', fishingResult2.fish.name);
    console.log('   - Rarity:', fishingResult2.fish.rarity);
    console.log('   - Value:', fishingResult2.value);
    console.log('   - New balance:', fishingResult2.newBalance);

    // 7. Kiểm tra fishing data sau 2 lần câu
    console.log('\n7. Checking fishing data after 2 fishing attempts...');
    const finalFishingData = await prisma.fishingData.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      include: {
        rods: true,
        baits: true,
        fish: true
      }
    });
    
    if (finalFishingData) {
      console.log('✅ Final fishing data:');
      console.log('   - Total fish caught:', finalFishingData.totalFish);
      console.log('   - Total earnings:', finalFishingData.totalEarnings);
      console.log('   - Fish in inventory:', finalFishingData.fish.length);
      console.log('   - Last fished:', finalFishingData.lastFished);
    }

    // 8. Tóm tắt kết quả
    console.log('\n📊 Duplicate Test Results:');
    console.log('   - Can fish 1:', canFishAdmin1.canFish);
    console.log('   - Can fish 2:', canFishAdmin2.canFish);
    console.log('   - Fishing 1:', fishingResult1.fish.name, `(${fishingResult1.fish.rarity})`);
    console.log('   - Fishing 2:', fishingResult2.fish.name, `(${fishingResult2.fish.rarity})`);
    console.log('   - Total fish in DB:', finalFishingData?.totalFish);
    console.log('   - Fish inventory count:', finalFishingData?.fish.length);
    
    if (finalFishingData && finalFishingData.totalFish === 2) {
      console.log('   ✅ No duplicate fishing detected');
    } else {
      console.log('   ❌ Duplicate fishing detected!');
    }

    console.log('\n🎉 Admin Fishing Duplicate Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFishingDuplicate(); 