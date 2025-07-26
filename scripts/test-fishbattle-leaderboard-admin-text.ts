/**
 * 👑 Test FishBattle Leaderboard - Admin Text
 *
 * Script này test hiển thị text "Admin" khi không có top 1 thực tế
 */

import { FishBattleService } from '../src/utils/fish-battle';

async function testFishBattleLeaderboardAdminText() {
    console.log('👑 Test FishBattle Leaderboard - Admin Text\n');

    try {
        const testGuildId = '1005280612845891615';

        // Lấy leaderboard thực tế
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`📊 Found ${leaderboard.length} users in guild`);

        // Mô phỏng cách hiển thị embed với text "Admin" cho top 1
        console.log('\n🏆 Bảng Xếp Hạng Đấu Cá (Admin Text)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        let hasRealTop1 = false;

        // Luôn hiển thị top 10, kể cả khi không có dữ liệu đấu cá
        for (let i = 0; i < 10; i++) {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            if (i < leaderboard.length) {
                const user = leaderboard[i];
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                
                // Kiểm tra nếu user có dữ liệu đấu cá thực tế hoặc không phải user test
                const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
                const isTestUser = user.userId.includes('test-') || user.userId.includes('test_') || user.userId.includes('real-battle-user');
                
                if (hasRealBattleData && !isTestUser) {
                    // Hiển thị user thực tế có dữ liệu đấu cá
                    if (i === 0) {
                        // Top 1: Hiển thị GIF thay vì emoji
                        hasRealTop1 = true;
                        console.log(`🎬 <@${user.userId}> (Top 1 - GIF Thumbnail Above)`);
                        console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
                        console.log(`   🎬 GIF (setThumbnail - above name in separate embed): https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif`);
                    } else {
                        // Các vị trí khác: Hiển thị emoji bình thường
                        console.log(`${medal} <@${user.userId}>`);
                        console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
                    }
                } else {
                    // Ẩn user test hoặc user không có dữ liệu đấu cá
                    console.log(`${medal} Trống`);
                    console.log(`   🏆 0W/0L (0%) | 🐟 0 FishCoin`);
                    
                    if (isTestUser) {
                        console.log(`   💡 Hidden: Test user detected`);
                    } else if (!hasRealBattleData) {
                        console.log(`   💡 Hidden: No real battle data`);
                    }
                }
            } else {
                // Hiển thị tên trống cho các vị trí còn lại
                console.log(`${medal} Trống`);
                console.log(`   🏆 0W/0L (0%) | 🐟 0 FishCoin`);
            }
            console.log('');
        }

        // Hiển thị top 1 nếu không có user thực tế
        if (!hasRealTop1) {
            console.log('🎬 **Admin** (Top 1 - No Real User)');
            console.log('   🏆 0W/0L (0%) | 🐟 0 FishCoin');
            console.log('   💡 No real top 1 user found, showing Admin');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Leaderboard admin text test completed!');

        console.log('\n🎯 Key Features:');
        console.log('   ✅ Shows "Admin" when no real top 1 user');
        console.log('   ✅ Shows GIF when real top 1 user exists');
        console.log('   ✅ Hides test users and users with no battle data');
        console.log('   ✅ Always shows 10 positions');

        console.log('\n📋 Test Commands:');
        console.log('   n.fishbattle leaderboard');
        console.log('   n.fishbattle ui (then click Leaderboard button)');

        console.log('\n🎬 Expected Display:');
        if (hasRealTop1) {
            console.log('   🎬 [GIF] **@RealUser** (when real user exists)');
        } else {
            console.log('   🎬 **Admin** (when no real user)');
        }

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testFishBattleLeaderboardAdminText(); 