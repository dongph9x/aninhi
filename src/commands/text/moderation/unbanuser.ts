import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { SpamProtectionService } from "@/utils/spam-protection";

export default Bot.createCommand({
    structure: {
        name: "unbanuser",
        aliases: ["unban", "mở khóa", "unlockuser"],
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
                    "**Cách dùng:** `n.unbanuser <người dùng> [lệnh]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.unbanuser @user` - Mở khóa tất cả lệnh\n" +
                        "• `n.unbanuser @user fishing` - Mở khóa lệnh fishing\n" +
                        "• `n.unbanuser 123456789 battle` - Mở khóa lệnh battle\n\n" +
                        "**Lưu ý:**\n" +
                        "• Chỉ Admin mới có thể mở khóa user\n" +
                        "• Nếu không chỉ định lệnh, sẽ mở khóa tất cả\n" +
                        "• User sẽ có thể sử dụng lệnh bình thường\n\n" +
                        "**Lệnh liên quan:**\n" +
                        "• `n.spamstats <user>` - Xem thống kê spam\n" +
                        "• `n.resetspam <user>` - Reset spam records",
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
                // Unban user cho lệnh cụ thể
                const success = spamService.unbanUser(targetUser.id, guildId, command);
                
                if (success) {
                    const embed = new EmbedBuilder()
                        .setTitle("✅ Đã Mở Khóa User")
                        .setDescription(
                            `**Người dùng:** <@${targetUser.id}>\n` +
                            `**Lệnh:** \`${command}\`\n` +
                            `**Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                            `User có thể sử dụng lệnh \`${command}\` bình thường.`
                        )
                        .setColor("#51cf66")
                        .setThumbnail(
                            "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                        )
                        .setTimestamp();

                    message.reply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle("ℹ️ User Không Bị Khóa")
                        .setDescription(
                            `<@${targetUser.id}> không bị khóa lệnh \`${command}\``
                        )
                        .setColor("#ffa500")
                        .setTimestamp();

                    message.reply({ embeds: [embed] });
                }
            } else {
                // Unban user cho tất cả lệnh
                const commands = ["fishing", "battle", "feed"];
                let unbanCount = 0;

                for (const cmd of commands) {
                    if (spamService.unbanUser(targetUser.id, guildId, cmd)) {
                        unbanCount++;
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle("✅ Đã Mở Khóa User")
                    .setDescription(
                        `**Người dùng:** <@${targetUser.id}>\n` +
                        `**Lệnh đã mở khóa:** ${unbanCount}/${commands.length}\n` +
                        `**Thời gian:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                        `User có thể sử dụng tất cả lệnh bình thường.`
                    )
                    .setColor("#51cf66")
                    .setThumbnail(
                        "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                    )
                    .setTimestamp();

                message.reply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("Error in unbanuser command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Mở Khóa User")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi mở khóa user. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});