import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSkillsInDocker() {
    try {
        console.log('🔍 Kiểm tra skills trong Docker...');

        // Đếm tổng số skills
        const totalSkills = await prisma.fishSkillDefinition.count();
        console.log(`📊 Tổng số skills trong database: ${totalSkills}`);

        if (totalSkills === 0) {
            console.log('❌ Không có skills nào trong database!');
            return;
        }

        // Lấy tất cả skills
        const skills = await prisma.fishSkillDefinition.findMany({
            select: {
                id: true,
                name: true,
                element: true,
                emoji: true,
                baseCost: true
            }
        });

        console.log('\n📋 Danh sách skills:');
        skills.forEach((skill, index) => {
            console.log(`${index + 1}. ${skill.emoji} ${skill.name} (${skill.element}) - ${skill.baseCost} FishCoin`);
        });

        // Thống kê theo element
        const skillsByElement = await prisma.fishSkillDefinition.groupBy({
            by: ['element'],
            _count: {
                element: true
            }
        });

        console.log('\n📈 Thống kê theo element:');
        skillsByElement.forEach(group => {
            console.log(`  ${group.element}: ${group._count.element} skills`);
        });

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    checkSkillsInDocker();
}

export default checkSkillsInDocker;
