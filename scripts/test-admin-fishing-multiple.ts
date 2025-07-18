import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';

async function testAdminFishingMultiple() {
  console.log('🎣 Testing Admin Fishing Multiple Times...\n');

  const testUserId = 'test_user_admin_multiple';
  const testGuildId = 'test_guild_admin_multiple';

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

    // 3. Test câu cá nhiều lần với Admin
    console.log('\n3. Testing multiple admin fishing...');
    
    const fishingResults = [];
    let currentBalance = user.balance;
    
    for (let i = 0; i < 5; i++) {
      console.log(`\n   Fishing ${i + 1}:`);
      
      try {
        const fishingResult = await FishingService.fish(testUserId, testGuildId, true);
        
        console.log(`   ✅ Success: ${fishingResult.fish.name} (${fishingResult.fish.rarity})`);
        console.log(`   - Value: ${fishingResult.value} AniCoin`);
        console.log(`   - Balance: ${currentBalance} → ${fishingResult.newBalance}`);
        console.log(`   - Net gain: +${fishingResult.value - 10} AniCoin`);
        
        fishingResults.push({
          fish: fishingResult.fish.name,
          rarity: fishingResult.fish.rarity,
          value: fishingResult.value,
          netGain: fishingResult.value - 10
        });
        
        currentBalance = fishingResult.newBalance;
        
        // Đợi 1 giây giữa các lần câu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      console.log('   - Current rod:', finalFishingData.currentRod || 'None');
      console.log('   - Current bait:', finalFishingData.currentBait || 'None');
      console.log('   - Total fish caught:', finalFishingData.totalFish);
      console.log('   - Total earnings:', finalFishingData.totalEarnings);
      console.log('   - Biggest fish:', finalFishingData.biggestFish);
      console.log('   - Biggest value:', finalFishingData.biggestValue);
      console.log('   - Rods owned:', finalFishingData.rods.length);
      console.log('   - Baits owned:', finalFishingData.baits.length);
      console.log('   - Fish in inventory:', finalFishingData.fish.length);
    }

    // 5. Tóm tắt kết quả
    console.log('\n📊 Fishing Results Summary:');
    fishingResults.forEach((result, index) => {
      console.log(`   Fishing ${index + 1}: ${result.fish} (${result.rarity}) - ${result.value}₳ (+${result.netGain}₳)`);
    });
    
    const totalEarnings = fishingResults.reduce((sum, result) => sum + result.value, 0);
    const totalNetGain = fishingResults.reduce((sum, result) => sum + result.netGain, 0);
    const legendaryCount = fishingResults.filter(result => result.rarity === 'legendary').length;
    
    console.log('\n💰 Financial Summary:');
    console.log(`   - Total earnings: ${totalEarnings} AniCoin`);
    console.log(`   - Total cost: ${fishingResults.length * 10} AniCoin`);
    console.log(`   - Net profit: ${totalNetGain} AniCoin`);
    console.log(`   - Legendary fish: ${legendaryCount}/${fishingResults.length}`);
    
    console.log('\n🏆 Admin Features Confirmed:');
    console.log(`   ✅ No rod required: ${fishingResults.length > 0 ? 'YES' : 'NO'}`);
    console.log(`   ✅ No bait required: ${fishingResults.length > 0 ? 'YES' : 'NO'}`);
    console.log(`   ✅ No cooldown: ${fishingResults.length > 0 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Always legendary: ${legendaryCount === fishingResults.length ? 'YES' : 'NO'}`);

    console.log('\n🎉 Admin Multiple Fishing Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFishingMultiple(); 