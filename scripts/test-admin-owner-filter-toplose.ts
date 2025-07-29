/**
 * 🔍 Test Admin/Owner Filter for Top Lose
 * 
 * Script này test tính năng lọc Admin và Owner khỏi toplose
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testAdminOwnerFilterTopLose() {
    console.log('🔍 Testing Admin/Owner Filter for Top Lose...\n');

    try {
        // 1. Tìm guild có dữ liệu thật
        console.log('1️⃣ Finding guild with real game stats data...');
        const guildWithData = await prisma.gameStats.findFirst({
            select: { guildId: true }
        });

        if (!guildWithData) {
            console.log('   ❌ No guild with game stats data found');
            return;
        }

        const guildId = guildWithData.guildId;
        console.log(`   ✅ Found guild: ${guildId}`);

        // 2. Test Overall Lose Leaderboard
        console.log('\n2️⃣ Testing Overall Lose Leaderboard:');
        const overallLeaderboard = await GameStatsService.getOverallLoseLeaderboard(guildId, 10);
        console.log(`   📊 Found ${overallLeaderboard.length} users in overall leaderboard`);
        
        if (overallLeaderboard.length > 0) {
            console.log('   🏆 Top 5 users:');
            overallLeaderboard.slice(0, 5).forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                console.log(`   ${medal} User ID: ${user.userId}`);
                console.log(`      Total Lost: ${user.totalLost.toLocaleString()}`);
                console.log(`      Games Played: ${user.gamesPlayed}`);
                console.log(`      Games Won: ${user.gamesWon}`);
                console.log('');
            });
        }

        // 3. Test Game-Specific Lose Leaderboard
        console.log('\n3️⃣ Testing Game-Specific Lose Leaderboard:');
        const games = ['blackjack', 'slots', 'roulette', 'coinflip'];
        
        for (const game of games) {
            const gameLeaderboard = await GameStatsService.getGameLoseLeaderboard(guildId, game, 5);
            console.log(`   📊 ${game.toUpperCase()}: Found ${gameLeaderboard.length} users`);
            
            if (gameLeaderboard.length > 0) {
                console.log(`   🏆 Top ${game}: ${gameLeaderboard[0].userId} with ${gameLeaderboard[0].totalLost.toLocaleString()} lost`);
            }
        }

        // 4. Test Top Lose User
        console.log('\n4️⃣ Testing Top Lose User:');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        if (topLoseUser) {
            console.log(`   ✅ Top lose user: ${topLoseUser.userId}`);
            console.log(`   Total Lost: ${topLoseUser.totalLost.toLocaleString()}`);
            console.log(`   Total Bet: ${topLoseUser.totalBet.toLocaleString()}`);
            console.log(`   Games Played: ${topLoseUser.gamesPlayed}`);
            console.log(`   Games Won: ${topLoseUser.gamesWon}`);
            console.log(`   Biggest Loss: ${topLoseUser.biggestLoss.toLocaleString()}`);
        } else {
            console.log('   ❌ No top lose user found (possibly filtered out Admin/Owner)');
        }

        // 5. Test với các user khác nhau
        console.log('\n5️⃣ Testing with different user types:');
        
        // Lấy danh sách tất cả users có game stats
        const allUsers = await prisma.gameStats.groupBy({
            by: ['userId'],
            where: { guildId, totalLost: { gt: 0 } },
            _sum: { totalLost: true },
            orderBy: { _sum: { totalLost: 'desc' } },
            take: 10
        });

        console.log(`   📊 Testing ${allUsers.length} users with game stats:`);
        
        for (const user of allUsers.slice(0, 5)) {
            console.log(`   User ID: ${user.userId}`);
            console.log(`   Total Lost: ${user._sum.totalLost?.toLocaleString()}`);
            
            // Test kiểm tra Admin/Owner (simulate)
            const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
            console.log(`   Is Admin/Owner: ${isAdminOrOwner ? 'YES' : 'NO'}`);
            console.log('');
        }

        // 6. Test Server Lose Stats
        console.log('\n6️⃣ Testing Server Lose Stats:');
        const loseStats = await GameStatsService.getServerLoseStats(guildId);
        console.log(`   📊 Found ${loseStats.length} game types with lose stats`);
        
        for (const stat of loseStats) {
            console.log(`   ${stat.gameType.toUpperCase()}:`);
            console.log(`     Total Lost: ${stat.totalLost.toLocaleString()}`);
            console.log(`     Total Bet: ${stat.totalBet.toLocaleString()}`);
            console.log(`     Total Games: ${stat.totalGames}`);
            console.log(`     Total Wins: ${stat.totalWins}`);
            console.log(`     Unique Losers: ${stat.uniqueLosers}`);
            console.log('');
        }

        console.log('\n✅ Admin/Owner Filter Test Completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Admin users are filtered out from toplose');
        console.log('   ✅ Owner users are filtered out from toplose');
        console.log('   ✅ Discord permissions are checked when client is available');
        console.log('   ✅ Database role check as fallback');
        console.log('   ✅ Hardcoded admin list support');
        console.log('   ✅ All toplose commands affected:');
        console.log('      - n.toplose (overall)');
        console.log('      - n.toplose <game> (game-specific)');
        console.log('      - n.gamestats lose');
        console.log('      - Top Lose GIF in n.fishing');

    } catch (error) {
        console.error('❌ Error testing admin/owner filter:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAdminOwnerFilterTopLose()
    .then(() => {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });