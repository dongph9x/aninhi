/**
 * 🐛 Debug FishBattle Leaderboard GIF Display
 *
 * Script này debug chi tiết logic hiển thị GIF cho top 1
 */

import { FishBattleService } from '../src/utils/fish-battle';

async function debugFishBattleLeaderboardGif() {
    console.log('🐛 Debug FishBattle Leaderboard GIF Display\n');

    try {
        const testGuildId = '1005280612845891615';

        // Lấy leaderboard
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`📊 Found ${leaderboard.length} users in leaderboard`);

        // Debug từng user
        console.log('\n🔍 Debugging each user:');
        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const user = leaderboard[i];
            console.log(`\n--- User ${i + 1} ---`);
            console.log(`User ID: ${user.userId}`);
            console.log(`Total Battles: ${user.totalBattles}`);
            console.log(`Wins: ${user.wins}`);
            console.log(`Total Earnings: ${user.totalEarnings}`);
            
            // Kiểm tra logic
            const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
            const isTestUser = user.userId.includes('test-') || user.userId.includes('test_');
            
            console.log(`Has Real Battle Data: ${hasRealBattleData}`);
            console.log(`Is Test User: ${isTestUser}`);
            console.log(`Should Display: ${hasRealBattleData && !isTestUser}`);
            console.log(`Is Top 1: ${i === 0}`);
            console.log(`Should Show GIF: ${i === 0 && hasRealBattleData && !isTestUser}`);
            
            if (i === 0 && hasRealBattleData && !isTestUser) {
                console.log('🎬 GIF should be displayed for this user!');
                console.log('🎬 GIF URL: https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif');
            }
        }

        // Kiểm tra logic hiển thị
        console.log('\n🎯 Display Logic Check:');
        if (leaderboard.length > 0) {
            const topUser = leaderboard[0];
            const hasRealBattleData = topUser.totalBattles > 0 || topUser.totalEarnings > 0;
            const isTestUser = topUser.userId.includes('test-') || topUser.userId.includes('test_');
            
            console.log(`Top user: ${topUser.userId}`);
            console.log(`Has battle data: ${hasRealBattleData}`);
            console.log(`Is test user: ${isTestUser}`);
            console.log(`Will show GIF: ${hasRealBattleData && !isTestUser}`);
            
            if (hasRealBattleData && !isTestUser) {
                console.log('✅ GIF should be displayed!');
            } else {
                console.log('❌ GIF will NOT be displayed');
                if (!hasRealBattleData) {
                    console.log('   Reason: No real battle data');
                }
                if (isTestUser) {
                    console.log('   Reason: Is test user');
                }
            }
        }

        console.log('\n📋 Test Commands:');
        console.log('   n.fishbattle leaderboard');
        console.log('   n.fishbattle ui (then click Leaderboard)');

    } catch (error) {
        console.error('❌ Error debugging fishbattle leaderboard GIF:', error);
        throw error;
    }
}

// Chạy debug
debugFishBattleLeaderboardGif().catch(console.error); 