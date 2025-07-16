import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "unmute",
        aliases: ["unmuteuser", "unmutemember", "untimeout"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!unmute <người dùng>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!unmute @user`\n" +
                        "• `p!unmute 123456789`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Moderate Members.",
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

            // Check if user is actually muted
            if (!targetMember.isCommunicationDisabled()) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Bị Mute")
                    .setDescription(
                        `Người dùng <@${targetUser.id}> không bị mute.`
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user has permission to unmute the target
            if (!targetMember.moderatable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Unmute")
                    .setDescription("Bạn không có quyền unmute người dùng này.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Get mute info before unmuting
            const muteInfo = {
                isMuted: targetMember.isCommunicationDisabled(),
                timeoutUntil: targetMember.communicationDisabledUntil,
            };

            // Perform the unmute
            await targetMember.timeout(null, `Unmute by ${message.author.username}`);

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "unmute",
                reason: "Manual unmute",
                channelId: message.channelId,
                messageId: message.id
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("🔊 Đã Unmute Người Dùng")
                .setDescription(
                    `**${message.author.username}** đã unmute **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `🕐 **Thời gian unmute:** <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setColor("#51cf66")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Unmute bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in unmute command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Unmute Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi unmute người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 