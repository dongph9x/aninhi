import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ModerationAction {
    guildId: string;
    targetUserId: string;
    moderatorId: string;
    action: "kick" | "ban" | "unban" | "mute" | "unmute" | "add_money" | "subtract_money" | "add_item";
    reason?: string;
    duration?: number;
    amount?: number;
    channelId?: string;
    messageId?: string;
}

export class ModerationService {
    /**
     * Ghi lại hành động moderation
     */
    static async logAction(action: ModerationAction) {
        try {
            const log = await prisma.moderationLog.create({
                data: action
            });

            return log;
        } catch (error) {
            console.error("Error logging moderation action:", error);
            throw error;
        }
    }

    /**
     * Lấy lịch sử moderation của một người dùng
     */
    static async getUserHistory(userId: string, guildId: string, limit: number = 10) {
        try {
            const logs = await prisma.moderationLog.findMany({
                where: {
                    targetUserId: userId,
                    guildId: guildId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return logs;
        } catch (error) {
            console.error("Error getting user moderation history:", error);
            return [];
        }
    }

    /**
     * Lấy lịch sử moderation của một moderator
     */
    static async getModeratorHistory(moderatorId: string, guildId: string, limit: number = 10) {
        try {
            const logs = await prisma.moderationLog.findMany({
                where: {
                    moderatorId: moderatorId,
                    guildId: guildId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return logs;
        } catch (error) {
            console.error("Error getting moderator history:", error);
            return [];
        }
    }

    /**
     * Lấy tất cả moderation logs của server
     */
    static async getGuildHistory(guildId: string, limit: number = 20) {
        try {
            const logs = await prisma.moderationLog.findMany({
                where: {
                    guildId: guildId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return logs;
        } catch (error) {
            console.error("Error getting guild moderation history:", error);
            return [];
        }
    }

    /**
     * Lấy thống kê moderation
     */
    static async getModerationStats(guildId: string) {
        try {
            const stats = await prisma.moderationLog.groupBy({
                by: ['action'],
                where: {
                    guildId: guildId
                },
                _count: {
                    action: true
                }
            });

            return stats;
        } catch (error) {
            console.error("Error getting moderation stats:", error);
            return [];
        }
    }

    /**
     * Lấy top moderators
     */
    static async getTopModerators(guildId: string, limit: number = 5) {
        try {
            const moderators = await prisma.moderationLog.groupBy({
                by: ['moderatorId'],
                where: {
                    guildId: guildId
                },
                _count: {
                    moderatorId: true
                },
                orderBy: {
                    _count: {
                        moderatorId: 'desc'
                    }
                },
                take: limit
            });

            return moderators;
        } catch (error) {
            console.error("Error getting top moderators:", error);
            return [];
        }
    }

    /**
     * Lấy top users bị moderation
     */
    static async getTopTargets(guildId: string, limit: number = 5) {
        try {
            const targets = await prisma.moderationLog.groupBy({
                by: ['targetUserId'],
                where: {
                    guildId: guildId
                },
                _count: {
                    targetUserId: true
                },
                orderBy: {
                    _count: {
                        targetUserId: 'desc'
                    }
                },
                take: limit
            });

            return targets;
        } catch (error) {
            console.error("Error getting top targets:", error);
            return [];
        }
    }

    /**
     * Xóa logs cũ (older than X days)
     */
    static async cleanupOldLogs(daysOld: number = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const deletedCount = await prisma.moderationLog.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate
                    }
                }
            });

            return deletedCount.count;
        } catch (error) {
            console.error("Error cleaning up old logs:", error);
            return 0;
        }
    }
} 