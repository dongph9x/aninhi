import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { ecommerceDB } from "@/utils/ecommerce-db";

export default Bot.createCommand({
    structure: {
        name: "leaderboard",
        aliases: ["lb", "top", "rich"],
    },
    run: async ({ message, t }) => {
        const guildId = message.guildId!;

        try {
            const topUsers = await ecommerceDB.getTopUsers(guildId, 10);

            if (topUsers.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🏆 Bảng Xếp Hạng")
                    .setDescription("Không tìm thấy người dùng nào trong server này!")
                    .setColor(config.embedColor)
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle("🏆 Người Dùng Giàu Nhất")
                .setDescription(
                    topUsers
                        .map((user, index) => {
                            const medal =
                                index === 0
                                    ? "🥇"
                                    : index === 1
                                        ? "🥈"
                                        : index === 2
                                            ? "🥉"
                                            : `${index + 1}.`;
                            return `${medal} <@${user.userId}> - **${user.balance.toLocaleString()}** AniCoin`;
                        })
                        .join("\n"),
                )
                .setColor(config.embedColor)
                .setFooter({
                    text: `${message.guild?.name} • Top 10 Người Dùng Giàu Nhất | Database Version`,
                    iconURL: message.guild?.iconURL() || undefined,
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in leaderboard command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi lấy bảng xếp hạng. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
