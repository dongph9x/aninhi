import prisma from './prisma';
import { FishBreedingService } from './fish-breeding';
import { BattleFishInventoryService } from './battle-fish-inventory';
import { fishCoinDB } from './fish-coin';
import { WeaponService } from './weapon';
import type { FishStats } from './fish-breeding';

export interface BattleResult {
  winner: any;
  loser: any;
  winnerPower: number;
  loserPower: number;
  battleLog: string[];
  rewards: {
    winner: number;
    loser: number;
  };
  finalHP?: {
    winner: {
      current: number;
      max: number;
      percentage: number;
    };
    loser: {
      current: number;
      max: number;
      percentage: number;
    };
  };
  battleId?: string; // ID để lưu trữ battle log
}

export interface BattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
}

export class FishBattleService {
  // Lưu trữ thời gian cooldown của mỗi user
  private static battleCooldowns = new Map<string, number>()
  
  // Lưu trữ battle logs tạm thời (battleId -> battleLog)
  private static battleLogs = new Map<string, string[]>();
  private static readonly BATTLE_COOLDOWN = 60000; // 60 giây (1 phút)
  private static readonly DAILY_BATTLE_LIMIT = 20; // Giới hạn 20 lần đấu cá mỗi ngày cho user thường
  private static readonly ADMIN_DAILY_BATTLE_LIMIT = 100; // Giới hạn 100 lần đấu cá mỗi ngày cho admin

  /**
   * Kiểm tra cooldown battle
   */
  static async checkBattleCooldown(userId: string, guildId: string, isAdmin: boolean = false): Promise<{ canBattle: boolean; remainingTime?: number }> {
    // Admin bypass cooldown
    if (isAdmin) {
      return { canBattle: true };
    }
    
    const key = `${userId}_${guildId}`;
    const lastBattleTime = this.battleCooldowns.get(key);
    
    if (!lastBattleTime) {
      return { canBattle: true };
    }
    
    const now = Date.now();
    const timeSinceLastBattle = now - lastBattleTime;
    const remainingTime = this.BATTLE_COOLDOWN - timeSinceLastBattle;
    
    if (remainingTime <= 0) {
      this.battleCooldowns.delete(key);
      return { canBattle: true };
    }
    
    return { canBattle: false, remainingTime };
  }

  /**
   * Cập nhật thời gian cooldown
   */
  static updateBattleCooldown(userId: string, guildId: string) {
    const key = `${userId}_${guildId}`;
    this.battleCooldowns.set(key, Date.now());
  }

  /**
   * Kiểm tra và reset daily battle count nếu cần
   */
  static async checkAndResetDailyBattleCount(userId: string, guildId: string): Promise<{ canBattle: boolean; remainingBattles: number; error?: string; isAdmin?: boolean }> {
    try {
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId, guildId } }
      });

      if (!user) {
        return { canBattle: false, remainingBattles: 0, error: 'Không tìm thấy người dùng' };
      }

      const now = new Date();
      const lastReset = new Date(user.lastBattleReset);
      
      // Kiểm tra xem có phải ngày mới không (so sánh ngày)
      const isNewDay = now.getDate() !== lastReset.getDate() || 
                      now.getMonth() !== lastReset.getMonth() || 
                      now.getFullYear() !== lastReset.getFullYear();

      // Kiểm tra xem user có phải admin không
      const isAdmin = await this.isAdministrator(userId, guildId);
      const dailyLimit = isAdmin ? this.ADMIN_DAILY_BATTLE_LIMIT : this.DAILY_BATTLE_LIMIT;

      if (isNewDay) {
        // Reset daily battle count cho ngày mới
        await prisma.user.update({
          where: { userId_guildId: { userId, guildId } },
          data: {
            dailyBattleCount: 0,
            lastBattleReset: now
          }
        });
        
        return { canBattle: true, remainingBattles: dailyLimit, isAdmin };
      }

      // Kiểm tra xem có vượt quá giới hạn không
      if (user.dailyBattleCount >= dailyLimit) {
        return { 
          canBattle: false, 
          remainingBattles: 0, 
          error: `Bạn đã đạt giới hạn ${dailyLimit} lần đấu cá trong ngày! Vui lòng thử lại vào ngày mai.`,
          isAdmin
        };
      }

      const remainingBattles = dailyLimit - user.dailyBattleCount;
      return { canBattle: true, remainingBattles, isAdmin };
    } catch (error) {
      console.error('Error checking daily battle count:', error);
      return { canBattle: false, remainingBattles: 0, error: 'Đã xảy ra lỗi khi kiểm tra giới hạn đấu cá' };
    }
  }

  /**
   * Tăng daily battle count
   */
  static async incrementDailyBattleCount(userId: string, guildId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: {
          dailyBattleCount: {
            increment: 1
          }
        }
      });
    } catch (error) {
      console.error('Error incrementing daily battle count:', error);
    }
  }

  /**
   * Tạo battle ID duy nhất
   */
  private static generateBattleId(): string {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Lưu battle log
   */
  static saveBattleLog(battleId: string, battleLog: string[]): void {
    this.battleLogs.set(battleId, battleLog);
    
    // Tự động xóa sau 1 giờ để tránh memory leak
    setTimeout(() => {
      this.battleLogs.delete(battleId);
    }, 60 * 60 * 1000); // 1 giờ
  }

  /**
   * Lấy battle log
   */
  static getBattleLog(battleId: string): string[] | null {
    return this.battleLogs.get(battleId) || null;
  }

  /**
   * Xóa battle log
   */
  static deleteBattleLog(battleId: string): void {
    this.battleLogs.delete(battleId);
  }

  /**
   * Kiểm tra quyền Administrator
   */
  static async isAdministrator(userId: string, guildId: string, client?: any): Promise<boolean> {
    try {
      // Danh sách Administrator IDs (có thể mở rộng sau)
      const adminUserIds: string[] = [
        '389957152153796608', // Admin user - có quyền sử dụng lệnh admin
        // Thêm ID của các Administrator khác vào đây
        // Ví dụ: '123456789012345678'
        // Thêm User ID của user bạn muốn cấp quyền admin ở đây
      ];
      
      // Kiểm tra xem user có trong danh sách admin không
      if (adminUserIds.includes(userId)) {
        return true;
      }
      
      // Kiểm tra quyền Discord Administrator nếu có client
      if (client) {
        try {
          // Lấy guild và member
          const guild = await client.guilds.fetch(guildId);
          if (!guild) return false;
          
          const member = await guild.members.fetch(userId);
          if (!member) return false;
          
          // Kiểm tra quyền Administrator
          if (member.permissions.has('Administrator')) {
            return true;
          }
          
          // Kiểm tra quyền ManageGuild (Server Manager)
          if (member.permissions.has('ManageGuild')) {
            return true;
          }
          
        } catch (discordError) {
          console.log('Discord permission check failed, falling back to ID list:', discordError);
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Tìm đối thủ ngẫu nhiên cho cá
   */
  static async findRandomOpponent(userId: string, guildId: string, fishId: string) {
    const userFish = await prisma.fish.findFirst({
      where: { id: fishId, userId }
    });

    if (!userFish) {
      return { success: false, error: 'Không tìm thấy cá!' };
    }

    if (userFish.status !== 'adult') {
      return { success: false, error: 'Chỉ cá trưởng thành mới có thể đấu!' };
    }

    // Tìm cá trưởng thành khác trong server (thế hệ 2+)
    const opponents = await prisma.fish.findMany({
      where: {
        guildId,
        status: 'adult',
        generation: { gte: 2 }, // Chỉ cá thế hệ 2+ mới đấu được
        userId: { not: userId } // Không phải cá của user
      },
      take: 10 // Lấy 10 cá ngẫu nhiên
    });

    if (opponents.length === 0) {
      // Nếu không tìm thấy đối thủ thực tế, tạo BOT đối thủ
      console.log(`🤖 No real opponents found, creating BOT opponent for user ${userId}`);
      const botOpponent = this.createBotOpponent(userFish);
      
      return {
        success: true,
        opponent: botOpponent,
        isBot: true // Đánh dấu đây là BOT đối thủ
      };
    }

    // Chọn ngẫu nhiên 1 đối thủ
    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];

    return {
      success: true,
      opponent: {
        ...randomOpponent,
        name: randomOpponent.species,
        stats: JSON.parse((randomOpponent as any).stats || '{}'),
        traits: JSON.parse(randomOpponent.specialTraits || '[]'),
      },
      isBot: false // Đánh dấu đây là đối thủ thực tế
    };
  }

  /**
   * Tạo BOT đối thủ với stats cân bằng
   */
  private static createBotOpponent(userFish: any) {
    // Parse stats của user fish
    const userStats = JSON.parse(userFish.stats || '{}');
    
    // Tính toán sức mạnh cơ bản của user fish
    const userBasePower = FishBreedingService.calculateTotalPowerWithLevel({
      ...userFish,
      stats: userStats
    });

    // Tạo BOT đối thủ với sức mạnh cân bằng với user fish
    const powerVariation = 0.3; // ±30% variation
    const randomMultiplier = 0.7 + (Math.random() * powerVariation * 2); // 0.7 - 1.3 (BOT có thể mạnh hơn user)
    const botBasePower = userBasePower * randomMultiplier;
    
    // Đảm bảo BOT có sức mạnh hợp lý (0.7x - 1.3x user power)
    const minBotPower = userBasePower * 0.7;
    const maxBotPower = userBasePower * 1.3;
    const finalBotPower = Math.max(minBotPower, Math.min(botBasePower, maxBotPower));
    
    // Trừ đi level bonus vì BOT sẽ có level 10 (thêm 90 power)
    // Chúng ta muốn stats cơ bản của BOT cân bằng với user
    const levelBonus = 90; // (10-1) * 10
    const statsOnlyPower = finalBotPower - levelBonus;

    // Tạo stats cân bằng cho BOT (chỉ dựa trên stats, không tính level bonus)
    const botStats = {
      strength: Math.floor(statsOnlyPower * 0.25),
      agility: Math.floor(statsOnlyPower * 0.2),
      intelligence: Math.floor(statsOnlyPower * 0.2),
      defense: Math.floor(statsOnlyPower * 0.2),
      luck: Math.floor(statsOnlyPower * 0.1),
      accuracy: Math.floor(statsOnlyPower * 0.05)
    };

    // Tạo BOT opponent
    const botOpponent = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'BOT_OPPONENT',
      guildId: userFish.guildId,
      species: this.getRandomBotSpecies(),
      level: 10,
      experience: 0,
      rarity: this.getRandomBotRarity(),
      value: BigInt(Math.floor(finalBotPower * 100)), // Giá trị dựa trên sức mạnh
      generation: 2,
      status: 'adult',
      stats: botStats,
      specialTraits: this.getRandomBotTraits(),
      isCloned: false,
      clonedFrom: null,
      clonedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: this.getRandomBotSpecies(), // Tên hiển thị
      traits: this.getRandomBotTraits() // Traits cho battle
    };

    console.log(`🤖 Created BOT opponent: ${botOpponent.species} with power: ${Math.floor(finalBotPower)} (user: ${Math.floor(userBasePower)}, ratio: ${(finalBotPower/userBasePower).toFixed(2)}x)`);
    return botOpponent;
  }

  /**
   * Lấy tên loài cá ngẫu nhiên cho BOT
   */
  private static getRandomBotSpecies(): string {
    const botSpecies = [
      'BOT Warrior Fish',
      'BOT Guardian Fish', 
      'BOT Elite Fish',
      'BOT Champion Fish',
      'BOT Legend Fish',
      'BOT Master Fish',
      'BOT Supreme Fish',
      'BOT Ultimate Fish'
    ];
    return botSpecies[Math.floor(Math.random() * botSpecies.length)];
  }

  /**
   * Lấy độ hiếm ngẫu nhiên cho BOT
   */
  private static getRandomBotRarity(): string {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const weights = [0.4, 0.3, 0.2, 0.08, 0.02]; // Tỷ lệ xuất hiện
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return rarities[i];
      }
    }
    
    return 'common'; // Fallback
  }

  /**
   * Lấy traits ngẫu nhiên cho BOT
   */
  private static getRandomBotTraits(): string[] {
    const allTraits = [
      'BOT Enhanced',
      'Artificial Intelligence',
      'Machine Learning',
      'Digital Mastery',
      'Virtual Power',
      'Cyber Strength',
      'Quantum Speed',
      'Neural Network'
    ];
    
    const numTraits = Math.floor(Math.random() * 3) + 1; // 1-3 traits
    const selectedTraits: string[] = [];
    
    while (selectedTraits.length < numTraits) {
      const randomTrait = allTraits[Math.floor(Math.random() * allTraits.length)];
      if (!selectedTraits.includes(randomTrait)) {
        selectedTraits.push(randomTrait);
      }
    }
    
    return selectedTraits;
  }

  /**
   * Đấu cá với đối thủ
   */
  static async battleFish(userId: string, guildId: string, fishId: string, opponentId: string, opponentData?: any): Promise<BattleResult | { success: false, error: string }> {
    try {
      console.log(`🔍 [DEBUG] battleFish called:`);
      console.log(`  - userId: ${userId}`);
      console.log(`  - guildId: ${guildId}`);
      console.log(`  - fishId: ${fishId}`);
      console.log(`  - opponentId: ${opponentId}`);

      // Kiểm tra quyền admin trước
      const isAdmin = await this.isAdministrator(userId, guildId);
      
      // Kiểm tra cooldown và daily battle limit (admin bypass cooldown)
      const cooldownCheck = await this.checkBattleCooldown(userId, guildId, isAdmin);
      if (!cooldownCheck.canBattle) {
        const remainingSeconds = Math.ceil((cooldownCheck.remainingTime || 0) / 1000);
        return { 
          success: false, 
          error: `⏰ Bạn cần chờ ${remainingSeconds} giây nữa mới có thể đấu!` 
        };
      }

      // Kiểm tra daily battle limit
      const dailyLimitCheck = await this.checkAndResetDailyBattleCount(userId, guildId);
      if (!dailyLimitCheck.canBattle) {
        return { 
          success: false, 
          error: dailyLimitCheck.error || 'Đã đạt giới hạn đấu cá trong ngày!' 
        };
      }

      const userFish = await prisma.fish.findFirst({
        where: { id: fishId, userId }
      });

          // Kiểm tra xem có phải BOT đối thủ không
    const isBotOpponent = opponentId.startsWith('bot_');
    
    let opponentFish: any;
    let opponentResult: any;
    
    if (isBotOpponent) {
      // Nếu là BOT đối thủ, sử dụng opponentData được truyền vào
      console.log(`  - 🤖 BOT opponent detected: ${opponentId}`);
      if (opponentData) {
        opponentResult = { opponent: opponentData, isBot: true };
        opponentFish = opponentData; // Sử dụng opponentData cho BOT
      } else {
        // Fallback: tạo BOT opponent mới nếu không có opponentData
        const userFish = await prisma.fish.findFirst({
          where: { id: fishId, userId }
        });
        if (userFish) {
          const botOpponent = this.createBotOpponent(userFish);
          opponentResult = { opponent: botOpponent, isBot: true };
          opponentFish = botOpponent;
        }
      }
    } else {
      // Nếu là đối thủ thực tế, query database
      opponentFish = await prisma.fish.findFirst({
        where: { id: opponentId }
      });
      opponentResult = { opponent: opponentFish, isBot: false };
    }

      console.log(`  - userFish found: ${!!userFish}`);
      console.log(`  - opponentFish found: ${!!opponentFish || isBotOpponent}`);

      if (!userFish) {
        return { success: false, error: 'Không tìm thấy cá của bạn!' };
      }

      if (userFish.status !== 'adult') {
        return { success: false, error: 'Chỉ cá trưởng thành mới có thể đấu!' };
      }

      // Đối với BOT opponent, không cần kiểm tra status
      if (!isBotOpponent && (!opponentFish || opponentFish.status !== 'adult')) {
        return { success: false, error: 'Đối thủ không hợp lệ để đấu!' };
      }

    // Parse stats
    const userStats: FishStats = JSON.parse(userFish.stats || '{}');
    
    // Xử lý stats của opponent (có thể là BOT hoặc thực tế)
    let opponentStats: FishStats;
    let opponentBasePower: number;
    
    if (isBotOpponent) {
      // BOT opponent - stats đã được tạo sẵn
      opponentStats = opponentFish?.stats || {};
      opponentBasePower = FishBreedingService.calculateTotalPowerWithLevel({
        ...opponentFish,
        stats: opponentStats
      });
    } else {
      // Đối thủ thực tế - parse từ database
      opponentStats = JSON.parse(opponentFish.stats || '{}');
      opponentBasePower = FishBreedingService.calculateTotalPowerWithLevel({
        ...opponentFish,
        stats: opponentStats
      });
    }

    // Tính toán sức mạnh cơ bản của user
    const userBasePower = FishBreedingService.calculateTotalPowerWithLevel({
      ...userFish,
      stats: userStats
    });

    // Tạo battle log
    const battleLog: string[] = [];
    
    // === PHASE 0: KIỂM TRA VŨ KHÍ TRANG BỊ ===
    // Sử dụng thông tin opponent từ kết quả tìm kiếm (có thể là BOT hoặc thực tế)
    const opponentName = isBotOpponent ? opponentResult.opponent.species : opponentFish.species;
    battleLog.push(`⚔️ **${userFish.species}** vs **${opponentName}**`);
    battleLog.push(`💪 Sức mạnh cơ bản: ${Math.floor(userBasePower)} vs ${Math.floor(opponentBasePower)}`);

    // Lấy weapon stats của user
    const userWeaponStats = await WeaponService.getTotalWeaponStats(userId, guildId);
    const userEquippedWeapon = await WeaponService.getEquippedWeapon(userId, guildId);
    
    // Tính toán sức mạnh sau khi cộng weapon stats
    let userPowerWithWeapon = userBasePower;
    let opponentPowerWithWeapon = opponentBasePower;
    
    if (userWeaponStats.power > 0 || userWeaponStats.defense > 0 || userWeaponStats.accuracy > 0) {
      // Cộng weapon stats vào sức mạnh
      userPowerWithWeapon += userWeaponStats.power * 10; // 1 ATK = +10 power
      userPowerWithWeapon += userWeaponStats.defense * 5; // 1 DEF = +5 power
      
      // Accuracy ảnh hưởng đến critical hit chance
      const accuracyBonus = userWeaponStats.accuracy * 0.01; // 1% accuracy = +1% crit chance
      
      battleLog.push(`\n⚔️ **Vũ khí trang bị của ${userFish.species}:**`);
      if (userEquippedWeapon) {
        const weapon = WeaponService.getWeaponById(userEquippedWeapon.weaponId);
        if (weapon) {
          battleLog.push(`🗡️ ${weapon.name} (${weapon.rarity})`);
        }
      }
      battleLog.push(`⚔️ ATK: +${userWeaponStats.power} | 🛡️ DEF: +${userWeaponStats.defense} | 🎯 Accuracy: +${userWeaponStats.accuracy}%`);
      battleLog.push(`💪 Sức mạnh sau vũ khí: ${Math.floor(userPowerWithWeapon)}`);
    } else {
      battleLog.push(`\n⚔️ **${userFish.species}** không có vũ khí trang bị`);
    }

    // Thêm chi tiết stats
    battleLog.push(`\n📊 **Stats ${userFish.species}:**`);
            battleLog.push(`💪 Sức mạnh: ${userStats.strength || 0} | 🏃 Thể lực: ${userStats.agility || 0} | 🧠 Trí tuệ: ${userStats.intelligence || 0} | 🛡️ Phòng thủ: ${userStats.defense || 0} | 🍀 May mắn: ${userStats.luck || 0} | 🎯 Độ chính xác: ${userStats.accuracy || 0}`);

    battleLog.push(`\n📊 **Stats ${opponentName}:**`);
            battleLog.push(`💪 Sức mạnh: ${opponentStats.strength || 0} | 🏃 Thể lực: ${opponentStats.agility || 0} | 🧠 Trí tuệ: ${opponentStats.intelligence || 0} | 🛡️ Phòng thủ: ${opponentStats.defense || 0} | 🍀 May mắn: ${opponentStats.luck || 0} | 🎯 Độ chính xác: ${opponentStats.accuracy || 0}`);

    // === PHASE 1: KIỂM TRA ĐIỀU KIỆN ĐẶC BIỆT ===
    battleLog.push(`\n🎯 **PHASE 1: Kiểm tra điều kiện đặc biệt**`);
    
    // Kiểm tra thế hệ (cá thế hệ cao hơn có lợi thế)
    const userGen = userFish.generation || 1;
    const opponentGen = isBotOpponent ? opponentResult.opponent.generation : (opponentFish.generation || 1);
    const userGenBonus = Math.max(0, (userGen - opponentGen) * 0.1); // +10% mỗi thế hệ chênh lệch
    const opponentGenBonus = Math.max(0, (opponentGen - userGen) * 0.1);
    
    if (userGenBonus > 0) {
      battleLog.push(`🌟 ${userFish.species} có lợi thế thế hệ: +${Math.round(userGenBonus * 100)}%`);
    }
    if (opponentGenBonus > 0) {
      battleLog.push(`🌟 ${opponentName} có lợi thế thế hệ: +${Math.round(opponentGenBonus * 100)}%`);
    }

    // === PHASE 1.5: BUFF/DEBUFF NGẪU NHIÊN ===
    battleLog.push(`\n🎲 **PHASE 1.5: Buff/Debuff ngẫu nhiên**`);
    
    // Danh sách các loại buff/debuff
    const buffTypes = [
      { name: 'Sức mạnh', stat: 'strength', emoji: '💪' },
      { name: 'Thể lực', stat: 'agility', emoji: '🏃' },
      { name: 'Trí tuệ', stat: 'intelligence', emoji: '🧠' },
      { name: 'Phòng thủ', stat: 'defense', emoji: '🛡️' },
      { name: 'May mắn', stat: 'luck', emoji: '🍀' }
    ];
    
    // Tạo buff/debuff cho user
    const userBuffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
    const userBuffAmount = Math.floor(Math.random() * 15) + 5; // 5-20 điểm
    const userBuffIsPositive = Math.random() > 0.4; // 60% buff, 40% debuff
    
    // Tạo buff/debuff cho opponent
    const opponentBuffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];
    const opponentBuffAmount = Math.floor(Math.random() * 15) + 5; // 5-20 điểm
    const opponentBuffIsPositive = Math.random() > 0.4; // 60% buff, 40% debuff
    
    // Áp dụng buff/debuff cho user
    const userBuffMultiplier = userBuffIsPositive ? 1 + (userBuffAmount / 100) : 1 - (userBuffAmount / 100);
    const userBuffEmoji = userBuffIsPositive ? '📈' : '📉';
    const userBuffText = userBuffIsPositive ? 'tăng' : 'giảm';
    battleLog.push(`${userBuffEmoji} **${userFish.species}** ${userBuffText} ${userBuffType.name} ${userBuffAmount} điểm!`);
    
    // Áp dụng buff/debuff cho opponent
    const opponentBuffMultiplier = opponentBuffIsPositive ? 1 + (opponentBuffAmount / 100) : 1 - (opponentBuffAmount / 100);
    const opponentBuffEmoji = opponentBuffIsPositive ? '📈' : '📉';
    const opponentBuffText = opponentBuffIsPositive ? 'tăng' : 'giảm';
    battleLog.push(`${opponentBuffEmoji} **${opponentName}** ${opponentBuffText} ${opponentBuffType.name} ${opponentBuffAmount} điểm!`);
    
    // Tính toán sức mạnh sau buff/debuff
    let userBuffPower = userPowerWithWeapon;
    let opponentBuffPower = opponentPowerWithWeapon;
    
    // Áp dụng buff/debuff vào sức mạnh
    if (userBuffType.stat === 'strength') {
      userBuffPower = userPowerWithWeapon * userBuffMultiplier;
    } else if (userBuffType.stat === 'agility') {
      userBuffPower = userPowerWithWeapon * userBuffMultiplier;
    } else if (userBuffType.stat === 'intelligence') {
      userBuffPower = userPowerWithWeapon * userBuffMultiplier;
    } else if (userBuffType.stat === 'defense') {
      userBuffPower = userPowerWithWeapon * userBuffMultiplier;
    } else if (userBuffType.stat === 'luck') {
      userBuffPower = userPowerWithWeapon * userBuffMultiplier;
    }
    
    if (opponentBuffType.stat === 'strength') {
      opponentBuffPower = opponentPowerWithWeapon * opponentBuffMultiplier;
    } else if (opponentBuffType.stat === 'agility') {
      opponentBuffPower = opponentPowerWithWeapon * opponentBuffMultiplier;
    } else if (opponentBuffType.stat === 'intelligence') {
      opponentBuffPower = opponentPowerWithWeapon * opponentBuffMultiplier;
    } else if (opponentBuffType.stat === 'defense') {
      opponentBuffPower = opponentPowerWithWeapon * opponentBuffMultiplier;
    } else if (opponentBuffType.stat === 'luck') {
      opponentBuffPower = opponentPowerWithWeapon * opponentBuffMultiplier;
    }
    
    battleLog.push(`💪 Sức mạnh sau buff/debuff: ${Math.floor(userBuffPower)} vs ${Math.floor(opponentBuffPower)}`);

    // === PHASE 2: TÍNH TOÁN SỨC MẠNH THỰC TẾ ===
    battleLog.push(`\n⚡ **PHASE 2: Tính toán sức mạnh thực tế**`);
    
    // Yếu tố may mắn (random)
    const userLuckRoll = Math.random() * (userStats.luck || 0) / 100;
    const opponentLuckRoll = Math.random() * (opponentStats.luck || 0) / 100;
    
    const userLuckBonus = userLuckRoll * 0.3; // +30% max từ luck
    const opponentLuckBonus = opponentLuckRoll * 0.3;
    
    battleLog.push(`🍀 ${userFish.species} may mắn: +${Math.round(userLuckBonus * 100)}%`);
    battleLog.push(`🍀 ${opponentName} may mắn: +${Math.round(opponentLuckBonus * 100)}%`);

    // Tính sức mạnh cuối cùng (sau buff/debuff)
    const userFinalPower = userBuffPower * (1 + userGenBonus + userLuckBonus);
    const opponentFinalPower = opponentBuffPower * (1 + opponentGenBonus + opponentLuckBonus);

    battleLog.push(`💪 Sức mạnh cuối cùng: ${Math.floor(userFinalPower)} vs ${Math.floor(opponentFinalPower)}`);

    // === PHASE 3: KIỂM TRA CRITICAL HIT ===
    battleLog.push(`\n🎯 **PHASE 3: Kiểm tra đòn đánh quan trọng**`);
    
            // Critical hit chance = luck + fish accuracy + weapon accuracy
        const userCritChance = (userStats.luck || 0) / 200 + (userStats.accuracy || 0) / 200 + (userWeaponStats.accuracy || 0) / 100; // 0.5% mỗi điểm luck + 0.5% mỗi điểm fish accuracy + 1% mỗi điểm weapon accuracy
    const opponentCritChance = (opponentStats.luck || 0) / 200;
    
    const userCritRoll = Math.random();
    const opponentCritRoll = Math.random();
    
    let userCritMultiplier = 1;
    let opponentCritMultiplier = 1;
    
    if (userCritRoll < userCritChance) {
      userCritMultiplier = 1.5;
      battleLog.push(`💥 **CRITICAL HIT!** ${userFish.species} gây sát thương x1.5!`);
    }
    
    if (opponentCritRoll < opponentCritChance) {
      opponentCritMultiplier = 1.5;
      battleLog.push(`💥 **CRITICAL HIT!** ${opponentName} gây sát thương x1.5!`);
    }

    // Hiển thị critical hit chance
            battleLog.push(`🎯 ${userFish.species} Crit Chance: ${Math.round(userCritChance * 100)}% (Luck: ${userStats.luck || 0} + Fish Accuracy: ${userStats.accuracy || 0} + Weapon Accuracy: ${userWeaponStats.accuracy || 0}%)`);
    battleLog.push(`🎯 ${opponentName} Crit Chance: ${Math.round(opponentCritChance * 100)}% (Luck: ${opponentStats.luck || 0})`);

    // === PHASE 4: KIỂM TRA KHẢ NĂNG ĐẶC BIỆT ===
    battleLog.push(`\n✨ **PHASE 4: Kiểm tra khả năng đặc biệt**`);
    
    // Khả năng dựa trên stats cao nhất
    const userMaxStat = Math.max(userStats.strength || 0, userStats.agility || 0, userStats.intelligence || 0, userStats.defense || 0);
    const opponentMaxStat = Math.max(opponentStats.strength || 0, opponentStats.agility || 0, opponentStats.intelligence || 0, opponentStats.defense || 0);
    
    let userSpecialBonus = 0;
    let opponentSpecialBonus = 0;
    
    // Khả năng đặc biệt dựa trên stat cao nhất
    if (userMaxStat >= 40) {
      const specialChance = 0.15; // 15% chance
      if (Math.random() < specialChance) {
        userSpecialBonus = 0.2; // +20%
        battleLog.push(`🔥 **KHẢ NĂNG ĐẶC BIỆT!** ${userFish.species} kích hoạt sức mạnh tiềm ẩn! +20%`);
      }
    }
    
    if (opponentMaxStat >= 40) {
      const specialChance = 0.15; // 15% chance
      if (Math.random() < specialChance) {
        opponentSpecialBonus = 0.2; // +20%
        battleLog.push(`🔥 **KHẢ NĂNG ĐẶC BIỆT!** ${opponentName} kích hoạt sức mạnh tiềm ẩn! +20%`);
      }
    }

    // === PHASE 5: BATTLE VỚI HP THỰC TẾ ===
    battleLog.push(`\n⚔️ **PHASE 5: Battle với HP thực tế**`);
    
    const userTotalPower = userFinalPower * userCritMultiplier * (1 + userSpecialBonus);
    const opponentTotalPower = opponentFinalPower * opponentCritMultiplier * (1 + opponentSpecialBonus);
    
    battleLog.push(`💪 Sức mạnh tổng: ${Math.floor(userTotalPower)} vs ${Math.floor(opponentTotalPower)}`);

    // Tính HP ban đầu
    const calculateMaxHP = (fish: any) => {
      const baseHP = 100;
      const levelBonus = (fish.level || 1) * 10;
      const defenseBonus = (fish.stats?.defense || 0) * 5;
      return baseHP + levelBonus + defenseBonus;
    };

    let userHP = calculateMaxHP(userFish);
    let opponentHP = calculateMaxHP(opponentFish);
    const userMaxHP = userHP;
    const opponentMaxHP = opponentHP;
    
    battleLog.push(`❤️ HP ban đầu: ${userHP}/${userMaxHP} vs ${opponentHP}/${opponentMaxHP}`);

    // === PHASE 6: CHIẾN ĐẤU VỚI HP ===
    let winner, loser, winnerPower, loserPower;
    let isUserWinner = false;
    let battleType = 'normal';
    let roundCount = 0;
    const maxRounds = 10; // Giới hạn tối đa 10 hiệp để tránh vô hạn

    while (userHP > 0 && opponentHP > 0 && roundCount < maxRounds) {
      roundCount++;
      battleLog.push(`\n🥊 **Hiệp ${roundCount}**`);
      
      // Tính damage dựa trên sức mạnh và random factor (điều chỉnh để battle kết thúc khi HP về 0)
      const userBaseDamage = Math.floor((userTotalPower / 8) * (0.8 + Math.random() * 0.4)); // 80-120% của base damage
      const opponentBaseDamage = Math.floor((opponentTotalPower / 8) * (0.8 + Math.random() * 0.4));
      
      // Lưu base damage để hiển thị trong log
      const userOriginalDamage = userBaseDamage;
      const opponentOriginalDamage = opponentBaseDamage;
      
      // Tính khả năng né tránh dựa trên Agility và Intelligence
      const userAgility = userStats.agility || 0;
      const opponentAgility = opponentStats.agility || 0;
      const userIntelligence = userStats.intelligence || 0;
      const opponentIntelligence = opponentStats.intelligence || 0;
      
      // Khả năng né tránh: 0-40% dựa trên Agility (70%) + Intelligence (30%)
      const userDodgeChance = Math.min(0.4, (userAgility * 0.7 + userIntelligence * 0.3) / 1000); // Tối đa 40%
      const opponentDodgeChance = Math.min(0.4, (opponentAgility * 0.7 + opponentIntelligence * 0.3) / 1000);
      
      // Kiểm tra né tránh
      const userDodges = Math.random() < userDodgeChance;
      const opponentDodges = Math.random() < opponentDodgeChance;
      
      // Tính khả năng hit dựa trên Accuracy (kiểm tra miss trước)
      const userAccuracy = userStats.accuracy || 0;
      const opponentAccuracy = opponentStats.accuracy || 0;
      
      // Hit chance: 70-100% dựa trên Accuracy (tối thiểu 70% để không miss quá nhiều)
      const userHitChance = Math.min(1.0, 0.7 + (userAccuracy / 1000)); // 70-100%
      const opponentHitChance = Math.min(1.0, 0.7 + (opponentAccuracy / 1000));
      
      // Kiểm tra hit/miss
      const userHits = Math.random() < userHitChance;
      const opponentHits = Math.random() < opponentHitChance;
      
      // Tính damage thực tế (chỉ tính nếu không miss)
      let userDamage = userHits ? userBaseDamage : 0;
      let opponentDamage = opponentHits ? opponentBaseDamage : 0;
      
      // Tính khả năng critical hit dựa trên Luck (chỉ nếu hit)
      const userLuck = userStats.luck || 0;
      const opponentLuck = opponentStats.luck || 0;
      
      // Critical hit chance: 0-20% dựa trên Luck
      const userCritChance = Math.min(0.2, userLuck / 1000); // Tối đa 20%
      const opponentCritChance = Math.min(0.2, opponentLuck / 1000);
      
      // Kiểm tra critical hit
      const userCrits = userHits && Math.random() < userCritChance;
      const opponentCrits = opponentHits && Math.random() < opponentCritChance;
      
      // Áp dụng critical damage (x2) nếu crit
      if (userCrits) {
        userDamage = Math.floor(userDamage * 2); // Critical damage x2
      }
      if (opponentCrits) {
        opponentDamage = Math.floor(opponentDamage * 2); // Critical damage x2
      }
      
      // Tính damage thực tế sau khi né tránh (chỉ nếu hit)
      if (userHits) {
        userDamage = userDodges ? Math.floor(userDamage * 0.3) : userDamage; // Né tránh giảm 70% damage
      }
      if (opponentHits) {
        opponentDamage = opponentDodges ? Math.floor(opponentDamage * 0.3) : opponentDamage;
      }
      
      // Áp dụng Defense để giảm damage nhận vào (chỉ nếu có damage)
      const userDefense = userStats.defense || 0;
      const opponentDefense = opponentStats.defense || 0;
      
      // Defense giảm damage: 0-25% dựa trên Defense
      const userDefenseReduction = Math.min(0.25, userDefense / 1000); // Tối đa 25%
      const opponentDefenseReduction = Math.min(0.25, opponentDefense / 1000);
      
      // Áp dụng defense reduction cho damage nhận vào (chỉ nếu có damage)
      if (userDamage > 0) {
        userDamage = Math.floor(userDamage * (1 - opponentDefenseReduction));
      }
      if (opponentDamage > 0) {
        opponentDamage = Math.floor(opponentDamage * (1 - userDefenseReduction));
      }
      
      // Xác định thứ tự tấn công dựa trên Agility
      const userAttacksFirst = userAgility >= opponentAgility;
      
      // Log với thông tin chi tiết về các hiệu ứng đặc biệt
      // Dodge text cho người bị tấn công (khi họ né được đòn tấn công)
      let userDodgeText = userDodges ? `\n🛡️ **${userFish.species} NÉ!** (Nhanh nhẹn: ${userAgility}, Trí tuệ: ${userIntelligence} → Tỷ lệ né: ${(userDodgeChance * 100).toFixed(1)}%)` : '';
      let opponentDodgeText = opponentDodges ? `\n🛡️ **${opponentName} NÉ!** (Nhanh nhẹn: ${opponentAgility}, Trí tuệ: ${opponentIntelligence} → Tỷ lệ né: ${(opponentDodgeChance * 100).toFixed(1)}%)` : '';
      
      // Defense text cho người bị tấn công (chỉ hiển thị khi có damage thực tế và không miss)
      let userDefenseText = (userDefenseReduction > 0 && userDamage > 0) ? `\n🛡️ **Phòng thủ giảm sát thương!** (Phòng thủ: ${userDefense} → -${(userDefenseReduction * 100).toFixed(1)}% sát thương)` : '';
      let opponentDefenseText = (opponentDefenseReduction > 0 && opponentDamage > 0) ? `\n🛡️ **Phòng thủ giảm sát thương!** (Phòng thủ: ${opponentDefense} → -${(opponentDefenseReduction * 100).toFixed(1)}% sát thương)` : '';
      
      let userCritText = userCrits ? `\n💥 **CHÍ MẠNG!** (May mắn: ${userLuck} → Tỷ lệ chí mạng: ${(userCritChance * 100).toFixed(1)}% → x2 sát thương!)` : '';
      let opponentCritText = opponentCrits ? `\n💥 **CHÍ MẠNG!** (May mắn: ${opponentLuck} → Tỷ lệ chí mạng: ${(opponentCritChance * 100).toFixed(1)}% → x2 sát thương!)` : '';
      
      let userMissText = !userHits ? `\n❌ **ĐÁNH TRƯỢT!** (Độ chính xác: ${userAccuracy} → Tỷ lệ trúng: ${(userHitChance * 100).toFixed(1)}% → 0 sát thương!)` : '';
      let opponentMissText = !opponentHits ? `\n❌ **ĐÁNH TRƯỢT!** (Độ chính xác: ${opponentAccuracy} → Tỷ lệ trúng: ${(opponentHitChance * 100).toFixed(1)}% → 0 sát thương!)` : '';
      
      // Tạo damage comparison text
      let userDamageComparison = userOriginalDamage !== userDamage ? ` (${userOriginalDamage} → ${userDamage})` : '';
      let opponentDamageComparison = opponentOriginalDamage !== opponentDamage ? ` (${opponentOriginalDamage} → ${opponentDamage})` : '';
      
      // Áp dụng damage theo thứ tự tấn công và log
      if (userAttacksFirst) {
        // User tấn công trước
        opponentHP = Math.max(0, opponentHP - userDamage);
        battleLog.push(`💥 ${userFish.species} gây ${userDamage} sát thương!${userDamageComparison}${userCritText}${userMissText}${opponentDodgeText}${opponentDefenseText} ${opponentName} còn ${opponentHP}/${opponentMaxHP} HP`);
        
        if (opponentHP > 0) {
          userHP = Math.max(0, userHP - opponentDamage);
          battleLog.push(`💥 ${opponentName} gây ${opponentDamage} sát thương!${opponentDamageComparison}${opponentCritText}${opponentMissText}${userDodgeText}${userDefenseText} ${userFish.species} còn ${userHP}/${userMaxHP} HP`);
        }
      } else {
        // Opponent tấn công trước
        userHP = Math.max(0, userHP - opponentDamage);
        battleLog.push(`💥 ${opponentName} gây ${opponentDamage} sát thương!${opponentDamageComparison}${opponentCritText}${opponentMissText}${userDodgeText}${userDefenseText} ${userFish.species} còn ${userHP}/${userMaxHP} HP`);
        
        if (userHP > 0) {
          opponentHP = Math.max(0, opponentHP - userDamage);
          battleLog.push(`💥 ${userFish.species} gây ${userDamage} sát thương!${userDamageComparison}${userCritText}${userMissText}${opponentDodgeText}${opponentDefenseText} ${opponentName} còn ${opponentHP}/${opponentMaxHP} HP`);
        }
      }
      
      // Kiểm tra kết thúc
      if (userHP <= 0 || opponentHP <= 0) {
        break;
      }
    }

    // Xác định người thắng dựa trên HP
    if (userHP > 0 && opponentHP <= 0) {
      winner = userFish;
      loser = opponentFish;
      winnerPower = userTotalPower;
      loserPower = opponentTotalPower;
      isUserWinner = true;
      battleLog.push(`\n🏆 **${userFish.species} chiến thắng!**`);
    } else if (opponentHP > 0 && userHP <= 0) {
      winner = opponentFish;
      loser = userFish;
      winnerPower = opponentTotalPower;
      loserPower = userTotalPower;
      isUserWinner = false;
      battleLog.push(`\n🏆 **${opponentName} chiến thắng!**`);
    } else {
      // Hòa - cả hai đều còn HP hoặc hết hiệp
      if (userHP > opponentHP) {
        winner = userFish;
        loser = opponentFish;
        winnerPower = userTotalPower;
        loserPower = opponentTotalPower;
        isUserWinner = true;
        battleType = 'tie';
        battleLog.push(`\n🤝 **Hòa!** ${userFish.species} thắng nhờ HP cao hơn!`);
      } else if (opponentHP > userHP) {
        winner = opponentFish;
        loser = userFish;
        winnerPower = opponentTotalPower;
        loserPower = userTotalPower;
        isUserWinner = false;
        battleType = 'tie';
        battleLog.push(`\n🤝 **Hòa!** ${opponentName} thắng nhờ HP cao hơn!`);
      } else {
        // HP bằng nhau - dùng may mắn
        if (userLuckRoll >= opponentLuckRoll) {
          winner = userFish;
          loser = opponentFish;
          winnerPower = userTotalPower;
          loserPower = opponentTotalPower;
          isUserWinner = true;
          battleType = 'tie';
          battleLog.push(`\n🤝 **Hòa!** ${userFish.species} thắng nhờ may mắn cao hơn!`);
        } else {
          winner = opponentFish;
          loser = userFish;
          winnerPower = opponentTotalPower;
          loserPower = userTotalPower;
          isUserWinner = false;
          battleType = 'tie';
          battleLog.push(`\n🤝 **Hòa!** ${opponentName} thắng nhờ may mắn cao hơn!`);
        }
      }
    }

    // Kết quả đã được hiển thị ở trên, không cần duplicate

    // === PHASE 7: TÍNH TOÁN PHẦN THƯỞNG ===
    battleLog.push(`\n💰 **PHASE 7: Tính toán phần thưởng**`);
    
    // Tính toán độ chênh lệch sức mạnh
    const powerDifference = Math.abs(winnerPower - loserPower);
    const totalPower = winnerPower + loserPower;
    const powerRatio = powerDifference / totalPower; // 0 = cân bằng, 1 = chênh lệch lớn
    
    // Base reward dựa trên tổng sức mạnh (tăng 10 lần)
    const baseReward = Math.floor(totalPower / 1); // Thay vì chia 10, giờ chia 1 (tăng 10 lần)
    
    // Multiplier dựa trên độ cân bằng (càng cân bằng càng cao)
    const balanceMultiplier = Math.max(0.5, 2.0 - powerRatio * 1.5); // 0.5 - 2.0
    
    // Tính phần thưởng cơ bản
    let winnerReward = Math.floor(baseReward * balanceMultiplier);
    let loserReward = Math.floor(baseReward * 0.3);
    
    // Hiển thị thông tin cân bằng
    const balancePercentage = Math.round((1 - powerRatio) * 100);
    battleLog.push(`⚖️ Độ cân bằng trận đấu: ${balancePercentage}%`);
    battleLog.push(`📊 Chênh lệch sức mạnh: ${Math.floor(powerDifference)} (${Math.round(powerRatio * 100)}%)`);
    battleLog.push(`🎯 Multiplier cân bằng: x${balanceMultiplier.toFixed(2)}`);
    
    // Bonus cho trận đấu rất cân bằng (chênh lệch < 10%)
    if (powerRatio < 0.1) {
      const perfectBalanceBonus = 1.5; // +50% bonus
      winnerReward = Math.floor(winnerReward * perfectBalanceBonus);
      battleLog.push(`🌟 **BONUS HOÀN HẢO!** Trận đấu cực kỳ cân bằng! +50%`);
    }
    // Bonus cho trận đấu cân bằng (chênh lệch < 25%)
    else if (powerRatio < 0.25) {
      const balanceBonus = 1.3; // +30% bonus
      winnerReward = Math.floor(winnerReward * balanceBonus);
      battleLog.push(`✨ **BONUS CÂN BẰNG!** Trận đấu rất cân bằng! +30%`);
    }
    // Penalty cho trận đấu không cân bằng (chênh lệch > 50%)
    else if (powerRatio > 0.5) {
      const imbalancePenalty = 0.7; // -30% penalty
      winnerReward = Math.floor(winnerReward * imbalancePenalty);
      battleLog.push(`⚠️ **PENALTY KHÔNG CÂN BẰNG!** Trận đấu quá chênh lệch! -30%`);
    }
    
    // Bonus cho upset (giữ nguyên)
    if (battleType === 'upset') {
      winnerReward = Math.floor(winnerReward * 1.5); // +50% bonus cho upset
      battleLog.push(`🎭 Bonus upset: +50% phần thưởng!`);
    }
    
    // Bonus cho critical hit (giữ nguyên)
    if (userCritMultiplier > 1 || opponentCritMultiplier > 1) {
      winnerReward = Math.floor(winnerReward * 1.2); // +20% bonus cho critical
      battleLog.push(`💥 Bonus critical: +20% phần thưởng!`);
    }
    
    battleLog.push(`🐟 Phần thưởng người thắng: ${winnerReward.toLocaleString()} FishCoin`);
    battleLog.push(`🐟 Phần thưởng người thua: ${loserReward.toLocaleString()} FishCoin`);

    // Cập nhật FishCoin balance
    if (isUserWinner) {
      await fishCoinDB.addFishCoin(userId, guildId, winnerReward, `Battle victory reward: ${winner.species} vs ${loser.species}`);
    } else {
      await fishCoinDB.addFishCoin(userId, guildId, loserReward, `Battle defeat reward: ${loser.species} vs ${winner.species}`);
    }

    // Ghi lại lịch sử đấu
    await prisma.battleHistory.create({
      data: {
        userId,
        guildId,
        fishId,
        opponentId,
        opponentUserId: isBotOpponent ? 'BOT_OPPONENT' : opponentFish.userId,
        userPower: Math.floor(userTotalPower),
        opponentPower: Math.floor(opponentTotalPower),
        userWon: isUserWinner,
        reward: isUserWinner ? winnerReward : loserReward,
        battleLog: JSON.stringify(battleLog)
      }
    });

    // Cập nhật cooldown và daily battle count (admin không bị cập nhật cooldown)
    if (!isAdmin) {
      this.updateBattleCooldown(userId, guildId);
    }
    await this.incrementDailyBattleCount(userId, guildId);

    // Sử dụng HP thực tế từ battle
    const winnerFinalHP = {
      current: winner === userFish ? userHP : opponentHP,
      max: winner === userFish ? userMaxHP : opponentMaxHP,
      percentage: Math.floor(((winner === userFish ? userHP : opponentHP) / (winner === userFish ? userMaxHP : opponentMaxHP)) * 100)
    };
    
    const loserFinalHP = {
      current: loser === userFish ? userHP : opponentHP,
      max: loser === userFish ? userMaxHP : opponentMaxHP,
      percentage: Math.floor(((loser === userFish ? userHP : opponentHP) / (loser === userFish ? userMaxHP : opponentMaxHP)) * 100)
    };

    // Tạo battle ID và lưu battle log
    const battleId = this.generateBattleId();
    this.saveBattleLog(battleId, battleLog);

    return {
      winner: {
        ...winner,
        name: winner === userFish ? userFish.species : (isBotOpponent ? opponentResult.opponent.name : opponentFish.species),
        stats: winner === userFish ? userStats : opponentStats
      },
      loser: {
        ...loser,
        name: loser === userFish ? userFish.species : (isBotOpponent ? opponentResult.opponent.name : opponentFish.species),
        stats: loser === userFish ? userStats : opponentStats
      },
      winnerPower: Math.floor(winnerPower),
      loserPower: Math.floor(loserPower),
      battleLog, // Vẫn giữ để backward compatibility
      rewards: {
        winner: winnerReward,
        loser: loserReward
      },
      finalHP: {
        winner: winnerFinalHP,
        loser: loserFinalHP
      },
      battleId // Thêm battle ID để có thể lấy log sau
    };
  } catch (error) {
    console.error(`❌ Error in battleFish:`, error);
    return { success: false, error: 'Đã xảy ra lỗi khi đấu cá!' };
  }
  }

  /**
   * Lấy thống kê đấu cá của user
   */
  static async getBattleStats(userId: string, guildId: string): Promise<BattleStats> {
    const battles = await prisma.battleHistory.findMany({
      where: { userId, guildId }
    });

    const totalBattles = battles.length;
    const wins = battles.filter(b => b.userWon).length;
    const losses = totalBattles - wins;
    const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0;
    const totalEarnings = battles.reduce((sum, b) => sum + Number(b.reward), 0);

    return {
      totalBattles,
      wins,
      losses,
      winRate: Math.round(winRate * 100) / 100,
      totalEarnings
    };
  }

  /**
   * Lấy lịch sử đấu gần đây
   */
  static async getRecentBattles(userId: string, guildId: string, limit: number = 5) {
    const battles = await prisma.battleHistory.findMany({
      where: { userId, guildId },
      orderBy: { battledAt: 'desc' },
      take: limit
    });

    // Lấy thông tin cá từ fishId và opponentId
    const fishIds = [...new Set([
      ...battles.map(b => b.fishId),
      ...battles.map(b => b.opponentId)
    ])];

    const fishes = await prisma.fish.findMany({
      where: { id: { in: fishIds } }
    });

    const fishMap = new Map(fishes.map(fish => [fish.id, fish]));

    return battles.map(battle => {
      const userFish = fishMap.get(battle.fishId);
      const opponentFish = fishMap.get(battle.opponentId);

      return {
        ...battle,
        userFish: userFish ? {
          ...userFish,
          name: userFish.species,
          stats: JSON.parse(userFish.stats || '{}')
        } : null,
        opponentFish: opponentFish ? {
          ...opponentFish,
          name: opponentFish.species,
          stats: JSON.parse(opponentFish.stats || '{}')
        } : null,
        battleLog: JSON.parse(battle.battleLog || '[]')
      };
    });
  }

  /**
   * Lấy bảng xếp hạng đấu cá
   */
  static async getBattleLeaderboard(guildId: string, limit: number = 10) {
    // Lấy tất cả users trong guild (không giới hạn số lượng)
    const allUsers = await prisma.user.findMany({
      where: { guildId }
    });

    // Lấy dữ liệu đấu cá cho tất cả users
    const battleData = await prisma.$queryRaw`
      SELECT 
        u.userId,
        COUNT(b.id) as totalBattles,
        SUM(CASE WHEN b.userWon THEN 1 ELSE 0 END) as wins,
        SUM(b.reward) as totalEarnings
      FROM User u
      LEFT JOIN BattleHistory b ON u.userId = b.userId AND u.guildId = b.guildId
      WHERE u.guildId = ${guildId}
      GROUP BY u.userId
    `;

    // Tạo map để truy cập nhanh battle data
    const battleMap = new Map();
    (battleData as any[]).forEach(user => {
      battleMap.set(user.userId, {
        totalBattles: typeof user.totalBattles === 'bigint' ? Number(user.totalBattles) : Number(user.totalBattles || 0),
        wins: typeof user.wins === 'bigint' ? Number(user.wins) : Number(user.wins || 0),
        totalEarnings: typeof user.totalEarnings === 'bigint' ? Number(user.totalEarnings) : Number(user.totalEarnings || 0)
      });
    });

    // Tạo leaderboard với tất cả users, kể cả chưa có dữ liệu đấu cá
    const leaderboard = allUsers.map(user => {
      const battleInfo = battleMap.get(user.userId) || {
        totalBattles: 0,
        wins: 0,
        totalEarnings: 0
      };

      return {
        userId: user.userId,
        balance: typeof user.balance === 'bigint' ? Number(user.balance) : user.balance,
        totalBattles: battleInfo.totalBattles,
        wins: battleInfo.wins,
        totalEarnings: battleInfo.totalEarnings
      };
    });

    // Sắp xếp theo wins DESC, totalEarnings DESC, balance DESC
    leaderboard.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.totalEarnings !== b.totalEarnings) return b.totalEarnings - a.totalEarnings;
      return b.balance - a.balance;
    });

    return leaderboard.slice(0, limit);
  }
} 