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

async function exportSkillsToData() {
    try {
        console.log('🚀 Bắt đầu export skills từ database...');

        // Lấy tất cả skills từ database
        const dbSkills = await prisma.fishSkillDefinition.findMany({
            orderBy: [
                { element: 'asc' },
                { baseCost: 'asc' }
            ]
        });

        console.log(`📊 Tìm thấy ${dbSkills.length} skills trong database`);

        // Chuyển đổi sang format JSON
        const skills: FishSkillData[] = dbSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            element: skill.element as any,
            emoji: skill.emoji,
            description: skill.description,
            baseCost: Number(skill.baseCost),
            baseDamage: skill.baseDamage,
            damageMultiplier: Number(skill.damageMultiplier),
            damagePerLevel: Number(skill.damagePerLevel),
            maxLevel: skill.maxLevel,
            baseSuccessRate: Number(skill.baseSuccessRate),
            successRatePerLevel: Number(skill.successRatePerLevel),
            cooldown: skill.cooldown,
            requirements: skill.requirements ? JSON.parse(skill.requirements) : undefined,
            effects: skill.effects ? JSON.parse(skill.effects) : undefined
        }));

        // Tạo metadata
        const elements = [...new Set(skills.map(s => s.element))];
        const rarityRequirements = [...new Set(
            skills
                .map(s => s.requirements?.rarity)
                .filter(r => r !== undefined)
        )];

        const skillsData: SkillsDataFile = {
            skills,
            metadata: {
                version: "1.0.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                totalSkills: skills.length,
                elements,
                rarityRequirements
            }
        };

        // Ghi file
        const dataPath = path.join(__dirname, '../data/fish-skills-data.json');
        fs.writeFileSync(dataPath, JSON.stringify(skillsData, null, 2), 'utf-8');

        console.log('✅ Đã export skills thành công!');
        console.log(`📁 File: ${dataPath}`);
        console.log(`📊 Tổng số skills: ${skills.length}`);
        console.log(`🎨 Elements: ${elements.join(', ')}`);
        console.log(`🏆 Rarity requirements: ${rarityRequirements.join(', ')}`);

        // Hiển thị thống kê chi tiết
        console.log('\n📈 Thống kê chi tiết:');
        
        // Thống kê theo element
        const elementStats: { [key: string]: number } = {};
        skills.forEach(skill => {
            elementStats[skill.element] = (elementStats[skill.element] || 0) + 1;
        });

        Object.entries(elementStats).forEach(([element, count]) => {
            console.log(`  ${element}: ${count} skills`);
        });

        // Thống kê theo cost range
        const costRanges = [
            { min: 0, max: 5000, label: 'Rẻ (0-5K)' },
            { min: 5001, max: 10000, label: 'Trung bình (5K-10K)' },
            { min: 10001, max: 20000, label: 'Đắt (10K-20K)' },
            { min: 20001, max: 50000, label: 'Rất đắt (20K-50K)' }
        ];

        console.log('\n💰 Thống kê theo giá:');
        costRanges.forEach(range => {
            const count = skills.filter(s => s.baseCost >= range.min && s.baseCost <= range.max).length;
            console.log(`  ${range.label}: ${count} skills`);
        });

        // Thống kê theo rarity requirement
        const rarityStats: { [key: string]: number } = {};
        skills.forEach(skill => {
            const rarity = skill.requirements?.rarity || 'common';
            rarityStats[rarity] = (rarityStats[rarity] || 0) + 1;
        });

        console.log('\n🏆 Thống kê theo rarity requirement:');
        Object.entries(rarityStats).forEach(([rarity, count]) => {
            console.log(`  ${rarity}: ${count} skills`);
        });

    } catch (error) {
        console.error('❌ Lỗi khi export skills:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    exportSkillsToData();
}

export default exportSkillsToData;
