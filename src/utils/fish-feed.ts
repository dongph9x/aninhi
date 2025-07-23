import prisma from './prisma';

export class FishFeedService {
  private static readonly DAILY_FEED_LIMIT = 20; // Giới hạn 20 lần cho cá ăn mỗi ngày

  /**
   * Kiểm tra và reset daily feed count nếu cần
   */
  static async checkAndResetDailyFeedCount(userId: string, guildId: string): Promise<{ canFeed: boolean; remainingFeeds: number; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId, guildId } }
      });

      if (!user) {
        return { canFeed: false, remainingFeeds: 0, error: 'Không tìm thấy người dùng' };
      }

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
        
        return { canFeed: true, remainingFeeds: this.DAILY_FEED_LIMIT };
      }

      // Kiểm tra quyền admin
      const { FishBattleService } = await import('./fish-battle');
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
      
      // Admin luôn có thể cho cá ăn, không bị giới hạn
      if (isAdmin) {
        const remainingFeeds = Math.max(0, this.DAILY_FEED_LIMIT - user.dailyFeedCount);
        return { canFeed: true, remainingFeeds };
      }

      // Kiểm tra xem có vượt quá giới hạn không (chỉ cho user thường)
      if (user.dailyFeedCount >= this.DAILY_FEED_LIMIT) {
        return { 
          canFeed: false, 
          remainingFeeds: 0, 
          error: `Bạn đã đạt giới hạn ${this.DAILY_FEED_LIMIT} lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.` 
        };
      }

      const remainingFeeds = this.DAILY_FEED_LIMIT - user.dailyFeedCount;
      return { canFeed: true, remainingFeeds };
    } catch (error) {
      console.error('Error checking daily feed count:', error);
      return { canFeed: false, remainingFeeds: 0, error: 'Đã xảy ra lỗi khi kiểm tra giới hạn cho cá ăn' };
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
} 