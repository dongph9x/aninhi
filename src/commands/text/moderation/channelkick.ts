import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "channelkick",
        aliases: ["ckick", "kickfromchannel", "timeout"],
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
                    "**Cách dùng:** `p!channelkick <người dùng> [thời gian] [lý do]`\n\n" +
                        "**Thời gian:**\n" +
                        "• `1m` = 1 phút\n" +
                        "• `5m` = 5 phút\n" +
                        "• `1h` = 1 giờ\n" +
                        "• `1d` = 1 ngày\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!channelkick @user 1m spam`\n" +
                        "• `p!channelkick @user 5m vi phạm nội quy`\n" +
                        "• `p!channelkick 123456789 1h quấy rối`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Manage Channels và Manage Roles.",
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

            // Parse time duration
            let duration = 60000; // Default: 1 phút (60 giây)
            let timeString = "1 phút";
            let reason = "Không có lý do";

            // Check if second argument is a time duration
            if (args.length >= 2) {
                const timeArg = args[1]!;
                const timeMatch = timeArg.match(/^(\d+)([mhd])$/);
                
                if (timeMatch) {
                    const value = parseInt(timeMatch[1]);
                    const unit = timeMatch[2];
                    
                    switch (unit) {
                        case 'm':
                            duration = value * 60 * 1000; // phút
                            timeString = `${value} phút`;
                            break;
                        case 'h':
                            duration = value * 60 * 60 * 1000; // giờ
                            timeString = `${value} giờ`;
                            break;
                        case 'd':
                            duration = value * 24 * 60 * 60 * 1000; // ngày
                            timeString = `${value} ngày`;
                            break;
                    }
                    
                    // Parse reason (everything after time)
                    reason = args.slice(2).join(" ") || "Không có lý do";
                } else {
                    // No time specified, treat as reason
                    reason = args.slice(1).join(" ") || "Không có lý do";
                }
            }

            // Check if duration is too long (max 28 days)
            if (duration > 28 * 24 * 60 * 60 * 1000) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Thời Gian Quá Dài")
                    .setDescription("Thời gian kick không được vượt quá 28 ngày.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user has permission to timeout the target
            if (!targetMember.moderatable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Kick")
                    .setDescription("Bạn không có quyền kick người dùng này khỏi channel.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Calculate timeout end time
            const timeoutEndTime = new Date(Date.now() + duration);

            // Perform the timeout (kick from channel)
            await targetMember.timeout(duration, `Channel kick by ${message.author.username}: ${reason}`);

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "kick",
                reason: `Channel kick (${timeString}): ${reason}`,
                channelId: message.channelId,
                messageId: message.id,
                duration: duration
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("🚫 Đã Kick Khỏi Channel")
                .setDescription(
                    `**${message.author.username}** đã kick **<@${targetUser.id}>** khỏi channel này\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `⏰ **Thời gian:** ${timeString}\n` +
                        `📝 **Lý do:** ${reason}\n` +
                        `🕐 **Kết thúc:** <t:${Math.floor(timeoutEndTime.getTime() / 1000)}:R>`
                )
                .setColor("#ff6b35")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Channel kick bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in channelkick command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Kick Khỏi Channel Thất Bại")
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