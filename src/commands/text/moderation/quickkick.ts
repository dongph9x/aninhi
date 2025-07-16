import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "quickkick",
        aliases: ["qkick", "kick1m", "1mkick"],
    },
    options: {
        permissions: ["ManageChannels", "ManageRoles"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!quickkick <người dùng> [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!quickkick @user spam`\n" +
                        "• `p!quickkick @user vi phạm nội quy`\n" +
                        "• `p!quickkick 123456789 quấy rối`\n\n" +
                        "**Lưu ý:** Lệnh này sẽ kick người dùng khỏi channel trong 1 phút.",
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

            // Check if user is trying to kick themselves
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Tự Kick")
                    .setDescription("Bạn không thể kick chính mình khỏi channel.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to kick the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Kick Bot")
                    .setDescription("Bạn không thể kick bot khỏi channel.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Get target member
            const targetMember = await message.guild!.members.fetch(targetUser.id).catch(() => null);
            
            if (!targetMember) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Tìm Thấy")
                    .setDescription("Người dùng này không có trong máy chủ.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse reason
            const reason = args.slice(1).join(" ") || "Không có lý do";

            // Set duration to 1 minute
            const duration = 60000; // 1 phút
            const timeoutEndTime = new Date(Date.now() + duration);

            // Check if user has permission to timeout the target
            if (!targetMember.moderatable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Kick")
                    .setDescription("Bạn không có quyền kick người dùng này khỏi channel.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Perform the timeout (kick from channel for 1 minute)
            await targetMember.timeout(duration, `Quick kick by ${message.author.username}: ${reason}`);

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "kick",
                reason: `Quick kick (1m): ${reason}`,
                channelId: message.channelId,
                messageId: message.id,
                duration: duration
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("⚡ Quick Kick - 1 Phút")
                .setDescription(
                    `**${message.author.username}** đã kick **<@${targetUser.id}>** khỏi channel này trong 1 phút\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `⏰ **Thời gian:** 1 phút\n` +
                        `📝 **Lý do:** ${reason}\n` +
                        `🕐 **Kết thúc:** <t:${Math.floor(timeoutEndTime.getTime() / 1000)}:R>`
                )
                .setColor("#ff6b35")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Quick kick bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in quickkick command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Quick Kick Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi kick người dùng khỏi channel. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 