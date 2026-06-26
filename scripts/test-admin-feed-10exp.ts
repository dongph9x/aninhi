import prisma from '../src/utils/prisma';
import { FishBreedingService } from '../src/utils/fish-breeding';

async function testAdminFeed10Exp() {
  console.log('🧪 Testing Admin Feed 10 Exp Feature...\n');

  const testUserId = 'test_user_admin_feed';
  const testGuildId = 'test_guild_admin_feed';

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
        species: 'Admin Test Fish',
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Admin Test']),
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
    } else {
      console.log('   - Error:', feedResultAdmin.error);
    }

    // 4. Test cho cá ăn với người thường (isAdmin = false)
    console.log('\n4. Testing feed fish with normal user (isAdmin = false)...');
    const feedResultNormal = await FishBreedingService.feedFish(testUserId, testFish.id, false);
    console.log('✅ Normal feed result:', feedResultNormal.success);
    if (feedResultNormal.success && feedResultNormal.fish) {
      console.log('   - Experience gained:', feedResultNormal.experienceGained);
      console.log('   - Level:', feedResultNormal.fish.level);
      console.log('   - Exp:', feedResultNormal.fish.experience);
      console.log('   - Experience to next:', feedResultNormal.fish.experienceToNext);
      console.log('   - Leveled up:', feedResultNormal.leveledUp);
    } else {
      console.log('   - Error:', feedResultNormal.error);
    }

    // 5. Test cho cá ăn thêm với Admin để xác nhận luôn 10 exp
    console.log('\n5. Testing additional admin feed to confirm 10 exp...');
    const feedResultAdmin2 = await FishBreedingService.feedFish(testUserId, testFish.id, true);
    console.log('✅ Admin feed result 2:', feedResultAdmin2.success);
    if (feedResultAdmin2.success && feedResultAdmin2.fish) {
      console.log('   - Experience gained:', feedResultAdmin2.experienceGained);
      console.log('   - Level:', feedResultAdmin2.fish.level);
      console.log('   - Exp:', feedResultAdmin2.fish.experience);
      console.log('   - Experience to next:', feedResultAdmin2.fish.experienceToNext);
      console.log('   - Leveled up:', feedResultAdmin2.leveledUp);
    } else {
      console.log('   - Error:', feedResultAdmin2.error);
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
    console.log('   - Normal feed:', feedResultNormal.success ? `+${feedResultNormal.experienceGained} exp` : 'Failed');
    console.log('   - Admin feed 2:', feedResultAdmin2.success ? `+${feedResultAdmin2.experienceGained} exp` : 'Failed');
    
    if (feedResultAdmin.success && feedResultNormal.success && feedResultAdmin2.success && 
        feedResultAdmin.experienceGained && feedResultNormal.experienceGained && feedResultAdmin2.experienceGained) {
      console.log('   ✅ Admin luôn được 10 exp:', feedResultAdmin.experienceGained === 10 && feedResultAdmin2.experienceGained === 10);
      console.log('   ✅ Normal user random 1-5 exp:', feedResultNormal.experienceGained >= 1 && feedResultNormal.experienceGained <= 5);
    }

    console.log('\n🎉 Admin Feed 10 Exp test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminFeed10Exp(); 