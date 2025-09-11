import prisma from './prisma';

export interface FishSkillData {
  id: string;
  fishId: string;
  skillId: string;
  level: number;
  skillDefinition: {
    id: string;
    name: string;
    element: string;
    emoji: string;
    description: string;
    baseDamage: number;
    damageMultiplier: number;
    damagePerLevel: number;
    maxLevel: number;
    baseSuccessRate: number;
    successRatePerLevel: number;
    cooldown: number;
    requirements?: any;
    effects?: any;
  };
}

export interface BattleSkillState {
  skills: FishSkillData[];
  cooldowns: Map<string, number>; // skillId -> rounds remaining
}

export class SkillBattleService {
  /**
   * Helper function để xử lý emoji format cho battle log (sử dụng emoji gốc)
   */
  private static formatEmoji(emoji: string): string {
    // Sử dụng emoji gốc, Discord sẽ tự động xử lý hiển thị
    return emoji;
  }

  /**
   * Helper function để lấy emoji gốc (cho embed display)
   */
  private static getOriginalEmoji(emoji: string): string {
    // Trả về emoji gốc cho embed display
    return emoji;
  }

  /**
   * Lấy fallback emoji dựa trên custom emoji
   */
  private static getFallbackEmoji(customEmoji: string): string {
    // Map các custom emoji phổ biến với fallback emoji
    const emojiMap: { [key: string]: string } = {
      'pixel_skill_bong_ma': '🌑', // Hắc Ám Tuyệt Đối
      'water_wave': '💧',
      'fire_blast': '🔥',
      'earth_quake': '🌍',
      'wind_gust': '💨',
      'light_beam': '✨'
    };

    // Tìm emoji phù hợp trong custom emoji string
    for (const [key, fallback] of Object.entries(emojiMap)) {
      if (customEmoji.includes(key)) {
        return fallback;
      }
    }

    // Default fallback
    return '⚡';
  }

  /**
   * Khởi tạo skills cho battle
   */
  static async initializeBattleSkills(fishId: string): Promise<BattleSkillState> {
    try {
      const skills = await prisma.fishSkill.findMany({
        where: { fishId },
        include: {
          skillDefinition: true
        }
      });

      const cooldowns = new Map<string, number>();
      
      // Khởi tạo cooldown cho tất cả skills
      skills.forEach(skill => {
        cooldowns.set(skill.skillId, 0);
      });

      return {
        skills: skills.map(skill => ({
          id: skill.id,
          fishId: skill.fishId,
          skillId: skill.skillId,
          level: skill.level,
          skillDefinition: {
            id: skill.skillDefinition.id,
            name: skill.skillDefinition.name,
            element: skill.skillDefinition.element,
            emoji: skill.skillDefinition.emoji,
            description: skill.skillDefinition.description,
            baseDamage: skill.skillDefinition.baseDamage,
            damageMultiplier: Number(skill.skillDefinition.damageMultiplier),
            damagePerLevel: Number(skill.skillDefinition.damagePerLevel),
            maxLevel: skill.skillDefinition.maxLevel,
            baseSuccessRate: Number(skill.skillDefinition.baseSuccessRate),
            successRatePerLevel: Number(skill.skillDefinition.successRatePerLevel),
            cooldown: skill.skillDefinition.cooldown,
            requirements: skill.skillDefinition.requirements ? JSON.parse(skill.skillDefinition.requirements) : undefined,
            effects: skill.skillDefinition.effects ? JSON.parse(skill.skillDefinition.effects) : undefined
          }
        })),
        cooldowns
      };
    } catch (error) {
      console.error('Error initializing battle skills:', error);
      return { skills: [], cooldowns: new Map() };
    }
  }

  /**
   * Chọn skill để sử dụng trong battle
   */
  static selectSkillForBattle(battleState: BattleSkillState): FishSkillData | null {
    const availableSkills = battleState.skills.filter(skill => 
      battleState.cooldowns.get(skill.skillId) === 0
    );

    if (availableSkills.length === 0) {
      return null;
    }

    // Chọn skill ngẫu nhiên từ danh sách available
    const randomIndex = Math.floor(Math.random() * availableSkills.length);
    return availableSkills[randomIndex];
  }

  /**
   * Sử dụng skill trong battle
   */
  static async useSkillInBattle(
    fishId: string, 
    skill: FishSkillData, 
    battleState: BattleSkillState
  ): Promise<{
    success: boolean;
    skillUsed: FishSkillData;
    damage: number;
    message: string;
    cooldownRemaining: number;
  }> {
    try {
      const skillDef = skill.skillDefinition;
      const skillLevel = skill.level;
      
      // Tính damage
      const baseDamage = skillDef.baseDamage;
      const damageMultiplier = skillDef.damageMultiplier;
      const damagePerLevel = skillDef.damagePerLevel;
      const skillDamage = Math.floor(baseDamage * damageMultiplier * (1 + damagePerLevel * (skillLevel - 1)));

      // Tính success rate
      const baseSuccessRate = skillDef.baseSuccessRate;
      const successRatePerLevel = skillDef.successRatePerLevel;
      const successRate = Math.min(0.95, baseSuccessRate + successRatePerLevel * (skillLevel - 1));

      // Kiểm tra thành công
      const isSuccess = Math.random() < successRate;

      // Cập nhật cooldown
      battleState.cooldowns.set(skill.skillId, skillDef.cooldown);

      // Cập nhật lastUsed
      await prisma.fishSkill.update({
        where: { id: skill.id },
        data: { lastUsed: new Date() }
      });

      if (!isSuccess) {
        // Skill thất bại
        return {
          success: false,
          skillUsed: skill,
          damage: 0,
          message: `💨 **${skillDef.name}** đã trượt! (Tỷ lệ: ${Math.round(successRate * 100)}%)`,
          cooldownRemaining: skillDef.cooldown
        };
      }

      // Skill thành công
      const finalDamage = Math.floor(skillDamage * (0.8 + Math.random() * 0.4)); // 80-120% damage
      
      // Tạo message thành công
      const elementEmojis: { [key: string]: string } = {
        fire: '🔥',
        water: '💧',
        earth: '🪨',
        air: '💨',
        light: '✨',
        dark: '🌑'
      };
      const elementEmoji = elementEmojis[skillDef.element] || '⚡';
      
      const damageEmoji = finalDamage > skillDamage * 1.1 ? '💥' : '⚡';
      
      return {
        success: true,
        skillUsed: skill,
        damage: finalDamage,
        message: `${damageEmoji} **${skillDef.name}** (Lv.${skillLevel}) ${elementEmoji} gây **${finalDamage}** sát thương! (Tỷ lệ: ${Math.round(successRate * 100)}%)`,
        cooldownRemaining: skillDef.cooldown
      };
    } catch (error) {
      console.error('Error using skill in battle:', error);
      return {
        success: false,
        skillUsed: skill,
        damage: 0,
        message: '❌ Lỗi khi sử dụng skill!',
        cooldownRemaining: 0
      };
    }
  }

  /**
   * Giảm cooldown của tất cả skills
   */
  static reduceCooldowns(battleState: BattleSkillState): void {
    for (const [skillId, cooldown] of battleState.cooldowns.entries()) {
      if (cooldown > 0) {
        battleState.cooldowns.set(skillId, cooldown - 1);
      }
    }
  }

  /**
   * Lấy thông tin skills có sẵn
   */
  static getAvailableSkillsInfo(battleState: BattleSkillState): string {
    const availableSkills = battleState.skills.filter(skill => 
      battleState.cooldowns.get(skill.skillId) === 0
    );

    if (availableSkills.length === 0) {
      return 'Không có skill nào khả dụng';
    }

    return availableSkills.map(skill => {
      const skillDef = skill.skillDefinition;
      return `**${skillDef.name}** (Lv.${skill.level})`;
    }).join('\n');
  }

  /**
   * Lấy thông tin skills đang cooldown
   */
  static getCooldownSkillsInfo(battleState: BattleSkillState): string {
    const cooldownSkills = battleState.skills.filter(skill => 
      battleState.cooldowns.get(skill.skillId) > 0
    );

    if (cooldownSkills.length === 0) {
      return 'Không có skill nào đang cooldown';
    }

    return cooldownSkills.map(skill => {
      const skillDef = skill.skillDefinition;
      const cooldown = battleState.cooldowns.get(skill.skillId);
      return `**${skillDef.name}** (Lv.${skill.level}) - Cooldown: ${cooldown} rounds`;
    }).join('\n');
  }
}
