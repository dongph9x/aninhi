/**
 * 🐛 Debug FishBattle Leaderboard GIF Issue
 *
 * Script này debug chi tiết tại sao GIF không hiển thị
 */

import { FishBattleService } from '../src/utils/fish-battle';

async function debugFishBattleLeaderboardGifIssue() {
    console.log('🐛 Debug FishBattle Leaderboard GIF Issue\n');

    try {
        const testGuildId = '1005280612845891615';

        // 1. Kiểm tra leaderboard data
        console.log('1️⃣ Checking leaderboard data...');
        const leaderboard = await FishBattleService.getBattleLeaderboard(testGuildId, 10);
        console.log(`📊 Found ${leaderboard.length} users in leaderboard`);

        // 2. Kiểm tra từng user
        console.log('\n2️⃣ Checking each user...');
        let hasRealTop1 = false;
        let realTop1User = null;

        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const user = leaderboard[i];
            console.log(`\n--- User ${i + 1} (Position ${i + 1}) ---`);
            console.log(`User ID: ${user.userId}`);
            console.log(`Total Battles: ${user.totalBattles}`);
            console.log(`Wins: ${user.wins}`);
            console.log(`Total Earnings: ${user.totalEarnings}`);
            
            // Kiểm tra logic
            const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
            const isTestUser = user.userId.includes('test-') || user.userId.includes('test_') || user.userId.includes('real-battle-user');
            
            console.log(`Has Real Battle Data: ${hasRealBattleData}`);
            console.log(`Is Test User: ${isTestUser}`);
            console.log(`Should Display: ${hasRealBattleData && !isTestUser}`);
            console.log(`Is Top 1: ${i === 0}`);
            console.log(`Should Show GIF: ${i === 0 && hasRealBattleData && !isTestUser}`);
            
            if (i === 0 && hasRealBattleData && !isTestUser) {
                hasRealTop1 = true;
                realTop1User = user;
                console.log('🎬 GIF should be displayed for this user!');
                console.log('🎬 GIF URL: https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif');
            }
        }

        // 3. Kiểm tra logic hiển thị
        console.log('\n3️⃣ Display logic check:');
        console.log(`Has Real Top 1: ${hasRealTop1}`);
        
        if (hasRealTop1 && realTop1User) {
            console.log('✅ Real top 1 user found - GIF should display');
            console.log(`User: ${realTop1User.userId}`);
            console.log(`Stats: ${realTop1User.wins}W/${realTop1User.totalBattles}L`);
        } else {
            console.log('❌ No real top 1 user found - showing BOT');
        }

        // 4. Kiểm tra GIF URL
        console.log('\n4️⃣ GIF URL check:');
        const gifUrl = 'https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif?ex=6885d697&is=68848517&hm=e4170005d400feac541c4b903b2fa4d329a734c157da76a12b9dbc13e840145f&=&width=260&height=104';
        console.log(`GIF URL: ${gifUrl}`);
        console.log('URL Length:', gifUrl.length);
        console.log('URL Valid:', gifUrl.startsWith('https://'));

        // 5. Mô phỏng embed creation
        console.log('\n5️⃣ Simulating embed creation...');
        
        if (hasRealTop1 && realTop1User) {
            const winRate = realTop1User.totalBattles > 0 ? Math.round((realTop1User.wins / realTop1User.totalBattles) * 100) : 0;
            
            console.log('🎬 Creating top1Embed with GIF:');
            console.log(`   Color: #FFD700`);
            console.log(`   Thumbnail: ${gifUrl}`);
            console.log(`   Description: **<@${realTop1User.userId}>**\\n🏆 ${realTop1User.wins}W/${realTop1User.totalBattles}L (${winRate}%) | 🐟 ${realTop1User.totalEarnings.toLocaleString()} FishCoin`);
            
            console.log('\n🎬 Expected Discord Embed Structure:');
            console.log('   [Embed 1 - Top 1 with GIF]');
            console.log('   ┌─────────────────────────────────┐');
            console.log('   │ 🎬 [GIF Thumbnail]              │');
            console.log('   │                                 │');
            console.log('   │ **@Username**                   │');
            console.log('   │ 🏆 15W/5L (75%) | 🐟 25,000 FC │');
            console.log('   └─────────────────────────────────┘');
            console.log('');
            console.log('   [Embed 2 - Main Leaderboard]');
            console.log('   ┌─────────────────────────────────┐');
            console.log('   │ 🏆 Bảng Xếp Hạng Đấu Cá        │');
            console.log('   │                                 │');
            console.log('   │ 🥈 @User2                       │');
            console.log('   │ 🏆 10W/8L (56%) | 🐟 18,000 FC │');
            console.log('   │                                 │');
            console.log('   │ 🥉 @User3                       │');
            console.log('   │ 🏆 8W/12L (40%) | 🐟 15,000 FC │');
            console.log('   └─────────────────────────────────┘');
        } else {
            console.log('🎬 Creating top1Embed with BOT:');
            console.log(`   Color: #FFD700`);
            console.log(`   Description: **BOT**\\n🏆 0W/0L (0%) | 🐟 0 FishCoin`);
            console.log('   Note: No thumbnail GIF for BOT');
        }

        // 6. Kiểm tra Discord embed limits
        console.log('\n6️⃣ Discord embed limits check:');
        console.log('   Max embeds per message: 10');
        console.log('   Max thumbnail size: 256x256');
        console.log('   Max image size: 400x400');
        console.log('   Max description length: 4096 characters');
        console.log('   Max field value length: 1024 characters');

        // 7. Troubleshooting suggestions
        console.log('\n7️⃣ Troubleshooting suggestions:');
        console.log('   🔍 Check if GIF URL is accessible in browser');
        console.log('   🔍 Check if Discord can load the GIF');
        console.log('   🔍 Check if embed is being sent correctly');
        console.log('   🔍 Check if thumbnail is being set properly');
        console.log('   🔍 Check if there are any Discord API errors');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Debug completed!');

    } catch (error) {
        console.error('❌ Error during debug:', error);
    }
}

debugFishBattleLeaderboardGifIssue(); 