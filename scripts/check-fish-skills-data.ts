import prisma from '../src/utils/prisma';

async function checkFishSkillsData() {
    try {
        console.log('🔍 Checking Fish Skills Data...\n');

        const userId = '389957152153796608';
        const guildId = '1005280612845891615';

        // Lấy tất cả fish skills của user
        const fishSkills = await prisma.fishSkill.findMany({
            where: {
                fish: {
                    userId: userId,
                    guildId: guildId
                }
            },
            include: {
                fish: true,
                skillDefinition: true
            }
        });

        console.log('📋 Fish Skills trong database:');
        console.log('- Total skills:', fishSkills.length);

        for (const fishSkill of fishSkills) {
            console.log(`\n🐟 Fish: ${fishSkill.fish.species} (${fishSkill.fish.id})`);
            console.log(`- Skill: ${fishSkill.skillDefinition.name}`);
            console.log(`- Level: ${fishSkill.level}`);
            console.log(`- Learned at: ${fishSkill.learnedAt}`);
        }

        // Kiểm tra fish cụ thể
        const specificFishId = 'cmf7lg6i6001ksx772z19svek';
        const specificFishSkills = await prisma.fishSkill.findMany({
            where: { fishId: specificFishId },
            include: { skillDefinition: true }
        });

        console.log(`\n🎯 Skills của fish ${specificFishId}:`);
        console.log('- Count:', specificFishSkills.length);
        for (const skill of specificFishSkills) {
            console.log(`- ${skill.skillDefinition.name} (Lv.${skill.level})`);
        }

        // Kiểm tra tất cả fish skills trong database
        const allFishSkills = await prisma.fishSkill.findMany({
            include: {
                fish: true,
                skillDefinition: true
            }
        });

        console.log('\n🌍 Tất cả Fish Skills trong database:');
        console.log('- Total:', allFishSkills.length);
        for (const fishSkill of allFishSkills) {
            console.log(`- User: ${fishSkill.fish.userId} | Fish: ${fishSkill.fish.species} | Skill: ${fishSkill.skillDefinition.name}`);
        }

    } catch (error) {
        console.error('❌ Error checking fish skills data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFishSkillsData();
