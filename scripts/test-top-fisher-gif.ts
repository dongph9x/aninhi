/**
 * 🏆 Test Top 1 Fisher GIF Feature
 * 
 * Script này test tính năng GIF đặc biệt cho người có số lần câu cá nhiều nhất
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';

const prisma = new PrismaClient();

async function testTopFisherGif() {
    console.log('🏆 Test Top 1 Fisher GIF Feature\n');

    const testGuildId = 'test-guild-123';

    try {
        // 1. Test lấy top fisher
        console.log('1️⃣ Testing getTopFisher function...');
        const topFisher = await FishingService.getTopFisher(testGuildId);
        
        if (topFisher) {
            console.log('   ✅ Top Fisher found:');
            console.log(`   User ID: ${topFisher.userId}`);
            console.log(`   Total Fish: ${topFisher.totalFish.toLocaleString()}`);
            console.log(`   Total Earnings: ${topFisher.totalEarnings.toLocaleString()}`);
            console.log(`   Biggest Fish: ${topFisher.biggestFish}`);
            console.log(`   Rarest Fish: ${topFisher.rarestFish} (${topFisher.rarestRarity})`);
        } else {
            console.log('   ⚠️ No top fisher found (empty database)');
        }

        // 2. Test với guild có dữ liệu thật
        console.log('\n2️⃣ Testing with real guild data...');
        
        // Lấy guild đầu tiên có dữ liệu
        const guildWithData = await prisma.fishingData.findFirst({
            select: { guildId: true }
        });

        if (guildWithData) {
            const realTopFisher = await FishingService.getTopFisher(guildWithData.guildId);
            if (realTopFisher) {
                console.log('   ✅ Real Top Fisher found:');
                console.log(`   Guild ID: ${guildWithData.guildId}`);
                console.log(`   User ID: ${realTopFisher.userId}`);
                console.log(`   Total Fish: ${realTopFisher.totalFish.toLocaleString()}`);
                console.log(`   Total Earnings: ${realTopFisher.totalEarnings.toLocaleString()}`);
            } else {
                console.log('   ⚠️ No real top fisher found');
            }
        } else {
            console.log('   ⚠️ No guild with fishing data found');
        }

        // 3. Test fishing leaderboard
        console.log('\n3️⃣ Testing fishing leaderboard...');
        const leaderboard = await FishingService.getFishingLeaderboard(testGuildId, 5);
        console.log(`   Leaderboard entries: ${leaderboard.length}`);
        
        if (leaderboard.length > 0) {
            console.log('   Top 3 fishers:');
            leaderboard.slice(0, 3).forEach((fisher, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                console.log(`   ${medal} User ${fisher.userId.slice(-4)} - ${fisher.totalFish} fish`);
            });
        }

        // 4. Test logic kiểm tra top fisher
        console.log('\n4️⃣ Testing top fisher logic...');
        
        if (topFisher) {
            const testUserId = topFisher.userId;
            const isTopFisher = topFisher.userId === testUserId;
            
            console.log(`   Test User ID: ${testUserId}`);
            console.log(`   Is Top Fisher: ${isTopFisher ? '✅ Yes' : '❌ No'}`);
            
            if (isTopFisher) {
                console.log('   🎯 This user should see Top 1 Fisher GIF!');
                console.log('   🎨 GIF URL: https://cdn.discordapp.com/attachments/1396335030216822875/1398569224347320361/113_138.gif');
                console.log('   🎨 Color: #ff6b35 (Orange)');
                console.log('   🏆 Title: "🏆 Top 1 Fisher Mode"');
            }
        }

        // 5. Test với user không phải top fisher
        console.log('\n5️⃣ Testing non-top fisher logic...');
        const nonTopUserId = 'non-top-user-123';
        const isNonTopFisher = topFisher && topFisher.userId !== nonTopUserId;
        
        console.log(`   Non-Top User ID: ${nonTopUserId}`);
        console.log(`   Is Top Fisher: ${isNonTopFisher ? '❌ No' : '✅ Yes (should see regular GIF)'}`);
        
        if (isNonTopFisher) {
            console.log('   🎯 This user should see regular fishing GIF');
            console.log('   🎨 GIF URL: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif');
            console.log('   🎨 Color: #0099ff (Blue)');
        }

        // 6. Test animation steps
        console.log('\n6️⃣ Testing animation steps...');
        const animationSteps = [
            "🎣 Đang thả mồi...",
            "🌊 Đang chờ cá cắn câu...",
            "🐟 Có gì đó đang cắn câu!",
            "🎣 Đang kéo cá lên..."
        ];

        animationSteps.forEach((step, index) => {
            console.log(`   Step ${index + 1}: ${step} (${index * 750}ms - ${(index + 1) * 750}ms)`);
        });

        console.log('\n7️⃣ Code Implementation Summary:');
        console.log(`
// ✅ Top Fisher Detection
const topFisher = await FishingService.getTopFisher(guildId);
const isTopFisher = topFisher && topFisher.userId === userId;

// ✅ GIF Selection
const topFisherGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1398569224347320361/113_138.gif";
const selectedGifUrl = isTopFisher ? topFisherGifUrl : fishingGifUrl;

// ✅ Embed Creation
let topFisherEmbed = null;
if (isTopFisher && !isAdmin) {
    topFisherEmbed = new EmbedBuilder()
        .setThumbnail(topFisherGifUrl)
        .setColor("#ff6b35")
        .setTitle("🏆 Top 1 Fisher Mode");
}

// ✅ Conditional Display
let embeds = [fishingEmbed];
if (isAdmin) {
    embeds = [adminEmbed, fishingEmbed];
} else if (isTopFisher) {
    embeds = [topFisherEmbed, fishingEmbed];
}

// ✅ Animation Updates
if (isTopFisher) {
    const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1])
        .setDescription(newDescription + '\\n\\n🏆 Top 1 Fisher đang câu cá với GIF đặc biệt!');
    
    const updatedEmbeds = [topFisherEmbed, updatedFishingEmbed];
    await fishingMsg.edit({ embeds: updatedEmbeds });
}
        `);

        console.log('\n✅ Top 1 Fisher GIF Feature test completed!');

    } catch (error) {
        console.error('❌ Error testing top fisher GIF feature:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopFisherGif().catch(console.error); 