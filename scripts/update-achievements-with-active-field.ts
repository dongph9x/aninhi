import prisma from '../src/utils/prisma';
import { AchievementService } from '../src/utils/achievement';

async function updateAchievementsWithActiveField() {
    console.log('🔄 Updating Achievements with Active Field...\n');

    try {
        // 1. Kiểm tra trạng thái hiện tại
        const totalAchievements = await prisma.achievement.count();
        console.log(`📊 Total achievements in database: ${totalAchievements}`);

        if (totalAchievements === 0) {
            console.log('✅ No achievements to update!');
            return;
        }

        // 2. Lấy tất cả achievements
        const achievements = await prisma.achievement.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log('\n📋 Current achievements:');
        achievements.forEach((achievement, index) => {
            const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
            const typeName = typeNames[achievement.type] || 'Unknown';
            console.log(`   ${index + 1}. ${achievement.name} (${typeName}) - User: ${achievement.target} - Active: ${achievement.active}`);
        });

        // 3. Cập nhật active field cho từng user
        const userGroups = new Map<string, any[]>();
        
        // Nhóm achievements theo user
        achievements.forEach(achievement => {
            if (!userGroups.has(achievement.target)) {
                userGroups.set(achievement.target, []);
            }
            userGroups.get(achievement.target)!.push(achievement);
        });

        console.log(`\n👥 Found ${userGroups.size} users with achievements`);

        // 4. Cập nhật active field cho từng user
        let updatedCount = 0;
        
        for (const [userId, userAchievements] of userGroups) {
            console.log(`\n🔄 Processing user ${userId}:`);
            console.log(`   📊 Has ${userAchievements.length} achievements`);
            
            // Sắp xếp theo priority (type thấp nhất = priority cao nhất)
            const sortedAchievements = userAchievements.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type - b.type; // Type thấp nhất trước
                }
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Cũ nhất trước
            });

            // Deactivate tất cả achievements của user này
            await prisma.achievement.updateMany({
                where: { target: userId },
                data: { active: false }
            });

            // Active achievement có priority cao nhất
            if (sortedAchievements.length > 0) {
                const highestPriorityAchievement = sortedAchievements[0];
                await prisma.achievement.update({
                    where: { id: highestPriorityAchievement.id },
                    data: { active: true }
                });

                const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
                const typeName = typeNames[highestPriorityAchievement.type] || 'Unknown';
                
                console.log(`   ✅ Activated: ${highestPriorityAchievement.name} (${typeName})`);
                updatedCount++;
            }
        }

        // 5. Kiểm tra kết quả
        console.log('\n📊 Final Results:');
        const finalAchievements = await prisma.achievement.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const activeCount = finalAchievements.filter(a => a.active).length;
        const inactiveCount = finalAchievements.filter(a => !a.active).length;

        console.log(`   ✅ Active achievements: ${activeCount}`);
        console.log(`   ❌ Inactive achievements: ${inactiveCount}`);
        console.log(`   📊 Total updated: ${updatedCount} users`);

        // 6. Test AchievementService methods
        console.log('\n🧪 Testing AchievementService methods:');
        
        for (const [userId] of userGroups) {
            const activeAchievements = await AchievementService.getActiveAchievements(userId);
            const hasActive = await AchievementService.hasActiveAchievement(userId);
            const highestPriority = await AchievementService.getHighestPriorityAchievement(userId);
            
            console.log(`   User ${userId}:`);
            console.log(`     Active achievements: ${activeAchievements.length}`);
            console.log(`     Has active: ${hasActive}`);
            console.log(`     Highest priority: ${highestPriority ? highestPriority.name : 'None'}`);
        }

        console.log('\n✅ Achievements update completed successfully!');

    } catch (error) {
        console.error('❌ Error updating achievements:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateAchievementsWithActiveField().catch(console.error); 