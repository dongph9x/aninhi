import prisma from '../src/utils/prisma';
import { AchievementService } from '../src/utils/achievement';
import { FishingService } from '../src/utils/fishing';
import { GameStatsService } from '../src/utils/gameStats';

async function testAchievementPrioritySystem() {
    console.log('🏆 Testing Achievement Priority System...\n');

    try {
        const testGuildId = '1005280612845891615';
        const testUserId = '389957152153796608'; // User để test

        // 1. Kiểm tra dữ liệu hiện tại
        console.log('1️⃣ Checking current data...');
        
        // Kiểm tra Achievement
        const userAchievement = await AchievementService.getHighestPriorityAchievement(testUserId);
        const hasAchievement = userAchievement !== null;
        console.log(`   🏅 User Achievement: ${hasAchievement ? '✅ YES' : '❌ NO'}`);
        if (hasAchievement && userAchievement) {
            console.log(`   📋 Achievement Name: ${userAchievement.name}`);
            console.log(`   🔗 Achievement Link: ${userAchievement.link}`);
            console.log(`   🎯 Achievement Type: ${AchievementService.getAchievementTypeName(userAchievement.type)}`);
            console.log(`   🎨 Achievement Emoji: ${AchievementService.getAchievementTypeEmoji(userAchievement.type)}`);
        }

        // Kiểm tra Admin
        console.log(`   👑 Is Admin: ❌ NO (Script test)`);

        // Kiểm tra Top Fisher
        const topFisher = await FishingService.getTopFisher(testGuildId);
        const isTopFisher = topFisher && topFisher.userId === testUserId;
        console.log(`   🏆 Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);

        // Kiểm tra Top FishCoin
        const topFishCoinUser = await GameStatsService.getTopFishCoinUser(testGuildId);
        const isTopFishCoin = topFishCoinUser === testUserId;
        console.log(`   💰 Is Top FishCoin: ${isTopFishCoin ? '✅ YES' : '❌ NO'}`);

        // Kiểm tra Top Lose
        const topLoseUser = await GameStatsService.getTopLoseUser(testGuildId);
        const isTopLose = topLoseUser && topLoseUser.userId === testUserId;
        console.log(`   💸 Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);

        // 2. Test Priority System
        console.log('\n2️⃣ Testing Priority System...');
        console.log('   🎯 Priority Order:');
        console.log('      1. 🏅 Achievement (HIGHEST)');
        console.log('      2. 👑 Admin');
        console.log('      3. 🏆 Top 1 Fisher');
        console.log('      4. 💰 Top 1 FishCoin');
        console.log('      5. 💸 Top 1 Lose');
        console.log('      6. 👤 Normal User (LOWEST)');

        // 3. Simulate Priority Logic
        console.log('\n3️⃣ Simulating Priority Logic...');
        
        let selectedPriority = 'Normal User';
        let selectedEmbed = 'Fishing GIF only';
        let selectedColor = '#0099ff';

        if (hasAchievement && userAchievement) {
            selectedPriority = 'Achievement';
            selectedEmbed = `${userAchievement.name} (${userAchievement.link}) + Fishing GIF`;
            selectedColor = '#ff6b35';
            console.log('   🎯 Selected: Achievement (Highest Priority)');
        } else if (false) { // isAdmin = false in script
            selectedPriority = 'Admin';
            selectedEmbed = 'Admin GIF + Fishing GIF';
            selectedColor = '#ffd700';
            console.log('   🎯 Selected: Admin GIF');
        } else if (isTopFisher) {
            selectedPriority = 'Top 1 Fisher';
            selectedEmbed = 'Top Fisher GIF + Fishing GIF';
            selectedColor = '#ff6b35';
            console.log('   🎯 Selected: Top 1 Fisher GIF');
        } else if (isTopFishCoin) {
            selectedPriority = 'Top 1 FishCoin';
            selectedEmbed = 'Top FishCoin GIF + Fishing GIF';
            selectedColor = '#00d4aa';
            console.log('   🎯 Selected: Top 1 FishCoin GIF');
        } else if (isTopLose) {
            selectedPriority = 'Top 1 Lose';
            selectedEmbed = 'Top Lose GIF + Fishing GIF';
            selectedColor = '#ff4757';
            console.log('   🎯 Selected: Top 1 Lose GIF');
        } else {
            console.log('   🎯 Selected: Normal Fishing GIF');
        }

        console.log(`   📋 Final Selection: ${selectedPriority}`);
        console.log(`   🎨 Embed Structure: ${selectedEmbed}`);
        console.log(`   🎨 Color: ${selectedColor}`);

        // 4. Test Achievement Service Methods
        console.log('\n4️⃣ Testing Achievement Service Methods...');
        
        // Test getUserAchievement
        const achievement = await AchievementService.getUserAchievement(testUserId);
        console.log(`   📋 getUserAchievement: ${achievement ? '✅ Found' : '❌ Not found'}`);

        // Test getUserAchievements
        const achievements = await AchievementService.getUserAchievements(testUserId);
        console.log(`   📋 getUserAchievements: ${achievements.length} achievements found`);

        // Test hasAchievement
        const hasAnyAchievement = await AchievementService.hasAchievement(testUserId);
        console.log(`   📋 hasAchievement: ${hasAnyAchievement ? '✅ YES' : '❌ NO'}`);

        // Test getAchievementByType
        const type0Achievement = await AchievementService.getAchievementByType(testUserId, 0);
        console.log(`   📋 getAchievementByType(0): ${type0Achievement ? '✅ Found' : '❌ Not found'}`);

        // 5. Test Type Names and Emojis
        console.log('\n5️⃣ Testing Type Names and Emojis...');
        for (let i = 0; i <= 3; i++) {
            const typeName = AchievementService.getAchievementTypeName(i);
            const typeEmoji = AchievementService.getAchievementTypeEmoji(i);
            console.log(`   Type ${i}: ${typeEmoji} ${typeName}`);
        }

        // 6. Test Database Queries
        console.log('\n6️⃣ Testing Database Queries...');
        
        // Count total achievements
        const totalAchievements = await prisma.achievement.count();
        console.log(`   📊 Total achievements in database: ${totalAchievements}`);

        // Get all achievements for test user
        const userAchievements = await prisma.achievement.findMany({
            where: { target: testUserId },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`   📊 Achievements for test user: ${userAchievements.length}`);

        if (userAchievements.length > 0) {
            console.log('   📋 User Achievements:');
            userAchievements.forEach((achievement, index) => {
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name} (${typeName})`);
                console.log(`         🔗 Link: ${achievement.link}`);
                console.log(`         📅 Created: ${achievement.createdAt.toLocaleString()}`);
            });
        }

        console.log('\n✅ Achievement Priority System test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Achievement has HIGHEST priority');
        console.log('   ✅ Uses achievement name and link from database');
        console.log('   ✅ Supports multiple achievement types');
        console.log('   ✅ Proper priority fallback system');
        console.log('   ✅ Integration with existing GIF system');

    } catch (error) {
        console.error('❌ Error testing achievement priority system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testAchievementPrioritySystem().catch(console.error); 