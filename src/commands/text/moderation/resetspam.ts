import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { SpamProtectionService } from "@/utils/spam-protection";

export default Bot.createCommand({
    structure: {
        name: "resetspam",
        aliases: ["resetspamrecord", "xóa spam", "cleanspam"],
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
                    "**Cách dùng:** `n.resetspam <người dùng> [lệnh]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.resetspam @user` - Reset tất cả spam records\n" +
                        "• `n.resetspam @user fishing` - Reset spam record cho lệnh fishing\n" +
                        "• `n.resetspam 123456789 battle` - Reset spam record cho lệnh battle\n\n" +
                        "**Lưu ý:**\n" +
                        "• Chỉ Admin mới có thể reset spam records\n" +
                        "• Nếu không chỉ định lệnh, sẽ reset tất cả\n" +
                        "• Không thể hoàn tác sau khi reset\n\n" +
                        "**Lệnh liên quan:**\n" +
                        "• `n.spamstats <user>` - Xem thống kê spam\n" +
                        "• `n.unbanuser <user>` - Mở khóa user",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            const spamService = SpamProtectionService.getInstance();
            const guildId = message.guildId!;

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

            // Parse command (optional)
            const command = args[1]?.toLowerCase();

            if (command) {
                // Reset spam record cho lệnh cụ thể
                const success = spamService.resetSpamRecord(targetUser.id, guildId, command);
                
                if (success) {
                    const embed = new EmbedBuilder()
                        .setTitle("✅ Đã Reset Spam Record")
                        .setDescription(
                            `**Người dùng:** <@${targetUser.id}>\n` +
                            `**Lệnh:** \`${command}\`\n` +
                            `**Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>`
                        )
                        .setColor("#51cf66")
                        .setThumbnail(
                            "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                        )
                        .setTimestamp();

                    message.reply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle("ℹ️ Không Có Spam Record")
                        .setDescription(
                            `<@${targetUser.id}> không có spam record cho lệnh \`${command}\``
                        )
                        .setColor("#ffa500")
                        .setTimestamp();

                    message.reply({ embeds: [embed] });
                }
            } else {
                // Reset tất cả spam records
                const commands = ["fishing", "battle", "feed"];
                let resetCount = 0;

                for (const cmd of commands) {
                    if (spamService.resetSpamRecord(targetUser.id, guildId, cmd)) {
                        resetCount++;
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle("✅ Đã Reset Spam Records")
                    .setDescription(
                        `**Người dùng:** <@${targetUser.id}>\n` +
                        `**Lệnh đã reset:** ${resetCount}/${commands.length}\n` +
                        `**Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor("#51cf66")
                    .setThumbnail(
                        "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                    )
                    .setTimestamp();

                message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("Error in resetspam command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Reset Spam")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi reset spam record. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});