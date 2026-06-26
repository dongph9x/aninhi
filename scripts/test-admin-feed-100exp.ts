import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testAdminFeed100Exp() {
  console.log('🧪 Testing Admin Feed 100 Exp Feature...\n');

  const testUserId = 'test_user_admin_100exp';
  const testGuildId = 'test_guild_admin_100exp';

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
        species: 'Admin 100 Exp Test Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Admin 100 Exp Test']),
        status: 'growing',
      },
    });
    console.log('✅ Test fish created:', testFish.species, '- Level:', testFish.level, '- Exp:', testFish.experience);

    // 3. Test cho cá ăn với Admin (isAdmin = true)
    console.log('\n3. Testing feed fish with Admin (isAdmin = true)...');
    const feedResultAdmin = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Admin feed result:', feedResultAdmin.success);
    if (feedResultAdmin.success && feedResultAdmin.fish) {
      console.log('   - Experience gained:', feedResultAdmin.experienceGained);
      console.log('   - Level:', feedResultAdmin.fish.level);
      console.log('   - Exp:', feedResultAdmin.fish.experience);
      console.log('   - Experience to next:', feedResultAdmin.fish.experienceToNext);
      console.log('   - Leveled up:', feedResultAdmin.leveledUp);
      console.log('   - Became adult:', feedResultAdmin.becameAdult);
    } else {
      console.log('   - Error:', feedResultAdmin.error);
    }

    // 4. Test cho cá ăn thêm với Admin để xác nhận luôn 100 exp
    console.log('\n4. Testing additional admin feed to confirm 100 exp...');
    const feedResultAdmin2 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Admin feed result 2:', feedResultAdmin2.success);
    if (feedResultAdmin2.success && feedResultAdmin2.fish) {
      console.log('   - Experience gained:', feedResultAdmin2.experienceGained);
      console.log('   - Level:', feedResultAdmin2.fish.level);
      console.log('   - Exp:', feedResultAdmin2.fish.experience);
      console.log('   - Experience to next:', feedResultAdmin2.fish.experienceToNext);
      console.log('   - Leveled up:', feedResultAdmin2.leveledUp);
      console.log('   - Became adult:', feedResultAdmin2.becameAdult);
    } else {
      console.log('   - Error:', feedResultAdmin2.error);
    }

    // 5. Test cho cá ăn thêm lần nữa để xem leveling
    console.log('\n5. Testing third admin feed to see leveling...');
    const feedResultAdmin3 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Admin feed result 3:', feedResultAdmin3.success);
    if (feedResultAdmin3.success && feedResultAdmin3.fish) {
      console.log('   - Experience gained:', feedResultAdmin3.experienceGained);
      console.log('   - Level:', feedResultAdmin3.fish.level);
      console.log('   - Exp:', feedResultAdmin3.fish.experience);
      console.log('   - Experience to next:', feedResultAdmin3.fish.experienceToNext);
      console.log('   - Leveled up:', feedResultAdmin3.leveledUp);
      console.log('   - Became adult:', feedResultAdmin3.becameAdult);
    } else {
      console.log('   - Error:', feedResultAdmin3.error);
    }

    // 6. Kiểm tra thông tin cá cuối cùng
    console.log('\n6. Final fish info...');
    const finalFish = await FishBreedingService.getFishById(testUserId, testFish.id);
    if (finalFish) {
      console.log('✅ Final fish info:');
      console.log('   - Name:', finalFish.name);
      console.log('   - Level:', finalFish.level);
      console.log('   - Exp:', finalFish.experience);
      console.log('   - Status:', finalFish.status);
      console.log('   - Experience to next:', finalFish.experienceToNext);
      console.log('   - Can breed:', finalFish.canBreed);
    }

    // 7. Tóm tắt kết quả
    console.log('\n📊 Summary:');
    console.log('   - Admin feed 1:', feedResultAdmin.success ? `+${feedResultAdmin.experienceGained} exp` : 'Failed');
    console.log('   - Admin feed 2:', feedResultAdmin2.success ? `+${feedResultAdmin2.experienceGained} exp` : 'Failed');
    console.log('   - Admin feed 3:', feedResultAdmin3.success ? `+${feedResultAdmin3.experienceGained} exp` : 'Failed');
    
    if (feedResultAdmin.success && feedResultAdmin2.success && feedResultAdmin3.success && 
        feedResultAdmin.experienceGained && feedResultAdmin2.experienceGained && feedResultAdmin3.experienceGained) {
      console.log('   ✅ Admin luôn được 100 exp:', 
        feedResultAdmin.experienceGained === 100 && 
        feedResultAdmin2.experienceGained === 100 && 
        feedResultAdmin3.experienceGained === 100);
      
      const totalExp = feedResultAdmin.experienceGained + feedResultAdmin2.experienceGained + feedResultAdmin3.experienceGained;
      console.log('   📈 Total exp gained:', totalExp);
      console.log('   🎯 Final level:', finalFish?.level);
    }

    console.log('\n🎉 Admin Feed 100 Exp test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFeed100Exp(); 