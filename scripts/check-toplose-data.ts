/**
 * 🔍 Kiểm tra dữ liệu n.toplose
 * 
 * Script này kiểm tra dữ liệu thực tế trong database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTopLoseData() {
    console.log('🔍 Kiểm tra dữ liệu n.toplose\n');

    try {
        // 1. Kiểm tra tất cả bảng
        console.log('1️⃣ Kiểm tra tất cả bảng:');
        
        const gameStatsCount = await prisma.gameStats.count();
        console.log(`   📊 GameStats records: ${gameStatsCount}`);
        
        const userCount = await prisma.user.count();
        console.log(`   👥 User records: ${userCount}`);
        
        const fishCount = await prisma.fish.count();
        console.log(`   🐟 Fish records: ${fishCount}`);
        
        const breedingCount = await prisma.breedingHistory.count();
        console.log(`   🧬 BreedingHistory records: ${breedingCount}`);
        
        const battleCount = await prisma.battleHistory.count();
        console.log(`   ⚔️ BattleHistory records: ${battleCount}`);

        // 2. Kiểm tra GameStats chi tiết
        if (gameStatsCount > 0) {
            console.log('\n2️⃣ Chi tiết GameStats:');
            
            const allGameStats = await prisma.gameStats.findMany({
                include: {
                    user: true
                },
                orderBy: {
                    totalLost: 'desc'
                }
            });

            allGameStats.forEach((stat, index) => {
                console.log(`   ${index + 1}. User: ${stat.userId} (${stat.user?.username || 'Unknown'})`);
                console.log(`      🎮 Game: ${stat.gameType}`);
                console.log(`      💸 Total Lost: ${stat.totalLost.toLocaleString()}`);
                console.log(`      💰 Total Bet: ${stat.totalBet.toLocaleString()}`);
                console.log(`      📊 Games: ${stat.gamesPlayed} | Wins: ${stat.gamesWon}`);
                console.log(`      🎯 Biggest Loss: ${stat.biggestLoss.toLocaleString()}`);
                console.log('');
            });
        }

        // 3. Kiểm tra User có dữ liệu game không
        console.log('3️⃣ Kiểm tra User có dữ liệu game:');
        
        const usersWithGameData = await prisma.user.findMany({
            where: {
                gameStats: {
                    some: {}
                }
            },
            include: {
                gameStats: true
            }
        });

        console.log(`   👥 Users có game data: ${usersWithGameData.length}`);
        
        usersWithGameData.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username || user.userId}`);
            console.log(`      📊 GameStats records: ${user.gameStats.length}`);
            
            const totalLost = user.gameStats.reduce((sum, stat) => sum + Number(stat.totalLost), 0);
            console.log(`      💸 Total Lost: ${totalLost.toLocaleString()}`);
            console.log('');
        });

        // 4. Mô phỏng lệnh n.toplose
        console.log('4️⃣ Mô phỏng lệnh n.toplose:');
        
        const overallLoseLeaderboard = await prisma.gameStats.groupBy({
            by: ['userId'],
            where: {
                totalLost: { gt: 0 }
            },
            _sum: {
                totalLost: true,
                totalBet: true,
                gamesPlayed: true,
                gamesWon: true,
                biggestLoss: true
            },
            orderBy: {
                _sum: {
                    totalLost: 'desc'
                }
            },
            take: 10
        });

        console.log(`   📊 Top losers found: ${overallLoseLeaderboard.length}`);
        
        if (overallLoseLeaderboard.length > 0) {
            console.log('   🏆 Top 10 người thua lỗ:');
            
            for (let i = 0; i < overallLoseLeaderboard.length; i++) {
                const entry = overallLoseLeaderboard[i];
                const user = await prisma.user.findUnique({
                    where: {
                        userId_guildId: {
                            userId: entry.userId,
                            guildId: 'your-guild-id' // Cần guildId thực tế
                        }
                    }
                });
                
                const totalLost = entry._sum.totalLost || 0n;
                const totalBet = entry._sum.totalBet || 0n;
                const gamesPlayed = entry._sum.gamesPlayed || 0;
                const gamesWon = entry._sum.gamesWon || 0;
                const biggestLoss = entry._sum.biggestLoss || 0n;
                
                console.log(`   ${i + 1}. ${user?.username || entry.userId}`);
                console.log(`      💸 ${totalLost.toLocaleString()} AniCoin thua`);
                console.log(`      📊 ${gamesPlayed} trận | 🏆 ${gamesWon} thắng`);
                console.log(`      💰 Tổng cược: ${totalBet.toLocaleString()}`);
                console.log(`      🎯 Thua lớn nhất: ${biggestLoss.toLocaleString()}`);
                console.log('');
            }
        } else {
            console.log('   ❌ Không tìm thấy dữ liệu thua lỗ nào');
        }

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTopLoseData(); 