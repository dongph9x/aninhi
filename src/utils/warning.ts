import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface WarningData {
  userId: string;
  guildId: string;
  moderatorId: string;
  warningLevel: number;
  reason: string;
  message: string;
  expiresAt?: Date;
}

export interface WarningStats {
  totalWarnings: number;
  activeWarnings: number;
  warningLevels: {
    level1: number;
    level2: number;
    level3: number;
  };
}

export class WarningService {
  // Messages mặc định cho từng level
  private static defaultMessages = {
    1: "⚠️ **Cảnh cáo lần 1** - Đây là cảnh cáo đầu tiên. Hãy tuân thủ nội quy server!",
    2: "🚨 **Cảnh cáo lần 2** - Đây là cảnh cáo thứ hai. Vi phạm thêm sẽ bị ban!",
    3: "🔨 **Cảnh cáo lần 3** - Đây là cảnh cáo cuối cùng. Bạn sẽ bị ban khỏi server!"
  };

  /**
   * Tạo cảnh cáo mới cho user
   */
  static async createWarning(data: WarningData): Promise<any> {
    try {
      // Kiểm tra warning level hiện tại của user
      const currentWarnings = await this.getActiveWarnings(data.userId, data.guildId);
      const currentLevel = currentWarnings.length;

      // Nếu đã có 3 cảnh cáo, không cho phép thêm
      if (currentLevel >= 3) {
        throw new Error("User đã có đủ 3 cảnh cáo. Không thể thêm cảnh cáo mới.");
      }

      // Tạo cảnh cáo mới
      const warning = await prisma.warningRecord.create({
        data: {
          userId: data.userId,
          guildId: data.guildId,
          moderatorId: data.moderatorId,
          warningLevel: currentLevel + 1,
          reason: data.reason,
          message: data.message || this.defaultMessages[currentLevel + 1 as keyof typeof this.defaultMessages],
          expiresAt: data.expiresAt,
          isActive: true
        }
      });

      return warning;
    } catch (error) {
      console.error("Error creating warning:", error);
      throw error;
    }
  }

  /**
   * Lấy tất cả cảnh cáo active của user
   */
  static async getActiveWarnings(userId: string, guildId: string): Promise<any[]> {
    try {
      const warnings = await prisma.warningRecord.findMany({
        where: {
          userId,
          guildId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return warnings;
    } catch (error) {
      console.error("Error getting active warnings:", error);
      throw error;
    }
  }

  /**
   * Lấy thống kê cảnh cáo của user
   */
  static async getUserWarningStats(userId: string, guildId: string): Promise<WarningStats> {
    try {
      const activeWarnings = await this.getActiveWarnings(userId, guildId);
      const totalWarnings = await prisma.warningRecord.count({
        where: {
          userId,
          guildId
        }
      });

      const warningLevels = {
        level1: activeWarnings.filter(w => w.warningLevel === 1).length,
        level2: activeWarnings.filter(w => w.warningLevel === 2).length,
        level3: activeWarnings.filter(w => w.warningLevel === 3).length
      };

      return {
        totalWarnings,
        activeWarnings: activeWarnings.length,
        warningLevels
      };
    } catch (error) {
      console.error("Error getting user warning stats:", error);
      throw error;
    }
  }

  /**
   * Xóa cảnh cáo (chỉ moderator hoặc admin mới có thể xóa)
   */
  static async removeWarning(warningId: string, moderatorId: string): Promise<boolean> {
    try {
      const warning = await prisma.warningRecord.findUnique({
        where: { id: warningId }
      });

      if (!warning) {
        throw new Error("Không tìm thấy cảnh cáo này.");
      }

      // Chỉ cho phép moderator đã tạo cảnh cáo hoặc admin xóa
      if (warning.moderatorId !== moderatorId) {
        throw new Error("Bạn không có quyền xóa cảnh cáo này.");
      }

      await prisma.warningRecord.update({
        where: { id: warningId },
        data: { isActive: false }
      });

      return true;
    } catch (error) {
      console.error("Error removing warning:", error);
      throw error;
    }
  }

  /**
   * Xóa tất cả cảnh cáo của user (admin only)
   */
  static async clearUserWarnings(userId: string, guildId: string, moderatorId: string): Promise<boolean> {
    try {
      await prisma.warningRecord.updateMany({
        where: {
          userId,
          guildId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return true;
    } catch (error) {
      console.error("Error clearing user warnings:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem user có nên bị ban không (3 cảnh cáo)
   */
  static async shouldBanUser(userId: string, guildId: string): Promise<boolean> {
    try {
      const activeWarnings = await this.getActiveWarnings(userId, guildId);
      return activeWarnings.length >= 3;
    } catch (error) {
      console.error("Error checking if user should be banned:", error);
      return false;
    }
  }

  /**
   * Lấy danh sách user có cảnh cáo trong server
   */
  static async getServerWarnings(guildId: string, limit: number = 20): Promise<any[]> {
    try {
      const warnings = await prisma.warningRecord.findMany({
        where: {
          guildId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          // Có thể include thêm thông tin user nếu cần
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return warnings;
    } catch (error) {
      console.error("Error getting server warnings:", error);
      throw error;
    }
  }

  /**
   * Tạo message cảnh cáo tùy chỉnh
   */
  static createWarningMessage(level: number, reason: string, customMessage?: string): string {
    const baseMessage = customMessage || this.defaultMessages[level as keyof typeof this.defaultMessages];
    
    return `${baseMessage}\n\n📝 **Lý do:** ${reason}\n⏰ **Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>`;
  }

  /**
   * Tạo message thông báo ban tự động
   */
  static createAutoBanMessage(userId: string, reason: string): string {
    return `🔨 **Tự động ban** - <@${userId}> đã bị ban do đạt 3 cảnh cáo!\n\n📝 **Lý do ban:** ${reason}\n⏰ **Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>`;
  }

  /**
   * Lấy thống kê cảnh cáo của server
   */
  static async getServerWarningStats(guildId: string): Promise<any> {
    try {
      const totalWarnings = await prisma.warningRecord.count({
        where: { guildId }
      });

      const activeWarnings = await prisma.warningRecord.count({
        where: {
          guildId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      const levelStats = await prisma.warningRecord.groupBy({
        by: ['warningLevel'],
        where: {
          guildId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        _count: {
          warningLevel: true
        }
      });

      return {
        totalWarnings,
        activeWarnings,
        levelStats
      };
    } catch (error) {
      console.error("Error getting server warning stats:", error);
      throw error;
    }
  }
}