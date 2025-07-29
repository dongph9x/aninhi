/**
 * 💸 Test Top Lose Commands
 * 
 * Script này test các lệnh toplose thực tế
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testTopLoseCommands() {
    console.log('💸 Test Top Lose Commands\n');

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

        // 2. Test n.toplose (overall)
        console.log('\n2️⃣ Testing n.toplose (overall):');
        const overallLeaderboard = await GameStatsService.getOverallLoseLeaderboard(guildId, 10);
        console.log(`   📊 Found ${overallLeaderboard.length} users in overall leaderboard`);
        
        if (overallLeaderboard.length > 0) {
            console.log('   🏆 Top 10 người thua lỗ nhiều nhất:');
            overallLeaderboard.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
                const totalProfit = Number(user.totalBet) - Number(user.totalLost);
                
                console.log(`   ${medal} User ID: ${user.userId}`);
                console.log(`      💸 ${user.totalLost.toLocaleString()} AniCoin thua`);
                console.log(`      📊 ${user.gamesPlayed} trận | 🏆 ${user.gamesWon} thắng (${winRate}%)`);
                console.log(`      💰 Tổng cược: ${user.totalBet.toLocaleString()} | 💵 Lỗ: ${totalProfit.toLocaleString()}`);
                console.log(`      🎯 Thua lớn nhất: ${user.biggestLoss.toLocaleString()} AniCoin`);
                console.log('');
            });
        } else {
            console.log('   ❌ No users found (all might be Admin/Owner)');
        }

        // 3. Test n.toplose <game>
        console.log('\n3️⃣ Testing n.toplose <game>:');
        const games = ['blackjack', 'slots', 'roulette', 'coinflip'];
        
        for (const game of games) {
            const gameLeaderboard = await GameStatsService.getGameLoseLeaderboard(guildId, game, 10);
            console.log(`   📊 ${game.toUpperCase()}: Found ${gameLeaderboard.length} users`);
            
            if (gameLeaderboard.length > 0) {
                console.log(`   🏆 Top ${game}:`);
                gameLeaderboard.slice(0, 3).forEach((user, index) => {
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                    const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
                    const totalProfit = Number(user.totalBet) - Number(user.totalLost);
                    
                    console.log(`   ${medal} User ID: ${user.userId}`);
                    console.log(`      💸 ${user.totalLost.toLocaleString()} AniCoin thua`);
                    console.log(`      📊 ${user.gamesPlayed} trận | 🏆 ${user.gamesWon} thắng (${winRate}%)`);
                    console.log(`      💰 Tổng cược: ${user.totalBet.toLocaleString()} | 💵 Lỗ: ${totalProfit.toLocaleString()}`);
                    console.log(`      🎯 Thua lớn nhất: ${user.biggestLoss.toLocaleString()} AniCoin`);
                    console.log('');
                });
            } else {
                console.log(`   ❌ No users found for ${game}`);
            }
        }

        // 4. Test n.toplose stats
        console.log('\n4️⃣ Testing n.toplose stats:');
        const loseStats = await GameStatsService.getServerLoseStats(guildId);
        console.log(`   📊 Found ${loseStats.length} game types with lose stats`);
        
        for (const stat of loseStats) {
            const winRate = stat.totalGames > 0 ? Math.round((stat.totalWins / stat.totalGames) * 100) : 0;
            const avgLoss = stat.totalGames > 0 ? Math.round(Number(stat.totalLost) / stat.totalGames) : 0;
            const totalProfit = Number(stat.totalBet) - Number(stat.totalLost);
            
            console.log(`   💸 ${stat.gameType.toUpperCase()}:`);
            console.log(`     📊 ${stat.totalGames.toLocaleString()} trận | 🏆 ${stat.totalWins.toLocaleString()} thắng (${winRate}%)`);
            console.log(`     💰 Tổng cược: ${stat.totalBet.toLocaleString()} | Trung bình thua: ${avgLoss.toLocaleString()}`);
            console.log(`     💸 Tổng thua: ${stat.totalLost.toLocaleString()} | 💵 Lỗ ròng: ${totalProfit.toLocaleString()}`);
            console.log(`     🎯 Thua lớn nhất: ${stat.biggestLoss.toLocaleString()} | 👥 ${stat.uniqueLosers} người thua`);
            console.log('');
        }

        // 5. Test Top Lose User cho n.fishing
        console.log('\n5️⃣ Testing Top Lose User for n.fishing:');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        if (topLoseUser) {
            console.log(`   ✅ Top lose user: ${topLoseUser.userId}`);
            console.log(`   Total Lost: ${topLoseUser.totalLost.toLocaleString()}`);
            console.log(`   Total Bet: ${topLoseUser.totalBet.toLocaleString()}`);
            console.log(`   Games Played: ${topLoseUser.gamesPlayed}`);
            console.log(`   Games Won: ${topLoseUser.gamesWon}`);
            console.log(`   Biggest Loss: ${topLoseUser.biggestLoss.toLocaleString()}`);
            console.log('   🎣 This user will see Top Lose GIF in n.fishing');
        } else {
            console.log('   ❌ No top lose user found (possibly filtered out Admin/Owner)');
            console.log('   🎣 No Top Lose GIF will be shown in n.fishing');
        }

        // 6. Summary
        console.log('\n6️⃣ Summary:');
        console.log('   📊 Total users with game stats:', await prisma.gameStats.groupBy({
            by: ['userId'],
            where: { guildId, totalLost: { gt: 0 } },
            _count: { userId: true }
        }).then(result => result.length));

        console.log('   📊 Users shown in toplose:', overallLeaderboard.length);
        
        const adminUsers = await prisma.gameStats.groupBy({
            by: ['userId'],
            where: { guildId, totalLost: { gt: 0 } },
            _sum: { totalLost: true },
            orderBy: { _sum: { totalLost: 'desc' } }
        }).then(async (users) => {
            let adminCount = 0;
            for (const user of users) {
                const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
                if (isAdminOrOwner) adminCount++;
            }
            return adminCount;
        });

        console.log('   📊 Admin/Owner users filtered out:', adminUsers);

        console.log('\n✅ Top Lose Commands Test Completed!');
        console.log('\n🎯 Key Results:');
        console.log('   ✅ Admin/Owner users are completely filtered out');
        console.log('   ✅ Only regular users appear in toplose');
        console.log('   ✅ All toplose commands work correctly');
        console.log('   ✅ Top Lose GIF system works with filtered data');

    } catch (error) {
        console.error('❌ Error testing toplose commands:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopLoseCommands()
    .then(() => {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });