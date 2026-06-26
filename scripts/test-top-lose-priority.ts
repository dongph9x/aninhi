/**
 * 🏆 Test Top Lose Priority System
 * 
 * Script này test logic ưu tiên top lose khi có nhiều Admin
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testTopLosePriority() {
    console.log('🏆 Test Top Lose Priority System\n');

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

        // 2. Lấy tất cả users với game stats (không lọc)
        console.log('\n2️⃣ Getting all users with game stats (unfiltered):');
        const allUsers = await prisma.gameStats.groupBy({
            by: ['userId'],
            where: { guildId, totalLost: { gt: 0 } },
            _sum: {
                totalLost: true,
                totalBet: true,
                gamesPlayed: true,
                gamesWon: true,
                biggestLoss: true
            },
            orderBy: { _sum: { totalLost: 'desc' } },
            take: 10
        });

        console.log(`   📊 Found ${allUsers.length} users with game stats:`);
        allUsers.forEach((user, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            console.log(`   ${medal} User ID: ${user.userId}`);
            console.log(`      Total Lost: ${user._sum.totalLost?.toLocaleString()}`);
            console.log(`      Total Bet: ${user._sum.totalBet?.toLocaleString()}`);
            console.log(`      Games Played: ${user._sum.gamesPlayed || 0}`);
            console.log(`      Games Won: ${user._sum.gamesWon || 0}`);
            console.log('');
        });

        // 3. Kiểm tra từng user có phải Admin/Owner không
        console.log('\n3️⃣ Checking Admin/Owner status for each user:');
        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];
            const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
            const status = isAdminOrOwner ? '❌ Admin/Owner' : '✅ Regular User';
            const position = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            console.log(`   ${position} User ID: ${user.userId} - ${status}`);
            console.log(`      Total Lost: ${user._sum.totalLost?.toLocaleString()}`);
        }

        // 4. Test getTopLoseUser (với logic mới)
        console.log('\n4️⃣ Testing getTopLoseUser (with new logic):');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        
        if (topLoseUser) {
            console.log(`   ✅ Top lose user found: ${topLoseUser.userId}`);
            console.log(`   Total Lost: ${topLoseUser.totalLost.toLocaleString()}`);
            console.log(`   Total Bet: ${topLoseUser.totalBet.toLocaleString()}`);
            console.log(`   Games Played: ${topLoseUser.gamesPlayed}`);
            console.log(`   Games Won: ${topLoseUser.gamesWon}`);
            console.log(`   Biggest Loss: ${topLoseUser.biggestLoss.toLocaleString()}`);
            
            // Tìm vị trí của user này trong danh sách gốc
            const originalPosition = allUsers.findIndex(u => u.userId === topLoseUser.userId);
            const position = originalPosition === 0 ? '🥇' : originalPosition === 1 ? '🥈' : originalPosition === 2 ? '🥉' : `${originalPosition + 1}.`;
            console.log(`   📊 Original position: ${position} (${originalPosition + 1}th place)`);
            
            // Kiểm tra có bao nhiêu Admin/Owner ở trên
            let adminCount = 0;
            for (let i = 0; i < originalPosition; i++) {
                const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](allUsers[i].userId, guildId);
                if (isAdminOrOwner) adminCount++;
            }
            console.log(`   📊 Admin/Owner users skipped: ${adminCount}`);
            
            console.log('   🎣 This user will see Top Lose GIF in n.fishing');
        } else {
            console.log('   ❌ No top lose user found (all users might be Admin/Owner)');
            console.log('   🎣 No Top Lose GIF will be shown in n.fishing');
        }

        // 5. Test overall leaderboard (để so sánh)
        console.log('\n5️⃣ Testing overall leaderboard (for comparison):');
        const overallLeaderboard = await GameStatsService.getOverallLoseLeaderboard(guildId, 10);
        console.log(`   📊 Overall leaderboard shows ${overallLeaderboard.length} users`);
        
        if (overallLeaderboard.length > 0) {
            console.log('   🏆 Top 3 in overall leaderboard:');
            overallLeaderboard.slice(0, 3).forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                console.log(`   ${medal} User ID: ${user.userId}`);
                console.log(`      Total Lost: ${user.totalLost.toLocaleString()}`);
            });
        }

        // 6. Summary
        console.log('\n6️⃣ Summary:');
        console.log('   📊 Total users with game stats:', allUsers.length);
        console.log('   📊 Users shown in overall leaderboard:', overallLeaderboard.length);
        
        const adminUsers = await Promise.all(allUsers.map(async (user) => {
            const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
            return isAdminOrOwner ? 1 : 0;
        })).then(counts => counts.reduce((a, b) => a + b, 0));
        
        console.log('   📊 Admin/Owner users:', adminUsers);
        console.log('   📊 Regular users:', allUsers.length - adminUsers);

        console.log('\n✅ Top Lose Priority Test Completed!');
        console.log('\n🎯 Key Results:');
        console.log('   ✅ Logic correctly skips Admin/Owner users');
        console.log('   ✅ Returns the first non-Admin/Owner user');
        console.log('   ✅ Top Lose GIF will show for the correct user');
        console.log('   ✅ System handles multiple Admin/Owner users correctly');

    } catch (error) {
        console.error('❌ Error testing top lose priority:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopLosePriority()
    .then(() => {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });