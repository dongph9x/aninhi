import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function debugYourDailyFeed() {
  console.log('🔍 Debugging Your Daily Feed Limit...\n');

  // Thay đổi userId và guildId này thành của bạn
  const userId = 'YOUR_USER_ID_HERE'; // Thay bằng User ID của bạn
  const guildId = 'YOUR_GUILD_ID_HERE'; // Thay bằng Guild ID của bạn

  try {
    // 1. Kiểm tra thông tin user
    console.log('1️⃣ Checking your user information...');
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });

    if (!user) {
      console.log('❌ User not found! Please check your userId and guildId.');
      console.log('💡 Make sure you have used the bot at least once in this server.');
      return;
    }

    console.log('✅ User found:');
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Guild ID: ${user.guildId}`);
    console.log(`   Daily Feed Count: ${user.dailyFeedCount}`);
    console.log(`   Last Feed Reset: ${user.lastFeedReset}`);
    console.log(`   Created At: ${user.createdAt}`);
    console.log(`   Updated At: ${user.updatedAt}`);

    // 2. Kiểm tra quyền admin
    console.log('\n2️⃣ Checking your admin status...');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
    console.log(`   Is Admin: ${isAdmin}`);

    if (isAdmin) {
      console.log('👑 You are an admin!');
      console.log('   - Admins can feed fish unlimited times per day');
      console.log('   - Daily feed count still increases for display purposes');
      console.log('   - This is why you might always see 20/20 initially');
    }

    // 3. Kiểm tra daily feed limit
    console.log('\n3️⃣ Checking your daily feed limit...');
    const dailyFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    console.log('Daily feed check result:');
    console.log(`   Can Feed: ${dailyFeedCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${dailyFeedCheck.remainingFeeds}/20`);
    console.log(`   Error: ${dailyFeedCheck.error || 'None'}`);

    // 4. Kiểm tra xem có phải ngày mới không
    console.log('\n4️⃣ Checking if it\'s a new day...');
    const now = new Date();
    const lastReset = new Date(user.lastFeedReset);
    
    const isNewDay = now.getDate() !== lastReset.getDate() || 
                    now.getMonth() !== lastReset.getMonth() || 
                    now.getFullYear() !== lastReset.getFullYear();
    
    console.log(`   Current Date: ${now.toDateString()}`);
    console.log(`   Last Reset Date: ${lastReset.toDateString()}`);
    console.log(`   Is New Day: ${isNewDay}`);

    if (isNewDay) {
      console.log('ℹ️  It\'s a new day, so daily feed count should be reset to 0.');
    }

    // 5. Thử tăng daily feed count
    console.log('\n5️⃣ Testing increment daily feed count...');
    console.log(`   Before increment: ${user.dailyFeedCount}`);
    
    await FishFeedService.incrementDailyFeedCount(userId, guildId);
    
    const updatedUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });
    
    console.log(`   After increment: ${updatedUser?.dailyFeedCount}`);

    // 6. Kiểm tra lại daily feed limit
    console.log('\n6️⃣ Checking daily feed limit after increment...');
    const newDailyFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    console.log('New daily feed check result:');
    console.log(`   Can Feed: ${newDailyFeedCheck.canFeed}`);
    console.log(`   Remaining Feeds: ${newDailyFeedCheck.remainingFeeds}/20`);
    console.log(`   Error: ${newDailyFeedCheck.error || 'None'}`);

    // 7. Tóm tắt vấn đề
    console.log('\n📋 Summary:');
    if (isAdmin) {
      console.log('   👑 You are an admin:');
      console.log('      - Daily feed count increases normally');
      console.log('      - You can feed fish unlimited times');
      console.log('      - The display should show decreasing numbers');
      console.log('      - If you still see 20/20, try feeding once more');
    } else {
      console.log('   👤 You are a regular user:');
      console.log('      - Daily feed count should decrease after each feed');
      console.log('      - You are limited to 20 feeds per day');
      console.log('      - If you see 20/20 after feeding, there might be an issue');
    }

    console.log(`   📊 Your current daily feed count: ${updatedUser?.dailyFeedCount}`);
    console.log(`   📊 Remaining feeds: ${newDailyFeedCheck.remainingFeeds}/20`);

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Hướng dẫn sử dụng
console.log('📝 Instructions:');
console.log('1. Replace YOUR_USER_ID_HERE with your actual Discord User ID');
console.log('2. Replace YOUR_GUILD_ID_HERE with your Discord Server ID');
console.log('3. Run this script to debug your daily feed limit issue');
console.log('');

debugYourDailyFeed(); 