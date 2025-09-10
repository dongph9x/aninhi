import prisma from '../src/utils/prisma';

async function insertFishSkills() {
    try {
        console.log('🚀 Bắt đầu thêm skills vào database...');

        // Thêm skill "Hắc Ám Tuyệt Đối"
        const skill = await prisma.fishSkillDefinition.upsert({
            where: { id: 'absolute_darkness' },
            update: {},
            create: {
                id: 'absolute_darkness',
                name: 'Hắc Ám Tuyệt Đối',
                element: 'dark',
                emoji: '<a:pixel_skill_bong_ma:1415338985873735804>',
                description: 'Triệu hồi bóng tối tuyệt đối',
                baseCost: BigInt(32000),
                baseDamage: 21,
                damageMultiplier: 2.0,
                damagePerLevel: 0.3,
                maxLevel: 5,
                baseSuccessRate: 0.4, // 40% thành công
                successRatePerLevel: 0.12, // +12% mỗi level
                cooldown: 3,
                requirements: JSON.stringify({ level: 27, luck: 120, rarity: 'legendary' }),
                effects: JSON.stringify({})
            }
        });

        console.log('✅ Đã thêm skill:', skill.name);

        // Thêm một số skills khác để test
        const additionalSkills = [
            {
                id: 'fire_blast',
                name: 'Lửa Thiêu Đốt',
                element: 'fire',
                emoji: '🔥',
                description: 'Tấn công bằng lửa mạnh mẽ',
                baseCost: BigInt(5000),
                baseDamage: 15,
                damageMultiplier: 1.5,
                damagePerLevel: 0.2,
                maxLevel: 5,
                baseSuccessRate: 0.6,
                successRatePerLevel: 0.08,
                cooldown: 2,
                requirements: JSON.stringify({ level: 10, strength: 50 }),
                effects: JSON.stringify({ burn: 0.1 })
            },
            {
                id: 'water_heal',
                name: 'Hồi Phục Nước',
                element: 'water',
                emoji: '💧',
                description: 'Hồi phục HP bằng nước',
                baseCost: BigInt(8000),
                baseDamage: 0,
                damageMultiplier: 1.0,
                damagePerLevel: 0.15,
                maxLevel: 5,
                baseSuccessRate: 0.7,
                successRatePerLevel: 0.1,
                cooldown: 4,
                requirements: JSON.stringify({ level: 15, intelligence: 80 }),
                effects: JSON.stringify({ heal: 0.2 })
            },
            {
                id: 'earth_shield',
                name: 'Khiên Đất',
                element: 'earth',
                emoji: '🪨',
                description: 'Tạo khiên bảo vệ bằng đất',
                baseCost: BigInt(12000),
                baseDamage: 0,
                damageMultiplier: 1.0,
                damagePerLevel: 0.1,
                maxLevel: 5,
                baseSuccessRate: 0.8,
                successRatePerLevel: 0.05,
                cooldown: 5,
                requirements: JSON.stringify({ level: 20, defense: 100 }),
                effects: JSON.stringify({ shield: 0.3 })
            }
        ];

        for (const skillData of additionalSkills) {
            const skill = await prisma.fishSkillDefinition.upsert({
                where: { id: skillData.id },
                update: {},
                create: skillData
            });
            console.log('✅ Đã thêm skill:', skill.name);
        }

        console.log('🎉 Hoàn thành thêm skills vào database!');
        
        // Hiển thị tổng số skills
        const totalSkills = await prisma.fishSkillDefinition.count();
        console.log(`📊 Tổng số skills trong database: ${totalSkills}`);

    } catch (error) {
        console.error('❌ Lỗi khi thêm skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

insertFishSkills();
