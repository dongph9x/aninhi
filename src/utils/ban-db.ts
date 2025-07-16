import { prisma } from './database';

// Types
export interface BanRecordData {
  id: string;
  userId: string;
  guildId: string;
  moderatorId: string;
  reason: string;
  banAt: Date;
  expiresAt: Date | null;
  type: 'permanent' | 'temporary';
  isActive: boolean;
}

export class BanDatabaseService {
  private static instance: BanDatabaseService;

  private constructor() {}

  public static getInstance(): BanDatabaseService {
    if (!BanDatabaseService.instance) {
      BanDatabaseService.instance = new BanDatabaseService();
    }
    return BanDatabaseService.instance;
  }

  // ===== BAN MANAGEMENT =====

  /**
   * Tạo ban record mới
   */
  async createBan(
    userId: string,
    guildId: string,
    moderatorId: string,
    reason: string,
    type: 'permanent' | 'temporary',
    duration?: number, // milliseconds
  ): Promise<BanRecordData> {
    const expiresAt = type === 'temporary' && duration 
      ? new Date(Date.now() + duration)
      : null;

    const banRecord = await prisma.banRecord.create({
      data: {
        userId,
        guildId,
        moderatorId,
        reason,
        type,
        expiresAt,
        isActive: true,
      },
    });

    return banRecord;
  }

  /**
   * Lấy ban record hiện tại của user
   */
  async getActiveBan(userId: string, guildId: string): Promise<BanRecordData | null> {
    const banRecord = await prisma.banRecord.findFirst({
      where: {
        userId,
        guildId,
        isActive: true,
        OR: [
          { type: 'permanent' },
          {
            type: 'temporary',
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      orderBy: {
        banAt: 'desc',
      },
    });

    return banRecord;
  }

  /**
   * Kiểm tra user có bị ban không
   */
  async isUserBanned(userId: string, guildId: string): Promise<boolean> {
    const banRecord = await this.getActiveBan(userId, guildId);
    return !!banRecord;
  }

  /**
   * Unban user
   */
  async unbanUser(userId: string, guildId: string): Promise<boolean> {
    const result = await prisma.banRecord.updateMany({
      where: {
        userId,
        guildId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count > 0;
  }

  /**
   * Lấy danh sách ban records
   */
  async getBanList(guildId: string, limit: number = 50): Promise<BanRecordData[]> {
    const banRecords = await prisma.banRecord.findMany({
      where: {
        guildId,
        isActive: true,
      },
      orderBy: {
        banAt: 'desc',
      },
      take: limit,
    });

    return banRecords;
  }

  /**
   * Lấy ban history của user
   */
  async getUserBanHistory(userId: string, guildId: string): Promise<BanRecordData[]> {
    const banRecords = await prisma.banRecord.findMany({
      where: {
        userId,
        guildId,
      },
      orderBy: {
        banAt: 'desc',
      },
    });

    return banRecords;
  }

  /**
   * Lấy ban records theo moderator
   */
  async getBansByModerator(moderatorId: string, guildId: string): Promise<BanRecordData[]> {
    const banRecords = await prisma.banRecord.findMany({
      where: {
        moderatorId,
        guildId,
      },
      orderBy: {
        banAt: 'desc',
      },
    });

    return banRecords;
  }

  /**
   * Tìm kiếm ban records
   */
  async searchBans(
    guildId: string,
    searchTerm: string,
    limit: number = 20,
  ): Promise<BanRecordData[]> {
    const banRecords = await prisma.banRecord.findMany({
      where: {
        guildId,
        OR: [
          {
            userId: {
              contains: searchTerm,
            },
          },
          {
            reason: {
              contains: searchTerm,
            },
          },
        ],
      },
      orderBy: {
        banAt: 'desc',
      },
      take: limit,
    });

    return banRecords;
  }

  /**
   * Xóa ban records cũ (đã hết hạn và không active)
   */
  async cleanupExpiredBans(): Promise<number> {
    const result = await prisma.banRecord.deleteMany({
      where: {
        type: 'temporary',
        expiresAt: {
          lt: new Date(),
        },
        isActive: false,
      },
    });

    return result.count;
  }

  /**
   * Tự động deactivate các ban đã hết hạn
   */
  async deactivateExpiredBans(): Promise<number> {
    const result = await prisma.banRecord.updateMany({
      where: {
        type: 'temporary',
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count;
  }

  /**
   * Lấy thống kê ban
   */
  async getBanStats(guildId: string): Promise<{
    totalBans: number;
    activeBans: number;
    permanentBans: number;
    temporaryBans: number;
    expiredBans: number;
  }> {
    const [
      totalBans,
      activeBans,
      permanentBans,
      temporaryBans,
      expiredBans,
    ] = await Promise.all([
      prisma.banRecord.count({
        where: { guildId },
      }),
      prisma.banRecord.count({
        where: {
          guildId,
          isActive: true,
          OR: [
            { type: 'permanent' },
            {
              type: 'temporary',
              expiresAt: {
                gt: new Date(),
              },
            },
          ],
        },
      }),
      prisma.banRecord.count({
        where: {
          guildId,
          type: 'permanent',
        },
      }),
      prisma.banRecord.count({
        where: {
          guildId,
          type: 'temporary',
        },
      }),
      prisma.banRecord.count({
        where: {
          guildId,
          type: 'temporary',
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return {
      totalBans,
      activeBans,
      permanentBans,
      temporaryBans,
      expiredBans,
    };
  }

  /**
   * Lấy ban record theo ID
   */
  async getBanById(id: string): Promise<BanRecordData | null> {
    const banRecord = await prisma.banRecord.findUnique({
      where: { id },
    });

    return banRecord;
  }

  /**
   * Cập nhật ban record
   */
  async updateBan(
    id: string,
    data: Partial<{
      reason: string;
      expiresAt: Date | null;
      isActive: boolean;
    }>,
  ): Promise<BanRecordData | null> {
    const banRecord = await prisma.banRecord.update({
      where: { id },
      data,
    });

    return banRecord;
  }
}

// Export singleton instance
export const banDB = BanDatabaseService.getInstance(); 