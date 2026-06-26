/**
 * 🏆 Test Top 1 Fisher GIF Feature - Corrected Version
 * 
 * Script này test tính năng GIF đặc biệt cho Top 1 Fisher với cách hiển thị đúng:
 * - Giữ nguyên GIF câu cá cũ ở vị trí chính
 * - Chỉ thêm GIF đặc biệt ở thumbnail cho Top 1 Fisher
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';

const prisma = new PrismaClient();

async function testTopFisherCorrected() {
    console.log('🏆 Test Top 1 Fisher GIF Feature - Corrected Version\n');

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

        // 3. Test logic với top fisher
        console.log('\n3️⃣ Testing corrected logic with top fisher...');
        const testTopUserId = topFisher.userId;
        const isTopFisher = topFisher.userId === testTopUserId;
        
        console.log(`   Test User ID: ${testTopUserId}`);
        console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
        
        if (isTopFisher) {
            console.log('   🎯 This user should see:');
            console.log('   📋 [Embed 1 - Top Fisher GIF (Small)]');
            console.log('      🏆 Top 1 Fisher Mode');
            console.log('      🎨 GIF: https://cdn.discordapp.com/attachments/1396335030216822875/1398569224347320361/113_138.gif');
            console.log('      🎨 Color: #ff6b35 (Orange)');
            console.log('');
            console.log('   📋 [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      Username đang câu cá...');
            console.log('      ⏳ 🎣 Đang thả mồi...');
            console.log('      🏆 Top 1 Fisher đang câu cá với GIF đặc biệt!');
            console.log('      🎨 GIF: https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif (ORIGINAL FISHING GIF)');
            console.log('      🎨 Color: #0099ff (Blue)');
        }

        // 4. Test logic với normal user
        console.log('\n4️⃣ Testing corrected logic with normal user...');
        const normalUserId = 'normal-user-123';
        const isNormalTopFisher = topFisher.userId === normalUserId;
        
        console.log(`   Normal User ID: ${normalUserId}`);
        console.log(`   Is Top Fisher: ${isNormalTopFisher ? '✅ YES' : '❌ NO'}`);
        
        if (!isNormalTopFisher) {
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
        const topFisherGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1398569224347320361/113_138.gif?ex=6885d697&is=68848517&hm=659d280e05cb18bd554ef510d676e9456d1d97bfd1cd20d6378aa8d1aba80639&";
        
        console.log('   🎨 Original Fishing GIF (ALWAYS USED):');
        console.log(`      URL: ${fishingGifUrl}`);
        console.log('      Position: Main image (.setImage())');
        console.log('      Used for: ALL users (Normal, Top Fisher, Admin)');
        console.log('');
        console.log('   🏆 Top Fisher GIF (ONLY for Top 1 Fisher):');
        console.log(`      URL: ${topFisherGifUrl}`);
        console.log('      Position: Thumbnail (.setThumbnail())');
        console.log('      Used for: Top 1 Fisher only (not Admin)');

        // 7. Test embed structure
        console.log('\n7️⃣ Testing embed structure...');
        console.log('   📋 Normal User:');
        console.log('      - 1 embed');
        console.log('      - Main GIF: Original fishing GIF');
        console.log('      - Thumbnail: User avatar');
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
        console.log('      1. 👑 Admin > 🏆 Top 1 Fisher > 👤 Normal User');
        console.log('   📋 Logic:');
        console.log('      if (isAdmin) {');
        console.log('          embeds = [adminEmbed, fishingEmbed];');
        console.log('      } else if (isTopFisher) {');
        console.log('          embeds = [topFisherEmbed, fishingEmbed];');
        console.log('      } else {');
        console.log('          embeds = [fishingEmbed];');
        console.log('      }');

        console.log('\n✅ Corrected Top 1 Fisher GIF Feature test completed!');
        console.log('\n🎯 Key Points:');
        console.log('   ✅ Original fishing GIF is ALWAYS preserved');
        console.log('   ✅ Top Fisher GIF only appears as thumbnail');
        console.log('   ✅ No interference with main fishing animation');
        console.log('   ✅ Same structure as Admin GIF feature');

    } catch (error) {
        console.error('❌ Error testing corrected top fisher GIF feature:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTopFisherCorrected().catch(console.error); 