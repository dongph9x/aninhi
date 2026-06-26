import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testAdminMaxLevelSpeed() {
  console.log('🏃‍♂️ Testing Admin Max Level Speed with 100 Exp...\n');

  const testUserId = 'test_user_admin_speed';
  const testGuildId = 'test_guild_admin_speed';

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
        species: 'Speed Test Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Speed Test']),
        status: 'growing',
      },
    });
    console.log('✅ Test fish created:', testFish.species, '- Level:', testFish.level, '- Exp:', testFish.experience);

    // 3. Test Admin feed cho đến max level
    console.log('\n3. Testing admin feeds until max level...');
    
    let currentFish = testFish;
    const feedResults = [];
    let feedCount = 0;
    
    while (currentFish.level < 10 && feedCount < 20) { // Giới hạn 20 lần để tránh vòng lặp vô hạn
      feedCount++;
      console.log(`\n   Feed ${feedCount}:`);
      
      const feedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, true);
      
      if (feedResult.success && feedResult.fish) {
        console.log(`   ✅ Success: +${feedResult.experienceGained} exp`);
        console.log(`   - Level: ${currentFish.level} → ${feedResult.fish.level}`);
        console.log(`   - Exp: ${currentFish.experience} → ${feedResult.fish.experience}`);
        console.log(`   - Exp to next: ${feedResult.fish.experienceToNext}`);
        console.log(`   - Status: ${feedResult.fish.status}`);
        
        if (feedResult.leveledUp) {
          console.log(`   🎉 Leveled up!`);
        }
        
        if (feedResult.becameAdult) {
          console.log(`   🐟 Became adult!`);
        }
        
        feedResults.push({
          feed: feedCount,
          expGained: feedResult.experienceGained,
          level: feedResult.fish.level,
          status: feedResult.fish.status
        });
        
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
    console.log('\n📊 Speed Test Results:');
    console.log(`   🎯 Feeds needed to reach level ${currentFish.level}: ${feedCount}`);
    console.log(`   📈 Total exp gained: ${feedResults.reduce((sum, result) => sum + result.expGained, 0)}`);
    console.log(`   🏆 Final status: ${currentFish.status}`);
    
    console.log('\n📋 Feed History:');
    feedResults.forEach((result, index) => {
      console.log(`   Feed ${result.feed}: +${result.expGained} exp → Level ${result.level} (${result.status})`);
    });

    // 5. So sánh với normal user
    console.log('\n⚡ Speed Comparison:');
    console.log(`   🚀 Admin (100 exp): ${feedCount} feeds to reach level ${currentFish.level}`);
    console.log(`   🐌 Normal user (1-5 exp): ~${Math.ceil(feedCount * 20)} feeds (ước tính)`);
    console.log(`   ⚡ Speed boost: ~${Math.ceil(feedCount * 20 / feedCount)}x faster`);

    // 6. Test cho cá ăn thêm khi đã max level
    console.log('\n4. Testing feed at max level...');
    const maxLevelFeedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, true);
    console.log('✅ Max level feed result:', maxLevelFeedResult.success);
    if (maxLevelFeedResult.success && maxLevelFeedResult.fish) {
      console.log('   - Experience gained:', maxLevelFeedResult.experienceGained);
      console.log('   - Level:', maxLevelFeedResult.fish.level);
      console.log('   - Status:', maxLevelFeedResult.fish.status);
    } else {
      console.log('   - Error:', maxLevelFeedResult.error);
    }

    console.log('\n🎉 Admin Max Level Speed Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminMaxLevelSpeed(); 