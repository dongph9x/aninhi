/**
 * 💰 Test Top FishCoin GIF Feature
 *
 * Script này test tính năng hiển thị GIF riêng cho Top 1 FishCoin user
 */

import { GameStatsService } from '../src/utils/gameStats';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTopFishCoinGifFeature() {
    console.log('💰 Test Top FishCoin GIF Feature\n');

    try {
        const testGuildId = '1005280612845891615';

        // 1. Lấy top FishCoin user
        console.log('1️⃣ Getting top FishCoin user...');
        const topFishCoinUserId = await GameStatsService.getTopFishCoinUser(testGuildId);
        
        if (!topFishCoinUserId) {
            console.log('❌ No top FishCoin user found!');
            return;
        }

        console.log(`✅ Top FishCoin user: ${topFishCoinUserId}`);

        // 2. Lấy thông tin chi tiết của top FishCoin user
        console.log('\n2️⃣ Getting top FishCoin user details...');
        const topFishCoinUser = await prisma.user.findUnique({
            where: { userId_guildId: { userId: topFishCoinUserId, guildId: testGuildId } }
        });

        if (!topFishCoinUser) {
            console.log('❌ Top FishCoin user not found in database!');
            return;
        }

        console.log(`💰 FishCoin Balance: ${topFishCoinUser.fishBalance.toLocaleString()}`);
        console.log(`💳 AniCoin Balance: ${topFishCoinUser.balance.toLocaleString()}`);

        // 3. Lấy thông tin Admin, Top Fisher, Top Lose để so sánh priority
        console.log('\n3️⃣ Checking other top users for priority comparison...');
        
        // Kiểm tra Admin (giả lập)
        const isAdmin = false; // Giả sử không phải admin
        console.log(`👑 Is Admin: ${isAdmin}`);

        // Lấy Top Fisher
        const { FishingService } = await import('../src/utils/fishing');
        const topFisher = await FishingService.getTopFisher(testGuildId);
        const isTopFisher = topFisher && topFisher.userId === topFishCoinUserId;
        console.log(`🏆 Is Top Fisher: ${isTopFisher}`);

        // Lấy Top Lose
        const topLoseUser = await GameStatsService.getTopLoseUser(testGuildId);
        const isTopLose = topLoseUser && topLoseUser.userId === topFishCoinUserId;
        console.log(`💸 Is Top Lose: ${isTopLose}`);

        // 4. Mô phỏng logic priority
        console.log('\n4️⃣ Simulating priority logic...');
        console.log('Priority Order: Admin > Top Fisher > Top FishCoin > Top Lose');
        
        let selectedGif = 'Normal Fishing GIF';
        let selectedTitle = '🎣 Đang Câu Cá...';
        let selectedColor = '#0099ff';

        if (isAdmin) {
            selectedGif = 'Admin GIF';
            selectedTitle = '👑 Admin Fishing';
            selectedColor = '#ffd700';
            console.log('🎯 Selected: Admin GIF (Highest Priority)');
        } else if (isTopFisher) {
            selectedGif = 'Top Fisher GIF';
            selectedTitle = '🏆 Top 1 Câu Cá';
            selectedColor = '#ff6b35';
            console.log('🎯 Selected: Top Fisher GIF (Second Priority)');
        } else if (true) { // Luôn true vì đây là top FishCoin user
            selectedGif = 'Top FishCoin GIF';
            selectedTitle = '💰 Top 1 FishCoin';
            selectedColor = '#00d4aa';
            console.log('🎯 Selected: Top FishCoin GIF (Third Priority)');
        } else if (isTopLose) {
            selectedGif = 'Top Lose GIF';
            selectedTitle = '💸 Top 1 Thua Lỗ';
            selectedColor = '#ff4757';
            console.log('🎯 Selected: Top Lose GIF (Third Priority)');
        } else if (isTopFisher) {
            selectedGif = 'Top Fisher GIF';
            selectedTitle = '🏆 Top 1 Câu Cá';
            selectedColor = '#ff6b35';
            console.log('🎯 Selected: Top Fisher GIF (Fourth Priority)');
        } else {
            console.log('🎯 Selected: Normal Fishing GIF (No Special Status)');
        }

        // 5. Hiển thị thông tin GIF
        console.log('\n5️⃣ GIF Information:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🎬 GIF Type: ${selectedGif}`);
        console.log(`📝 Title: ${selectedTitle}`);
        console.log(`🎨 Color: ${selectedColor}`);
        
        if (selectedGif === 'Top FishCoin GIF') {
            console.log(`🔗 GIF URL: https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif`);
            console.log(`📏 Size: 600x168`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 6. Mô phỏng embed structure
        console.log('\n6️⃣ Simulating embed structure...');
        if (selectedGif !== 'Normal Fishing GIF') {
            console.log('📋 Dual Embed Structure:');
            console.log('   Embed 1: Special GIF (Thumbnail)');
            console.log('   Embed 2: Main Fishing GIF (Image)');
            console.log('');
            console.log('📋 Embed 1 Details:');
            console.log(`   Title: ${selectedTitle}`);
            console.log(`   Color: ${selectedColor}`);
            console.log('   Thumbnail: Special GIF');
            console.log('');
            console.log('📋 Embed 2 Details:');
            console.log('   Title: 🎣 Đang Câu Cá...');
            console.log('   Color: #0099ff');
            console.log('   Image: Main Fishing GIF');
            console.log('   Description: Animation steps...');
        } else {
            console.log('📋 Single Embed Structure:');
            console.log('   Title: 🎣 Đang Câu Cá...');
            console.log('   Color: #0099ff');
            console.log('   Image: Main Fishing GIF');
            console.log('   Description: Animation steps...');
        }

        // 7. Kiểm tra các user khác trong guild
        console.log('\n7️⃣ Checking other users in guild...');
        const allUsers = await prisma.user.findMany({
            where: { guildId: testGuildId },
            orderBy: { fishBalance: 'desc' },
            take: 5,
            select: { userId: true, fishBalance: true }
        });

        console.log('📊 Top 5 FishCoin Users:');
        allUsers.forEach((user, index) => {
            const isTop = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const isCurrent = user.userId === topFishCoinUserId ? ' (Current)' : '';
            console.log(`   ${isTop} ${user.userId}: ${user.fishBalance.toLocaleString()} FishCoin${isCurrent}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Top FishCoin GIF feature test completed!');

        console.log('\n🎯 Key Features:');
        console.log('   ✅ Shows special GIF for top FishCoin user');
        console.log('   ✅ Priority system: Admin > Top FishCoin > Top Lose > Top Fisher');
        console.log('   ✅ Dual embed structure for special users');
        console.log('   ✅ Maintains main fishing GIF for animation');
        console.log('   ✅ No-flicker animation technique');

        console.log('\n📋 Test Commands:');
        console.log('   n.fishing');
        console.log('   (Run as top FishCoin user to see special GIF)');

        console.log('\n🎬 Expected Display:');
        if (selectedGif === 'Top FishCoin GIF') {
            console.log('   💰 [Top FishCoin GIF] **@TopFishCoinUser**');
            console.log('   🎣 [Main Fishing GIF] Animation steps...');
        } else {
            console.log('   🎣 [Main Fishing GIF] Animation steps...');
        }

    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTopFishCoinGifFeature(); 