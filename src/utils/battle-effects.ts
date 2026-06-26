/**
 * 🎭 Battle Effects System
 * Hệ thống effects cho skills trong trận đấu
 */

export interface BattleEffect {
    id: string;
    name: string;
    type: 'debuff' | 'buff' | 'status';
    duration: number; // Số rounds
    intensity?: number; // Cường độ effect
    description: string;
}

export interface BattleEffectState {
    effects: Map<string, BattleEffect>; // effectId -> BattleEffect
    activeEffects: Map<string, number>; // effectId -> rounds remaining
}

export interface EffectResult {
    success: boolean;
    effectApplied: BattleEffect | null;
    message: string;
    damage?: number;
    healing?: number;
    statChanges?: {
        strength?: number;
        agility?: number;
        intelligence?: number;
        defense?: number;
        accuracy?: number;
    };
}

/**
 * 🎭 Battle Effects Service
 * Quản lý tất cả effects trong trận đấu
 */
export class BattleEffectsService {
    
    /**
     * 📋 Danh sách tất cả effects có sẵn
     */
    private static readonly AVAILABLE_EFFECTS: Map<string, BattleEffect> = new Map([
        // Dark Effects
        ['skill_lock', {
            id: 'skill_lock',
            name: 'Khóa Kỹ Năng',
            type: 'debuff',
            duration: 2,
            description: 'Không thể sử dụng kỹ năng trong 2 rounds'
        }],
        
        ['darkness_curse', {
            id: 'darkness_curse',
            name: 'Lời Nguyền Bóng Tối',
            type: 'debuff',
            duration: 3,
            intensity: 0.3,
            description: 'Giảm 30% tất cả stats trong 3 rounds'
        }],
        
        ['shadow_bind', {
            id: 'shadow_bind',
            name: 'Trói Buộc Bóng Tối',
            type: 'debuff',
            duration: 2,
            description: 'Không thể tấn công trong 2 rounds'
        }],
        
        // Fire Effects
        ['burn', {
            id: 'burn',
            name: 'Bỏng',
            type: 'debuff',
            duration: 3,
            intensity: 0.15,
            description: 'Mất 15% HP mỗi round trong 3 rounds'
        }],
        
        ['fire_rage', {
            id: 'fire_rage',
            name: 'Cơn Thịnh Nộ Lửa',
            type: 'buff',
            duration: 3,
            intensity: 0.25,
            description: 'Tăng 25% damage trong 3 rounds'
        }],
        
        // Water Effects
        ['freeze', {
            id: 'freeze',
            name: 'Đóng Băng',
            type: 'debuff',
            duration: 2,
            description: 'Bỏ qua lượt trong 2 rounds'
        }],
        
        ['water_shield', {
            id: 'water_shield',
            name: 'Khiên Nước',
            type: 'buff',
            duration: 4,
            intensity: 0.2,
            description: 'Giảm 20% damage nhận vào trong 4 rounds'
        }],
        
        // Earth Effects
        ['petrify', {
            id: 'petrify',
            name: 'Hóa Đá',
            type: 'debuff',
            duration: 3,
            description: 'Không thể hành động trong 3 rounds'
        }],
        
        ['earth_armor', {
            id: 'earth_armor',
            name: 'Giáp Đất',
            type: 'buff',
            duration: 5,
            intensity: 0.4,
            description: 'Tăng 40% defense trong 5 rounds'
        }],
        
        // Air Effects
        ['confusion', {
            id: 'confusion',
            name: 'Hoang Mang',
            type: 'debuff',
            duration: 2,
            intensity: 0.5,
            description: '50% khả năng tấn công chính mình trong 2 rounds'
        }],
        
        ['wind_boost', {
            id: 'wind_boost',
            name: 'Tăng Tốc Gió',
            type: 'buff',
            duration: 3,
            intensity: 0.3,
            description: 'Tăng 30% agility trong 3 rounds'
        }],
        
        // Light Effects
        ['blind', {
            id: 'blind',
            name: 'Mù Quáng',
            type: 'debuff',
            duration: 2,
            intensity: 0.4,
            description: 'Giảm 40% accuracy trong 2 rounds'
        }],
        
        ['divine_blessing', {
            id: 'divine_blessing',
            name: 'Phước Lành Thần Thánh',
            type: 'buff',
            duration: 4,
            intensity: 0.2,
            description: 'Tăng 20% tất cả stats trong 4 rounds'
        }],
        
        // Special Effects
        ['poison', {
            id: 'poison',
            name: 'Độc',
            type: 'debuff',
            duration: 4,
            intensity: 0.1,
            description: 'Mất 10% HP mỗi round trong 4 rounds'
        }],
        
        ['regeneration', {
            id: 'regeneration',
            name: 'Hồi Sinh',
            type: 'buff',
            duration: 5,
            intensity: 0.1,
            description: 'Hồi 10% HP mỗi round trong 5 rounds'
        }],
        
        ['berserk', {
            id: 'berserk',
            name: 'Cuồng Nộ',
            type: 'buff',
            duration: 3,
            intensity: 0.5,
            description: 'Tăng 50% damage nhưng giảm 25% defense trong 3 rounds'
        }]
    ]);

    /**
     * 🎯 Áp dụng effect cho target
     */
    static applyEffect(
        effectId: string, 
        targetEffectState: BattleEffectState,
        intensity?: number
    ): EffectResult {
        const effect = this.AVAILABLE_EFFECTS.get(effectId);
        
        if (!effect) {
            return {
                success: false,
                effectApplied: null,
                message: `❌ Effect ${effectId} không tồn tại!`
            };
        }

        // Tạo effect với intensity tùy chỉnh
        const appliedEffect: BattleEffect = {
            ...effect,
            intensity: intensity || effect.intensity || 0
        };

        // Thêm effect vào target
        targetEffectState.effects.set(effectId, appliedEffect);
        targetEffectState.activeEffects.set(effectId, appliedEffect.duration);

        return {
            success: true,
            effectApplied: appliedEffect,
            message: `🎭 **${appliedEffect.name}** đã được áp dụng! (${appliedEffect.duration} rounds)`
        };
    }

    /**
     * ⏰ Giảm duration của tất cả effects
     */
    static reduceEffectDurations(effectState: BattleEffectState): string[] {
        const expiredEffects: string[] = [];
        
        for (const [effectId, remainingRounds] of effectState.activeEffects) {
            const newRounds = remainingRounds - 1;
            
            if (newRounds <= 0) {
                // Effect hết hạn
                effectState.activeEffects.delete(effectId);
                effectState.effects.delete(effectId);
                expiredEffects.push(effectId);
            } else {
                // Giảm rounds còn lại
                effectState.activeEffects.set(effectId, newRounds);
            }
        }
        
        return expiredEffects;
    }

    /**
     * 🎯 Xử lý effects trong battle round
     */
    static processEffects(
        effectState: BattleEffectState,
        targetStats: any,
        targetHP: number
    ): {
        modifiedStats: any;
        modifiedHP: number;
        messages: string[];
    } {
        let modifiedStats = { ...targetStats };
        let modifiedHP = targetHP;
        const messages: string[] = [];

        for (const [effectId, effect] of effectState.effects) {
            const result = this.processSingleEffect(effect, modifiedStats, modifiedHP);
            
            modifiedStats = result.modifiedStats;
            modifiedHP = result.modifiedHP;
            
            if (result.message) {
                messages.push(result.message);
            }
        }

        return {
            modifiedStats,
            modifiedHP,
            messages
        };
    }

    /**
     * 🔥 Xử lý một effect cụ thể
     */
    private static processSingleEffect(
        effect: BattleEffect,
        currentStats: any,
        currentHP: number
    ): {
        modifiedStats: any;
        modifiedHP: number;
        message?: string;
    } {
        let modifiedStats = { ...currentStats };
        let modifiedHP = currentHP;
        let message = '';

        switch (effect.id) {
            // Dark Effects
            case 'skill_lock':
                // Không có thay đổi stats, chỉ ngăn sử dụng skill
                break;
                
            case 'darkness_curse':
                const curseReduction = effect.intensity || 0.3;
                modifiedStats.strength = Math.floor(modifiedStats.strength * (1 - curseReduction));
                modifiedStats.agility = Math.floor(modifiedStats.agility * (1 - curseReduction));
                modifiedStats.intelligence = Math.floor(modifiedStats.intelligence * (1 - curseReduction));
                modifiedStats.defense = Math.floor(modifiedStats.defense * (1 - curseReduction));
                message = `🌑 **${effect.name}** giảm ${Math.round(curseReduction * 100)}% stats!`;
                break;
                
            case 'shadow_bind':
                // Không thể tấn công - được xử lý trong battle logic
                break;

            // Fire Effects
            case 'burn':
                const burnDamage = Math.floor(currentHP * (effect.intensity || 0.15));
                modifiedHP = Math.max(0, modifiedHP - burnDamage);
                message = `🔥 **${effect.name}** gây ${burnDamage} damage!`;
                break;
                
            case 'fire_rage':
                const rageBoost = effect.intensity || 0.25;
                // Tăng damage - được xử lý trong battle logic
                message = `🔥 **${effect.name}** tăng damage!`;
                break;

            // Water Effects
            case 'freeze':
                // Bỏ qua lượt - được xử lý trong battle logic
                break;
                
            case 'water_shield':
                const shieldReduction = effect.intensity || 0.2;
                // Giảm damage nhận vào - được xử lý trong battle logic
                message = `💧 **${effect.name}** bảo vệ khỏi damage!`;
                break;

            // Earth Effects
            case 'petrify':
                // Không thể hành động - được xử lý trong battle logic
                break;
                
            case 'earth_armor':
                const armorBoost = effect.intensity || 0.4;
                modifiedStats.defense = Math.floor(modifiedStats.defense * (1 + armorBoost));
                message = `🪨 **${effect.name}** tăng defense!`;
                break;

            // Air Effects
            case 'confusion':
                // 50% tấn công chính mình - được xử lý trong battle logic
                break;
                
            case 'wind_boost':
                const windBoost = effect.intensity || 0.3;
                modifiedStats.agility = Math.floor(modifiedStats.agility * (1 + windBoost));
                message = `💨 **${effect.name}** tăng agility!`;
                break;

            // Light Effects
            case 'blind':
                const blindReduction = effect.intensity || 0.4;
                modifiedStats.accuracy = Math.floor(modifiedStats.accuracy * (1 - blindReduction));
                message = `✨ **${effect.name}** giảm accuracy!`;
                break;
                
            case 'divine_blessing':
                const blessingBoost = effect.intensity || 0.2;
                modifiedStats.strength = Math.floor(modifiedStats.strength * (1 + blessingBoost));
                modifiedStats.agility = Math.floor(modifiedStats.agility * (1 + blessingBoost));
                modifiedStats.intelligence = Math.floor(modifiedStats.intelligence * (1 + blessingBoost));
                modifiedStats.defense = Math.floor(modifiedStats.defense * (1 + blessingBoost));
                modifiedStats.accuracy = Math.floor(modifiedStats.accuracy * (1 + blessingBoost));
                message = `✨ **${effect.name}** tăng tất cả stats!`;
                break;

            // Special Effects
            case 'poison':
                const poisonDamage = Math.floor(currentHP * (effect.intensity || 0.1));
                modifiedHP = Math.max(0, modifiedHP - poisonDamage);
                message = `☠️ **${effect.name}** gây ${poisonDamage} damage!`;
                break;
                
            case 'regeneration':
                const healAmount = Math.floor(currentHP * (effect.intensity || 0.1));
                modifiedHP = Math.min(currentHP + healAmount, currentHP); // Không vượt quá HP max
                message = `💚 **${effect.name}** hồi ${healAmount} HP!`;
                break;
                
            case 'berserk':
                const berserkDamageBoost = effect.intensity || 0.5;
                const berserkDefenseReduction = 0.25;
                modifiedStats.strength = Math.floor(modifiedStats.strength * (1 + berserkDamageBoost));
                modifiedStats.defense = Math.floor(modifiedStats.defense * (1 - berserkDefenseReduction));
                message = `⚔️ **${effect.name}** tăng damage nhưng giảm defense!`;
                break;
        }

        return {
            modifiedStats,
            modifiedHP,
            message: message || undefined
        };
    }

    /**
     * 🔍 Kiểm tra effect có active không
     */
    static hasEffect(effectState: BattleEffectState, effectId: string): boolean {
        return effectState.activeEffects.has(effectId);
    }

    /**
     * 📊 Lấy danh sách effects đang active
     */
    static getActiveEffects(effectState: BattleEffectState): BattleEffect[] {
        const activeEffects: BattleEffect[] = [];
        
        for (const [effectId, remainingRounds] of effectState.activeEffects) {
            const effect = effectState.effects.get(effectId);
            if (effect) {
                activeEffects.push({
                    ...effect,
                    duration: remainingRounds
                });
            }
        }
        
        return activeEffects;
    }

    /**
     * 🎯 Lấy effect theo ID
     */
    static getEffect(effectId: string): BattleEffect | undefined {
        return this.AVAILABLE_EFFECTS.get(effectId);
    }

    /**
     * 📋 Lấy tất cả effects có sẵn
     */
    static getAllEffects(): BattleEffect[] {
        return Array.from(this.AVAILABLE_EFFECTS.values());
    }

    /**
     * 🎭 Tạo effect state mới
     */
    static createEffectState(): BattleEffectState {
        return {
            effects: new Map(),
            activeEffects: new Map()
        };
    }
}
