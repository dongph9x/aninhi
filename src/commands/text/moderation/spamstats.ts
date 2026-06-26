import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { SpamProtectionService } from "@/utils/spam-protection";

export default Bot.createCommand({
    structure: {
        name: "spamstats",
        aliases: ["spam", "thống kê spam", "spamstatistics"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        try {
            const spamService = SpamProtectionService.getInstance();
            const guildId = message.guildId!;

            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null) ||
                message.author; // Mặc định xem thống kê của chính mình

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.\n" +
                        "Hoặc sử dụng `n.spamstats` để xem thống kê của chính mình.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse command (optional)
            const command = args[1]?.toLowerCase() || "fishing";

            // Lấy thống kê spam
            const embed = spamService.createSpamStatsEmbed(targetUser.id, guildId, command);

            // Thêm thông tin user
            embed.setThumbnail(
                "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
            );

            // Thêm thông tin về hệ thống spam protection
            embed.addFields({
                name: "ℹ️ Hệ Thống Spam Protection",
                value: 
                    "**Fishing:** 30s cooldown, 5 lần/5 phút\n" +
                    "**Battle:** 60s cooldown, 3 lần/10 phút\n" +
                    "**Feed:** 15s cooldown, 10 lần/5 phút\n\n" +
                    "**Cảnh cáo:** Sau 3 lần vi phạm\n" +
                    "**Tạm khóa:** Sau 5 lần vi phạm (30 phút)",
                inline: false
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in spamstats command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Thống Kê Spam")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy thống kê spam. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});