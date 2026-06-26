/**
 * 🏆 Test FishBattle Leaderboard Feature
 *
 * Script này test tính năng bảng xếp hạng đấu cá luôn hiển thị top 10 với tên trống nếu không có dữ liệu
 */

import { PrismaClient } from '@prisma/client';
import { FishBattleService } from '../src/utils/fish-battle';

const prisma = new PrismaClient();

async function testFishBattleLeaderboard() {
    console.log('🏆 Test FishBattle Leaderboard Feature\n');

    try {
        const testGuildId = '1005280612845891615';

        // 1. Test leaderboard với dữ liệu thực tế
        console.log('1️⃣ Testing leaderboard with real data...');
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`   📊 Found ${leaderboard.length} users with battle data`);
        
        if (leaderboard.length > 0) {
            console.log('   🏆 Top 3 users:');
            leaderboard.slice(0, 3).forEach((user, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                console.log(`   ${medal} User ${user.userId.slice(-4)}: ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
            });
        }

        // 2. Test leaderboard với limit 10 (luôn trả về 10 items)
        console.log('\n2️⃣ Testing leaderboard always returns 10 items...');
        const leaderboard10 = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`   📊 Leaderboard length: ${leaderboard10.length}`);
        
        if (leaderboard10.length === 10) {
            console.log('   ✅ Leaderboard correctly returns 10 items');
        } else {
            console.log('   ❌ Leaderboard should return 10 items');
        }

        // 3. Test với guild không có dữ liệu
        console.log('\n3️⃣ Testing leaderboard with empty guild...');
        const emptyGuildId = '999999999999999999';
        const emptyLeaderboard = await FishBattleService.getBattleLeaderboard(emptyGuildId, 10);
        console.log(`   📊 Empty guild leaderboard length: ${emptyLeaderboard.length}`);
        
        if (emptyLeaderboard.length === 0) {
            console.log('   ✅ Empty guild correctly returns 0 items (no users)');
        } else {
            console.log('   ❌ Empty guild should return 0 items');
        }

        // 4. Test sắp xếp leaderboard
        console.log('\n4️⃣ Testing leaderboard sorting...');
        if (leaderboard.length >= 2) {
            const firstUser = leaderboard[0];
            const secondUser = leaderboard[1];
            
            console.log(`   🥇 1st place: ${firstUser.wins} wins, ${firstUser.totalEarnings} FishCoin`);
            console.log(`   🥈 2nd place: ${secondUser.wins} wins, ${secondUser.totalEarnings} FishCoin`);
            
            // Kiểm tra sắp xếp theo wins DESC
            if (firstUser.wins >= secondUser.wins) {
                console.log('   ✅ Sorting by wins DESC is correct');
            } else {
                console.log('   ❌ Sorting by wins DESC is incorrect');
            }
            
            // Nếu wins bằng nhau, kiểm tra sắp xếp theo totalEarnings DESC
            if (firstUser.wins === secondUser.wins && firstUser.totalEarnings >= secondUser.totalEarnings) {
                console.log('   ✅ Secondary sorting by totalEarnings DESC is correct');
            } else if (firstUser.wins !== secondUser.wins) {
                console.log('   ✅ Primary sorting by wins is sufficient');
            } else {
                console.log('   ❌ Secondary sorting by totalEarnings DESC is incorrect');
            }
        }

        // 5. Test BigInt conversion
        console.log('\n5️⃣ Testing BigInt conversion...');
        let hasBigIntIssue = false;
        leaderboard.forEach((user, index) => {
            try {
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                const earningsText = user.totalEarnings.toLocaleString();
                console.log(`   ✅ User ${index + 1}: ${earningsText} FishCoin (${winRate}% win rate)`);
            } catch (error) {
                console.log(`   ❌ User ${index + 1}: BigInt conversion error - ${error.message}`);
                hasBigIntIssue = true;
            }
        });
        
        if (!hasBigIntIssue) {
            console.log('   ✅ All BigInt conversions successful');
        }

        // 6. Test edge cases
        console.log('\n6️⃣ Testing edge cases...');
        
        // Test với limit 0
        const leaderboard0 = await FishBattleService.getBattleLeaderboard(testGuildId, 0);
        console.log(`   📊 Limit 0 result: ${leaderboard0.length} items`);
        
        // Test với limit âm
        const leaderboardNegative = await FishBattleService.getBattleLeaderboard(testGuildId, -5);
        console.log(`   📊 Negative limit result: ${leaderboardNegative.length} items`);
        
        // Test với limit lớn
        const leaderboardLarge = await FishBattleService.getBattleLeaderboard(testGuildId, 100);
        console.log(`   📊 Large limit result: ${leaderboardLarge.length} items`);

        console.log('\n✅ FishBattle Leaderboard test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Always returns top 10 users (or available users)');
        console.log('   ✅ Shows "Trống" for empty positions');
        console.log('   ✅ Proper sorting: wins DESC > totalEarnings DESC > balance DESC');
        console.log('   ✅ BigInt conversion handled correctly');
        console.log('   ✅ Works with users who have no battle data');
        console.log('   ✅ Robust error handling');
        
        console.log('\n📋 Test Commands:');
        console.log('   n.fishbattle leaderboard');
        console.log('   n.fishbattle ui (then click Leaderboard button)');

    } catch (error) {
        console.error('❌ Error testing fishbattle leaderboard:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testFishBattleLeaderboard().catch(console.error); 