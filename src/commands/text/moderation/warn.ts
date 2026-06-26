import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { WarningService } from "@/utils/warning";
import { ModerationService } from "@/utils/moderation";
import { banDB } from "@/utils/ban-db";
import { emojis } from "@/config";

export default Bot.createCommand({
    structure: {
        name: "warn",
        aliases: ["warning", "cảnh cáo", "caution"],
    },
    options: {
        permissions: ["Administrator"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `n.warn <người dùng> [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.warn @user spam`\n" +
                        "• `n.warn @user vi phạm nội quy`\n" +
                        "• `n.warn 123456789 quấy rối`\n\n" +
                        "**Hệ thống cảnh cáo:**\n" +
                        "• **Lần 1:** Cảnh cáo nhẹ\n" +
                        "• **Lần 2:** Cảnh cáo nghiêm trọng\n" +
                        "• **Lần 3:** Tự động ban khỏi server\n\n" +
                        "**Lệnh liên quan:**\n" +
                        "• `n.warnings <user>` - Xem cảnh cáo của user\n" +
                        "• `n.warnlist` - Xem danh sách cảnh cáo server\n" +
                        "• `n.warnstats` - Thống kê cảnh cáo\n" +
                        "• `n.clearwarnings <user>` - Xóa tất cả cảnh cáo của user\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Administrator.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null);

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to warn themselves
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Tự Cảnh Cáo")
                    .setDescription("Bạn không thể cảnh cáo chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to warn the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Cảnh Cáo Bot")
                    .setDescription("Bạn không thể cảnh cáo bot.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse reason
            const reason = args.slice(1).join(" ") || "Không có lý do";

            // Lấy thống kê cảnh cáo hiện tại của user
            const currentStats = await WarningService.getUserWarningStats(targetUser.id, message.guildId!);
            const currentLevel = currentStats.activeWarnings;

            // Kiểm tra xem user đã có 3 cảnh cáo chưa
            if (currentLevel >= 3) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Cảnh Cáo")
                    .setDescription(
                        `<@${targetUser.id}> đã có đủ 3 cảnh cáo!\n\n` +
                        `**Thống kê hiện tại:**\n` +
                        `• Tổng cảnh cáo: ${currentStats.totalWarnings}\n` +
                        `• Cảnh cáo active: ${currentStats.activeWarnings}\n` +
                        `• Level 1: ${currentStats.warningLevels.level1}\n` +
                        `• Level 2: ${currentStats.warningLevels.level2}\n` +
                        `• Level 3: ${currentStats.warningLevels.level3}\n\n` +
                        `**Hành động:** User sẽ bị ban tự động.`
                    )
                    .setColor("#ff6b6b")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Tạo cảnh cáo mới
            const warningData = {
                userId: targetUser.id,
                guildId: message.guildId!,
                moderatorId: message.author.id,
                warningLevel: currentLevel + 1,
                reason: reason,
                message: ""
            };

            const warning = await WarningService.createWarning(warningData);

            // Tạo message cảnh cáo
            const warningMessage = WarningService.createWarningMessage(
                warning.warningLevel,
                reason
            );

            // Tạo embed cảnh cáo
            const embed = new EmbedBuilder()
                .setTitle(`🚨 Cảnh Cáo Lần ${warning.warningLevel}`)
                .setDescription(
                    `**${message.author.username}** đã cảnh cáo **<@${targetUser.id}>**\n\n` +
                    `👤 **Người dùng:** <@${targetUser.id}>\n` +
                    `📝 **Lý do:** ${reason}\n` +
                    `⚠️ **Cảnh cáo:** ${currentLevel + 1}/3\n` +
                    `🕐 **Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                    warningMessage
                )
                .setColor(warning.warningLevel === 1 ? "#ffa500" : warning.warningLevel === 2 ? "#ff6b6b" : "#ff0000")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Cảnh cáo bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "warn",
                reason: `Warning level ${warning.warningLevel}: ${reason}`,
                channelId: message.channelId,
                messageId: message.id
            });

            // Kiểm tra xem có nên ban tự động không
            if (warning.warningLevel === 3) {
                try {
                    // Ban user
                    await message.guild!.members.ban(targetUser.id, {
                        reason: `Auto ban - 3 warnings: ${reason}`,
                        deleteMessageDays: 1
                    });

                    // Lưu vào database
                    await banDB.createBan(
                        targetUser.id,
                        message.guildId!,
                        message.author.id,
                        `Auto ban - 3 warnings: ${reason}`,
                        "permanent"
                    );

                    // Thêm thông báo ban vào embed
                    embed.addFields({
                        name: "🔨 Tự Động Ban",
                        value: `<@${targetUser.id}> đã bị ban tự động do đạt 3 cảnh cáo!`,
                        inline: false
                    });

                    // Ghi log ban
                    await ModerationService.logAction({
                        guildId: message.guildId!,
                        targetUserId: targetUser.id,
                        moderatorId: message.author.id,
                        action: "ban",
                        reason: `Auto ban - 3 warnings: ${reason}`,
                        channelId: message.channelId,
                        messageId: message.id
                    });

                } catch (banError) {
                    console.error("Error auto-banning user:", banError);
                    embed.addFields({
                        name: "⚠️ Lỗi Ban Tự Động",
                        value: "Không thể ban user tự động. Vui lòng ban thủ công.",
                        inline: false
                    });
                }
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in warn command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Cảnh Cáo Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi cảnh cáo người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});