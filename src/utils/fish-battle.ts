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
  private static battleCooldowns = new Map<string, number>();
  private static readonly BATTLE_COOLDOWN = 60000; // 60 giây (1 phút)
  private static readonly DAILY_BATTLE_LIMIT = 20; // Giới hạn 20 lần đấu cá mỗi ngày

  /**
   * Kiểm tra cooldown battle
   */
  static checkBattleCooldown(userId: string, guildId: string): { canBattle: boolean; remainingTime?: number } {
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
  static async checkAndResetDailyBattleCount(userId: string, guildId: string): Promise<{ canBattle: boolean; remainingBattles: number; error?: string }> {
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

      if (isNewDay) {
        // Reset daily battle count cho ngày mới
        await prisma.user.update({
          where: { userId_guildId: { userId, guildId } },
          data: {
            dailyBattleCount: 0,
            lastBattleReset: now
          }
        });
        
        return { canBattle: true, remainingBattles: this.DAILY_BATTLE_LIMIT };
      }

      // Kiểm tra xem có vượt quá giới hạn không (áp dụng cho tất cả người dùng)
      if (user.dailyBattleCount >= this.DAILY_BATTLE_LIMIT) {
        return { 
          canBattle: false, 
          remainingBattles: 0, 
          error: `Bạn đã đạt giới hạn ${this.DAILY_BATTLE_LIMIT} lần đấu cá trong ngày! Vui lòng thử lại vào ngày mai.` 
        };
      }

      const remainingBattles = this.DAILY_BATTLE_LIMIT - user.dailyBattleCount;
      return { canBattle: true, remainingBattles };
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
      return { success: false, error: 'Không có đối thủ nào trong server!' };
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
      }
    };
  }

  /**
   * Đấu cá với đối thủ
   */
  static async battleFish(userId: string, guildId: string, fishId: string, opponentId: string): Promise<BattleResult | { success: false, error: string }> {
    try {
      console.log(`🔍 [DEBUG] battleFish called:`);
      console.log(`  - userId: ${userId}`);
      console.log(`  - guildId: ${guildId}`);
      console.log(`  - fishId: ${fishId}`);
      console.log(`  - opponentId: ${opponentId}`);

      // Kiểm tra cooldown và daily battle limit (áp dụng cho tất cả người dùng)
      const cooldownCheck = this.checkBattleCooldown(userId, guildId);
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

      const opponentFish = await prisma.fish.findFirst({
        where: { id: opponentId }
      });

      console.log(`  - userFish found: ${!!userFish}`);
      console.log(`  - opponentFish found: ${!!opponentFish}`);

      if (!userFish || !opponentFish) {
        return { success: false, error: 'Không tìm thấy cá!' };
      }

      if (userFish.status !== 'adult' || opponentFish.status !== 'adult') {
        return { success: false, error: 'Chỉ cá trưởng thành mới có thể đấu!' };
      }

    // Parse stats
    const userStats: FishStats = JSON.parse(userFish.stats || '{}');
    const opponentStats: FishStats = JSON.parse(opponentFish.stats || '{}');

    // Tính toán sức mạnh cơ bản
    const userBasePower = FishBreedingService.calculateTotalPowerWithLevel({
      ...userFish,
      stats: userStats
    });
    const opponentBasePower = FishBreedingService.calculateTotalPowerWithLevel({
      ...opponentFish,
      stats: opponentStats
    });

    // Tạo battle log
    const battleLog: string[] = [];
    
    // === PHASE 0: KIỂM TRA VŨ KHÍ TRANG BỊ ===
    battleLog.push(`⚔️ **${userFish.species}** vs **${opponentFish.species}**`);
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

    battleLog.push(`\n📊 **Stats ${opponentFish.species}:**`);
            battleLog.push(`💪 Sức mạnh: ${opponentStats.strength || 0} | 🏃 Thể lực: ${opponentStats.agility || 0} | 🧠 Trí tuệ: ${opponentStats.intelligence || 0} | 🛡️ Phòng thủ: ${opponentStats.defense || 0} | 🍀 May mắn: ${opponentStats.luck || 0} | 🎯 Độ chính xác: ${opponentStats.accuracy || 0}`);

    // === PHASE 1: KIỂM TRA ĐIỀU KIỆN ĐẶC BIỆT ===
    battleLog.push(`\n🎯 **PHASE 1: Kiểm tra điều kiện đặc biệt**`);
    
    // Kiểm tra thế hệ (cá thế hệ cao hơn có lợi thế)
    const userGen = userFish.generation || 1;
    const opponentGen = opponentFish.generation || 1;
    const userGenBonus = Math.max(0, (userGen - opponentGen) * 0.1); // +10% mỗi thế hệ chênh lệch
    const opponentGenBonus = Math.max(0, (opponentGen - userGen) * 0.1);
    
    if (userGenBonus > 0) {
      battleLog.push(`🌟 ${userFish.species} có lợi thế thế hệ: +${Math.round(userGenBonus * 100)}%`);
    }
    if (opponentGenBonus > 0) {
      battleLog.push(`🌟 ${opponentFish.species} có lợi thế thế hệ: +${Math.round(opponentGenBonus * 100)}%`);
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
    battleLog.push(`${opponentBuffEmoji} **${opponentFish.species}** ${opponentBuffText} ${opponentBuffType.name} ${opponentBuffAmount} điểm!`);
    
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
    battleLog.push(`🍀 ${opponentFish.species} may mắn: +${Math.round(opponentLuckBonus * 100)}%`);

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
      battleLog.push(`💥 **CRITICAL HIT!** ${opponentFish.species} gây sát thương x1.5!`);
    }

    // Hiển thị critical hit chance
            battleLog.push(`🎯 ${userFish.species} Crit Chance: ${Math.round(userCritChance * 100)}% (Luck: ${userStats.luck || 0} + Fish Accuracy: ${userStats.accuracy || 0} + Weapon Accuracy: ${userWeaponStats.accuracy || 0}%)`);
    battleLog.push(`🎯 ${opponentFish.species} Crit Chance: ${Math.round(opponentCritChance * 100)}% (Luck: ${opponentStats.luck || 0})`);

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
        battleLog.push(`🔥 **KHẢ NĂNG ĐẶC BIỆT!** ${opponentFish.species} kích hoạt sức mạnh tiềm ẩn! +20%`);
      }
    }

    // === PHASE 5: TÍNH TOÁN KẾT QUẢ CUỐI CÙNG ===
    battleLog.push(`\n🏆 **PHASE 5: Kết quả cuối cùng**`);
    
    const userTotalPower = userFinalPower * userCritMultiplier * (1 + userSpecialBonus);
    const opponentTotalPower = opponentFinalPower * opponentCritMultiplier * (1 + opponentSpecialBonus);
    
    battleLog.push(`💪 Sức mạnh tổng: ${Math.floor(userTotalPower)} vs ${Math.floor(opponentTotalPower)}`);

    // === PHASE 6: XÁC ĐỊNH NGƯỜI THẮNG ===
    let winner, loser, winnerPower, loserPower;
    let isUserWinner = false;
    let battleType = 'normal';

    // Thêm yếu tố random để tạo bất ngờ (10% chance cho upset)
    const upsetChance = 0.1;
    const upsetRoll = Math.random();
    
    if (upsetRoll < upsetChance) {
      // Upset - cá yếu hơn có thể thắng
      const powerDifference = Math.abs(userTotalPower - opponentTotalPower);
      const maxUpsetPower = Math.max(userTotalPower, opponentTotalPower) * 0.3; // Chỉ upset nếu chênh lệch < 30%
      
      if (powerDifference < maxUpsetPower) {
        if (userTotalPower > opponentTotalPower) {
          winner = opponentFish;
          loser = userFish;
          winnerPower = opponentTotalPower;
          loserPower = userTotalPower;
          isUserWinner = false;
          battleType = 'upset';
          battleLog.push(`🎭 **BẤT NGỜ!** ${opponentFish.species} thắng dù yếu hơn! (Upset)`);
        } else {
          winner = userFish;
          loser = opponentFish;
          winnerPower = userTotalPower;
          loserPower = opponentTotalPower;
          isUserWinner = true;
          battleType = 'upset';
          battleLog.push(`🎭 **BẤT NGỜ!** ${userFish.species} thắng dù yếu hơn! (Upset)`);
        }
      } else {
        // Không đủ điều kiện upset, dùng logic bình thường
        if (userTotalPower > opponentTotalPower) {
          winner = userFish;
          loser = opponentFish;
          winnerPower = userTotalPower;
          loserPower = opponentTotalPower;
          isUserWinner = true;
        } else if (opponentTotalPower > userTotalPower) {
          winner = opponentFish;
          loser = userFish;
          winnerPower = opponentTotalPower;
          loserPower = userTotalPower;
          isUserWinner = false;
        } else {
          // Hòa - người có may mắn cao hơn thắng
          if (userLuckRoll >= opponentLuckRoll) {
            winner = userFish;
            loser = opponentFish;
            winnerPower = userTotalPower;
            loserPower = opponentTotalPower;
            isUserWinner = true;
            battleType = 'tie';
            battleLog.push(`🤝 **Hòa!** ${userFish.species} thắng nhờ may mắn cao hơn!`);
          } else {
            winner = opponentFish;
            loser = userFish;
            winnerPower = opponentTotalPower;
            loserPower = userTotalPower;
            isUserWinner = false;
            battleType = 'tie';
            battleLog.push(`🤝 **Hòa!** ${opponentFish.species} thắng nhờ may mắn cao hơn!`);
          }
        }
      }
    } else {
      // Logic bình thường
      if (userTotalPower > opponentTotalPower) {
        winner = userFish;
        loser = opponentFish;
        winnerPower = userTotalPower;
        loserPower = opponentTotalPower;
        isUserWinner = true;
      } else if (opponentTotalPower > userTotalPower) {
        winner = opponentFish;
        loser = userFish;
        winnerPower = opponentTotalPower;
        loserPower = userTotalPower;
        isUserWinner = false;
      } else {
        // Hòa - người có may mắn cao hơn thắng
        if (userLuckRoll >= opponentLuckRoll) {
          winner = userFish;
          loser = opponentFish;
          winnerPower = userTotalPower;
          loserPower = opponentTotalPower;
          isUserWinner = true;
          battleType = 'tie';
          battleLog.push(`🤝 **Hòa!** ${userFish.species} thắng nhờ may mắn cao hơn!`);
        } else {
          winner = opponentFish;
          loser = userFish;
          winnerPower = opponentTotalPower;
          loserPower = userTotalPower;
          isUserWinner = false;
          battleType = 'tie';
          battleLog.push(`🤝 **Hòa!** ${opponentFish.species} thắng nhờ may mắn cao hơn!`);
        }
      }
    }

    // Hiển thị kết quả
    if (battleType === 'upset') {
      battleLog.push(`\n🎭 **${winner.species} chiến thắng trong trận đấu đầy bất ngờ!**`);
    } else if (battleType === 'tie') {
      battleLog.push(`\n🤝 **${winner.species} chiến thắng sau trận đấu cân bằng!**`);
    } else {
      battleLog.push(`\n🏆 **${winner.species} chiến thắng!**`);
    }

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
        opponentUserId: opponentFish.userId,
        userPower: Math.floor(userTotalPower),
        opponentPower: Math.floor(opponentTotalPower),
        userWon: isUserWinner,
        reward: isUserWinner ? winnerReward : loserReward,
        battleLog: JSON.stringify(battleLog)
      }
    });

    // Cập nhật cooldown và daily battle count
    this.updateBattleCooldown(userId, guildId);
    await this.incrementDailyBattleCount(userId, guildId);

    return {
      winner: {
        ...winner,
        name: winner.species,
        stats: winner === userFish ? userStats : opponentStats
      },
      loser: {
        ...loser,
        name: loser.species,
        stats: loser === userFish ? userStats : opponentStats
      },
      winnerPower: Math.floor(winnerPower),
      loserPower: Math.floor(loserPower),
      battleLog,
      rewards: {
        winner: winnerReward,
        loser: loserReward
      }
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