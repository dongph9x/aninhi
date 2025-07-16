import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "logs",
        aliases: ["modlogs", "moderationlogs", "history"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        try {
            // Parse arguments
            const targetUser = message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null);

            const limit = args[1] ? parseInt(args[1]) : 10;

            if (limit && (isNaN(limit) || limit < 1 || limit > 25)) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Số Lượng Không Hợp Lệ")
                    .setDescription("Số lượng logs phải từ 1 đến 25.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            let logs;
            let title;
            let description;

            if (targetUser) {
                // Lấy lịch sử của một người dùng cụ thể
                logs = await ModerationService.getUserHistory(targetUser.id, guildId, limit);
                const username = 'username' in targetUser ? targetUser.username : targetUser.id;
                title = `📋 Lịch Sử Moderation - ${username}`;
                description = `Lịch sử moderation của <@${targetUser.id}>`;
            } else {
                // Lấy lịch sử moderation của server
                logs = await ModerationService.getGuildHistory(guildId, limit);
                title = "📋 Lịch Sử Moderation Server";
                description = "Lịch sử moderation gần đây của server";
            }

            if (logs.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("📋 Không Có Logs")
                    .setDescription(
                        targetUser 
                            ? `Không có lịch sử moderation nào cho <@${targetUser.id}>`
                            : "Không có lịch sử moderation nào trong server"
                    )
                    .setColor("#ffa500")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Tạo danh sách logs
            const logsList = logs.map((log: any, index: number) => {
                const actionEmoji: Record<string, string> = {
                    kick: "👢",
                    ban: "🔨",
                    unban: "🔓",
                    mute: "🔇",
                    unmute: "🔊",
                    add_money: "💰",
                    subtract_money: "💸"
                };

                const actionName: Record<string, string> = {
                    kick: "Kick",
                    ban: "Ban",
                    unban: "Unban",
                    mute: "Mute",
                    unmute: "Unmute",
                    add_money: "Thêm tiền",
                    subtract_money: "Trừ tiền"
                };

                const emoji = actionEmoji[log.action] || "📝";
                const name = actionName[log.action] || log.action;

                const timestamp = `<t:${Math.floor(new Date(log.createdAt).getTime() / 1000)}:R>`;
                
                let details = `${emoji} **${name}** bởi <@${log.moderatorId}>\n`;
                details += `📅 ${timestamp}\n`;
                
                if (log.reason) {
                    details += `📝 **Lý do:** ${log.reason}\n`;
                }
                
                if (log.duration) {
                    const durationStr = formatDuration(log.duration);
                    details += `⏰ **Thời gian:** ${durationStr}\n`;
                }
                
                if (log.amount) {
                    details += `💰 **Số tiền:** ${log.amount.toLocaleString()} AniCoin\n`;
                }

                return `${index + 1}. ${details}`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields({
                    name: "📋 Chi Tiết",
                    value: logsList,
                    inline: false
                })
                .setColor("#51cf66")
                .setFooter({
                    text: `Hiển thị ${logs.length} logs gần nhất`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in logs command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Khi Lấy Logs")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy logs. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

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