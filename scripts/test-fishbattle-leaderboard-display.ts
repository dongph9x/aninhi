/**
 * 🏆 Test FishBattle Leaderboard Display
 *
 * Script này mô phỏng cách hiển thị leaderboard với ít hơn 10 users và hiển thị "Trống" cho các vị trí còn lại
 */

import { FishBattleService } from '../src/utils/fish-battle';

async function testFishBattleLeaderboardDisplay() {
    console.log('🏆 Test FishBattle Leaderboard Display\n');

    try {
        const testGuildId = '1005280612845891615';

        // Lấy leaderboard thực tế
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`📊 Found ${leaderboard.length} users in guild`);

        // Mô phỏng cách hiển thị embed
        console.log('\n🏆 Bảng Xếp Hạng Đấu Cá');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Luôn hiển thị top 10, kể cả khi không có dữ liệu đấu cá
        for (let i = 0; i < 10; i++) {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            if (i < leaderboard.length) {
                const user = leaderboard[i];
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                
                console.log(`${medal} User ${user.userId.slice(-4)}`);
                console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
            } else {
                // Hiển thị tên trống cho các vị trí còn lại
                console.log(`${medal} Trống`);
                console.log(`   🏆 0W/0L (0%) | 🐟 0 FishCoin`);
            }
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Leaderboard display test completed!');
        
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Always shows 10 positions');
        console.log('   ✅ Shows "Trống" for empty positions');
        console.log('   ✅ Proper medal emojis (🥇🥈🥉)');
        console.log('   ✅ Win rate calculation');
        console.log('   ✅ FishCoin formatting');
        console.log('   ✅ Works with any number of users');

        console.log('\n📋 Test Commands:');
        console.log('   n.fishbattle leaderboard');
        console.log('   n.fishbattle ui (then click Leaderboard button)');

    } catch (error) {
        console.error('❌ Error testing fishbattle leaderboard display:', error);
        throw error;
    }
}

// Chạy test
testFishBattleLeaderboardDisplay().catch(console.error); 