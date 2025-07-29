import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { WarningService } from "@/utils/warning";

export default Bot.createCommand({
    structure: {
        name: "warnstats",
        aliases: ["warningstats", "thống kê cảnh cáo", "warnstatistics"],
    },
    options: {
        permissions: ["Administrator"],
        inGuild: true,
    },
    run: async ({ message, t }) => {
        try {
            const guildId = message.guildId!;

            // Lấy thống kê cảnh cáo của server
            const stats = await WarningService.getServerWarningStats(guildId);
            const recentWarnings = await WarningService.getServerWarnings(guildId, 10);

            // Tạo embed thống kê
            const embed = new EmbedBuilder()
                .setTitle("📊 Thống Kê Cảnh Cáo Server")
                .setDescription(`Thống kê cảnh cáo của **${message.guild?.name}**`)
                .setColor("#51cf66")
                .setTimestamp();

            // Thống kê tổng quan
            embed.addFields({
                name: "📈 Thống Kê Tổng Quan",
                value: 
                    `📊 **Tổng cảnh cáo:** ${stats.totalWarnings}\n` +
                    `⚠️ **Cảnh cáo active:** ${stats.activeWarnings}\n` +
                    `✅ **Tỷ lệ active:** ${stats.totalWarnings > 0 ? Math.round((stats.activeWarnings / stats.totalWarnings) * 100) : 0}%`,
                inline: false
            });

            // Thống kê theo level
            if (stats.levelStats && stats.levelStats.length > 0) {
                const levelStatsText = stats.levelStats.map((levelStat: any) => {
                    const levelName = levelStat.warningLevel === 1 ? "⚠️ Level 1" : 
                                    levelStat.warningLevel === 2 ? "🚨 Level 2" : 
                                    levelStat.warningLevel === 3 ? "🔨 Level 3" : `Level ${levelStat.warningLevel}`;
                    
                    return `${levelName}: **${levelStat._count.warningLevel}**`;
                }).join("\n");

                embed.addFields({
                    name: "📋 Thống Kê Theo Level",
                    value: levelStatsText,
                    inline: true
                });
            }

            // Cảnh cáo gần đây
            if (recentWarnings.length > 0) {
                const recentWarningsText = recentWarnings.slice(0, 5).map((warning: any) => {
                    const levelEmoji = warning.warningLevel === 1 ? "⚠️" : warning.warningLevel === 2 ? "🚨" : "🔨";
                    return `${levelEmoji} **Level ${warning.warningLevel}** - <@${warning.userId}>\n` +
                           `📝 ${warning.reason.substring(0, 50)}${warning.reason.length > 50 ? '...' : ''}\n` +
                           `⏰ <t:${Math.floor(new Date(warning.createdAt).getTime() / 1000)}:R>`;
                }).join("\n\n");

                embed.addFields({
                    name: "🕐 Cảnh Cáo Gần Đây",
                    value: recentWarningsText,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: "✅ Không Có Cảnh Cáo",
                    value: "Server này không có cảnh cáo active nào.",
                    inline: false
                });
            }

            // Thông tin hệ thống
            embed.addFields({
                name: "ℹ️ Hệ Thống Cảnh Cáo",
                value: 
                    "**Level 1:** Cảnh cáo nhẹ - Cảnh báo user\n" +
                    "**Level 2:** Cảnh cáo nghiêm trọng - Cảnh báo mạnh\n" +
                    "**Level 3:** Tự động ban - Ban khỏi server\n\n" +
                    "**Lệnh liên quan:**\n" +
                    "• `n.warn <user> <reason>` - Cảnh cáo user\n" +
                    "• `n.warnings <user>` - Xem cảnh cáo của user\n" +
                    "• `n.clearwarnings <user>` - Xóa tất cả cảnh cáo\n\n" +
                    "**Lưu ý:** Tất cả lệnh cảnh cáo yêu cầu quyền Administrator.",
                inline: false
            });

            // Footer với thông tin server
            embed.setFooter({
                text: `${message.guild?.name} • ${new Date().toLocaleDateString('vi-VN')}`,
                iconURL: message.guild?.iconURL() || undefined
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in warnstats command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Thống Kê")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy thống kê cảnh cáo. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});