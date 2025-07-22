import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class FishCoinService {
  /**
   * Lấy hoặc tạo người dùng với FishCoin
   */
  static async getUser(userId: string, guildId: string) {
    try {
      const user = await prisma.user.upsert({
        where: {
          userId_guildId: {
            userId,
            guildId
          }
        },
        update: {},
        create: {
          userId,
          guildId,
          balance: 0,
          fishBalance: 0,
          dailyStreak: 0
        }
      });

      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  /**
   * Lấy số dư FishCoin
   */
  static async getFishBalance(userId: string, guildId: string) {
    const user = await this.getUser(userId, guildId);
    return user.fishBalance;
  }

  /**
   * Cộng FishCoin cho người dùng
   */
  static async addFishCoin(
    userId: string,
    guildId: string,
    amount: number | string | bigint,
    description: string = "Added FishCoin"
  ) {
    try {
      const bigIntAmount = BigInt(amount);
      
      if (bigIntAmount <= 0n) {
        throw new Error("Số FishCoin phải lớn hơn 0");
      }

      const user = await prisma.user.upsert({
        where: {
          userId_guildId: {
            userId,
            guildId
          }
        },
        update: {
          fishBalance: { increment: bigIntAmount }
        },
        create: {
          userId,
          guildId,
          balance: 0,
          fishBalance: bigIntAmount,
          dailyStreak: 0
        }
      });

      // Ghi lại giao dịch FishCoin
      await prisma.fishTransaction.create({
        data: {
          userId,
          guildId,
          amount: bigIntAmount,
          type: "add",
          description
        }
      });

      return user;
    } catch (error) {
      console.error("Error adding FishCoin:", error);
      throw error;
    }
  }

  /**
   * Trừ FishCoin của người dùng
   */
  static async subtractFishCoin(
    userId: string,
    guildId: string,
    amount: number | string | bigint,
    description: string = "Subtracted FishCoin"
  ) {
    try {
      const bigIntAmount = BigInt(amount);
      
      if (bigIntAmount <= 0n) {
        throw new Error("Số FishCoin phải lớn hơn 0");
      }

      const user = await this.getUser(userId, guildId);
      if (user.fishBalance < bigIntAmount) {
        throw new Error("Không đủ FishCoin");
      }

      const updatedUser = await prisma.user.update({
        where: {
          userId_guildId: {
            userId,
            guildId
          }
        },
        data: {
          fishBalance: { decrement: bigIntAmount }
        }
      });

      // Ghi lại giao dịch FishCoin
      await prisma.fishTransaction.create({
        data: {
          userId,
          guildId,
          amount: -bigIntAmount,
          type: "subtract",
          description
        }
      });

      return updatedUser;
    } catch (error) {
      console.error("Error subtracting FishCoin:", error);
      throw error;
    }
  }

  /**
   * Chuyển FishCoin giữa người dùng
   */
  static async transferFishCoin(
    fromUserId: string,
    toUserId: string,
    guildId: string,
    amount: number | string | bigint,
    description: string = "Transfer FishCoin"
  ) {
    try {
      const bigIntAmount = BigInt(amount);
      
      if (bigIntAmount <= 0n) {
        throw new Error("Số FishCoin phải lớn hơn 0");
      }

      const fromUser = await this.getUser(fromUserId, guildId);
      if (fromUser.fishBalance < bigIntAmount) {
        throw new Error("Không đủ FishCoin để chuyển");
      }

      // Thực hiện chuyển FishCoin trong transaction
      await prisma.$transaction(async (tx: any) => {
        // Trừ FishCoin người gửi
        await tx.user.update({
          where: {
            userId_guildId: {
              userId: fromUserId,
              guildId
            }
          },
          data: {
            fishBalance: { decrement: bigIntAmount }
          }
        });

        // Cộng FishCoin người nhận
        await tx.user.update({
          where: {
            userId_guildId: {
              userId: toUserId,
              guildId
            }
          },
          data: {
            fishBalance: { increment: bigIntAmount }
          }
        });

        // Ghi lại giao dịch FishCoin
        await tx.fishTransaction.create({
          data: {
            userId: fromUserId,
            guildId,
            amount: -bigIntAmount,
            type: "transfer",
            description: `${description} -> ${toUserId}`
          }
        });

        await tx.fishTransaction.create({
          data: {
            userId: toUserId,
            guildId,
            amount: bigIntAmount,
            type: "transfer",
            description: `${description} <- ${fromUserId}`
          }
        });
      });

      return { success: true, message: "Chuyển FishCoin thành công" };
    } catch (error) {
      console.error("Error transferring FishCoin:", error);
      return { success: false, message: "Lỗi khi chuyển FishCoin" };
    }
  }

  /**
   * Lấy lịch sử giao dịch FishCoin
   */
  static async getFishTransactions(userId: string, guildId: string, limit: number = 10) {
    try {
      const transactions = await prisma.fishTransaction.findMany({
        where: {
          userId,
          guildId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return transactions;
    } catch (error) {
      console.error("Error getting FishCoin transactions:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra có đủ FishCoin không
   */
  static async hasEnoughFishCoin(userId: string, guildId: string, amount: number | string | bigint): Promise<boolean> {
    try {
      const user = await this.getUser(userId, guildId);
      const bigIntAmount = BigInt(amount);
      return user.fishBalance >= bigIntAmount;
    } catch (error) {
      console.error("Error checking FishCoin balance:", error);
      return false;
    }
  }

  /**
   * Lấy top người chơi có nhiều FishCoin nhất
   */
  static async getTopFishCoinUsers(guildId: string, limit: number = 10) {
    try {
      const users = await prisma.user.findMany({
        where: {
          guildId
        },
        orderBy: {
          fishBalance: 'desc'
        },
        take: limit,
        select: {
          userId: true,
          fishBalance: true
        }
      });

      return users;
    } catch (error) {
      console.error("Error getting top FishCoin users:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const fishCoinDB = FishCoinService; 