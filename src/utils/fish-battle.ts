import prisma from './prisma';
import { FishBreedingService } from './fish-breeding';
import { BattleFishInventoryService } from './battle-fish-inventory';
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

    // Tìm cá trưởng thành khác trong server
    const opponents = await prisma.fish.findMany({
      where: {
        guildId,
        status: 'adult',
        rarity: 'legendary',
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
    const userFish = await prisma.fish.findFirst({
      where: { id: fishId, userId }
    });

    const opponentFish = await prisma.fish.findFirst({
      where: { id: opponentId }
    });

    if (!userFish || !opponentFish) {
      return { success: false, error: 'Không tìm thấy cá!' };
    }

    if (userFish.status !== 'adult' || opponentFish.status !== 'adult') {
      return { success: false, error: 'Chỉ cá trưởng thành mới có thể đấu!' };
    }

    // Tính toán sức mạnh
    const userStats: FishStats = JSON.parse(userFish.stats || '{}');
    const opponentStats: FishStats = JSON.parse(opponentFish.stats || '{}');

    const userPower = FishBreedingService.calculateTotalPowerWithLevel({
      ...userFish,
      stats: userStats
    });
    const opponentPower = FishBreedingService.calculateTotalPowerWithLevel({
      ...opponentFish,
      stats: opponentStats
    });

    // Thêm yếu tố may mắn
    const userLuck = (userStats.luck || 0) / 100;
    const opponentLuck = (opponentStats.luck || 0) / 100;

    const userFinalPower = userPower * (1 + userLuck * 0.2); // +20% max từ luck
    const opponentFinalPower = opponentPower * (1 + opponentLuck * 0.2);

    // Tạo battle log
    const battleLog: string[] = [];
    battleLog.push(`⚔️ **${userFish.species}** vs **${opponentFish.species}**`);
    battleLog.push(`💪 Sức mạnh: ${Math.floor(userFinalPower)} vs ${Math.floor(opponentFinalPower)}`);

    // Thêm chi tiết stats
    battleLog.push(`\n📊 **Stats ${userFish.species}:**`);
    battleLog.push(`💪 Sức mạnh: ${userStats.strength || 0} | 🏃 Thể lực: ${userStats.agility || 0} | 🧠 Trí tuệ: ${userStats.intelligence || 0} | 🛡️ Phòng thủ: ${userStats.defense || 0} | 🍀 May mắn: ${userStats.luck || 0}`);

    battleLog.push(`\n📊 **Stats ${opponentFish.species}:**`);
    battleLog.push(`💪 Sức mạnh: ${opponentStats.strength || 0} | 🏃 Thể lực: ${opponentStats.agility || 0} | 🧠 Trí tuệ: ${opponentStats.intelligence || 0} | 🛡️ Phòng thủ: ${opponentStats.defense || 0} | 🍀 May mắn: ${opponentStats.luck || 0}`);

    // Xác định người thắng
    let winner, loser, winnerPower, loserPower;
    let isUserWinner = false;

    if (userFinalPower > opponentFinalPower) {
      winner = userFish;
      loser = opponentFish;
      winnerPower = userFinalPower;
      loserPower = opponentFinalPower;
      isUserWinner = true;
      battleLog.push(`\n🏆 **${userFish.species} chiến thắng!**`);
    } else if (opponentFinalPower > userFinalPower) {
      winner = opponentFish;
      loser = userFish;
      winnerPower = opponentFinalPower;
      loserPower = userFinalPower;
      isUserWinner = false;
      battleLog.push(`\n🏆 **${opponentFish.species} chiến thắng!**`);
    } else {
      // Hòa - người chủ sở hữu cá có may mắn cao hơn thắng
      if (userLuck >= opponentLuck) {
        winner = userFish;
        loser = opponentFish;
        winnerPower = userFinalPower;
        loserPower = opponentFinalPower;
        isUserWinner = true;
        battleLog.push(`\n🏆 **Hòa! ${userFish.species} thắng nhờ may mắn!**`);
      } else {
        winner = opponentFish;
        loser = userFish;
        winnerPower = opponentFinalPower;
        loserPower = userFinalPower;
        isUserWinner = false;
        battleLog.push(`\n🏆 **Hòa! ${opponentFish.species} thắng nhờ may mắn!**`);
      }
    }

    // Tính toán phần thưởng
    const baseReward = Math.floor((winnerPower + loserPower) / 10);
    const winnerReward = Math.floor(baseReward * 1.5);
    const loserReward = Math.floor(baseReward * 0.3);

    // Cập nhật balance cho người thắng
    if (isUserWinner) {
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { balance: { increment: winnerReward } }
      });
    } else {
      // Người thua vẫn nhận được một ít tiền
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { balance: { increment: loserReward } }
      });
    }

    // Ghi lại lịch sử đấu
    await prisma.battleHistory.create({
      data: {
        userId,
        guildId,
        fishId,
        opponentId,
        opponentUserId: opponentFish.userId,
        userPower: Math.floor(userFinalPower),
        opponentPower: Math.floor(opponentFinalPower),
        userWon: isUserWinner,
        reward: isUserWinner ? winnerReward : loserReward,
        battleLog: JSON.stringify(battleLog)
      }
    });

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
    const totalEarnings = battles.reduce((sum, b) => sum + b.reward, 0);

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
      include: {
        fish: true
      },
      orderBy: { battledAt: 'desc' },
      take: limit
    });

    return battles.map(battle => ({
      ...battle,
      fish: {
        ...battle.fish,
        name: battle.fish.species,
        stats: JSON.parse(battle.fish.stats || '{}')
      },
      battleLog: JSON.parse(battle.battleLog || '[]')
    }));
  }

  /**
   * Lấy bảng xếp hạng đấu cá
   */
  static async getBattleLeaderboard(guildId: string, limit: number = 10) {
    const leaderboard = await prisma.$queryRaw`
      SELECT 
        u.userId,
        u.balance,
        COUNT(b.id) as totalBattles,
        SUM(CASE WHEN b.userWon THEN 1 ELSE 0 END) as wins,
        SUM(b.reward) as totalEarnings
      FROM User u
      LEFT JOIN BattleHistory b ON u.userId = b.userId AND u.guildId = b.guildId
      WHERE u.guildId = ${guildId}
      GROUP BY u.userId, u.balance
      HAVING totalBattles > 0
      ORDER BY wins DESC, totalEarnings DESC
      LIMIT ${limit}
    `;

    return leaderboard;
  }
} 