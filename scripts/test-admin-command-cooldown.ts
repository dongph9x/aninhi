import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';

async function testAdminCommandCooldown() {
  console.log('⏱️ Testing Admin Command Cooldown...\n');

  const testUserId = 'test_user_admin_cooldown';
  const testGuildId = 'test_guild_admin_cooldown';

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

    // 3. Test câu cá liên tục với Admin
    console.log('\n3. Testing continuous admin fishing...');
    
    const fishingResults = [];
    let currentBalance = user.balance;
    
    for (let i = 0; i < 3; i++) {
      console.log(`\n   Fishing ${i + 1}:`);
      
      try {
        const startTime = Date.now();
        const fishingResult = await FishingService.fish(testUserId, testGuildId, true);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`   ✅ Success: ${fishingResult.fish.name} (${fishingResult.fish.rarity})`);
        console.log(`   - Value: ${fishingResult.value} AniCoin`);
        console.log(`   - Balance: ${currentBalance} → ${fishingResult.newBalance}`);
        console.log(`   - Duration: ${duration}ms`);
        
        fishingResults.push({
          fish: fishingResult.fish.name,
          rarity: fishingResult.fish.rarity,
          value: fishingResult.value,
          duration: duration
        });
        
        currentBalance = fishingResult.newBalance;
        
        // Đợi 500ms giữa các lần câu để test
        if (i < 2) {
          console.log(`   ⏳ Waiting 500ms before next fishing...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error}`);
        break;
      }
    }

    // 4. Kiểm tra fishing data cuối cùng
    console.log('\n4. Checking final fishing data...');
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

    // 5. Tóm tắt kết quả
    console.log('\n📊 Cooldown Test Results:');
    fishingResults.forEach((result, index) => {
      console.log(`   Fishing ${index + 1}: ${result.fish} (${result.rarity}) - ${result.value}₳ (${result.duration}ms)`);
    });
    
    const totalEarnings = fishingResults.reduce((sum, result) => sum + result.value, 0);
    const totalDuration = fishingResults.reduce((sum, result) => sum + result.duration, 0);
    const avgDuration = totalDuration / fishingResults.length;
    
    console.log('\n⏱️ Performance Summary:');
    console.log(`   - Total earnings: ${totalEarnings} AniCoin`);
    console.log(`   - Total duration: ${totalDuration}ms`);
    console.log(`   - Average duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`   - Success rate: ${fishingResults.length}/3`);
    
    if (finalFishingData && finalFishingData.totalFish === 3) {
      console.log('   ✅ All fishing attempts successful');
    } else {
      console.log('   ❌ Some fishing attempts failed');
    }

    console.log('\n🎉 Admin Command Cooldown Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminCommandCooldown(); 