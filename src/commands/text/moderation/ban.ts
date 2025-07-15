import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { Bot } from "@/classes";
import { addBan, removeBan } from "@/utils/banStore";
import type { BanRecord } from "@/utils/banStore";

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
        name: "ban",
        aliases: ["banuser", "banmember"],
    },
    options: {
        permissions: ["BanMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `n.ban <người dùng> [thời gian] [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.ban @user spam`\n" +
                        "• `n.ban @user 10m spam`\n" +
                        "• `n.ban @user 2h vi phạm nội quy`\n" +
                        "• `n.ban @user 1d spam liên tục`\n\n" +
                        "**Đơn vị thời gian:**\n" +
                        "• `s` - giây (ví dụ: 30s)\n" +
                        "• `m` - phút (ví dụ: 10m)\n" +
                        "• `h` - giờ (ví dụ: 2h)\n" +
                        "• `d` - ngày (ví dụ: 1d)\n" +
                        "• `w` - tuần (ví dụ: 1w)\n" +
                        "• `y` - năm (ví dụ: 1y)\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Ban Members.",
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

            // Check if user is trying to ban themselves
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Tự Ban")
                    .setDescription("Bạn không thể ban chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to ban the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Ban Bot")
                    .setDescription("Bạn không thể ban bot.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user has permission to ban the target
            const targetMember = await message.guild!.members.fetch(targetUser.id).catch(() => null);
            if (targetMember && !targetMember.bannable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Ban")
                    .setDescription("Bạn không có quyền ban người dùng này.")
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
                const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
                if (duration > maxDuration) {
                    const embed = new EmbedBuilder()
                        .setTitle("❌ Thời Gian Quá Dài")
                        .setDescription("Thời gian ban không được vượt quá 1 năm.")
                        .setColor("#ff0000")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }
            }

            // Perform the ban
            const banOptions: any = {
                reason: `Ban by ${message.author.username}: ${reason}`,
            };

            if (duration !== null) {
                banOptions.deleteMessageDays = 1; // Delete messages from last day
            }

            await message.guild!.members.ban(targetUser.id, banOptions);

            // Lưu lịch sử ban vào file JSON
            addBan({
                userId: targetUser.id,
                guildId: message.guildId!,
                moderatorId: message.author.id,
                reason,
                banAt: Date.now(),
                expiresAt: duration !== null ? Date.now() + duration : null,
                type: duration !== null ? "temporary" : "permanent",
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("🔨 Đã Ban Người Dùng")
                .setDescription(
                    `**${message.author.username}** đã ban **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `📝 **Lý do:** ${reason}\n` +
                        (duration !== null
                            ? `⏰ **Thời gian:** ${durationStr} (${formatDuration(duration)})\n` +
                              `🕐 **Hết hạn:** <t:${Math.floor((Date.now() + duration) / 1000)}:R>`
                            : "🔒 **Loại ban:** Vĩnh viễn")
                )
                .setColor("#ff6b6b")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Ban bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Set up auto-unban if duration is provided
            if (duration !== null) {
                setTimeout(async () => {
                    try {
                        await message.guild!.members.unban(targetUser.id, "Tự động unban sau khi hết hạn");
                        // Xoá khỏi file ban khi auto-unban
                        removeBan(targetUser.id, message.guildId!);
                        
                        const unbanEmbed = new EmbedBuilder()
                            .setTitle("🔓 Tự Động Unban")
                            .setDescription(
                                `**<@${targetUser.id}>** đã được tự động unban sau khi hết hạn thời gian ban.\n\n` +
                                `⏰ **Thời gian ban:** ${durationStr}\n` +
                                `📝 **Lý do ban:** ${reason}`
                            )
                            .setColor("#51cf66")
                            .setTimestamp();

                        // Try to send to the same channel, fallback to first available channel
                        try {
                            await message.channel.send({ embeds: [unbanEmbed] });
                        } catch {
                            const firstChannel = message.guild!.channels.cache
                                .filter(ch => ch.isTextBased())
                                .first();
                            if (firstChannel && firstChannel.isTextBased()) {
                                await firstChannel.send({ embeds: [unbanEmbed] });
                            }
                        }
                    } catch (error) {
                        console.error("Error auto-unbanning user:", error);
                    }
                }, duration);
            }
        } catch (error) {
            console.error("Error in ban command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Ban Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi ban người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 