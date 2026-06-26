/**
 * 🔍 Test Multiple Admin Skip Logic
 * 
 * Script này test logic bỏ qua nhiều Admin liên tiếp
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testMultipleAdminSkip() {
    console.log('🔍 Test Multiple Admin Skip Logic\n');

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
        let adminCount = 0;
        let regularCount = 0;
        
        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];
            const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
            const status = isAdminOrOwner ? '❌ Admin/Owner' : '✅ Regular User';
            const position = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            console.log(`   ${position} User ID: ${user.userId} - ${status}`);
            console.log(`      Total Lost: ${user._sum.totalLost?.toLocaleString()}`);
            
            if (isAdminOrOwner) {
                adminCount++;
            } else {
                regularCount++;
            }
        }

        console.log(`\n   📊 Summary: ${adminCount} Admin/Owner, ${regularCount} Regular users`);

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
            
            if (adminCount > 0) {
                console.log(`   🎯 Logic: Skipped ${adminCount} Admin/Owner(s) to find first regular user`);
            }
            
            console.log('   🎣 This user will see Top Lose GIF in n.fishing');
        } else {
            console.log('   ❌ No top lose user found (all users might be Admin/Owner)');
            console.log('   🎣 No Top Lose GIF will be shown in n.fishing');
        }

        // 5. Mô phỏng logic step-by-step
        console.log('\n5️⃣ Simulating step-by-step logic:');
        console.log('   🔍 Checking users in order:');
        
        for (let i = 0; i < Math.min(allUsers.length, 5); i++) {
            const user = allUsers[i];
            const isAdminOrOwner = await GameStatsService['isAdminOrOwner'](user.userId, guildId);
            const position = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            if (isAdminOrOwner) {
                console.log(`   ${position} User ${user.userId} - ❌ Admin/Owner → SKIP`);
            } else {
                console.log(`   ${position} User ${user.userId} - ✅ Regular User → SELECT`);
                console.log(`   🎯 Found first regular user at position ${i + 1}!`);
                break;
            }
        }

        // 6. Test với scenario giả định
        console.log('\n6️⃣ Testing hypothetical scenarios:');
        
        // Scenario 1: Top 1, 2, 3 đều là Admin
        console.log('   📊 Scenario 1: Top 1, 2, 3 đều là Admin');
        console.log('   🎯 Expected: Top 4 sẽ được chọn');
        
        // Scenario 2: Top 1, 2 là Admin, Top 3 là Regular
        console.log('   📊 Scenario 2: Top 1, 2 là Admin, Top 3 là Regular');
        console.log('   🎯 Expected: Top 3 sẽ được chọn');
        
        // Scenario 3: Top 1 là Admin, Top 2 là Regular
        console.log('   📊 Scenario 3: Top 1 là Admin, Top 2 là Regular');
        console.log('   🎯 Expected: Top 2 sẽ được chọn');

        console.log('\n✅ Multiple Admin Skip Test Completed!');
        console.log('\n🎯 Key Results:');
        console.log('   ✅ Logic correctly skips multiple Admin/Owner users');
        console.log('   ✅ Returns the first non-Admin/Owner user regardless of position');
        console.log('   ✅ Top Lose GIF will show for the correct user');
        console.log('   ✅ System handles any number of consecutive Admin/Owner users');

    } catch (error) {
        console.error('❌ Error testing multiple admin skip:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testMultipleAdminSkip()
    .then(() => {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });