import prisma from './prisma';

export interface AchievementData {
  id: string;
  name: string;
  link: string;
  target: string;
  type: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AchievementService {
  /**
   * Lấy achievement của user dựa trên user_id
   */
  static async getUserAchievement(userId: string): Promise<AchievementData | null> {
    try {
      const achievement = await prisma.achievement.findFirst({
        where: { target: userId },
        orderBy: { createdAt: 'desc' } // Lấy achievement mới nhất nếu có nhiều
      });

      return achievement;
    } catch (error) {
      console.error('Error getting user achievement:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả achievement của user
   */
  static async getUserAchievements(userId: string): Promise<AchievementData[]> {
    try {
      const achievements = await prisma.achievement.findMany({
        where: { target: userId },
        orderBy: { createdAt: 'desc' }
      });

      return achievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Lấy achievement theo type
   */
  static async getAchievementByType(userId: string, type: number): Promise<AchievementData | null> {
    try {
      const achievement = await prisma.achievement.findFirst({
        where: { 
          target: userId,
          type: type
        },
        orderBy: { createdAt: 'desc' }
      });

      return achievement;
    } catch (error) {
      console.error('Error getting achievement by type:', error);
      return null;
    }
  }

  /**
   * Kiểm tra xem user có achievement không
   */
  static async hasAchievement(userId: string): Promise<boolean> {
    try {
      const count = await prisma.achievement.count({
        where: { target: userId }
      });

      return count > 0;
    } catch (error) {
      console.error('Error checking user achievement:', error);
      return false;
    }
  }

  /**
   * Lấy achievement có priority cao nhất cho user (chỉ active achievements)
   * Priority: type 0 (top câu cá) > type 1 (top fishcoin) > type 2 (top fishbattle) > type 3 (top custom)
   */
  static async getHighestPriorityAchievement(userId: string): Promise<AchievementData | null> {
    try {
      // Tìm achievement có type thấp nhất (priority cao nhất) và đang active
      const achievement = await prisma.achievement.findFirst({
        where: { 
          target: userId,
          active: true // Chỉ lấy achievement đang active
        },
        orderBy: [
          { type: 'asc' }, // Type thấp nhất = priority cao nhất
          { createdAt: 'desc' } // Nếu cùng type thì lấy mới nhất
        ]
      });

      return achievement;
    } catch (error) {
      console.error('Error getting highest priority achievement:', error);
      return null;
    }
  }

  /**
   * Lấy tên type achievement
   */
  static getAchievementTypeName(type: number): string {
    const typeNames = {
      0: '🔥💢 Đặt cần xuống – cá lên bờ như bị thôi miên. 🌀🐠',
      1: '🪙🐠 Ngồi rung đùi đếm coin – khỏi cần thả lưới. 🐟💰', 
      2: '⚔️🐡 Vô địch toàn mặt nước – 🐟 chạm mặt là KO 🩻💢',
      3: '🧙‍♂️🐉 Định mệnh vẫy gọi 📜🪄'
    };
    return typeNames[type as keyof typeof typeNames] || 'Unknown';
  }

  /**
   * Lấy tất cả active achievements của user
   */
  static async getActiveAchievements(userId: string): Promise<AchievementData[]> {
    try {
      const achievements = await prisma.achievement.findMany({
        where: { 
          target: userId,
          active: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return achievements;
    } catch (error) {
      console.error('Error getting active achievements:', error);
      return [];
    }
  }

  /**
   * Kiểm tra xem user có active achievement không
   */
  static async hasActiveAchievement(userId: string): Promise<boolean> {
    try {
      const count = await prisma.achievement.count({
        where: { 
          target: userId,
          active: true
        }
      });

      return count > 0;
    } catch (error) {
      console.error('Error checking active achievement:', error);
      return false;
    }
  }

  /**
   * Active một achievement
   */
  static async activateAchievement(achievementId: string, userId: string): Promise<boolean> {
    try {
      // Kiểm tra xem achievement có thuộc về user không
      const achievement = await prisma.achievement.findFirst({
        where: { 
          id: achievementId,
          target: userId
        }
      });

      if (!achievement) {
        return false;
      }

      // Deactivate tất cả achievements khác của user
      await prisma.achievement.updateMany({
        where: { target: userId },
        data: { active: false }
      });

      // Active achievement được chọn
      await prisma.achievement.update({
        where: { id: achievementId },
        data: { active: true }
      });

      return true;
    } catch (error) {
      console.error('Error activating achievement:', error);
      return false;
    }
  }

  /**
   * Deactivate tất cả achievements của user
   */
  static async deactivateAllAchievements(userId: string): Promise<boolean> {
    try {
      await prisma.achievement.updateMany({
        where: { target: userId },
        data: { active: false }
      });

      return true;
    } catch (error) {
      console.error('Error deactivating achievements:', error);
      return false;
    }
  }

  /**
   * Lấy emoji cho type achievement
   */
  static getAchievementTypeEmoji(type: number): string {
    const typeEmojis = {
      0: '🏆', // Top câu cá
      1: '💰', // Top FishCoin
      2: '⚔️', // Top FishBattle  
      3: '🎖️'  // Top Custom
    };
    return typeEmojis[type as keyof typeof typeEmojis] || '🏅';
  }
} 