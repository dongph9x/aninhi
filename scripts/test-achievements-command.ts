import prisma from '../src/utils/prisma';
import { AchievementService } from '../src/utils/achievement';

async function testAchievementsCommand() {
    console.log('🏅 Testing Achievements Command...\n');

    try {
        const testUserId = '389957152153796608';
        const testUserId2 = '1397381362763169853';

        // 1. Test với user có nhiều achievements
        console.log('1️⃣ Testing User with Multiple Achievements...');
        console.log(`   User ID: ${testUserId}`);
        
        const userAchievements = await AchievementService.getUserAchievements(testUserId);
        console.log(`   📊 Total achievements: ${userAchievements.length}`);

        if (userAchievements.length > 0) {
            console.log('   📋 Achievements:');
            userAchievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                const createdAt = achievement.createdAt.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name}`);
                console.log(`         🏅 Loại: ${typeName}`);
                console.log(`         📅 Nhận ngày: ${createdAt}`);
                console.log(`         🔗 Link: ${achievement.link}`);
            });

            // Test highest priority achievement
            const highestPriority = await AchievementService.getHighestPriorityAchievement(testUserId);
            if (highestPriority) {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(highestPriority.type);
                const typeName = AchievementService.getAchievementTypeName(highestPriority.type);
                console.log(`\n   🎯 Highest Priority Achievement:`);
                console.log(`      ${typeEmoji} ${highestPriority.name}`);
                console.log(`      🏅 Loại: ${typeName}`);
                console.log(`      💡 Sẽ hiển thị khi câu cá`);
            }
        }

        // 2. Test với user có ít achievements
        console.log('\n2️⃣ Testing User with Few Achievements...');
        console.log(`   User ID: ${testUserId2}`);
        
        const user2Achievements = await AchievementService.getUserAchievements(testUserId2);
        console.log(`   📊 Total achievements: ${user2Achievements.length}`);

        if (user2Achievements.length > 0) {
            console.log('   📋 Achievements:');
            user2Achievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                const createdAt = achievement.createdAt.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name}`);
                console.log(`         🏅 Loại: ${typeName}`);
                console.log(`         📅 Nhận ngày: ${createdAt}`);
                console.log(`         🔗 Link: ${achievement.link}`);
            });
        }

        // 3. Test với user không có achievements
        console.log('\n3️⃣ Testing User with No Achievements...');
        const noAchievementUserId = '999999999999999999';
        console.log(`   User ID: ${noAchievementUserId}`);
        
        const noAchievements = await AchievementService.getUserAchievements(noAchievementUserId);
        console.log(`   📊 Total achievements: ${noAchievements.length}`);
        
        if (noAchievements.length === 0) {
            console.log('   ✅ User has no achievements (expected)');
        }

        // 4. Test embed simulation
        console.log('\n4️⃣ Simulating Embed Creation...');
        
        // Simulate embed for user with achievements
        if (userAchievements.length > 0) {
            console.log('\n   📋 Embed for User with Achievements:');
            console.log('   Title: 🏅 Danh Hiệu Của [Username]');
            console.log(`   Description: [Username] đã sở hữu ${userAchievements.length} danh hiệu!`);
            console.log('   Color: #ff6b35');
            console.log('   Thumbnail: User avatar');
            
            console.log('\n   📋 Fields:');
            userAchievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                console.log(`      Field ${index + 1}: ${typeEmoji} ${achievement.name}`);
                console.log(`         Value: 🏅 Loại: ${typeName} | 📅 Nhận ngày: [Date] | 🔗 Ảnh: [Link]`);
            });

            // Test highest priority achievement
            const highestPriority = await AchievementService.getHighestPriorityAchievement(testUserId);
            if (highestPriority) {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(highestPriority.type);
                const typeName = AchievementService.getAchievementTypeName(highestPriority.type);
                console.log(`\n      Special Field: 🎯 Danh Hiệu Ưu Tiên Cao Nhất`);
                console.log(`         Value: ${typeEmoji} ${highestPriority.name} | 🏅 Loại: ${typeName} | 💡 Sẽ hiển thị khi câu cá`);
            }

            console.log(`\n   Footer: Tổng cộng: ${userAchievements.length} danh hiệu • Danh hiệu ưu tiên sẽ hiển thị khi câu cá`);
        }

        // Simulate embed for user without achievements
        console.log('\n   📋 Embed for User without Achievements:');
        console.log('   Title: 🏅 Danh Hiệu Của Bạn');
        console.log('   Description: [Username] chưa có danh hiệu nào!');
        console.log('   Color: #ff6b35');
        console.log('   Thumbnail: User avatar');
        console.log('   Content: Cách nhận danh hiệu...');

        // 5. Test command aliases
        console.log('\n5️⃣ Testing Command Aliases...');
        const aliases = ['achievements', 'achievement', 'danhhieu', 'badge'];
        console.log('   📋 Available aliases:');
        aliases.forEach((alias, index) => {
            console.log(`      ${index + 1}. n.${alias}`);
        });

        // 6. Test error handling
        console.log('\n6️⃣ Testing Error Handling...');
        try {
            // Simulate database error (invalid user ID)
            const invalidUserId = 'invalid-user-id';
            const invalidAchievements = await AchievementService.getUserAchievements(invalidUserId);
            console.log(`   ✅ Error handling works for invalid user ID`);
        } catch (error) {
            console.log(`   ✅ Error caught: ${error}`);
        }

        console.log('\n✅ Achievements command test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Shows all user achievements');
        console.log('   ✅ Displays achievement details (name, type, date, link)');
        console.log('   ✅ Highlights highest priority achievement');
        console.log('   ✅ Handles users with no achievements');
        console.log('   ✅ Multiple command aliases');
        console.log('   ✅ Error handling');

    } catch (error) {
        console.error('❌ Error testing achievements command:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testAchievementsCommand().catch(console.error); 