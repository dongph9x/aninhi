/**
 * 👤 Create Real User for GIF Test
 *
 * Script này tạo user thực tế để test GIF hiển thị trong leaderboard
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRealUserForGifTest() {
    console.log('👤 Create Real User for GIF Test\n');

    try {
        const testGuildId = '1005280612845891615';
        const realUserId = '8386'; // User ID thực tế để test

        // 1. Kiểm tra xem user đã tồn tại chưa
        console.log('1️⃣ Checking if user exists...');
        let existingUser = await prisma.user.findFirst({
            where: {
                userId: realUserId,
                guildId: testGuildId
            }
        });

        if (existingUser) {
            console.log('✅ User already exists, updating battle data...');
        } else {
            console.log('➕ Creating new user...');
            existingUser = await prisma.user.create({
                data: {
                    userId: realUserId,
                    guildId: testGuildId,
                    balance: BigInt(10000),
                    fishBalance: BigInt(5000)
                }
            });
            console.log('✅ User created successfully');
        }

        // 2. Tạo battle history cho user
        console.log('\n2️⃣ Creating battle history...');
        
        // Xóa battle history cũ nếu có
        await prisma.battleHistory.deleteMany({
            where: {
                userId: realUserId,
                guildId: testGuildId
            }
        });

        // Tạo battle history mới với dữ liệu thực tế
        const battleHistory = await prisma.battleHistory.create({
            data: {
                userId: realUserId,
                guildId: testGuildId,
                fishId: 'test-fish-1',
                opponentId: 'test-fish-2',
                opponentUserId: 'opponent-user-123',
                userPower: 100,
                opponentPower: 80,
                userWon: true,
                reward: BigInt(1500),
                battleLog: JSON.stringify({ steps: ['Battle started', 'User won'] })
            }
        });

        console.log('✅ Battle history created');
        console.log(`   Battle ID: ${battleHistory.id}`);
        console.log(`   Result: ${battleHistory.userWon ? 'WIN' : 'LOSE'}`);
        console.log(`   Reward: ${battleHistory.reward}`);

        // 3. Tạo thêm một số battle để có dữ liệu phong phú
        console.log('\n3️⃣ Creating additional battles...');
        
        const additionalBattles = [
            { userWon: true, reward: BigInt(2000), userPower: 120, opponentPower: 90 },
            { userWon: false, reward: BigInt(0), userPower: 80, opponentPower: 110 },
            { userWon: true, reward: BigInt(1800), userPower: 95, opponentPower: 85 },
            { userWon: true, reward: BigInt(2200), userPower: 130, opponentPower: 100 }
        ];

        for (const battle of additionalBattles) {
            await prisma.battleHistory.create({
                data: {
                    userId: realUserId,
                    guildId: testGuildId,
                    fishId: 'test-fish-1',
                    opponentId: 'test-fish-2',
                    opponentUserId: 'opponent-user-123',
                    userPower: battle.userPower,
                    opponentPower: battle.opponentPower,
                    userWon: battle.userWon,
                    reward: battle.reward,
                    battleLog: JSON.stringify({ steps: ['Battle started', battle.userWon ? 'User won' : 'User lost'] })
                }
            });
        }

        console.log('✅ Additional battles created');

        // 4. Kiểm tra tổng kết
        console.log('\n4️⃣ Summary:');
        const totalBattles = await prisma.battleHistory.count({
            where: {
                userId: realUserId,
                guildId: testGuildId
            }
        });

        const wins = await prisma.battleHistory.count({
            where: {
                userId: realUserId,
                guildId: testGuildId,
                userWon: true
            }
        });

        const totalEarnings = await prisma.battleHistory.aggregate({
            where: {
                userId: realUserId,
                guildId: testGuildId
            },
            _sum: {
                reward: true
            }
        });

        console.log(`   Total Battles: ${totalBattles}`);
        console.log(`   Wins: ${wins}`);
        console.log(`   Losses: ${totalBattles - wins}`);
        console.log(`   Win Rate: ${Math.round((wins / totalBattles) * 100)}%`);
        console.log(`   Total Earnings: ${totalEarnings._sum.earnings?.toString() || '0'} FishCoin`);

        // 5. Test leaderboard
        console.log('\n5️⃣ Testing leaderboard...');
        const { FishBattleService } = await import('../src/utils/fish-battle');
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        
        console.log(`📊 Leaderboard has ${leaderboard.length} users`);
        
        if (leaderboard.length > 0) {
            const topUser = leaderboard[0];
            console.log(`🥇 Top 1: ${topUser.userId}`);
            console.log(`   Battles: ${topUser.totalBattles}`);
            console.log(`   Wins: ${topUser.wins}`);
            console.log(`   Earnings: ${topUser.totalEarnings}`);
            
            const hasRealBattleData = topUser.totalBattles > 0 || topUser.totalEarnings > 0;
            const isTestUser = topUser.userId.includes('test-') || topUser.userId.includes('test_') || topUser.userId.includes('real-battle-user');
            
            console.log(`   Has Real Battle Data: ${hasRealBattleData}`);
            console.log(`   Is Test User: ${isTestUser}`);
            console.log(`   Should Show GIF: ${hasRealBattleData && !isTestUser}`);
            
            if (hasRealBattleData && !isTestUser) {
                console.log('🎬 GIF should now display for this user!');
            } else {
                console.log('❌ GIF will not display (user is test user or no real data)');
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Real user created for GIF test!');
        console.log('🎯 Now test: n.fishbattle leaderboard');

    } catch (error) {
        console.error('❌ Error creating real user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createRealUserForGifTest(); 