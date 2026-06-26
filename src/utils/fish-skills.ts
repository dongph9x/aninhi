import prisma from './prisma';
import { FISH_SKILLS, FishSkillDefinition, FishSkillHelper } from '@/config/fish-skills';

export interface FishSkillData {
    id: string;
    skillId: string;
    level: number;
    learnedAt: Date;
    lastUsed?: Date;
    skillDefinition: FishSkillDefinition;
}

export interface SkillUpgradeResult {
    success: boolean;
    error?: string;
    newLevel?: number;
    cost?: number;
}

export class FishSkillService {
    /**
     * Lấy tất cả skills của cá
     */
    static async getFishSkills(fishId: string): Promise<FishSkillData[]> {
        try {
            const fishSkills = await prisma.fishSkill.findMany({
                where: { fishId },
                include: {
                    skillDefinition: true
                }
            });

            return fishSkills.map(fishSkill => {
                const skillDef = fishSkill.skillDefinition;
                return {
                    id: fishSkill.id,
                    skillId: fishSkill.skillId,
                    level: fishSkill.level,
                    learnedAt: fishSkill.learnedAt,
                    lastUsed: fishSkill.lastUsed,
                    skillDefinition: {
                        id: skillDef.id,
                        name: skillDef.name,
                        element: skillDef.element as any,
                        emoji: skillDef.emoji,
                        description: skillDef.description,
                        baseCost: Number(skillDef.baseCost),
                        baseDamage: skillDef.baseDamage,
                        damageMultiplier: Number(skillDef.damageMultiplier),
                        damagePerLevel: Number(skillDef.damagePerLevel),
                        maxLevel: skillDef.maxLevel,
                        baseSuccessRate: Number(skillDef.baseSuccessRate),
                        successRatePerLevel: Number(skillDef.successRatePerLevel),
                        requirements: skillDef.requirements ? JSON.parse(skillDef.requirements) : undefined,
                        effects: skillDef.effects ? JSON.parse(skillDef.effects) : undefined
                    }
                };
            });
        } catch (error) {
            console.error('Error getting fish skills:', error);
            return [];
        }
    }

    /**
     * Học skill mới cho cá
     */
    static async learnSkill(fishId: string, skillId: string, userId: string, guildId: string): Promise<SkillUpgradeResult> {
        try {
            // Kiểm tra cá có tồn tại không
            const fish = await prisma.fish.findFirst({
                where: { id: fishId, userId, guildId }
            });

            if (!fish) {
                return { success: false, error: 'Không tìm thấy cá hoặc bạn không sở hữu cá này!' };
            }

            // Kiểm tra skill có tồn tại không
            const skillDefinition = await prisma.fishSkillDefinition.findUnique({
                where: { id: skillId }
            });
            if (!skillDefinition) {
                return { success: false, error: 'Skill không tồn tại!' };
            }

            // Kiểm tra cá đã học skill này chưa
            const existingSkill = await prisma.fishSkill.findFirst({
                where: { fishId, skillId }
            });

            if (existingSkill) {
                return { success: false, error: 'Cá đã học skill này rồi!' };
            }

            // Kiểm tra cá đã có skill nào chưa (quy tắc 1 cá = 1 skill)
            const fishSkills = await prisma.fishSkill.findMany({
                where: { fishId }
            });

            if (fishSkills.length > 0) {
                return { success: false, error: 'Cá đã có skill rồi! Mỗi cá chỉ học được 1 skill duy nhất.' };
            }

            // Đơn giản: chỉ cần có tiền và cá chưa có skill
            // Không cần kiểm tra requirements phức tạp

            // Kiểm tra FishCoin
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!user || user.fishBalance < skillDefinition.baseCost) {
                return { 
                    success: false, 
                    error: `Không đủ FishCoin! Cần ${Number(skillDefinition.baseCost).toLocaleString()} FishCoin` 
                };
            }

            // Thực hiện giao dịch
            await prisma.$transaction(async (tx) => {
                // Trừ FishCoin
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { fishBalance: { decrement: skillDefinition.baseCost } }
                });

                // Thêm skill cho cá
                await tx.fishSkill.create({
                    data: {
                        fishId,
                        skillId,
                        level: 1
                    }
                });

                // Ghi lại giao dịch
                await tx.fishTransaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: -skillDefinition.baseCost,
                        type: 'skill_learn',
                        description: `Học skill ${skillDefinition.name} cho cá ${fish.species}`
                    }
                });
            });

            return { success: true, newLevel: 1, cost: Number(skillDefinition.baseCost) };
        } catch (error) {
            console.error('Error learning skill:', error);
            return { success: false, error: 'Có lỗi xảy ra khi học skill!' };
        }
    }

    /**
     * Nâng cấp skill của cá
     */
    static async upgradeSkill(fishId: string, skillId: string, userId: string, guildId: string): Promise<SkillUpgradeResult> {
        try {
            // Kiểm tra cá có tồn tại không
            const fish = await prisma.fish.findFirst({
                where: { id: fishId, userId, guildId }
            });

            if (!fish) {
                return { success: false, error: 'Không tìm thấy cá hoặc bạn không sở hữu cá này!' };
            }

            // Kiểm tra skill có tồn tại không
            const skillDefinition = FISH_SKILLS.find(s => s.id === skillId);
            if (!skillDefinition) {
                return { success: false, error: 'Skill không tồn tại!' };
            }

            // Kiểm tra cá đã học skill này chưa
            const existingSkill = await prisma.fishSkill.findFirst({
                where: { fishId, skillId }
            });

            if (!existingSkill) {
                return { success: false, error: 'Cá chưa học skill này!' };
            }

            // Kiểm tra đã đạt level tối đa chưa
            if (existingSkill.level >= skillDefinition.maxLevel) {
                return { success: false, error: 'Skill đã đạt level tối đa!' };
            }

            // Tính cost nâng cấp
            const upgradeCost = FishSkillHelper.calculateUpgradeCost(skillDefinition, existingSkill.level);

            // Kiểm tra FishCoin
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!user || user.fishBalance < upgradeCost) {
                return { 
                    success: false, 
                    error: `Không đủ FishCoin! Cần ${upgradeCost.toLocaleString()} FishCoin` 
                };
            }

            // Thực hiện giao dịch
            await prisma.$transaction(async (tx) => {
                // Trừ FishCoin
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { fishBalance: { decrement: upgradeCost } }
                });

                // Nâng cấp skill
                await tx.fishSkill.update({
                    where: { id: existingSkill.id },
                    data: { level: existingSkill.level + 1 }
                });

                // Ghi lại giao dịch
                await tx.fishTransaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: -upgradeCost,
                        type: 'skill_upgrade',
                        description: `Nâng cấp skill ${skillDefinition.name} lên level ${existingSkill.level + 1} cho cá ${fish.species}`
                    }
                });
            });

            return { 
                success: true, 
                newLevel: existingSkill.level + 1, 
                cost: upgradeCost 
            };
        } catch (error) {
            console.error('Error upgrading skill:', error);
            return { success: false, error: 'Có lỗi xảy ra khi nâng cấp skill!' };
        }
    }

    /**
     * Quên skill của cá
     */
    static async forgetSkill(fishId: string, skillId: string, userId: string, guildId: string): Promise<SkillUpgradeResult> {
        try {
            // Kiểm tra cá có tồn tại không
            const fish = await prisma.fish.findFirst({
                where: { id: fishId, userId, guildId }
            });

            if (!fish) {
                return { success: false, error: 'Không tìm thấy cá hoặc bạn không sở hữu cá này!' };
            }

            // Kiểm tra cá có skill này không
            const existingSkill = await prisma.fishSkill.findFirst({
                where: { fishId, skillId }
            });

            if (!existingSkill) {
                return { success: false, error: 'Cá không có skill này!' };
            }

            // Tính FishCoin hoàn lại (50% cost đã bỏ ra)
            const skillDefinition = FISH_SKILLS.find(s => s.id === skillId)!;
            let totalCost = skillDefinition.baseCost;
            
            for (let i = 1; i < existingSkill.level; i++) {
                totalCost += FishSkillHelper.calculateUpgradeCost(skillDefinition, i);
            }
            
            const refundAmount = Math.floor(totalCost * 0.5);

            // Thực hiện giao dịch
            await prisma.$transaction(async (tx) => {
                // Hoàn lại FishCoin
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { fishBalance: { increment: refundAmount } }
                });

                // Xóa skill
                await tx.fishSkill.delete({
                    where: { id: existingSkill.id }
                });

                // Ghi lại giao dịch
                await tx.fishTransaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: refundAmount,
                        type: 'skill_forget',
                        description: `Quên skill ${skillDefinition.name}, hoàn lại ${refundAmount.toLocaleString()} FishCoin cho cá ${fish.species}`
                    }
                });
            });

            return { success: true, cost: refundAmount };
        } catch (error) {
            console.error('Error forgetting skill:', error);
            return { success: false, error: 'Có lỗi xảy ra khi quên skill!' };
        }
    }

    /**
     * Lấy skills có thể học cho cá
     */
    static async getAvailableSkills(fishId: string, userId: string, guildId: string): Promise<FishSkillDefinition[]> {
        try {
            // Kiểm tra cá có tồn tại không
            const fish = await prisma.fish.findFirst({
                where: { id: fishId, userId, guildId }
            });

            if (!fish) {
                return [];
            }

            // Lấy skills đã học
            const learnedSkills = await prisma.fishSkill.findMany({
                where: { fishId },
                select: { skillId: true }
            });

            const learnedSkillIds = learnedSkills.map(s => s.skillId);

            // Lấy tất cả skills từ database
            const allSkills = await prisma.fishSkillDefinition.findMany();
            
            // Lọc ra skills chưa học và có thể học
            return allSkills.filter(skillDef => {
                if (learnedSkillIds.includes(skillDef.id)) return false;
                
                const skillForCheck = {
                    id: skillDef.id,
                    name: skillDef.name,
                    element: skillDef.element as any,
                    emoji: skillDef.emoji,
                    description: skillDef.description,
                    baseCost: Number(skillDef.baseCost),
                    baseDamage: skillDef.baseDamage,
                    damageMultiplier: Number(skillDef.damageMultiplier),
                    damagePerLevel: Number(skillDef.damagePerLevel),
                    maxLevel: skillDef.maxLevel,
                    baseSuccessRate: Number(skillDef.baseSuccessRate),
                    successRatePerLevel: Number(skillDef.successRatePerLevel),
                    requirements: skillDef.requirements ? JSON.parse(skillDef.requirements) : undefined,
                    effects: skillDef.effects ? JSON.parse(skillDef.effects) : undefined
                };
                
                const canLearn = FishSkillHelper.canLearnSkill(fish, skillForCheck);
                return canLearn.canLearn;
            }).map(skillDef => ({
                id: skillDef.id,
                name: skillDef.name,
                element: skillDef.element as any,
                emoji: skillDef.emoji,
                description: skillDef.description,
                baseCost: Number(skillDef.baseCost),
                baseDamage: skillDef.baseDamage,
                damageMultiplier: Number(skillDef.damageMultiplier),
                damagePerLevel: Number(skillDef.damagePerLevel),
                maxLevel: skillDef.maxLevel,
                baseSuccessRate: Number(skillDef.baseSuccessRate),
                successRatePerLevel: Number(skillDef.successRatePerLevel),
                requirements: skillDef.requirements ? JSON.parse(skillDef.requirements) : undefined,
                effects: skillDef.effects ? JSON.parse(skillDef.effects) : undefined
            }));
        } catch (error) {
            console.error('Error getting available skills:', error);
            return [];
        }
    }

    /**
     * Tính damage của skill trong battle
     */
    static calculateSkillDamage(skillId: string, level: number, fishStats: any): number {
        const skillDefinition = FISH_SKILLS.find(s => s.id === skillId);
        if (!skillDefinition) return 0;

        const baseDamage = FishSkillHelper.calculateSkillDamage(skillDefinition, level);
        
        // Tính bonus từ stats
        let statBonus = 0;
        switch (skillDefinition.element) {
            case 'fire':
                statBonus = (fishStats.strength || 0) * 0.5;
                break;
            case 'water':
                statBonus = (fishStats.agility || 0) * 0.5;
                break;
            case 'earth':
                statBonus = (fishStats.strength || 0) * 0.3 + (fishStats.defense || 0) * 0.2;
                break;
            case 'air':
                statBonus = (fishStats.agility || 0) * 0.3 + (fishStats.intelligence || 0) * 0.2;
                break;
            case 'light':
                statBonus = (fishStats.intelligence || 0) * 0.6;
                break;
            case 'dark':
                statBonus = (fishStats.intelligence || 0) * 0.4 + (fishStats.strength || 0) * 0.2;
                break;
        }

        return Math.floor(baseDamage + statBonus);
    }

    /**
     * Kiểm tra cooldown của skill
     */
    static async isSkillOnCooldown(fishId: string, skillId: string): Promise<boolean> {
        try {
            const fishSkill = await prisma.fishSkill.findFirst({
                where: { fishId, skillId }
            });

            if (!fishSkill || !fishSkill.lastUsed) return false;

            const skillDefinition = FISH_SKILLS.find(s => s.id === skillId);
            if (!skillDefinition) return false;

            const cooldownMs = skillDefinition.cooldown * 1000; // Convert to milliseconds
            const timeSinceLastUse = Date.now() - fishSkill.lastUsed.getTime();

            return timeSinceLastUse < cooldownMs;
        } catch (error) {
            console.error('Error checking skill cooldown:', error);
            return false;
        }
    }

    /**
     * Cập nhật thời gian sử dụng skill
     */
    static async updateSkillUsage(fishId: string, skillId: string): Promise<void> {
        try {
            await prisma.fishSkill.updateMany({
                where: { fishId, skillId },
                data: { lastUsed: new Date() }
            });
        } catch (error) {
            console.error('Error updating skill usage:', error);
        }
    }

    /**
     * Lấy tất cả skill definitions từ database
     */
    static async getAllSkillDefinitions(): Promise<FishSkillDefinition[]> {
        try {
            const skills = await prisma.fishSkillDefinition.findMany();
            return skills.map(skillDef => ({
                id: skillDef.id,
                name: skillDef.name,
                element: skillDef.element as any,
                emoji: skillDef.emoji,
                description: skillDef.description,
                baseCost: Number(skillDef.baseCost),
                baseDamage: skillDef.baseDamage,
                damageMultiplier: Number(skillDef.damageMultiplier),
                damagePerLevel: Number(skillDef.damagePerLevel),
                maxLevel: skillDef.maxLevel,
                baseSuccessRate: Number(skillDef.baseSuccessRate),
                successRatePerLevel: Number(skillDef.successRatePerLevel),
                requirements: skillDef.requirements ? JSON.parse(skillDef.requirements) : undefined,
                effects: skillDef.effects ? JSON.parse(skillDef.effects) : undefined
            }));
        } catch (error) {
            console.error('Error getting all skill definitions:', error);
            return [];
        }
    }

    /**
     * Lấy skill definition theo ID từ database
     */
    static async getSkillDefinition(skillId: string): Promise<FishSkillDefinition | null> {
        try {
            const skillDef = await prisma.fishSkillDefinition.findUnique({
                where: { id: skillId }
            });
            
            if (!skillDef) return null;
            
            return {
                id: skillDef.id,
                name: skillDef.name,
                element: skillDef.element as any,
                emoji: skillDef.emoji,
                description: skillDef.description,
                baseCost: Number(skillDef.baseCost),
                baseDamage: skillDef.baseDamage,
                damageMultiplier: Number(skillDef.damageMultiplier),
                damagePerLevel: Number(skillDef.damagePerLevel),
                maxLevel: skillDef.maxLevel,
                baseSuccessRate: Number(skillDef.baseSuccessRate),
                successRatePerLevel: Number(skillDef.successRatePerLevel),
                requirements: skillDef.requirements ? JSON.parse(skillDef.requirements) : undefined,
                effects: skillDef.effects ? JSON.parse(skillDef.effects) : undefined
            };
        } catch (error) {
            console.error('Error getting skill definition:', error);
            return null;
        }
    }
}
