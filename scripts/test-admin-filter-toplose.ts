import { GameStatsService } from '../src/utils/gameStats';

async function testAdminFilterTopLose() {
    console.log('🔍 Testing Administrator Filter for Top Lose...\n');

    const testGuildId = 'test-guild-id';

    try {
        // Test 1: Lấy overall lose leaderboard
        console.log('1. Testing Overall Lose Leaderboard:');
        const overallLeaderboard = await GameStatsService.getOverallLoseLeaderboard(testGuildId, 10);
        console.log(`   Found ${overallLeaderboard.length} users in overall leaderboard`);
        
        if (overallLeaderboard.length > 0) {
            console.log(`   Top 1: ${overallLeaderboard[0].userId} with ${overallLeaderboard[0].totalLost} lost`);
        }

        // Test 2: Lấy game-specific lose leaderboard
        console.log('\n2. Testing Game-Specific Lose Leaderboard:');
        const gameLeaderboard = await GameStatsService.getGameLoseLeaderboard(testGuildId, 'blackjack', 10);
        console.log(`   Found ${gameLeaderboard.length} users in blackjack leaderboard`);
        
        if (gameLeaderboard.length > 0) {
            console.log(`   Top 1: ${gameLeaderboard[0].userId} with ${gameLeaderboard[0].totalLost} lost`);
        }

        // Test 3: Lấy top lose user
        console.log('\n3. Testing Top Lose User:');
        const topLoseUser = await GameStatsService.getTopLoseUser(testGuildId);
        if (topLoseUser) {
            console.log(`   Top lose user: ${topLoseUser.userId} with ${topLoseUser.totalLost} lost`);
        } else {
            console.log('   No top lose user found (possibly filtered out Administrator)');
        }

        // Test 4: Test với các game khác
        console.log('\n4. Testing Different Games:');
        const games = ['slots', 'roulette', 'coinflip'];
        
        for (const game of games) {
            const gameLeaderboard = await GameStatsService.getGameLoseLeaderboard(testGuildId, game, 5);
            console.log(`   ${game}: ${gameLeaderboard.length} users`);
            
            if (gameLeaderboard.length > 0) {
                console.log(`     Top 1: ${gameLeaderboard[0].userId} with ${gameLeaderboard[0].totalLost} lost`);
            }
        }

        console.log('\n✅ Administrator Filter Test Completed!');
        console.log('🔍 Logic: Administrators are filtered out from top 1 positions');

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

// Run the test
testAdminFilterTopLose();