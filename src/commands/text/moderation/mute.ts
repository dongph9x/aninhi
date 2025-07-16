import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

// Helper function to parse duration
function parseDuration(durationStr: string): { duration: number | null; unit: string } {
    const match = durationStr.match(/^(\d+)([smhdwy])$/);
    if (!match) return { duration: null, unit: "" };

    const value = parseInt(match[1]!);
    const unit = match[2]!;

    const multipliers: Record<string, number> = {
        s: 1000, // seconds to milliseconds
        m: 60 * 1000, // minutes to milliseconds
        h: 60 * 60 * 1000, // hours to milliseconds
        d: 24 * 60 * 60 * 1000, // days to milliseconds
        w: 7 * 24 * 60 * 60 * 1000, // weeks to milliseconds
        y: 365 * 24 * 60 * 60 * 1000, // years to milliseconds
    };

    return { duration: value * multipliers[unit], unit };
}

// Helper function to format duration
function formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    if (minutes > 0) return `${minutes} phút`;
    return `${seconds} giây`;
}

export default Bot.createCommand({
    structure: {
        name: "mute",
        aliases: ["muteuser", "mutemember", "timeout"],
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
                    "**Cách dùng:** `p!mute <người dùng> [thời gian] [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!mute @user spam`\n" +
                        "• `p!mute @user 10m spam`\n" +
                        "• `p!mute @user 2h vi phạm nội quy`\n" +
                        "• `p!mute @user 1d spam liên tục`\n\n" +
                        "**Đơn vị thời gian:**\n" +
                        "• `s` - giây (ví dụ: 30s)\n" +
                        "• `m` - phút (ví dụ: 10m)\n" +
                        "• `h` - giờ (ví dụ: 2h)\n" +
                        "• `d` - ngày (ví dụ: 1d)\n" +
                        "• `w` - tuần (ví dụ: 1w)\n" +
                        "• `y` - năm (ví dụ: 1y)\n\n" +
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

            // Check if user is trying to mute themselves
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Tự Mute")
                    .setDescription("Bạn không thể mute chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to mute the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Mute Bot")
                    .setDescription("Bạn không thể mute bot.")
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

            // Check if user has permission to mute the target
            if (!targetMember.moderatable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Mute")
                    .setDescription("Bạn không có quyền mute người dùng này.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            let duration: number | null = null;
            let reason = "";
            let durationStr = "";

            // Parse duration and reason
            if (args.length >= 2) {
                const secondArg = args[1]!;
                const parsedDuration = parseDuration(secondArg);

                if (parsedDuration.duration !== null) {
                    // Second argument is a duration
                    duration = parsedDuration.duration;
                    durationStr = secondArg;
                    reason = args.slice(2).join(" ") || "Không có lý do";
                } else {
                    // Second argument is part of the reason
                    reason = args.slice(1).join(" ") || "Không có lý do";
                }
            } else {
                reason = "Không có lý do";
            }

            // Validate duration if provided
            if (duration !== null) {
                const maxDuration = 28 * 24 * 60 * 60 * 1000; // 28 days in milliseconds (Discord limit)
                if (duration > maxDuration) {
                    const embed = new EmbedBuilder()
                        .setTitle("❌ Thời Gian Quá Dài")
                        .setDescription("Thời gian mute không được vượt quá 28 ngày (giới hạn của Discord).")
                        .setColor("#ff0000")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                const minDuration = 1000; // 1 second in milliseconds
                if (duration < minDuration) {
                    const embed = new EmbedBuilder()
                        .setTitle("❌ Thời Gian Quá Ngắn")
                        .setDescription("Thời gian mute phải ít nhất 1 giây.")
                        .setColor("#ff0000")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }
            } else {
                // Default to 5 minutes if no duration provided
                duration = 5 * 60 * 1000; // 5 minutes
                durationStr = "5m";
            }

            // Perform the timeout
            await targetMember.timeout(duration, `Mute by ${message.author.username}: ${reason}`);

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "mute",
                reason: reason,
                duration: duration,
                channelId: message.channelId,
                messageId: message.id
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("🔇 Đã Mute Người Dùng")
                .setDescription(
                    `**${message.author.username}** đã mute **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `📝 **Lý do:** ${reason}\n` +
                        `⏰ **Thời gian:** ${durationStr} (${formatDuration(duration)})\n` +
                        `🕐 **Hết hạn:** <t:${Math.floor((Date.now() + duration) / 1000)}:R>`
                )
                .setColor("#ffa500")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Mute bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in mute command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Mute Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi mute người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 