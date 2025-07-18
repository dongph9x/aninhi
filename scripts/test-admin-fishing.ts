import prisma from '../src/utils/prisma';
import { FishingService } from '../src/utils/fishing';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testAdminFishing() {
  console.log('🧪 Testing Admin Fishing Features...\n');

  const testUserId = 'admin_user_123';
  const testGuildId = 'test_guild_456';

  try {
    // 1. Tạo admin user
    console.log('1. Creating admin user...');
    const user = await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: { balance: 10000 },
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
      },
    });
    console.log('✅ Admin user created/updated:', user.userId);

    // 2. Test câu cá với Admin bypass
    console.log('\n2. Testing fishing with Admin bypass...');
    
    // Câu cá lần đầu
    const result1 = await FishingService.fish(testUserId, testGuildId, true); // isAdmin = true
    console.log('✅ First fish caught:', result1.fish.name, '- Rarity:', result1.fish.rarity);
    
    // Câu cá ngay lập tức (Admin bypass cooldown)
    const result2 = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Second fish caught (bypass cooldown):', result2.fish.name, '- Rarity:', result2.fish.rarity);
    
    // Câu cá lần thứ 3
    const result3 = await FishingService.fish(testUserId, testGuildId, true);
    console.log('✅ Third fish caught:', result3.fish.name, '- Rarity:', result3.fish.rarity);

    // 3. Kiểm tra xem có câu được cá huyền thoại không
    console.log('\n3. Checking legendary fish catch rate...');
    let legendaryCount = 0;
    let totalFishes = 0;
    
    for (let i = 0; i < 10; i++) {
      const result = await FishingService.fish(testUserId, testGuildId, true);
      totalFishes++;
      if (result.fish.rarity === 'legendary') {
        legendaryCount++;
        console.log(`   ${i + 1}. 🐋 ${result.fish.name} (Legendary) - ${result.value} coins`);
      } else {
        console.log(`   ${i + 1}. ${result.fish.emoji} ${result.fish.name} (${result.fish.rarity}) - ${result.value} coins`);
      }
    }
    
    console.log(`\n📊 Legendary catch rate: ${legendaryCount}/${totalFishes} (${(legendaryCount/totalFishes*100).toFixed(1)}%)`);

    // 4. Test cho cá ăn với Admin bypass
    console.log('\n4. Testing feed fish with Admin bypass...');
    
    // Tạo một con cá để test
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Fish',
        level: 1,
        experience: 5,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Test']),
        status: 'growing',
      },
    });
    
    console.log('✅ Test fish created:', testFish.species);
    
    // Cho cá ăn nhiều lần liên tiếp (Admin bypass cooldown)
    for (let i = 0; i < 5; i++) {
      const feedResult = await FishBreedingService.feedFish(testUserId, testFish.id, true); // isAdmin = true
      if (feedResult.success) {
        console.log(`   ${i + 1}. Feed successful - Level: ${feedResult.fish.level}, Exp: ${feedResult.fish.experience}/${feedResult.fish.experienceToNext}`);
      } else {
        console.log(`   ${i + 1}. Feed failed:`, feedResult.error);
      }
    }

    // 5. Kiểm tra balance cuối
    console.log('\n5. Final balance check...');
    const finalUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });
    console.log('✅ Final balance:', finalUser?.balance);

    console.log('\n🎉 Admin fishing features test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFishing(); 