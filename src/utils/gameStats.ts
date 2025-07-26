import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GameResult {
    won: boolean;
    bet: number;
    winnings: number;
}

export class GameStatsService {
    /**
     * Ghi lại kết quả game và cập nhật thống kê
     */
    static async recordGameResult(
        userId: string,
        guildId: string,
        gameType: string,
        result: GameResult
    ): Promise<void> {
        try {
            const { won, bet, winnings } = result;
            
            // Tìm hoặc tạo thống kê game
            const gameStats = await prisma.gameStats.upsert({
                where: {
                    userId_guildId_gameType: {
                        userId,
                        guildId,
                        gameType
                    }
                },
                update: {
                    gamesPlayed: { increment: 1 },
                    gamesWon: { increment: won ? 1 : 0 },
                    totalBet: { increment: bet },
                    totalWon: { increment: won ? winnings : 0 },
                    totalLost: { increment: won ? 0 : bet },
                    biggestWin: won ? Math.max(winnings, 0) : undefined,
                    biggestLoss: !won ? Math.max(bet, 0) : undefined,
                    updatedAt: new Date()
                },
                create: {
                    userId,
                    guildId,
                    gameType,
                    gamesPlayed: 1,
                    gamesWon: won ? 1 : 0,
                    totalBet: bet,
                    totalWon: won ? winnings : 0,
                    totalLost: won ? 0 : bet,
                    biggestWin: won ? winnings : 0,
                    biggestLoss: won ? 0 : bet
                }
            });

            // Cập nhật biggestWin và biggestLoss nếu cần
            if (won && winnings > gameStats.biggestWin) {
                await prisma.gameStats.update({
                    where: { id: gameStats.id },
                    data: { biggestWin: winnings }
                });
            }

            if (!won && bet > gameStats.biggestLoss) {
                await prisma.gameStats.update({
                    where: { id: gameStats.id },
                    data: { biggestLoss: bet }
                });
            }
        } catch (error) {
            console.error("Error recording game result:", error);
            throw error;
        }
    }

    /**
     * Lấy thống kê game của người dùng
     */
    static async getUserGameStats(
        userId: string,
        guildId: string,
        gameType?: string
    ) {
        try {
            const where: any = { userId, guildId };
            if (gameType) {
                where.gameType = gameType;
            }

            const stats = await prisma.gameStats.findMany({
                where,
                orderBy: { updatedAt: 'desc' }
            });

            return stats;
        } catch (error) {
            console.error("Error getting user game stats:", error);
            return [];
        }
    }

    /**
     * Lấy leaderboard cho một loại game
     */
    static async getGameLeaderboard(
        guildId: string,
        gameType: string,
        limit: number = 10
    ) {
        try {
            const leaderboard = await prisma.gameStats.findMany({
                where: {
                    guildId,
                    gameType
                },
                orderBy: [
                    { totalWon: 'desc' },
                    { gamesWon: 'desc' }
                ],
                take: limit,
                include: {
                    user: true
                }
            });

            return leaderboard;
        } catch (error) {
            console.error("Error getting game leaderboard:", error);
            return [];
        }
    }

    /**
     * Lấy top lose leaderboard cho một loại game
     */
    static async getGameLoseLeaderboard(
        guildId: string,
        gameType: string,
        limit: number = 10
    ) {
        try {
            const loseLeaderboard = await prisma.gameStats.findMany({
                where: {
                    guildId,
                    gameType,
                    totalLost: { gt: 0 } // Chỉ lấy những người có thua
                },
                orderBy: [
                    { totalLost: 'desc' },
                    { biggestLoss: 'desc' }
                ],
                take: limit,
                include: {
                    user: true
                }
            });

            return loseLeaderboard;
        } catch (error) {
            console.error("Error getting game lose leaderboard:", error);
            return [];
        }
    }

    /**
     * Lấy top lose tổng hợp tất cả game
     */
    static async getOverallLoseLeaderboard(
        guildId: string,
        limit: number = 10
    ) {
        try {
            const overallLoseLeaderboard = await prisma.gameStats.groupBy({
                by: ['userId'],
                where: {
                    guildId,
                    totalLost: { gt: 0 }
                },
                _sum: {
                    totalLost: true,
                    totalBet: true,
                    gamesPlayed: true,
                    gamesWon: true,
                    biggestLoss: true
                },
                orderBy: {
                    _sum: {
                        totalLost: 'desc'
                    }
                },
                take: limit
            });

            // Lấy thông tin user cho mỗi entry
            const leaderboardWithUsers = await Promise.all(
                overallLoseLeaderboard.map(async (entry) => {
                    const user = await prisma.user.findUnique({
                        where: {
                            userId_guildId: {
                                userId: entry.userId,
                                guildId
                            }
                        }
                    });

                    return {
                        userId: entry.userId,
                        totalLost: entry._sum.totalLost || 0n,
                        totalBet: entry._sum.totalBet || 0n,
                        gamesPlayed: entry._sum.gamesPlayed || 0,
                        gamesWon: entry._sum.gamesWon || 0,
                        biggestLoss: entry._sum.biggestLoss || 0n,
                        user: user
                    };
                })
            );

            return leaderboardWithUsers;
        } catch (error) {
            console.error("Error getting overall lose leaderboard:", error);
            return [];
        }
    }

    /**
     * Lấy thông tin người có số lần thua nhiều nhất (top 1 lose)
     */
    static async getTopLoseUser(guildId: string) {
        try {
            const topLoseUser = await prisma.gameStats.groupBy({
                by: ['userId'],
                where: {
                    guildId,
                    totalLost: { gt: 0 }
                },
                _sum: {
                    totalLost: true,
                    totalBet: true,
                    gamesPlayed: true,
                    gamesWon: true,
                    biggestLoss: true
                },
                orderBy: {
                    _sum: {
                        totalLost: 'desc'
                    }
                },
                take: 1
            });

            if (topLoseUser.length === 0) {
                return null;
            }

            const entry = topLoseUser[0];
            const user = await prisma.user.findUnique({
                where: {
                    userId_guildId: {
                        userId: entry.userId,
                        guildId
                    }
                }
            });

            return {
                userId: entry.userId,
                totalLost: entry._sum.totalLost || 0n,
                totalBet: entry._sum.totalBet || 0n,
                gamesPlayed: entry._sum.gamesPlayed || 0,
                gamesWon: entry._sum.gamesWon || 0,
                biggestLoss: entry._sum.biggestLoss || 0n,
                user: user
            };
        } catch (error) {
            console.error("Error getting top lose user:", error);
            return null;
        }
    }

    /**
     * Lấy tổng thống kê game của server
     */
    static async getServerGameStats(guildId: string) {
        try {
            const stats = await prisma.gameStats.groupBy({
                by: ['gameType'],
                where: { guildId },
                _sum: {
                    gamesPlayed: true,
                    gamesWon: true,
                    totalBet: true,
                    totalWon: true,
                    totalLost: true
                },
                _count: {
                    userId: true
                }
            });

            return stats.map((stat: any) => ({
                gameType: stat.gameType,
                totalGames: stat._sum.gamesPlayed || 0,
                totalWins: stat._sum.gamesWon || 0,
                totalBet: stat._sum.totalBet || 0,
                totalWon: stat._sum.totalWon || 0,
                totalLost: stat._sum.totalLost || 0,
                uniquePlayers: stat._count.userId
            }));
        } catch (error) {
            console.error("Error getting server game stats:", error);
            return [];
        }
    }

    /**
     * Lấy thống kê lose tổng hợp của server
     */
    static async getServerLoseStats(guildId: string) {
        try {
            const loseStats = await prisma.gameStats.groupBy({
                by: ['gameType'],
                where: {
                    guildId,
                    totalLost: { gt: 0 }
                },
                _sum: {
                    totalLost: true,
                    totalBet: true,
                    gamesPlayed: true,
                    gamesWon: true,
                    biggestLoss: true
                },
                _count: {
                    userId: true
                }
            });

            return loseStats.map((stat: any) => ({
                gameType: stat.gameType,
                totalLost: stat._sum.totalLost || 0n,
                totalBet: stat._sum.totalBet || 0n,
                totalGames: stat._sum.gamesPlayed || 0,
                totalWins: stat._sum.gamesWon || 0,
                biggestLoss: stat._sum.biggestLoss || 0n,
                uniqueLosers: stat._count.userId
            }));
        } catch (error) {
            console.error("Error getting server lose stats:", error);
            return [];
        }
    }

    /**
     * Xóa thống kê game của người dùng
     */
    static async deleteUserGameStats(
        userId: string,
        guildId: string,
        gameType?: string
    ): Promise<void> {
        try {
            const where: any = { userId, guildId };
            if (gameType) {
                where.gameType = gameType;
            }

            await prisma.gameStats.deleteMany({ where });
        } catch (error) {
            console.error("Error deleting user game stats:", error);
        }
    }
} 