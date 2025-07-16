import { TournamentService, getTournamentMessagesByTournamentId, deleteTournamentMessagesByTournamentId } from "./tournament";
import { logger } from "./logger";

/**
 * Job định kỳ để cập nhật tournaments hết hạn
 * Chạy mỗi 5 phút
 */
export class TournamentCleanupJob {
    private static interval: NodeJS.Timeout | null = null;

    /**
     * Bắt đầu job cleanup
     */
    static start() {
        if (this.interval) {
            logger.warn("Tournament cleanup job already running");
            return;
        }

        // Chạy ngay lập tức lần đầu
        console.log("[Tournament Cleanup] Starting initial cleanup...");
        this.runCleanup();

        // Sau đó chạy mỗi 10 giây
        this.interval = setInterval(() => {
            this.runCleanup();
        }, 10 * 1000); // 10 giây

        console.log("[Tournament Cleanup] Job started successfully - will run every 10 seconds");
    }

    /**
     * Dừng job cleanup
     */
    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log("Tournament cleanup job stopped");
        }
    }

    /**
     * Chạy cleanup một lần
     */
    private static async runCleanup() {
        try {
            // Kiểm tra xem có tournament nào đang diễn ra không
            const activeTournaments = await TournamentService.getAllActiveTournaments();
            
            if (activeTournaments.length === 0) {
                // Không có tournament nào đang diễn ra, không cần quét
                return;
            }

            console.log(`[Tournament Cleanup] Found ${activeTournaments.length} active tournaments, checking for expired ones...`);
            
            const updatedCount = await TournamentService.updateExpiredTournaments();
            
            if (updatedCount > 0) {
                console.log(`[Tournament Cleanup] Updated ${updatedCount} expired tournaments`);
                
                // Cập nhật các message cũ nếu có
                await this.updateExpiredTournamentMessages();
            }
        } catch (error) {
            logger.error(`Error in tournament cleanup job: ${error}`);
        }
    }

    /**
     * Cập nhật các message của tournament đã hết hạn
     */
    private static async updateExpiredTournamentMessages() {
        try {
            const expiredTournaments = await TournamentService.getExpiredTournaments();
            
            for (const tournament of expiredTournaments) {
                const messages = await getTournamentMessagesByTournamentId(tournament.id);
                if (!messages || messages.length === 0) continue;

                console.log(`[Tournament Cleanup] Updating ${messages.length} messages for expired tournament ${tournament.id}`);
                
                // Lấy thông tin tournament đầy đủ
                const fullTournament = await TournamentService.getTournamentById(tournament.id);
                if (!fullTournament) continue;

                // Cập nhật từng message
                for (const messageInfo of messages) {
                    try {
                        await this.updateSingleMessage(messageInfo, fullTournament);
                    } catch (error) {
                        console.error(`[Tournament Cleanup] Error updating message ${messageInfo.messageId}:`, error);
                    }
                }

                // Xóa messages đã cập nhật khỏi DB
                await deleteTournamentMessagesByTournamentId(tournament.id);
            }
        } catch (error) {
            console.error("[Tournament Cleanup] Error updating expired tournament messages:", error);
        }
    }

    /**
     * Cập nhật một message cụ thể
     */
    private static async updateSingleMessage(messageInfo: any, tournament: any) {
        // Import động để tránh circular dependency
        const { createTournamentEmbed } = await import("../commands/text/ecommerce/tournament");
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import("discord.js");

        // Tạo embed mới với trạng thái đã cập nhật
        const embed = createTournamentEmbed(tournament);
        
        // Tạo button "Đã kết thúc"
        const endedButton = new ButtonBuilder()
            .setCustomId("tournament_ended")
            .setLabel("Đã kết thúc")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        const row = new ActionRowBuilder().addComponents(endedButton);

        // Cập nhật message (cần client reference)
        // Lấy client từ global reference
        const client = (globalThis as any).tournamentClient;
        
        if (client) {
            try {
                // Kiểm tra channel ID có phải là snowflake hợp lệ không
                if (!/^\d{17,19}$/.test(messageInfo.channelId)) {
                    console.log(`[Tournament Cleanup] Skipping message update for invalid channel ID: ${messageInfo.channelId}`);
                    return;
                }

                const channel = await client.channels.fetch(messageInfo.channelId);
                if (channel && channel.isTextBased()) {
                    const message = await channel.messages.fetch(messageInfo.messageId);
                    await message.edit({ embeds: [embed], components: [row] });
                    console.log(`[Tournament Cleanup] Updated message ${messageInfo.messageId} for tournament ${tournament.id}`);
                }
            } catch (error) {
                console.error(`[Tournament Cleanup] Error fetching/editing message ${messageInfo.messageId}:`, error);
            }
        } else {
            console.log(`[Tournament Cleanup] No client available to update message ${messageInfo.messageId}`);
        }
    }

    /**
     * Chạy cleanup thủ công (cho testing)
     */
    static async runManualCleanup() {
        console.log("Running manual tournament cleanup...");
        await this.runCleanup();
    }
} 