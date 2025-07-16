import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "kick",
        aliases: ["kickuser", "kickmember"],
    },
    options: {
        permissions: ["KickMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!kick <người dùng> [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!kick @user spam`\n" +
                        "• `p!kick @user vi phạm nội quy`\n" +
                        "• `p!kick 123456789 spam liên tục`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Kick Members.",
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
                    .setDescription("Bạn không thể kick chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to kick the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Kick Bot")
                    .setDescription("Bạn không thể kick bot.")
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

            // Check if user has permission to kick the target
            if (!targetMember.kickable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Kick")
                    .setDescription("Bạn không có quyền kick người dùng này.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse reason
            const reason = args.slice(1).join(" ") || "Không có lý do";

            // Perform the kick
            await targetMember.kick(`Kick by ${message.author.username}: ${reason}`);

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "kick",
                reason: reason,
                channelId: message.channelId,
                messageId: message.id
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("👢 Đã Kick Người Dùng")
                .setDescription(
                    `**${message.author.username}** đã kick **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `📝 **Lý do:** ${reason}\n` +
                        `🕐 **Thời gian kick:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setColor("#ffa500")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Kick bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in kick command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Kick Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi kick người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 