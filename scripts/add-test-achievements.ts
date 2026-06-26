import prisma from '../src/utils/prisma';
import { AchievementService } from '../src/utils/achievement';

async function addTestAchievements() {
    console.log('🏆 Adding Test Achievements...\n');

    try {
        const testUserId = '389957152153796608';
        const testUserId2 = '1397381362763169853';

        // 1. Thêm achievement cho user 1 (type 0 - Top câu cá)
        console.log('1️⃣ Adding Top Fishing Achievement...');
        const topFishingAchievement = await prisma.achievement.create({
            data: {
                name: '🐋👑 𝕍𝕦𝕒 𝔹𝕚𝕖̂̉𝕟 ℂ𝕒̉',
                link: 'https://media.discordapp.net/attachments/1396335030216822875/1398568859987869696/113_137.gif?ex=6885d640&is=688484c0&hm=caa5221123afc40711c4fcfc972f92181fc6ed9fbbc2052d689e7962b6a0e55d&=&width=480&height=184',
                target: testUserId,
                type: 0, // Top câu cá
            }
        });
        console.log(`   ✅ Created: ${topFishingAchievement.name} (Type: ${AchievementService.getAchievementTypeName(topFishingAchievement.type)})`);

        // 2. Thêm achievement cho user 1 (type 1 - Top FishCoin)
        console.log('\n2️⃣ Adding Top FishCoin Achievement...');
        const topFishCoinAchievement = await prisma.achievement.create({
            data: {
                name: '💎🐬 𝓓𝓪̣𝓲 𝓖𝓲𝓪 𝓕𝓲𝓼𝓱𝓒𝓸𝓲𝓷𝓼 🪙',
                link: 'https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif?ex=6885d697&is=68848517&hm=6997312ba231ae7d566ffde7a4176d509ccc9dc85d2ff312934a34508c072e1c&=&width=600&height=168',
                target: testUserId,
                type: 1, // Top FishCoin
            }
        });
        console.log(`   ✅ Created: ${topFishCoinAchievement.name} (Type: ${AchievementService.getAchievementTypeName(topFishCoinAchievement.type)})`);

        // 3. Thêm achievement cho user 2 (type 2 - Top FishBattle)
        console.log('\n3️⃣ Adding Top FishBattle Achievement...');
        const topFishBattleAchievement = await prisma.achievement.create({
            data: {
                name: '⚔️🐟 𝕍𝕦𝕒 ℂ𝕒́ ℂ𝕙𝕠̣𝕚 💀',
                link: 'https://media.discordapp.net/attachments/1396335030216822875/1398569302663368714/113_156.gif?ex=6885d6a9&is=68848529&hm=e67d702c44f4916882ea5cb64940485e0b66aed91f74b7f7f5f6e53934fcd47d&=&width=408&height=192',
                target: testUserId2,
                type: 2, // Top FishBattle
            }
        });
        console.log(`   ✅ Created: ${topFishBattleAchievement.name} (Type: ${AchievementService.getAchievementTypeName(topFishBattleAchievement.type)})`);

        // 4. Kiểm tra priority system
        console.log('\n4️⃣ Testing Priority System...');
        
        // Test user 1 (có nhiều achievement)
        console.log('\n   📋 User 1 Achievements:');
        const user1Achievements = await AchievementService.getUserAchievements(testUserId);
        user1Achievements.forEach((achievement, index) => {
            const typeName = AchievementService.getAchievementTypeName(achievement.type);
            const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
            console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name} (${typeName})`);
        });

        // Test highest priority achievement
        const highestPriority = await AchievementService.getHighestPriorityAchievement(testUserId);
        if (highestPriority) {
            console.log(`\n   🎯 Highest Priority Achievement: ${highestPriority.name} (Type: ${highestPriority.type})`);
            console.log(`   📋 Expected: Type 0 (Top câu cá) should have highest priority`);
        }

        // Test user 2
        console.log('\n   📋 User 2 Achievements:');
        const user2Achievements = await AchievementService.getUserAchievements(testUserId2);
        user2Achievements.forEach((achievement, index) => {
            const typeName = AchievementService.getAchievementTypeName(achievement.type);
            const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
            console.log(`      ${index + 1}. ${typeEmoji} ${achievement.name} (${typeName})`);
        });

        // 5. Test fishing command simulation
        console.log('\n5️⃣ Simulating Fishing Command...');
        
        // Simulate user 1 fishing
        console.log('\n   🎣 User 1 Fishing Simulation:');
        const user1Achievement = await AchievementService.getHighestPriorityAchievement(testUserId);
        if (user1Achievement) {
            console.log(`   🏅 Achievement: ${user1Achievement.name}`);
            console.log(`   🔗 Link: ${user1Achievement.link}`);
            console.log(`   🎨 Embed: Achievement Embed + Fishing Embed`);
            console.log(`   🎯 Priority: Achievement (overrides Admin, Top Fisher, etc.)`);
        }

        // Simulate user 2 fishing
        console.log('\n   🎣 User 2 Fishing Simulation:');
        const user2Achievement = await AchievementService.getHighestPriorityAchievement(testUserId2);
        if (user2Achievement) {
            console.log(`   🏅 Achievement: ${user2Achievement.name}`);
            console.log(`   🔗 Link: ${user2Achievement.link}`);
            console.log(`   🎨 Embed: Achievement Embed + Fishing Embed`);
            console.log(`   🎯 Priority: Achievement (overrides Admin, Top Fisher, etc.)`);
        }

        // 6. Database summary
        console.log('\n6️⃣ Database Summary...');
        const totalAchievements = await prisma.achievement.count();
        console.log(`   📊 Total achievements: ${totalAchievements}`);
        
        const achievementsByType = await prisma.achievement.groupBy({
            by: ['type'],
            _count: { type: true }
        });
        
        console.log('   📋 Achievements by type:');
        achievementsByType.forEach((group) => {
            const typeName = AchievementService.getAchievementTypeName(group.type);
            const typeEmoji = AchievementService.getAchievementTypeEmoji(group.type);
            console.log(`      ${typeEmoji} ${typeName}: ${group._count.type}`);
        });

        console.log('\n✅ Test achievements added successfully!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Test with real fishing command: n.fishing');
        console.log('   2. Verify achievement priority over other roles');
        console.log('   3. Check achievement display in fishing animation');

    } catch (error) {
        console.error('❌ Error adding test achievements:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addTestAchievements().catch(console.error); 