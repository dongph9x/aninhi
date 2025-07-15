import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { getBalance, getUser } from "@/utils/ecommerce";

export default Bot.createCommand({
    structure: {
        name: "balance",
        aliases: ["bal", "money", "coins", "cash"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        try {
            const balance = await getBalance(userId, guildId);
            const user = await getUser(userId, guildId);

            const embed = new EmbedBuilder()
                .setTitle("💰 Số Dư")
                .setDescription(
                    `Số dư của **${message.author.username}**:\n\n` +
                        `💎 **AniCoin:** ${balance.toLocaleString()}\n` +
                        `🔥 **Chuỗi hàng ngày:** ${user.dailyStreak} ngày\n` +
                        `📅 **Tài khoản tạo:** <t:${Math.floor(new Date(user.createdAt).getTime() / 1000)}:R>`,
                )
                .setColor(config.embedColor)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `ID người dùng: ${userId}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in balance command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi lấy số dư. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
