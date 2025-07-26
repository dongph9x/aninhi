/**
 * 🏆 Test FishBattle Leaderboard - Hidden Test Users
 *
 * Script này test logic ẩn user test và chỉ hiển thị user thực tế có dữ liệu đấu cá
 */

import { FishBattleService } from '../src/utils/fish-battle';

async function testFishBattleLeaderboardHiddenTestUsers() {
    console.log('🏆 Test FishBattle Leaderboard - Hidden Test Users\n');

    try {
        const testGuildId = '1005280612845891615';

        // Lấy leaderboard thực tế
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`📊 Found ${leaderboard.length} users in guild`);

        // Mô phỏng cách hiển thị embed với logic mới
        console.log('\n🏆 Bảng Xếp Hạng Đấu Cá (Ẩn Test Users)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Luôn hiển thị top 10, kể cả khi không có dữ liệu đấu cá
        for (let i = 0; i < 10; i++) {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            if (i < leaderboard.length) {
                const user = leaderboard[i];
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                
                // Kiểm tra nếu user có dữ liệu đấu cá thực tế hoặc không phải user test
                const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
                const isTestUser = user.userId.includes('test-') || user.userId.includes('test_');
                
                console.log(`\n🔍 Analyzing user ${i + 1}:`);
                console.log(`   User ID: ${user.userId}`);
                console.log(`   Is Test User: ${isTestUser ? '✅ Yes' : '❌ No'}`);
                console.log(`   Has Real Battle Data: ${hasRealBattleData ? '✅ Yes' : '❌ No'}`);
                console.log(`   Total Battles: ${user.totalBattles}`);
                console.log(`   Total Earnings: ${user.totalEarnings}`);
                
                if (hasRealBattleData && !isTestUser) {
                    // Hiển thị user thực tế có dữ liệu đấu cá
                    console.log(`${medal} <@${user.userId}>`);
                    console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
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
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Leaderboard hidden test users test completed!');
        
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Always shows 10 positions');
        console.log('   ✅ Hides test users (contains "test-" or "test_")');
        console.log('   ✅ Hides users with no real battle data');
        console.log('   ✅ Shows "Trống" for hidden/empty positions');
        console.log('   ✅ Only shows real users with actual battle data');

        console.log('\n📋 Test Commands:');
        console.log('   n.fishbattle leaderboard');
        console.log('   n.fishbattle ui (then click Leaderboard button)');

    } catch (error) {
        console.error('❌ Error testing fishbattle leaderboard hidden test users:', error);
        throw error;
    }
}

// Chạy test
testFishBattleLeaderboardHiddenTestUsers().catch(console.error); 