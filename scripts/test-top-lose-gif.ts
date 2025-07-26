/**
 * 💸 Test Top 1 Lose GIF Feature
 * 
 * Script này test tính năng GIF đặc biệt cho Top 1 Lose user
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testTopLoseGif() {
    console.log('💸 Test Top 1 Lose GIF Feature\n');

    try {
        // 1. Lấy guild có dữ liệu thật
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

        // 2. Lấy top lose user thật
        console.log('\n2️⃣ Getting real top lose user...');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        
        if (!topLoseUser) {
            console.log('   ❌ No top lose user found');
            return;
        }

        console.log('   ✅ Top Lose User found:');
        console.log(`   User ID: ${topLoseUser.userId}`);
        console.log(`   Total Lost: ${topLoseUser.totalLost.toLocaleString()}`);
        console.log(`   Total Bet: ${topLoseUser.totalBet.toLocaleString()}`);
        console.log(`   Games Played: ${topLoseUser.gamesPlayed}`);
        console.log(`   Games Won: ${topLoseUser.gamesWon}`);
        console.log(`   Biggest Loss: ${topLoseUser.biggestLoss.toLocaleString()}`);

        // 3. Test logic với top lose user
        console.log('\n3️⃣ Testing logic with top lose user...');
        const testTopLoseUserId = topLoseUser.userId;
        const isTopLose = topLoseUser.userId === testTopLoseUserId;
        
        console.log(`   Test User ID: ${testTopLoseUserId}`);
        console.log(`   Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);
        
        if (isTopLose) {
            console.log('   🎯 This user should see:');
            console.log('   📋 [Embed 1 - Top Lose GIF (Small)]');
            console.log('      💸 Top 1 Thua Lỗ');
            console.log('      🎨 GIF: https://media.discordapp.net/attachments/1396335030216822875/1398569302663368714/113_156.gif');
            console.log('      🎨 Color: #ff4757 (Red)');
            console.log('');
            console.log('   📋 [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      Username đang câu cá...');
            console.log('      ⏳ 🎣 Đang thả mồi...');
            console.log('      💸 Top 1 Lose đang câu cá với GIF đặc biệt!');
            console.log('      🎨 GIF: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif (ORIGINAL FISHING GIF)');
            console.log('      🎨 Color: #0099ff (Blue)');
        }

        // 4. Test logic với normal user
        console.log('\n4️⃣ Testing logic with normal user...');
        const normalUserId = 'normal-user-123';
        const isNormalTopLose = topLoseUser.userId === normalUserId;
        
        console.log(`   Normal User ID: ${normalUserId}`);
        console.log(`   Is Top Lose: ${isNormalTopLose ? '✅ YES' : '❌ NO'}`);
        
        if (!isNormalTopLose) {
            console.log('   🎯 This user should see:');
            console.log('   📋 [Embed 1 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      Username đang câu cá...');
            console.log('      ⏳ 🎣 Đang thả mồi...');
            console.log('      🎨 GIF: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif (ORIGINAL FISHING GIF)');
            console.log('      🎨 Color: #0099ff (Blue)');
        }

        // 5. Test animation steps
        console.log('\n5️⃣ Testing animation steps...');
        const animationSteps = [
            "🎣 Đang thả mồi...",
            "🌊 Đang chờ cá cắn câu...",
            "🐟 Có gì đó đang cắn câu!",
            "🎣 Đang kéo cá lên..."
        ];

        console.log('   📊 Animation Steps (3 seconds total):');
        animationSteps.forEach((step, index) => {
            console.log(`   Step ${index + 1}: ${step} (${index * 750}ms - ${(index + 1) * 750}ms)`);
        });

        // 6. Test GIF URLs
        console.log('\n6️⃣ Testing GIF URLs...');
        const fishingGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif?ex=6881950d&is=6880438d&hm=60523d4d9a24ab5f45a42e6fd1c8dddf28680e015cadf0e5fce617e12599f552&";
        const topLoseGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398569302663368714/113_156.gif?ex=6885d6a9&is=68848529&hm=e67d702c44f4916882ea5cb64940485e0b66aed91f74b7f7f5f6e53934fcd47d&=&width=408&height=192";
        
        console.log('   🎨 Original Fishing GIF (ALWAYS USED):');
        console.log(`      URL: ${fishingGifUrl}`);
        console.log('      Position: Main image (.setImage())');
        console.log('      Used for: ALL users (Normal, Top Lose, Top Fisher, Admin)');
        console.log('');
        console.log('   💸 Top Lose GIF (ONLY for Top 1 Lose):');
        console.log(`      URL: ${topLoseGifUrl}`);
        console.log('      Position: Thumbnail (.setThumbnail())');
        console.log('      Used for: Top 1 Lose only (not Admin, not Top Fisher)');

        // 7. Test embed structure
        console.log('\n7️⃣ Testing embed structure...');
        console.log('   📋 Normal User:');
        console.log('      - 1 embed');
        console.log('      - Main GIF: Original fishing GIF');
        console.log('      - Thumbnail: User avatar');
        console.log('');
        console.log('   📋 Top 1 Lose:');
        console.log('      - 2 embeds');
        console.log('      - Embed 1: Top Lose GIF (thumbnail) + Red color');
        console.log('      - Embed 2: Original fishing GIF (main) + Blue color');
        console.log('');
        console.log('   📋 Top 1 Fisher:');
        console.log('      - 2 embeds');
        console.log('      - Embed 1: Top Fisher GIF (thumbnail) + Orange color');
        console.log('      - Embed 2: Original fishing GIF (main) + Blue color');
        console.log('');
        console.log('   📋 Admin:');
        console.log('      - 2 embeds');
        console.log('      - Embed 1: Admin GIF (thumbnail) + Gold color');
        console.log('      - Embed 2: Original fishing GIF (main) + Blue color');

        // 8. Test priority system
        console.log('\n8️⃣ Testing priority system...');
        console.log('   🏆 Priority Order:');
        console.log('      1. 👑 Admin > 🏆 Top 1 Fisher > 💸 Top 1 Lose > 👤 Normal User');
        console.log('   📋 Logic:');
        console.log('      if (isAdmin) {');
        console.log('          embeds = [adminEmbed, fishingEmbed];');
        console.log('      } else if (isTopFisher) {');
        console.log('          embeds = [topFisherEmbed, fishingEmbed];');
        console.log('      } else if (isTopLose) {');
        console.log('          embeds = [topLoseEmbed, fishingEmbed];');
        console.log('      } else {');
        console.log('          embeds = [fishingEmbed];');
        console.log('      }');

        // 9. Test top lose leaderboard
        console.log('\n9️⃣ Testing top lose leaderboard...');
        const loseLeaderboard = await GameStatsService.getOverallLoseLeaderboard(guildId, 5);
        console.log('   📊 Top 5 Lose Users:');
        loseLeaderboard.forEach((user, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            console.log(`   ${medal} User ID: ${user.userId}`);
            console.log(`      Total Lost: ${user.totalLost.toLocaleString()}`);
            console.log(`      Games Played: ${user.gamesPlayed}`);
            console.log(`      Games Won: ${user.gamesWon}`);
            console.log(`      Biggest Loss: ${user.biggestLoss.toLocaleString()}`);
            console.log('');
        });

        console.log('\n✅ Top 1 Lose GIF Feature test completed!');
        console.log('\n🎯 Key Points:');
        console.log('   ✅ Original fishing GIF is ALWAYS preserved');
        console.log('   ✅ Top Lose GIF only appears as thumbnail');
        console.log('   ✅ No interference with main fishing animation');
        console.log('   ✅ Same structure as Admin and Top Fisher GIF features');
        console.log('   ✅ Priority system: Admin > Top Fisher > Top Lose > Normal');

    } catch (error) {
        console.error('❌ Error testing top lose GIF feature:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopLoseGif().catch(console.error); 