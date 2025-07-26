/**
 * 🔍 Kiểm tra database backup
 * 
 * Script này kiểm tra dữ liệu trong file backup database
 */

import { PrismaClient } from '@prisma/client';

async function checkBackupDatabase() {
    console.log('🔍 Kiểm tra database backup\n');

    // Tạo Prisma client với database backup
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'file:./data/database.db.backup-1752740134521'
            }
        }
    });

    try {
        // 1. Kiểm tra tất cả bảng trong backup
        console.log('1️⃣ Kiểm tra tất cả bảng trong backup:');
        
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

        // 2. Kiểm tra GameStats chi tiết trong backup
        if (gameStatsCount > 0) {
            console.log('\n2️⃣ Chi tiết GameStats trong backup:');
            
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

        // 3. Mô phỏng lệnh n.toplose từ backup
        console.log('3️⃣ Mô phỏng lệnh n.toplose từ backup:');
        
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
            console.log('   🏆 Top 10 người thua lỗ từ backup:');
            
            for (let i = 0; i < overallLoseLeaderboard.length; i++) {
                const entry = overallLoseLeaderboard[i];
                const user = await prisma.user.findFirst({
                    where: {
                        userId: entry.userId
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
            console.log('   ❌ Không tìm thấy dữ liệu thua lỗ nào trong backup');
        }

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra backup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBackupDatabase(); 