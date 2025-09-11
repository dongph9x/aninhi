export interface FishSkillDefinition {
    id: string;
    name: string;
    element: 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark';
    emoji: string;
    description: string;
    baseCost: number; // Giá FishCoin cơ bản
    baseDamage: number; // Damage cơ bản
    damageMultiplier: number; // Hệ số damage cơ bản
    damagePerLevel: number; // Hệ số tăng damage mỗi cấp
    maxLevel: number;
    baseSuccessRate: number; // Tỷ lệ thành công cơ bản (0-1)
    successRatePerLevel: number; // Tỷ lệ thành công tăng mỗi level
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
        burn?: number; // Tỷ lệ burn
        freeze?: number; // Tỷ lệ freeze
        stun?: number; // Tỷ lệ stun
        heal?: number; // Lượng heal
        shield?: number; // Lượng shield
    };
}

// Import skills data from JSON file
import fs from 'fs';
import path from 'path';

// Load skills data from JSON file
function loadSkillsData(): FishSkillDefinition[] {
    try {
        const dataPath = path.join(__dirname, '../../data/fish-skills-data.json');
        const dataContent = fs.readFileSync(dataPath, 'utf-8');
        const skillsData = JSON.parse(dataContent);
        return skillsData.skills;
    } catch (error) {
        console.error('Error loading skills data:', error);
        // Fallback to basic skills if file not found
        return [
            {
                id: 'absolute_darkness',
                name: 'Hắc Ám Tuyệt Đối',
                element: 'dark',
                emoji: '<a:pixel_skill_bong_ma:1415338985873735804>',
                description: 'Triệu hồi bóng tối tuyệt đối',
                baseCost: 32000,
                baseDamage: 21,
                damageMultiplier: 2.0,
                damagePerLevel: 0.3,
                maxLevel: 5,
                baseSuccessRate: 0.4,
                successRatePerLevel: 0.12,
                requirements: { level: 27, luck: 120, rarity: 'legendary' },
                effects: {}
            }
        ];
    }
}

export const FISH_SKILLS: FishSkillDefinition[] = loadSkillsData();

// Helper functions
export class FishSkillHelper {
    /**
     * Tính damage của skill theo level
     */
    static calculateSkillDamage(skill: FishSkillDefinition, level: number): number {
        const baseDamage = skill.baseDamage;
        const multiplier = skill.damageMultiplier;
        const perLevel = skill.damagePerLevel;
        
        return Math.floor(baseDamage * multiplier * (1 + (level - 1) * perLevel));
    }

    /**
     * Tính success rate của skill theo level
     */
    static calculateSkillSuccessRate(skill: FishSkillDefinition, level: number): number {
        const baseSuccessRate = skill.baseSuccessRate;
        const successRatePerLevel = skill.successRatePerLevel;
        
        const successRate = baseSuccessRate + (level - 1) * successRatePerLevel;
        return Math.min(successRate, 0.95); // Tối đa 95% thành công
    }

    /**
     * Tính cost để nâng cấp skill
     */
    static calculateUpgradeCost(skill: FishSkillDefinition, currentLevel: number): number {
        return Math.floor(skill.baseCost * Math.pow(1.5, currentLevel - 1));
    }

    /**
     * Lấy skill theo element
     */
    static getSkillsByElement(element: string): FishSkillDefinition[] {
        return FISH_SKILLS.filter(skill => skill.element === element);
    }

    /**
     * Lấy skill theo rarity requirement
     */
    static getSkillsByRarity(rarity: string): FishSkillDefinition[] {
        return FISH_SKILLS.filter(skill => 
            !skill.requirements?.rarity || 
            skill.requirements.rarity === rarity
        );
    }

    /**
     * Kiểm tra cá có thể học skill không
     */
    static canLearnSkill(fish: any, skill: FishSkillDefinition): { canLearn: boolean; reason?: string } {
        const req = skill.requirements;
        if (!req) return { canLearn: true };

        // Parse fish stats nếu là string
        let fishStats = fish.stats;
        if (typeof fishStats === 'string') {
            try {
                fishStats = JSON.parse(fishStats);
            } catch (e) {
                fishStats = {};
            }
        }

        if (req.level && fish.level < req.level) {
            return { canLearn: false, reason: `Cần level ${req.level}` };
        }

        if (req.strength && (fishStats?.strength || 0) < req.strength) {
            return { canLearn: false, reason: `Cần Strength ${req.strength}` };
        }

        if (req.agility && (fishStats?.agility || 0) < req.agility) {
            return { canLearn: false, reason: `Cần Agility ${req.agility}` };
        }

        if (req.intelligence && (fishStats?.intelligence || 0) < req.intelligence) {
            return { canLearn: false, reason: `Cần Intelligence ${req.intelligence}` };
        }

        if (req.defense && (fishStats?.defense || 0) < req.defense) {
            return { canLearn: false, reason: `Cần Defense ${req.defense}` };
        }

        if (req.luck && (fishStats?.luck || 0) < req.luck) {
            return { canLearn: false, reason: `Cần Luck ${req.luck}` };
        }

        if (req.rarity && fish.rarity !== req.rarity) {
            return { canLearn: false, reason: `Cần cá ${req.rarity}` };
        }

        return { canLearn: true };
    }
}
