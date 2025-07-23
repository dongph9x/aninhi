import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

async function debugDailyBattleIssue() {
  console.log('🔍 Debugging Daily Battle Limit Issue...\n');

  // Thay đổi userId và guildId này thành của bạn
  const userId = 'YOUR_USER_ID_HERE'; // Thay bằng User ID của bạn
  const guildId = 'YOUR_GUILD_ID_HERE'; // Thay bằng Guild ID của bạn

  try {
    // 1. Kiểm tra thông tin user
    console.log('1️⃣ Checking user information...');
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });

    if (!user) {
      console.log('❌ User not found! Please check your userId and guildId.');
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
    console.log('\n2️⃣ Checking admin status...');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
    console.log(`   Is Admin: ${isAdmin}`);

    if (isAdmin) {
      console.log('⚠️  You are an admin! Admins are not limited by daily battle count.');
      console.log('   This is why your daily battle limit always shows 20/20.');
      console.log('   Admins can battle unlimited times per day.');
      return;
    }

    // 3. Kiểm tra daily battle limit
    console.log('\n3️⃣ Checking daily battle limit...');
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

    if (isNewDay) {
      console.log('ℹ️  It\'s a new day, so daily battle count should be reset to 0.');
    }

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

    // 7. Kiểm tra lịch sử đấu cá
    console.log('\n7️⃣ Checking battle history...');
    const battleHistory = await prisma.battleHistory.findMany({
      where: { userId, guildId },
      orderBy: { battledAt: 'desc' },
      take: 5
    });

    console.log(`   Total battles in history: ${battleHistory.length}`);
    if (battleHistory.length > 0) {
      console.log('   Recent battles:');
      battleHistory.forEach((battle, index) => {
        console.log(`     ${index + 1}. ${battle.battledAt.toLocaleString()} - ${battle.userWon ? 'Won' : 'Lost'}`);
      });
    }

    // 8. Tóm tắt vấn đề
    console.log('\n📋 Summary:');
    if (isAdmin) {
      console.log('   ✅ You are an admin - no daily battle limit applies');
      console.log('   ℹ️  This is expected behavior for admin users');
    } else if (user.dailyBattleCount === 0) {
      console.log('   ✅ Daily battle count is 0 - you haven\'t battled today');
      console.log('   ℹ️  This is normal for a new day or if you haven\'t battled');
    } else {
      console.log(`   ⚠️  Daily battle count is ${user.dailyBattleCount} - should be decreasing`);
      console.log('   🔍 Check if battles are actually completing successfully');
    }

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
console.log('3. Run this script to debug the daily battle limit issue');
console.log('');

debugDailyBattleIssue(); 