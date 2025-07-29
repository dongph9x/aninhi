import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { WarningService } from "@/utils/warning";

export default Bot.createCommand({
    structure: {
        name: "warnings",
        aliases: ["warninglist", "warnlist", "cảnh cáo list"],
    },
    options: {
        permissions: ["Administrator"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        try {
            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null) ||
                message.author; // Mặc định xem cảnh cáo của chính mình

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.\n" +
                        "Hoặc sử dụng `n.warnings` để xem cảnh cáo của chính mình.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const guildId = message.guildId!;

            // Lấy thống kê cảnh cáo
            const stats = await WarningService.getUserWarningStats(targetUser.id, guildId);
            const activeWarnings = await WarningService.getActiveWarnings(targetUser.id, guildId);

            // Tạo embed
            const embed = new EmbedBuilder()
                .setTitle(`📋 Cảnh Cáo - ${targetUser.username}`)
                .setDescription(
                    `**Thống kê cảnh cáo của <@${targetUser.id}>**\n\n` +
                    `📊 **Tổng quan:**\n` +
                    `• Tổng cảnh cáo: **${stats.totalWarnings}**\n` +
                    `• Cảnh cáo active: **${stats.activeWarnings}**\n` +
                    `• Trạng thái: ${stats.activeWarnings >= 3 ? "🔨 **Bị ban**" : stats.activeWarnings > 0 ? "⚠️ **Có cảnh cáo**" : "✅ **Sạch sẽ"}\n\n` +
                    `📈 **Chi tiết theo level:**\n` +
                    `• Level 1: **${stats.warningLevels.level1}**\n` +
                    `• Level 2: **${stats.warningLevels.level2}**\n` +
                    `• Level 3: **${stats.warningLevels.level3}**`
                )
                .setColor(stats.activeWarnings >= 3 ? "#ff0000" : stats.activeWarnings > 0 ? "#ffa500" : "#51cf66")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setTimestamp();

            // Thêm danh sách cảnh cáo active nếu có
            if (activeWarnings.length > 0) {
                const warningList = activeWarnings.map((warning, index) => {
                    const levelEmoji = warning.warningLevel === 1 ? "⚠️" : warning.warningLevel === 2 ? "🚨" : "🔨";
                    const levelColor = warning.warningLevel === 1 ? "#ffa500" : warning.warningLevel === 2 ? "#ff6b6b" : "#ff0000";
                    
                    return `${levelEmoji} **Level ${warning.warningLevel}** - ${warning.reason}\n` +
                           `📝 **Lý do:** ${warning.reason}\n` +
                           `⏰ **Thời gian:** <t:${Math.floor(new Date(warning.createdAt).getTime() / 1000)}:R>\n` +
                           `👮 **Moderator:** <@${warning.moderatorId}>\n`;
                }).join("\n");

                embed.addFields({
                    name: "📋 Danh Sách Cảnh Cáo Active",
                    value: warningList,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: "✅ Không Có Cảnh Cáo",
                    value: "User này không có cảnh cáo active nào.",
                    inline: false
                });
            }

            // Thêm thông tin về hệ thống cảnh cáo
            embed.addFields({
                name: "ℹ️ Hệ Thống Cảnh Cáo",
                value: 
                    "**Level 1:** Cảnh cáo nhẹ - Cảnh báo user\n" +
                    "**Level 2:** Cảnh cáo nghiêm trọng - Cảnh báo mạnh\n" +
                    "**Level 3:** Tự động ban - Ban khỏi server\n\n" +
                    "**Lệnh liên quan:**\n" +
                    "• `n.warn <user> <reason>` - Cảnh cáo user\n" +
                    "• `n.clearwarnings <user>` - Xóa tất cả cảnh cáo\n\n" +
                    "**Lưu ý:** Tất cả lệnh cảnh cáo yêu cầu quyền Administrator.",
                inline: false
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in warnings command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Xem Cảnh Cáo")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi xem cảnh cáo. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});