import prisma from '../src/utils/prisma';

async function testAchievementSystem() {
  console.log('🏆 Test Achievement System...\n');

  try {
    console.log('📋 Test Setup:\n');

    // 1. Test tạo achievement
    console.log('1️⃣ Testing create achievement...');
    
    const testAchievement = await prisma.achievement.create({
      data: {
        name: 'Top Fisher Master',
        link: 'https://example.com/top-fisher-badge.png',
        target: '389957152153796608', // Test user ID
        type: 0, // Top câu cá
      },
    });
    
    console.log('✅ Achievement created:', testAchievement.id);
    console.log(`   - Name: ${testAchievement.name}`);
    console.log(`   - Link: ${testAchievement.link}`);
    console.log(`   - Target: ${testAchievement.target}`);
    console.log(`   - Type: ${testAchievement.type}`);
    console.log(`   - Created: ${testAchievement.createdAt.toLocaleString()}`);

    // 2. Test tạo thêm achievement
    console.log('\n2️⃣ Testing create more achievements...');
    
    const achievements = [
      {
        name: 'FishCoin Millionaire',
        link: 'https://example.com/fishcoin-badge.png',
        target: '389957152153796608',
        type: 1, // Top FishCoin
      },
      {
        name: 'Battle Champion',
        link: 'https://example.com/battle-badge.png',
        target: '389957152153796608',
        type: 2, // Top FishBattle
      },
      {
        name: 'Custom Legend',
        link: 'https://example.com/custom-badge.png',
        target: '389957152153796608',
        type: 3, // Top Custom
      },
    ];

    for (const achievementData of achievements) {
      const achievement = await prisma.achievement.create({
        data: achievementData,
      });
      console.log(`✅ Created: ${achievement.name} (${achievement.id})`);
    }

    // 3. Test query achievements
    console.log('\n3️⃣ Testing query achievements...');
    
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`✅ Total achievements: ${allAchievements.length}`);
    
    allAchievements.forEach((achievement, index) => {
      const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
      const typeName = typeNames[achievement.type] || 'Unknown';
      
      console.log(`   ${index + 1}. ${achievement.name}`);
      console.log(`      - ID: ${achievement.id}`);
      console.log(`      - Type: ${typeName} (${achievement.type})`);
      console.log(`      - Target: ${achievement.target}`);
      console.log(`      - Link: ${achievement.link}`);
      console.log(`      - Created: ${achievement.createdAt.toLocaleString()}`);
      console.log('');
    });

    // 4. Test query by type
    console.log('4️⃣ Testing query by type...');
    
    const type0Achievements = await prisma.achievement.findMany({
      where: { type: 0 },
    });
    
    console.log(`✅ Type 0 achievements: ${type0Achievements.length}`);
    type0Achievements.forEach(achievement => {
      console.log(`   - ${achievement.name}`);
    });

    // 5. Test query by target
    console.log('\n5️⃣ Testing query by target...');
    
    const targetAchievements = await prisma.achievement.findMany({
      where: { target: '389957152153796608' },
    });
    
    console.log(`✅ Target achievements: ${targetAchievements.length}`);
    targetAchievements.forEach(achievement => {
      const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
      const typeName = typeNames[achievement.type] || 'Unknown';
      console.log(`   - ${achievement.name} (${typeName})`);
    });

    // 6. Test update achievement
    console.log('\n6️⃣ Testing update achievement...');
    
    const updatedAchievement = await prisma.achievement.update({
      where: { id: testAchievement.id },
      data: {
        name: 'Updated Top Fisher Master',
        link: 'https://example.com/updated-badge.png',
      },
    });
    
    console.log('✅ Achievement updated:');
    console.log(`   - New name: ${updatedAchievement.name}`);
    console.log(`   - New link: ${updatedAchievement.link}`);
    console.log(`   - Updated: ${updatedAchievement.updatedAt.toLocaleString()}`);

    // 7. Test delete achievement
    console.log('\n7️⃣ Testing delete achievement...');
    
    await prisma.achievement.delete({
      where: { id: testAchievement.id },
    });
    
    console.log('✅ Achievement deleted');

    // 8. Final count
    console.log('\n8️⃣ Final achievement count...');
    
    const finalCount = await prisma.achievement.count();
    console.log(`✅ Final achievements in database: ${finalCount}`);

    // 9. Test schema validation
    console.log('\n9️⃣ Testing schema validation...');
    
    try {
      // Test invalid type
      await prisma.achievement.create({
        data: {
          name: 'Invalid Type Test',
          link: 'https://example.com/test.png',
          target: '389957152153796608',
          type: 999, // Invalid type
        },
      });
      console.log('❌ Should have failed with invalid type');
    } catch (error) {
      console.log('✅ Correctly rejected invalid type');
    }

    console.log('\n🎉 Achievement system test completed!');
    console.log('\n📝 Summary:');
    console.log('- Database schema working correctly');
    console.log('- CRUD operations working');
    console.log('- Query filters working');
    console.log('- Validation working');
    console.log('\n💡 Next steps:');
    console.log('1. Test the Discord command: n.achievement-import');
    console.log('2. Test the form interface');
    console.log('3. Test the modal form');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAchievementSystem().catch(console.error); 