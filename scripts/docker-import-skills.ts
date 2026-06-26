import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface FishSkillData {
    id: string;
    name: string;
    element: 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark';
    emoji: string;
    description: string;
    baseCost: number;
    baseDamage: number;
    damageMultiplier: number;
    damagePerLevel: number;
    maxLevel: number;
    baseSuccessRate: number;
    successRatePerLevel: number;
    cooldown: number;
    requirements?: {
        level?: number;
        strength?: number;
        agility?: number;
        intelligence?: number;
        defense?: number;
        luck?: number;
        rarity?: string;
    };
    effects?: {
        burn?: number;
        freeze?: number;
        stun?: number;
        heal?: number;
        shield?: number;
    };
}

interface SkillsDataFile {
    skills: FishSkillData[];
    metadata: {
        version: string;
        lastUpdated: string;
        totalSkills: number;
        elements: string[];
        rarityRequirements: string[];
    };
}

async function importSkillsInDocker() {
    try {
        console.log('🐳 Bắt đầu import skills trong Docker...');

        // Đọc file data
        const absolutePath = '/app/data/fish-skills-data.json';
        console.log('📁 Đường dẫn file data:', absolutePath);
        
        const dataContent = fs.readFileSync(absolutePath, 'utf-8');
        const skillsData: SkillsDataFile = JSON.parse(dataContent);

        console.log(`📊 Tìm thấy ${skillsData.skills.length} skills trong file data`);
        console.log(`📅 Phiên bản: ${skillsData.metadata.version}`);
        console.log(`🔄 Cập nhật lần cuối: ${skillsData.metadata.lastUpdated}`);

        let successCount = 0;
        let errorCount = 0;

        // Import từng skill
        for (const skillData of skillsData.skills) {
            try {
                const skill = await prisma.fishSkillDefinition.upsert({
                    where: { id: skillData.id },
                    update: {
                        name: skillData.name,
                        element: skillData.element,
                        emoji: skillData.emoji,
                        description: skillData.description,
                        baseCost: BigInt(skillData.baseCost),
                        baseDamage: skillData.baseDamage,
                        damageMultiplier: skillData.damageMultiplier,
                        damagePerLevel: skillData.damagePerLevel,
                        maxLevel: skillData.maxLevel,
                        baseSuccessRate: skillData.baseSuccessRate,
                        successRatePerLevel: skillData.successRatePerLevel,
                        cooldown: skillData.cooldown,
                        requirements: skillData.requirements ? JSON.stringify(skillData.requirements) : null,
                        effects: skillData.effects ? JSON.stringify(skillData.effects) : null,
                        updatedAt: new Date()
                    },
                    create: {
                        id: skillData.id,
                        name: skillData.name,
                        element: skillData.element,
                        emoji: skillData.emoji,
                        description: skillData.description,
                        baseCost: BigInt(skillData.baseCost),
                        baseDamage: skillData.baseDamage,
                        damageMultiplier: skillData.damageMultiplier,
                        damagePerLevel: skillData.damagePerLevel,
                        maxLevel: skillData.maxLevel,
                        baseSuccessRate: skillData.baseSuccessRate,
                        successRatePerLevel: skillData.successRatePerLevel,
                        cooldown: skillData.cooldown,
                        requirements: skillData.requirements ? JSON.stringify(skillData.requirements) : null,
                        effects: skillData.effects ? JSON.stringify(skillData.effects) : null
                    }
                });

                console.log(`✅ ${skill.name} (${skill.element}) - ${skillData.baseCost} FishCoin`);
                successCount++;
            } catch (error) {
                console.error(`❌ Lỗi khi import skill ${skillData.name}:`, error);
                errorCount++;
            }
        }

        console.log('\n🎉 Hoàn thành import skills!');
        console.log(`✅ Thành công: ${successCount} skills`);
        console.log(`❌ Lỗi: ${errorCount} skills`);
        
        // Hiển thị thống kê
        const totalSkills = await prisma.fishSkillDefinition.count();
        console.log(`📊 Tổng số skills trong database: ${totalSkills}`);

        // Hiển thị skills theo element
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

        // Hiển thị skills theo rarity requirement
        const allSkills = await prisma.fishSkillDefinition.findMany({
            select: {
                name: true,
                requirements: true
            }
        });

        const rarityStats: { [key: string]: number } = {};
        allSkills.forEach(skill => {
            if (skill.requirements) {
                try {
                    const req = JSON.parse(skill.requirements);
                    const rarity = req.rarity || 'common';
                    rarityStats[rarity] = (rarityStats[rarity] || 0) + 1;
                } catch (e) {
                    rarityStats['common'] = (rarityStats['common'] || 0) + 1;
                }
            } else {
                rarityStats['common'] = (rarityStats['common'] || 0) + 1;
            }
        });

        console.log('\n🏆 Thống kê theo rarity requirement:');
        Object.entries(rarityStats).forEach(([rarity, count]) => {
            console.log(`  ${rarity}: ${count} skills`);
        });

    } catch (error) {
        console.error('❌ Lỗi khi import skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    importSkillsInDocker();
}

export default importSkillsInDocker;
