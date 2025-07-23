import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EcommerceService {
    /**
     * Lấy hoặc tạo người dùng
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
     * Lấy số dư của người dùng
     */
    static async getBalance(userId: string, guildId: string): Promise<bigint> {
        try {
            const user = await this.getUser(userId, guildId);
            return user.balance;
        } catch (error) {
            console.error("Error getting balance:", error);
            return 0n;
        }
    }

    /**
     * Cộng tiền cho người dùng
     */
    static async addMoney(
        userId: string,
        guildId: string,
        amount: number | string | bigint,
        description: string = "Added AniCoin"
    ) {
        try {
            // Convert amount to BigInt to handle large numbers properly
            const bigIntAmount = BigInt(amount);
            
            if (bigIntAmount <= 0n) {
                throw new Error("Số tiền phải lớn hơn 0");
            }

            // Đảm bảo user tồn tại trước khi update
            const user = await prisma.user.upsert({
                where: {
                    userId_guildId: {
                        userId,
                        guildId
                    }
                },
                update: {
                    balance: { increment: bigIntAmount }
                },
                create: {
                    userId,
                    guildId,
                    balance: bigIntAmount,
                    dailyStreak: 0
                }
            });

            // Ghi lại giao dịch
            await prisma.transaction.create({
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
            console.error("Error adding money:", error);
            throw error;
        }
    }

    /**
     * Trừ tiền của người dùng
     */
    static async subtractMoney(
        userId: string,
        guildId: string,
        amount: number | string | bigint,
        description: string = "Subtracted AniCoin"
    ) {
        try {
            // Convert amount to BigInt to handle large numbers properly
            const bigIntAmount = BigInt(amount);
            
            if (bigIntAmount <= 0n) {
                throw new Error("Số tiền phải lớn hơn 0");
            }

            const user = await this.getUser(userId, guildId);
            if (user.balance < bigIntAmount) {
                throw new Error("Không đủ tiền");
            }

            const updatedUser = await prisma.user.update({
                where: {
                    userId_guildId: {
                        userId,
                        guildId
                    }
                },
                data: {
                    balance: { decrement: bigIntAmount }
                }
            });

            // Ghi lại giao dịch
            await prisma.transaction.create({
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
            console.error("Error subtracting money:", error);
            throw error;
        }
    }



    /**
     * Kiểm tra có thể nhận daily không
     */
    static async canClaimDaily(userId: string, guildId: string): Promise<boolean> {
        try {
            const lastClaim = await prisma.dailyClaim.findFirst({
                where: {
                    userId,
                    guildId
                },
                orderBy: {
                    claimedAt: 'desc'
                }
            });

            if (!lastClaim) {
                return true;
            }

            const now = new Date();
            const lastClaimTime = new Date(lastClaim.claimedAt);
            const hoursSinceLastClaim = (now.getTime() - lastClaimTime.getTime()) / (1000 * 60 * 60);

            return hoursSinceLastClaim >= 24;
        } catch (error) {
            console.error("Error checking daily claim:", error);
            return false;
        }
    }

    /**
     * Lấy thời gian cooldown daily
     */
    static async getDailyCooldown(userId: string, guildId: string) {
        try {
            const lastClaim = await prisma.dailyClaim.findFirst({
                where: {
                    userId,
                    guildId
                },
                orderBy: {
                    claimedAt: 'desc'
                }
            });

            if (!lastClaim) {
                return { canClaim: true, remainingHours: 0, remainingMinutes: 0 };
            }

            const now = new Date();
            const lastClaimTime = new Date(lastClaim.claimedAt);
            const timeDiff = now.getTime() - lastClaimTime.getTime();
            const hoursSinceLastClaim = timeDiff / (1000 * 60 * 60);

            if (hoursSinceLastClaim >= 24) {
                return { canClaim: true, remainingHours: 0, remainingMinutes: 0 };
            }

            const remainingHours = Math.floor(24 - hoursSinceLastClaim);
            const remainingMinutes = Math.floor((24 - hoursSinceLastClaim - remainingHours) * 60);

            return { canClaim: false, remainingHours, remainingMinutes };
        } catch (error) {
            console.error("Error getting daily cooldown:", error);
            return { canClaim: false, remainingHours: 24, remainingMinutes: 0 };
        }
    }

    /**
     * Nhận daily reward
     */
    static async claimDaily(userId: string, guildId: string) {
        try {
            const canClaim = await this.canClaimDaily(userId, guildId);
            if (!canClaim) {
                throw new Error("Bạn đã nhận daily reward rồi");
            }

            const user = await this.getUser(userId, guildId);
            const baseAmount = 2000n;
            const newStreak = user.dailyStreak + 1;
            const streakBonus = BigInt(Math.min(newStreak * 100, 1000));
            const totalAmount = baseAmount + streakBonus;

            // Cập nhật user và ghi lại daily claim
            const result = await prisma.$transaction(async (tx: any) => {
                const updatedUser = await tx.user.update({
                    where: {
                        userId_guildId: {
                            userId,
                            guildId
                        }
                    },
                    data: {
                        balance: { increment: totalAmount },
                        dailyStreak: { increment: 1 }
                    }
                });

                await tx.dailyClaim.create({
                    data: {
                        userId,
                        guildId
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: totalAmount,
                        type: "daily",
                        description: `Daily reward (streak: ${user.dailyStreak + 1})`
                    }
                });

                return updatedUser;
            });

            return result;
        } catch (error) {
            console.error("Error claiming daily:", error);
            throw error;
        }
    }

    /**
     * Lấy top users theo số dư
     */
    static async getTopUsers(guildId: string, limit: number = 10) {
        try {
            const users = await prisma.user.findMany({
                where: { guildId },
                orderBy: { balance: 'desc' },
                take: limit
            });

            return users;
        } catch (error) {
            console.error("Error getting top users:", error);
            return [];
        }
    }

    /**
     * Lấy lịch sử giao dịch của người dùng
     */
    static async getUserTransactions(userId: string, guildId: string, limit: number = 10) {
        try {
            const transactions = await prisma.transaction.findMany({
                where: { userId, guildId },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            return transactions;
        } catch (error) {
            console.error("Error getting user transactions:", error);
            return [];
        }
    }

    /**
     * Reset số dư người dùng
     */
    static async resetBalance(userId: string, guildId: string) {
        try {
            const user = await prisma.user.upsert({
                where: {
                    userId_guildId: {
                        userId,
                        guildId
                    }
                },
                update: {
                    balance: 0n,
                    fishBalance: 0n,
                    dailyStreak: 0
                },
                create: {
                    userId,
                    guildId,
                    balance: 0n,
                    fishBalance: 0n,
                    dailyStreak: 0
                }
            });

            // Xóa tất cả daily claims cũ
            await prisma.dailyClaim.deleteMany({
                where: {
                    userId,
                    guildId
                }
            });

            return user;
        } catch (error) {
            console.error("Error resetting balance:", error);
            throw error;
        }
    }

    /**
     * Process daily claim with return structure for compatibility
     */
    static async processDailyClaim(userId: string, guildId: string) {
        try {
            const canClaim = await this.canClaimDaily(userId, guildId);
            if (!canClaim) {
                return { success: false };
            }

            const user = await this.getUser(userId, guildId);
            const baseAmount = 2000n;
            const newStreak = user.dailyStreak + 1;
            const streakBonus = BigInt(Math.min(newStreak * 100, 1000));
            const totalAniAmount = baseAmount + streakBonus;
            
            // Thêm FishCoin với số lượng tương tự
            const totalFishAmount = totalAniAmount;

            // Cập nhật user và ghi lại daily claim
            const result = await prisma.$transaction(async (tx: any) => {
                const updatedUser = await tx.user.update({
                    where: {
                        userId_guildId: {
                            userId,
                            guildId
                        }
                    },
                    data: {
                        balance: { increment: totalAniAmount },
                        fishBalance: { increment: totalFishAmount },
                        dailyStreak: { increment: 1 }
                    }
                });

                await tx.dailyClaim.create({
                    data: {
                        userId,
                        guildId
                    }
                });

                // Ghi lại transaction AniCoin
                await tx.transaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: totalAniAmount,
                        type: "daily",
                        description: `Daily reward (streak: ${user.dailyStreak + 1})`
                    }
                });

                // Ghi lại transaction FishCoin
                await tx.fishTransaction.create({
                    data: {
                        userId,
                        guildId,
                        amount: totalFishAmount,
                        type: "daily",
                        description: `Daily reward FishCoin (streak: ${user.dailyStreak + 1})`
                    }
                });

                return updatedUser;
            });

            return {
                success: true,
                aniAmount: totalAniAmount,
                fishAmount: totalFishAmount,
                newStreak: user.dailyStreak + 1
            };
        } catch (error) {
            console.error("Error processing daily claim:", error);
            return { success: false };
        }
    }

    /**
     * Get last daily claim time
     */
    static async getLastDailyClaim(userId: string, guildId: string) {
        try {
            const lastClaim = await prisma.dailyClaim.findFirst({
                where: {
                    userId,
                    guildId
                },
                orderBy: {
                    claimedAt: 'desc'
                }
            });

            return lastClaim ? new Date(lastClaim.claimedAt) : null;
        } catch (error) {
            console.error("Error getting last daily claim:", error);
            return null;
        }
    }

    /**
     * Get settings
     */
    static async getSettings() {
        return {
            dailyBaseAmount: 2000,
            dailyStreakBonus: 100,
            maxStreakBonus: 1000,
            dailyCooldownHours: 24
        };
    }

    /**
     * Transfer money with return structure for compatibility
     */
    static async transferMoney(
        fromUserId: string,
        toUserId: string,
        guildId: string,
        amount: number | string | bigint,
        description: string = "Transfer"
    ) {
        try {
            // Convert amount to BigInt to handle large numbers properly
            const bigIntAmount = BigInt(amount);
            
            if (bigIntAmount <= 0n) {
                return { success: false, message: "Số tiền phải lớn hơn 0" };
            }

            if (fromUserId === toUserId) {
                return { success: false, message: "Không thể chuyển tiền cho chính mình" };
            }

            // Đảm bảo cả hai user đều tồn tại trước khi transfer
            const fromUser = await this.getUser(fromUserId, guildId);
            const toUser = await this.getUser(toUserId, guildId);

            if (fromUser.balance < bigIntAmount) {
                return { success: false, message: "Không đủ tiền để chuyển" };
            }

            // Thực hiện chuyển tiền trong transaction
            await prisma.$transaction(async (tx: any) => {
                // Trừ tiền người gửi
                await tx.user.update({
                    where: {
                        userId_guildId: {
                            userId: fromUserId,
                            guildId
                        }
                    },
                    data: {
                        balance: { decrement: bigIntAmount }
                    }
                });

                // Cộng tiền người nhận
                await tx.user.update({
                    where: {
                        userId_guildId: {
                            userId: toUserId,
                            guildId
                        }
                    },
                    data: {
                        balance: { increment: bigIntAmount }
                    }
                });

                // Ghi lại giao dịch
                await tx.transaction.create({
                    data: {
                        userId: fromUserId,
                        guildId,
                        amount: -bigIntAmount,
                        type: "transfer",
                        description: `${description} -> ${toUserId}`
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId: toUserId,
                        guildId,
                        amount: bigIntAmount,
                        type: "transfer",
                        description: `${description} <- ${fromUserId}`
                    }
                });
            });

            return { success: true, message: "Chuyển tiền thành công" };
        } catch (error) {
            console.error("Error transferring money:", error);
            return { success: false, message: "Lỗi khi chuyển tiền" };
        }
    }
}

// Export instance for backward compatibility
export const ecommerceDB = EcommerceService;