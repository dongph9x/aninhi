import prisma from './prisma';

export class FishFeedService {
  private static readonly DAILY_FEED_LIMIT = 20; // Giới hạn 20 lần cho cá ăn mỗi ngày cho user thường
  private static readonly ADMIN_DAILY_FEED_LIMIT = 100; // Giới hạn 100 lần cho cá ăn mỗi ngày cho admin

  /**
   * Kiểm tra và reset daily feed count nếu cần
   */
  static async checkAndResetDailyFeedCount(userId: string, guildId: string): Promise<{ canFeed: boolean; remainingFeeds: number; error?: string; isAdmin?: boolean }> {
    try {
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId, guildId } }
      });

      if (!user) {
        return { canFeed: false, remainingFeeds: 0, error: 'Không tìm thấy người dùng' };
      }

      // Kiểm tra quyền admin
      const { FishBattleService } = await import('./fish-battle');
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
      
      // Xác định giới hạn dựa trên quyền
      const dailyLimit = isAdmin ? this.ADMIN_DAILY_FEED_LIMIT : this.DAILY_FEED_LIMIT;

      const now = new Date();
      const lastReset = new Date(user.lastFeedReset);
      
      // Kiểm tra xem có phải ngày mới không (so sánh ngày)
      const isNewDay = now.getDate() !== lastReset.getDate() || 
                      now.getMonth() !== lastReset.getMonth() || 
                      now.getFullYear() !== lastReset.getFullYear();

      if (isNewDay) {
        // Reset daily feed count cho ngày mới
        await prisma.user.update({
          where: { userId_guildId: { userId, guildId } },
          data: {
            dailyFeedCount: 0,
            lastFeedReset: now
          }
        });
        
        return { canFeed: true, remainingFeeds: dailyLimit, isAdmin };
      }

      // Kiểm tra xem có vượt quá giới hạn không
      if (user.dailyFeedCount >= dailyLimit) {
        return { 
          canFeed: false, 
          remainingFeeds: 0, 
          error: `Bạn đã đạt giới hạn ${dailyLimit} lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.`,
          isAdmin
        };
      }

      const remainingFeeds = dailyLimit - user.dailyFeedCount;
      return { canFeed: true, remainingFeeds, isAdmin };
    } catch (error) {
      console.error('Error checking daily feed count:', error);
      return { canFeed: false, remainingFeeds: 0, error: 'Đã xảy ra lỗi khi kiểm tra giới hạn cho cá ăn', isAdmin: false };
    }
  }

  /**
   * Tăng daily feed count
   */
  static async incrementDailyFeedCount(userId: string, guildId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: {
          dailyFeedCount: {
            increment: 1
          }
        }
      });
    } catch (error) {
      console.error('Error incrementing daily feed count:', error);
    }
  }

  /**
   * Lấy thông tin daily feed limit
   */
  static getDailyFeedLimit(): number {
    return this.DAILY_FEED_LIMIT;
  }

  /**
   * Lấy thông tin admin daily feed limit
   */
  static getAdminDailyFeedLimit(): number {
    return this.ADMIN_DAILY_FEED_LIMIT;
  }

  /**
   * Lấy daily feed limit cho user cụ thể
   */
  static async getDailyFeedLimitForUser(userId: string, guildId: string): Promise<number> {
    try {
      const { FishBattleService } = await import('./fish-battle');
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
      return isAdmin ? this.ADMIN_DAILY_FEED_LIMIT : this.DAILY_FEED_LIMIT;
    } catch (error) {
      console.error('Error getting daily feed limit for user:', error);
      return this.DAILY_FEED_LIMIT; // Fallback to regular limit
    }
  }
} 