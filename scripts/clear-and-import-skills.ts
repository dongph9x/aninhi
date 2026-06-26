import prisma from '../src/utils/prisma';
import fs from 'fs';
import path from 'path';

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

async function clearAndImportSkills() {
    try {
        console.log('🚀 Bắt đầu xóa và import lại toàn bộ skills...');

        const dataPath = path.join(__dirname, '../data/fish-skills-data.json');
        
        // Kiểm tra file data có tồn tại không
        if (!fs.existsSync(dataPath)) {
            console.log('❌ File data không tồn tại. Vui lòng tạo file data trước.');
            return;
        }

        // Đọc file data
        const dataContent = fs.readFileSync(dataPath, 'utf-8');
        const skillsData: SkillsDataFile = JSON.parse(dataContent);

        console.log(`📊 Tìm thấy ${skillsData.skills.length} skills trong file data`);
        console.log(`📅 Phiên bản: ${skillsData.metadata.version}`);
        console.log(`🔄 Cập nhật lần cuối: ${skillsData.metadata.lastUpdated}`);

        // Xóa tất cả skills cũ
        console.log('\n🗑️  Đang xóa tất cả skills cũ...');
        
        // Xóa FishSkill trước (foreign key constraint)
        const deletedFishSkills = await prisma.fishSkill.deleteMany({});
        console.log(`✅ Đã xóa ${deletedFishSkills.count} fish skills`);

        // Xóa FishSkillDefinition
        const deletedSkillDefinitions = await prisma.fishSkillDefinition.deleteMany({});
        console.log(`✅ Đã xóa ${deletedSkillDefinitions.count} skill definitions`);

        // Import skills mới
        console.log('\n📥 Đang import skills mới...');
        let successCount = 0;
        let errorCount = 0;

        for (const skillData of skillsData.skills) {
            try {
                await prisma.fishSkillDefinition.create({
                    data: {
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

                console.log(`✅ ${skillData.name} (${skillData.element}) - ${skillData.baseCost} FishCoin`);
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

        // Hiển thị skills theo cost range
        const costRanges = [
            { min: 0, max: 5000, label: 'Rẻ (0-5K)' },
            { min: 5001, max: 10000, label: 'Trung bình (5K-10K)' },
            { min: 10001, max: 20000, label: 'Đắt (10K-20K)' },
            { min: 20001, max: 50000, label: 'Rất đắt (20K-50K)' }
        ];

        console.log('\n💰 Thống kê theo giá:');
        costRanges.forEach(range => {
            const count = skillsData.skills.filter(s => s.baseCost >= range.min && s.baseCost <= range.max).length;
            console.log(`  ${range.label}: ${count} skills`);
        });

    } catch (error) {
        console.error('❌ Lỗi khi xóa và import skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    clearAndImportSkills();
}

export default clearAndImportSkills;
