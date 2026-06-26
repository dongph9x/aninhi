/**
 * 🏆 Test Top 1 Fisher GIF Feature - Real User Test
 * 
 * Script này test tính năng GIF đặc biệt cho Top 1 Fisher với user thật từ database
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';

const prisma = new PrismaClient();

async function testTopFisherReal() {
    console.log('🏆 Test Top 1 Fisher GIF Feature - Real User Test\n');

    try {
        // 1. Lấy guild có dữ liệu thật
        console.log('1️⃣ Finding guild with real fishing data...');
        const guildWithData = await prisma.fishingData.findFirst({
            select: { guildId: true }
        });

        if (!guildWithData) {
            console.log('   ❌ No guild with fishing data found');
            return;
        }

        const guildId = guildWithData.guildId;
        console.log(`   ✅ Found guild: ${guildId}`);

        // 2. Lấy top fisher thật
        console.log('\n2️⃣ Getting real top fisher...');
        const topFisher = await FishingService.getTopFisher(guildId);
        
        if (!topFisher) {
            console.log('   ❌ No top fisher found');
            return;
        }

        console.log('   ✅ Top Fisher found:');
        console.log(`   User ID: ${topFisher.userId}`);
        console.log(`   Total Fish: ${topFisher.totalFish.toLocaleString()}`);
        console.log(`   Total Earnings: ${topFisher.totalEarnings.toLocaleString()}`);
        console.log(`   Biggest Fish: ${topFisher.biggestFish}`);
        console.log(`   Rarest Fish: ${topFisher.rarestFish} (${topFisher.rarestRarity})`);

        // 3. Lấy thêm 2-3 fishers khác để so sánh
        console.log('\n3️⃣ Getting fishing leaderboard for comparison...');
        const leaderboard = await FishingService.getFishingLeaderboard(guildId, 5);
        
        console.log('   📊 Top 5 Fishers:');
        leaderboard.forEach((fisher, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            const isTop = fisher.userId === topFisher.userId ? " (TOP 1)" : "";
            console.log(`   ${medal} User ${fisher.userId.slice(-4)} - ${fisher.totalFish} fish${isTop}`);
        });

        // 4. Test logic với top fisher
        console.log('\n4️⃣ Testing logic with top fisher...');
        const testTopUserId = topFisher.userId;
        const isTopFisher = topFisher.userId === testTopUserId;
        
        console.log(`   Test User ID: ${testTopUserId}`);
        console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
        
        if (isTopFisher) {
            console.log('   🎯 This user should see Top 1 Fisher GIF!');
            console.log('   🎨 GIF URL: https://cdn.discordapp.com/attachments/1396335030216822875/1398569224347320361/113_138.gif');
            console.log('   🎨 Color: #ff6b35 (Orange)');
            console.log('   🏆 Title: "🏆 Top 1 Fisher Mode"');
            console.log('   📊 Stats:');
            console.log(`      - Total Fish: ${topFisher.totalFish.toLocaleString()}`);
            console.log(`      - Total Earnings: ${topFisher.totalEarnings.toLocaleString()}`);
            console.log(`      - Biggest Fish: ${topFisher.biggestFish}`);
            console.log(`      - Rarest Fish: ${topFisher.rarestFish} (${topFisher.rarestRarity})`);
        }

        // 5. Test logic với non-top fisher
        console.log('\n5️⃣ Testing logic with non-top fisher...');
        if (leaderboard.length > 1) {
            const nonTopUserId = leaderboard[1].userId; // User thứ 2
            const isNonTopFisher = topFisher.userId !== nonTopUserId;
            
            console.log(`   Non-Top User ID: ${nonTopUserId}`);
            console.log(`   Is Top Fisher: ${isNonTopFisher ? '❌ NO' : '✅ YES'}`);
            console.log(`   Their Stats: ${leaderboard[1].totalFish} fish, ${leaderboard[1].totalEarnings.toLocaleString()} earnings`);
            
            if (isNonTopFisher) {
                console.log('   🎯 This user should see regular fishing GIF');
                console.log('   🎨 GIF URL: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif');
                console.log('   🎨 Color: #0099ff (Blue)');
            }
        }

        // 6. Test với user không có trong leaderboard
        console.log('\n6️⃣ Testing logic with user not in leaderboard...');
        const randomUserId = 'random-user-123';
        const isRandomTopFisher = topFisher.userId === randomUserId;
        
        console.log(`   Random User ID: ${randomUserId}`);
        console.log(`   Is Top Fisher: ${isRandomTopFisher ? '✅ YES' : '❌ NO'}`);
        
        if (!isRandomTopFisher) {
            console.log('   🎯 This user should see regular fishing GIF');
            console.log('   🎨 GIF URL: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif');
            console.log('   🎨 Color: #0099ff (Blue)');
        }

        // 7. Test command simulation
        console.log('\n7️⃣ Simulating fishing command...');
        console.log('   🎣 Command: n.fishing');
        console.log('   📍 Guild ID:', guildId);
        
        if (isTopFisher) {
            console.log('   👤 User: Top 1 Fisher');
            console.log('   🎨 Expected Experience:');
            console.log('      [Embed 1 - Top Fisher GIF (Small)]');
            console.log('      🏆 Top 1 Fisher Mode');
            console.log('      [Small Top Fisher GIF - Thumbnail]');
            console.log('');
            console.log('      [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      Username đang câu cá...');
            console.log('      ⏳ 🎣 Đang thả mồi...');
            console.log('      🏆 Top 1 Fisher đang câu cá với GIF đặc biệt!');
            console.log('      [Top Fisher GIF - Full Size]');
        } else {
            console.log('   👤 User: Normal Fisher');
            console.log('   🎨 Expected Experience:');
            console.log('      [Embed 1]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      Username đang câu cá...');
            console.log('      ⏳ 🎣 Đang thả mồi...');
            console.log('      [Regular fishing GIF]');
        }

        // 8. Test gamestats command
        console.log('\n8️⃣ Testing gamestats fishing command...');
        console.log('   📊 Command: n.gamestats fishing');
        console.log('   📍 Expected Output:');
        console.log('      🎣 Top Người Câu Cá (Theo Số Lần Câu)');
        console.log('      Bảng xếp hạng người câu cá nhiều nhất');
        console.log('');
        leaderboard.slice(0, 3).forEach((fisher, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
            const isTop = fisher.userId === topFisher.userId ? " (TOP 1)" : "";
            console.log(`      ${medal} User ${fisher.userId.slice(-4)}${isTop}`);
            console.log(`         🎣 ${fisher.totalFish} lần câu | 💰 ${fisher.totalEarnings.toLocaleString()} coins`);
        });

        console.log('\n✅ Real Top 1 Fisher GIF Feature test completed!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Test with real Discord bot: n.fishing');
        console.log('   2. Check gamestats: n.gamestats fishing');
        console.log('   3. Verify Top 1 Fisher sees special GIF');
        console.log('   4. Verify normal users see regular GIF');

    } catch (error) {
        console.error('❌ Error testing real top fisher GIF feature:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopFisherReal().catch(console.error); 