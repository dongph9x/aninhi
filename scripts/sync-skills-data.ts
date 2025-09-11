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

async function syncSkillsData() {
    try {
        console.log('🔄 Bắt đầu đồng bộ skills data...');

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

        // Lấy skills hiện tại từ database
        const dbSkills = await prisma.fishSkillDefinition.findMany();
        console.log(`📊 Tìm thấy ${dbSkills.length} skills trong database`);

        let addedCount = 0;
        let updatedCount = 0;
        let unchangedCount = 0;

        // Đồng bộ từng skill
        for (const skillData of skillsData.skills) {
            const existingSkill = dbSkills.find(s => s.id === skillData.id);
            
            if (!existingSkill) {
                // Thêm skill mới
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
                console.log(`➕ Thêm mới: ${skillData.name}`);
                addedCount++;
            } else {
                // Kiểm tra có thay đổi không
                const hasChanges = 
                    existingSkill.name !== skillData.name ||
                    existingSkill.element !== skillData.element ||
                    existingSkill.emoji !== skillData.emoji ||
                    existingSkill.description !== skillData.description ||
                    Number(existingSkill.baseCost) !== skillData.baseCost ||
                    existingSkill.baseDamage !== skillData.baseDamage ||
                    Number(existingSkill.damageMultiplier) !== skillData.damageMultiplier ||
                    Number(existingSkill.damagePerLevel) !== skillData.damagePerLevel ||
                    existingSkill.maxLevel !== skillData.maxLevel ||
                    Number(existingSkill.baseSuccessRate) !== skillData.baseSuccessRate ||
                    Number(existingSkill.successRatePerLevel) !== skillData.successRatePerLevel ||
                    existingSkill.cooldown !== skillData.cooldown ||
                    existingSkill.requirements !== (skillData.requirements ? JSON.stringify(skillData.requirements) : null) ||
                    existingSkill.effects !== (skillData.effects ? JSON.stringify(skillData.effects) : null);

                if (hasChanges) {
                    // Cập nhật skill
                    await prisma.fishSkillDefinition.update({
                        where: { id: skillData.id },
                        data: {
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
                        }
                    });
                    console.log(`🔄 Cập nhật: ${skillData.name}`);
                    updatedCount++;
                } else {
                    console.log(`✅ Không đổi: ${skillData.name}`);
                    unchangedCount++;
                }
            }
        }

        // Kiểm tra skills trong database nhưng không có trong file data
        const fileSkillIds = skillsData.skills.map(s => s.id);
        const orphanedSkills = dbSkills.filter(s => !fileSkillIds.includes(s.id));
        
        if (orphanedSkills.length > 0) {
            console.log(`\n⚠️  Tìm thấy ${orphanedSkills.length} skills trong database nhưng không có trong file data:`);
            orphanedSkills.forEach(skill => {
                console.log(`  - ${skill.name} (${skill.id})`);
            });
        }

        console.log('\n🎉 Hoàn thành đồng bộ skills data!');
        console.log(`➕ Thêm mới: ${addedCount} skills`);
        console.log(`🔄 Cập nhật: ${updatedCount} skills`);
        console.log(`✅ Không đổi: ${unchangedCount} skills`);
        
        if (orphanedSkills.length > 0) {
            console.log(`⚠️  Skills không đồng bộ: ${orphanedSkills.length} skills`);
        }

        // Hiển thị tổng số skills
        const totalSkills = await prisma.fishSkillDefinition.count();
        console.log(`📊 Tổng số skills trong database: ${totalSkills}`);

    } catch (error) {
        console.error('❌ Lỗi khi đồng bộ skills data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    syncSkillsData();
}

export default syncSkillsData;
