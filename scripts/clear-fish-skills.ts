import prisma from '../src/utils/prisma';

async function clearFishSkills() {
    try {
        console.log('🧹 Clearing Fish Skills...\n');

        const userId = '389957152153796608';
        const guildId = '1005280612845891615';

        // Xóa tất cả fish skills của user
        const deletedSkills = await prisma.fishSkill.deleteMany({
            where: {
                fish: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });

        console.log('✅ Deleted fish skills:', deletedSkills.count);

        // Kiểm tra lại
        const remainingSkills = await prisma.fishSkill.findMany({
            where: {
                fish: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });

        console.log('📋 Remaining fish skills:', remainingSkills.length);

        if (remainingSkills.length === 0) {
            console.log('🎉 All fish skills cleared! Now you can test from scratch.');
        } else {
            console.log('❌ Still have fish skills:', remainingSkills);
        }

    } catch (error) {
        console.error('❌ Error clearing fish skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearFishSkills();
