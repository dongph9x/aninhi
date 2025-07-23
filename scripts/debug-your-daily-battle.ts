import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function debugYourDailyBattle() {
  console.log('🔍 Debugging Your Daily Battle Limit...\n');

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
    console.log(`   Daily Battle Count: ${user.dailyBattleCount}`);
    console.log(`   Last Battle Reset: ${user.lastBattleReset}`);
    console.log(`   Created At: ${user.createdAt}`);
    console.log(`   Updated At: ${user.updatedAt}`);

    // 2. Kiểm tra quyền admin
    console.log('\n2️⃣ Checking your admin status...');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
    console.log(`   Is Admin: ${isAdmin}`);

    if (isAdmin) {
      console.log('👑 You are an admin!');
      console.log('   - Admins can battle unlimited times per day');
      console.log('   - Daily battle count still increases for display purposes');
      console.log('   - This is why you might always see 20/20 initially');
    }

    // 3. Kiểm tra daily battle limit
    console.log('\n3️⃣ Checking your daily battle limit...');
    const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
    console.log('Daily limit check result:');
    console.log(`   Can Battle: ${dailyLimitCheck.canBattle}`);
    console.log(`   Remaining Battles: ${dailyLimitCheck.remainingBattles}/20`);
    console.log(`   Error: ${dailyLimitCheck.error || 'None'}`);

    // 4. Kiểm tra xem có phải ngày mới không
    console.log('\n4️⃣ Checking if it\'s a new day...');
    const now = new Date();
    const lastReset = new Date(user.lastBattleReset);
    
    const isNewDay = now.getDate() !== lastReset.getDate() || 
                    now.getMonth() !== lastReset.getMonth() || 
                    now.getFullYear() !== lastReset.getFullYear();
    
    console.log(`   Current Date: ${now.toDateString()}`);
    console.log(`   Last Reset Date: ${lastReset.toDateString()}`);
    console.log(`   Is New Day: ${isNewDay}`);

    // 5. Thử tăng daily battle count
    console.log('\n5️⃣ Testing increment daily battle count...');
    console.log(`   Before increment: ${user.dailyBattleCount}`);
    
    await FishBattleService.incrementDailyBattleCount(userId, guildId);
    
    const updatedUser = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });
    
    console.log(`   After increment: ${updatedUser?.dailyBattleCount}`);

    // 6. Kiểm tra lại daily battle limit
    console.log('\n6️⃣ Checking daily battle limit after increment...');
    const newDailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
    console.log('New daily limit check result:');
    console.log(`   Can Battle: ${newDailyLimitCheck.canBattle}`);
    console.log(`   Remaining Battles: ${newDailyLimitCheck.remainingBattles}/20`);
    console.log(`   Error: ${newDailyLimitCheck.error || 'None'}`);

    // 7. Tóm tắt vấn đề
    console.log('\n📋 Summary:');
    if (isAdmin) {
      console.log('   👑 You are an admin:');
      console.log('      - Daily battle count increases normally');
      console.log('      - You can battle unlimited times');
      console.log('      - The display should show decreasing numbers');
      console.log('      - If you still see 20/20, try battling once more');
    } else {
      console.log('   👤 You are a regular user:');
      console.log('      - Daily battle count should decrease after each battle');
      console.log('      - You are limited to 20 battles per day');
      console.log('      - If you see 20/20 after battling, there might be an issue');
    }

    console.log(`   📊 Your current daily battle count: ${updatedUser?.dailyBattleCount}`);
    console.log(`   📊 Remaining battles: ${newDailyLimitCheck.remainingBattles}/20`);

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
console.log('3. Run this script to debug your daily battle limit issue');
console.log('');

debugYourDailyBattle(); 