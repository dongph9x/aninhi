/**
 * 🏆 Test FishBattle Leaderboard - With Real Battle Data
 *
 * Script này tạo user thực tế có dữ liệu đấu cá để test hiển thị GIF top 1
 */

import { PrismaClient } from '@prisma/client';
import { FishBattleService } from '../src/utils/fish-battle';

const prisma = new PrismaClient();

async function testFishBattleLeaderboardWithRealData() {
    console.log('🏆 Test FishBattle Leaderboard - With Real Battle Data\n');

    try {
        const testGuildId = '1005280612845891615';
        const realUserId = 'real-battle-user-123';

        // 1. Tạo user thực tế có dữ liệu đấu cá
        console.log('1️⃣ Creating real user with battle data...');
        
        // Tạo user nếu chưa có
        await prisma.user.upsert({
            where: { userId_guildId: { userId: realUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: realUserId,
                guildId: testGuildId,
                balance: 10000
            }
        });

        // Tạo dữ liệu đấu cá cho user
        await prisma.battleHistory.createMany({
            data: [
                {
                    userId: realUserId,
                    guildId: testGuildId,
                    fishId: 'test-fish-1',
                    opponentId: 'test-fish-2',
                    opponentUserId: 'opponent-user',
                    userPower: 500,
                    opponentPower: 300,
                    userWon: true,
                    reward: 1000,
                    battleLog: JSON.stringify(['User won the battle!']),
                    battledAt: new Date()
                },
                {
                    userId: realUserId,
                    guildId: testGuildId,
                    fishId: 'test-fish-3',
                    opponentId: 'test-fish-4',
                    opponentUserId: 'opponent-user-2',
                    userPower: 600,
                    opponentPower: 400,
                    userWon: true,
                    reward: 1200,
                    battleLog: JSON.stringify(['User won another battle!']),
                    battledAt: new Date()
                },
                {
                    userId: realUserId,
                    guildId: testGuildId,
                    fishId: 'test-fish-5',
                    opponentId: 'test-fish-6',
                    opponentUserId: 'opponent-user-3',
                    userPower: 400,
                    opponentPower: 500,
                    userWon: false,
                    reward: 300,
                    battleLog: JSON.stringify(['User lost this battle!']),
                    battledAt: new Date()
                }
            ]
        });

        console.log('   ✅ Created real user with 3 battles (2 wins, 1 loss)');

        // 2. Kiểm tra leaderboard
        console.log('\n2️⃣ Checking leaderboard with real data...');
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`   📊 Found ${leaderboard.length} users in leaderboard`);

        if (leaderboard.length > 0) {
            const topUser = leaderboard[0];
            console.log(`   🏆 Top user: ${topUser.userId}`);
            console.log(`   📊 Stats: ${topUser.wins}W/${topUser.totalBattles}L | ${topUser.totalEarnings} FishCoin`);
            
            if (topUser.userId === realUserId) {
                console.log('   ✅ Real user is at top 1 - GIF should display!');
            } else {
                console.log('   ⚠️  Real user is not at top 1');
            }
        }

        // 3. Mô phỏng hiển thị embed
        console.log('\n3️⃣ Simulating embed display...');
        console.log('🏆 Bảng Xếp Hạng Đấu Cá');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const user = leaderboard[i];
            const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
            
            // Kiểm tra nếu user có dữ liệu đấu cá thực tế hoặc không phải user test
            const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
            const isTestUser = user.userId.includes('test-') || user.userId.includes('test_');
            
            if (hasRealBattleData && !isTestUser) {
                if (i === 0) {
                    // Top 1: Hiển thị GIF thay vì emoji
                    console.log(`🎬 <@${user.userId}> (Top 1 - GIF Display)`);
                    console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
                    console.log(`   🎬 GIF: https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif`);
                } else {
                    // Các vị trí khác: Hiển thị emoji bình thường
                    const medal = i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                    console.log(`${medal} <@${user.userId}>`);
                    console.log(`   🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
                }
            } else {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                console.log(`${medal} Trống`);
                console.log(`   🏆 0W/0L (0%) | 🐟 0 FishCoin`);
            }
            console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Test with real battle data completed!');
        
        console.log('\n🎯 Next Steps:');
        console.log('   1. Run: n.fishbattle leaderboard');
        console.log('   2. Check if GIF appears for top 1 user');
        console.log('   3. If not, check if real user is actually at top 1');

    } catch (error) {
        console.error('❌ Error testing fishbattle leaderboard with real data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testFishBattleLeaderboardWithRealData().catch(console.error); 