import prisma from '../src/utils/prisma';

async function addBasicSkills() {
    try {
        console.log('🚀 Adding Basic Skills for Low Level Fish...\n');

        // Thêm skills cơ bản cho fish level thấp
        const basicSkills = [
            {
                id: 'basic_attack',
                name: 'Tấn Công Cơ Bản',
                element: 'fire',
                emoji: '⚔️',
                description: 'Tấn công cơ bản với lửa',
                baseCost: BigInt(1000),
                baseDamage: 5,
                damageMultiplier: 1.0,
                damagePerLevel: 0.1,
                maxLevel: 5,
                baseSuccessRate: 0.8,
                successRatePerLevel: 0.05,
                cooldown: 1,
                requirements: JSON.stringify({ level: 1 }), // Không yêu cầu gì
                effects: JSON.stringify({})
            },
            {
                id: 'water_splash',
                name: 'Vẩy Nước',
                element: 'water',
                emoji: '💦',
                description: 'Vẩy nước đơn giản',
                baseCost: BigInt(1500),
                baseDamage: 3,
                damageMultiplier: 1.0,
                damagePerLevel: 0.08,
                maxLevel: 5,
                baseSuccessRate: 0.9,
                successRatePerLevel: 0.03,
                cooldown: 1,
                requirements: JSON.stringify({ level: 3 }),
                effects: JSON.stringify({})
            },
            {
                id: 'earth_pebble',
                name: 'Ném Đá',
                element: 'earth',
                emoji: '🪨',
                description: 'Ném đá nhỏ',
                baseCost: BigInt(2000),
                baseDamage: 4,
                damageMultiplier: 1.0,
                damagePerLevel: 0.12,
                maxLevel: 5,
                baseSuccessRate: 0.85,
                successRatePerLevel: 0.04,
                cooldown: 2,
                requirements: JSON.stringify({ level: 5 }),
                effects: JSON.stringify({})
            },
            {
                id: 'wind_gust',
                name: 'Cơn Gió',
                element: 'air',
                emoji: '💨',
                description: 'Tạo cơn gió nhẹ',
                baseCost: BigInt(2500),
                baseDamage: 6,
                damageMultiplier: 1.2,
                damagePerLevel: 0.15,
                maxLevel: 5,
                baseSuccessRate: 0.75,
                successRatePerLevel: 0.06,
                cooldown: 2,
                requirements: JSON.stringify({ level: 8 }),
                effects: JSON.stringify({})
            },
            {
                id: 'healing_light',
                name: 'Ánh Sáng Hồi Phục',
                element: 'light',
                emoji: '✨',
                description: 'Ánh sáng hồi phục nhẹ',
                baseCost: BigInt(3000),
                baseDamage: 0,
                damageMultiplier: 1.0,
                damagePerLevel: 0.1,
                maxLevel: 5,
                baseSuccessRate: 0.7,
                successRatePerLevel: 0.08,
                cooldown: 3,
                requirements: JSON.stringify({ level: 10 }),
                effects: JSON.stringify({ heal: 0.1 })
            }
        ];

        for (const skillData of basicSkills) {
            const skill = await prisma.fishSkillDefinition.upsert({
                where: { id: skillData.id },
                update: {},
                create: skillData
            });
            console.log('✅ Added skill:', skill.name);
        }

        console.log('\n🎉 Basic Skills Added Successfully!');
        console.log('Now low level fish can learn skills:');
        console.log('- Tấn Công Cơ Bản (Level 1+)');
        console.log('- Vẩy Nước (Level 3+)');
        console.log('- Ném Đá (Level 5+)');
        console.log('- Cơn Gió (Level 8+)');
        console.log('- Ánh Sáng Hồi Phục (Level 10+)');

    } catch (error) {
        console.error('❌ Error adding basic skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addBasicSkills();
