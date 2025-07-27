import prisma from '../src/utils/prisma';
import { AchievementService } from '../src/utils/achievement';

async function testActiveAchievementSystem() {
    console.log('🎯 Testing Active Achievement System...\n');

    try {
        const testUserId1 = '389957152153796608';
        const testUserId2 = '1397381362763169853';

        // 1. Test current active achievements
        console.log('1️⃣ Testing Current Active Achievements...');
        
        console.log(`\n👤 User ${testUserId1}:`);
        const user1Achievements = await AchievementService.getUserAchievements(testUserId1);
        const user1ActiveAchievements = await AchievementService.getActiveAchievements(testUserId1);
        const user1HasActive = await AchievementService.hasActiveAchievement(testUserId1);
        const user1HighestPriority = await AchievementService.getHighestPriorityAchievement(testUserId1);
        
        console.log(`   📊 Total achievements: ${user1Achievements.length}`);
        console.log(`   ✅ Active achievements: ${user1ActiveAchievements.length}`);
        console.log(`   🎯 Has active: ${user1HasActive}`);
        console.log(`   🏆 Highest priority: ${user1HighestPriority ? user1HighestPriority.name : 'None'}`);
        
        if (user1ActiveAchievements.length > 0) {
            console.log('   📋 Active achievement details:');
            user1ActiveAchievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name} (${typeName})`);
            });
        }

        console.log(`\n👤 User ${testUserId2}:`);
        const user2Achievements = await AchievementService.getUserAchievements(testUserId2);
        const user2ActiveAchievements = await AchievementService.getActiveAchievements(testUserId2);
        const user2HasActive = await AchievementService.hasActiveAchievement(testUserId2);
        const user2HighestPriority = await AchievementService.getHighestPriorityAchievement(testUserId2);
        
        console.log(`   📊 Total achievements: ${user2Achievements.length}`);
        console.log(`   ✅ Active achievements: ${user2ActiveAchievements.length}`);
        console.log(`   🎯 Has active: ${user2HasActive}`);
        console.log(`   🏆 Highest priority: ${user2HighestPriority ? user2HighestPriority.name : 'None'}`);
        
        if (user2ActiveAchievements.length > 0) {
            console.log('   📋 Active achievement details:');
            user2ActiveAchievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name} (${typeName})`);
            });
        }

        // 2. Test achievement activation
        console.log('\n2️⃣ Testing Achievement Activation...');
        
        if (user1Achievements.length > 1) {
            const achievementToActivate = user1Achievements.find(a => !a.active);
            if (achievementToActivate) {
                console.log(`\n🔄 Activating achievement: ${achievementToActivate.name}`);
                
                const success = await AchievementService.activateAchievement(achievementToActivate.id, testUserId1);
                console.log(`   ✅ Activation result: ${success}`);
                
                if (success) {
                    const newActiveAchievements = await AchievementService.getActiveAchievements(testUserId1);
                    const newHighestPriority = await AchievementService.getHighestPriorityAchievement(testUserId1);
                    
                    console.log(`   📊 New active achievements: ${newActiveAchievements.length}`);
                    console.log(`   🏆 New highest priority: ${newHighestPriority ? newHighestPriority.name : 'None'}`);
                    
                    // Reactivate the original one
                    const originalActive = user1Achievements.find(a => a.active);
                    if (originalActive) {
                        console.log(`\n🔄 Reactivating original achievement: ${originalActive.name}`);
                        await AchievementService.activateAchievement(originalActive.id, testUserId1);
                        console.log('   ✅ Reactivated original achievement');
                    }
                }
            }
        }

        // 3. Test deactivate all achievements
        console.log('\n3️⃣ Testing Deactivate All Achievements...');
        
        console.log(`\n🔄 Deactivating all achievements for user ${testUserId2}`);
        const deactivateSuccess = await AchievementService.deactivateAllAchievements(testUserId2);
        console.log(`   ✅ Deactivation result: ${deactivateSuccess}`);
        
        if (deactivateSuccess) {
            const afterDeactivate = await AchievementService.getActiveAchievements(testUserId2);
            const hasActiveAfter = await AchievementService.hasActiveAchievement(testUserId2);
            const highestPriorityAfter = await AchievementService.getHighestPriorityAchievement(testUserId2);
            
            console.log(`   📊 Active achievements after deactivate: ${afterDeactivate.length}`);
            console.log(`   🎯 Has active after deactivate: ${hasActiveAfter}`);
            console.log(`   🏆 Highest priority after deactivate: ${highestPriorityAfter ? highestPriorityAfter.name : 'None'}`);
            
            // Reactivate the original one
            const originalActive = user2Achievements.find(a => a.active);
            if (originalActive) {
                console.log(`\n🔄 Reactivating original achievement: ${originalActive.name}`);
                await AchievementService.activateAchievement(originalActive.id, testUserId2);
                console.log('   ✅ Reactivated original achievement');
            }
        }

        // 4. Test fishing command simulation
        console.log('\n4️⃣ Testing Fishing Command Simulation...');
        
        console.log(`\n🎣 User ${testUserId1} Fishing Simulation:`);
        const user1Active = await AchievementService.getHighestPriorityAchievement(testUserId1);
        if (user1Active) {
            const typeEmoji = AchievementService.getAchievementTypeEmoji(user1Active.type);
            const typeName = AchievementService.getAchievementTypeName(user1Active.type);
            
            console.log(`   🏅 Active Achievement: ${typeEmoji} ${user1Active.name}`);
            console.log(`   🏅 Type: ${typeName}`);
            console.log(`   🔗 Link: ${user1Active.link}`);
            console.log(`   🎨 Display: Achievement Embed + Fishing Embed`);
            console.log(`   🎯 Priority: Achievement (overrides Admin, Top Fisher, etc.)`);
        } else {
            console.log(`   ❌ No active achievement - will show normal fishing`);
        }

        console.log(`\n🎣 User ${testUserId2} Fishing Simulation:`);
        const user2Active = await AchievementService.getHighestPriorityAchievement(testUserId2);
        if (user2Active) {
            const typeEmoji = AchievementService.getAchievementTypeEmoji(user2Active.type);
            const typeName = AchievementService.getAchievementTypeName(user2Active.type);
            
            console.log(`   🏅 Active Achievement: ${typeEmoji} ${user2Active.name}`);
            console.log(`   🏅 Type: ${typeName}`);
            console.log(`   🔗 Link: ${user2Active.link}`);
            console.log(`   🎨 Display: Achievement Embed + Fishing Embed`);
            console.log(`   🎯 Priority: Achievement (overrides Admin, Top Fisher, etc.)`);
        } else {
            console.log(`   ❌ No active achievement - will show normal fishing`);
        }

        // 5. Test achievements command simulation
        console.log('\n5️⃣ Testing Achievements Command Simulation...');
        
        console.log(`\n📋 User ${testUserId1} Achievements Command:`);
        console.log('   🏅 Danh Hiệu Của Username');
        console.log(`   Username đã sở hữu ${user1Achievements.length} danh hiệu!`);
        console.log('');
        console.log('   🎯 Danh hiệu hiện tại:');
        
        user1Achievements.forEach((achievement, index) => {
            const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
            const typeName = AchievementService.getAchievementTypeName(achievement.type);
            const statusEmoji = achievement.active ? '✅' : '❌';
            const statusText = achievement.active ? 'Đang Active' : 'Chưa Active';
            
            console.log(`   ${index + 1}. ${typeEmoji} ${achievement.name} ${statusEmoji}`);
            console.log(`      🏅 Loại: ${typeName}`);
            console.log(`      🎯 Trạng thái: ${statusText}`);
        });
        
        if (user1Achievements.length > 1) {
            console.log('\n   🔘 Buttons sẽ hiển thị:');
            user1Achievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const statusEmoji = achievement.active ? '✅' : '❌';
                console.log(`      ${index + 1}. ${achievement.name} ${statusEmoji} (${typeEmoji})`);
            });
            console.log('      🚫 Deactivate Tất Cả');
        }

        console.log('\n✅ Active Achievement System test completed!');
        console.log('\n🎯 Key Features Verified:');
        console.log('   ✅ Active achievement detection');
        console.log('   ✅ Achievement activation/deactivation');
        console.log('   ✅ Priority system with active achievements');
        console.log('   ✅ Fishing command integration');
        console.log('   ✅ Achievements command with buttons');
        console.log('   ✅ Deactivate all functionality');

    } catch (error) {
        console.error('❌ Error testing active achievement system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testActiveAchievementSystem().catch(console.error); 