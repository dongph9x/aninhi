import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { WarningService } from "@/utils/warning";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "clearwarnings",
        aliases: ["clearwarn", "xóa cảnh cáo", "removewarnings"],
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
                    "**Cách dùng:** `n.clearwarnings <người dùng>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.clearwarnings @user`\n" +
                        "• `n.clearwarnings 123456789`\n\n" +
                        "**Lưu ý:**\n" +
                        "• Chỉ Admin mới có thể xóa cảnh cáo\n" +
                        "• Lệnh này sẽ xóa TẤT CẢ cảnh cáo của user\n" +
                        "• Không thể hoàn tác sau khi xóa\n\n" +
                        "**Lệnh liên quan:**\n" +
                        "• `n.warnings <user>` - Xem cảnh cáo của user\n" +
                        "• `n.warnstats` - Thống kê cảnh cáo server\n\n" +
                        "**Lưu ý:** Tất cả lệnh cảnh cáo yêu cầu quyền Administrator.",
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

            // Check if user is trying to clear their own warnings
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Xóa Cảnh Cáo Của Chính Mình")
                    .setDescription("Bạn không thể xóa cảnh cáo của chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const guildId = message.guildId!;

            // Lấy thống kê cảnh cáo trước khi xóa
            const statsBefore = await WarningService.getUserWarningStats(targetUser.id, guildId);
            const activeWarnings = await WarningService.getActiveWarnings(targetUser.id, guildId);

            if (statsBefore.activeWarnings === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("✅ Không Có Cảnh Cáo Để Xóa")
                    .setDescription(
                        `<@${targetUser.id}> không có cảnh cáo active nào để xóa.`
                    )
                    .setColor("#51cf66")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Xác nhận xóa cảnh cáo
            const confirmEmbed = new EmbedBuilder()
                .setTitle("⚠️ Xác Nhận Xóa Cảnh Cáo")
                .setDescription(
                    `**Bạn có chắc chắn muốn xóa TẤT CẢ cảnh cáo của <@${targetUser.id}>?**\n\n` +
                    `📊 **Thống kê hiện tại:**\n` +
                    `• Tổng cảnh cáo: **${statsBefore.totalWarnings}**\n` +
                    `• Cảnh cáo active: **${statsBefore.activeWarnings}**\n` +
                    `• Level 1: **${statsBefore.warningLevels.level1}**\n` +
                    `• Level 2: **${statsBefore.warningLevels.level2}**\n` +
                    `• Level 3: **${statsBefore.warningLevels.level3}**\n\n` +
                    `⚠️ **Lưu ý:** Hành động này không thể hoàn tác!`
                )
                .setColor("#ffa500")
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            // Thêm reactions để xác nhận
            await confirmMsg.react('✅');
            await confirmMsg.react('❌');

            // Đợi reaction từ người dùng
            const filter = (reaction: any, user: any) => 
                ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;

            try {
                const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: 30000 });

                if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setTitle("⏰ Hết Thời Gian")
                        .setDescription("Không có phản hồi. Hủy bỏ xóa cảnh cáo.")
                        .setColor("#ffa500")
                        .setTimestamp();

                    return confirmMsg.edit({ embeds: [timeoutEmbed] });
                }

                const reaction = collected.first();
                if (reaction?.emoji.name === '❌') {
                    const cancelEmbed = new EmbedBuilder()
                        .setTitle("❌ Đã Hủy")
                        .setDescription("Đã hủy bỏ xóa cảnh cáo.")
                        .setColor("#ffa500")
                        .setTimestamp();

                    return confirmMsg.edit({ embeds: [cancelEmbed] });
                }

                // Xóa tất cả cảnh cáo
                await WarningService.clearUserWarnings(targetUser.id, guildId, message.author.id);

                // Lấy thống kê sau khi xóa
                const statsAfter = await WarningService.getUserWarningStats(targetUser.id, guildId);

                // Ghi log moderation
                await ModerationService.logAction({
                    guildId: guildId,
                    targetUserId: targetUser.id,
                    moderatorId: message.author.id,
                    action: "clear_warnings",
                    reason: `Cleared ${statsBefore.activeWarnings} active warnings`,
                    channelId: message.channelId,
                    messageId: message.id
                });

                // Tạo embed thành công
                const successEmbed = new EmbedBuilder()
                    .setTitle("✅ Đã Xóa Cảnh Cáo")
                    .setDescription(
                        `**${message.author.username}** đã xóa tất cả cảnh cáo của **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `📊 **Trước khi xóa:**\n` +
                        `• Cảnh cáo active: **${statsBefore.activeWarnings}**\n` +
                        `• Level 1: **${statsBefore.warningLevels.level1}**\n` +
                        `• Level 2: **${statsBefore.warningLevels.level2}**\n` +
                        `• Level 3: **${statsBefore.warningLevels.level3}**\n\n` +
                        `📊 **Sau khi xóa:**\n` +
                        `• Cảnh cáo active: **${statsAfter.activeWarnings}**\n` +
                        `• Trạng thái: ✅ **Sạch sẽ**\n\n` +
                        `🕐 **Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor("#51cf66")
                    .setThumbnail(
                        "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                    )
                    .setFooter({
                        text: `Xóa bởi ${message.author.username}`,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                confirmMsg.edit({ embeds: [successEmbed] });

            } catch (error) {
                console.error("Error in confirmation:", error);
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi Xác Nhận")
                    .setDescription("Đã xảy ra lỗi trong quá trình xác nhận.")
                    .setColor("#ff0000")
                    .setTimestamp();

                confirmMsg.edit({ embeds: [errorEmbed] });
            }

        } catch (error) {
            console.error("Error in clearwarnings command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Xóa Cảnh Cáo Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi xóa cảnh cáo. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});