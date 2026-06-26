import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testAdminFeedReal() {
  console.log('🧪 Testing Admin Feed 10 Exp - Real World Test...\n');

  const testUserId = 'test_user_admin_real';
  const testGuildId = 'test_guild_admin_real';

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

    // 2. Tạo cá test với level 1
    console.log('\n2. Creating test fish at level 1...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Real Admin Test Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Real Admin Test']),
        status: 'growing',
      },
    });
    console.log('✅ Test fish created:', testFish.species, '- Level:', testFish.level, '- Exp:', testFish.experience);

    // 3. Test Admin feed nhiều lần để xác nhận luôn 10 exp
    console.log('\n3. Testing multiple admin feeds to confirm 10 exp consistency...');
    
    let currentFish = testFish;
    const feedResults = [];
    
    for (let i = 0; i < 5; i++) {
      console.log(`\n   Feed ${i + 1}:`);
      const feedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, true);
      
      if (feedResult.success && feedResult.fish) {
        console.log(`   ✅ Success: +${feedResult.experienceGained} exp`);
        console.log(`   - Level: ${currentFish.level} → ${feedResult.fish.level}`);
        console.log(`   - Exp: ${currentFish.experience} → ${feedResult.fish.experience}`);
        console.log(`   - Exp to next: ${feedResult.fish.experienceToNext}`);
        
        if (feedResult.leveledUp) {
          console.log(`   🎉 Leveled up!`);
        }
        
        feedResults.push(feedResult.experienceGained);
        currentFish = feedResult.fish;
        
        // Dừng nếu đã đạt max level
        if (currentFish.level >= 10) {
          console.log(`   🏆 Reached max level!`);
          break;
        }
      } else {
        console.log(`   ❌ Failed: ${feedResult.error}`);
        break;
      }
    }

    // 4. Tóm tắt kết quả
    console.log('\n📊 Feed Results Summary:');
    feedResults.forEach((exp, index) => {
      console.log(`   Feed ${index + 1}: +${exp} exp`);
    });
    
    const allTenExp = feedResults.every(exp => exp === 10);
    console.log(`\n✅ Admin luôn được 10 exp: ${allTenExp ? 'YES' : 'NO'}`);
    console.log(`📈 Total exp gained: ${feedResults.reduce((sum, exp) => sum + exp, 0)}`);
    console.log(`🎯 Final level: ${currentFish.level}`);

    // 5. Test normal user feed để so sánh
    console.log('\n4. Testing normal user feed for comparison...');
    const normalFeedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, false);
    console.log('✅ Normal feed result:', normalFeedResult.success);
    if (normalFeedResult.success && normalFeedResult.fish) {
      console.log(`   - Experience gained: ${normalFeedResult.experienceGained}`);
      console.log(`   - Level: ${normalFeedResult.fish.level}`);
      console.log(`   - Exp: ${normalFeedResult.fish.experience}`);
    } else {
      console.log(`   - Error: ${normalFeedResult.error}`);
    }

    console.log('\n🎉 Real World Admin Feed Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFeedReal(); 