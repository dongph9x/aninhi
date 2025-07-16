import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { ecommerceDB } from "@/utils/ecommerce-db";

export default Bot.createCommand({
    structure: {
        name: "balance",
        aliases: ["bal", "money", "coins", "cash"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        try {
            // Lấy thông tin user từ database
            const user = await ecommerceDB.getUser(userId, guildId);
            
            // Lấy lịch sử giao dịch gần nhất
            const recentTransactions = await ecommerceDB.getUserTransactions(userId, guildId, 5);

            const embed = new EmbedBuilder()
                .setTitle("💰 Thông Tin Tài Khoản")
                .setDescription(
                    `**${message.author.username}**\n\n` +
                        `💎 **Số dư hiện tại:** ${user.balance.toLocaleString()} AniCoin\n` +
                        `🔥 **Chuỗi hàng ngày:** ${user.dailyStreak} ngày\n` +
                        `📅 **Tham gia từ:** ${user.createdAt.toLocaleDateString('vi-VN')}\n` +
                        `🔄 **Cập nhật lần cuối:** ${user.updatedAt.toLocaleDateString('vi-VN')}`
                )
                .setColor(config.embedColor)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `ID: ${userId} | Database Version`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Thêm lịch sử giao dịch gần nhất
            if (recentTransactions.length > 0) {
                const transactionList = recentTransactions
                    .map(tx => {
                        const emoji = tx.amount > 0 ? "➕" : "➖";
                        const date = tx.createdAt.toLocaleDateString('vi-VN');
                        return `${emoji} **${Math.abs(tx.amount).toLocaleString()}** AniCoin - ${tx.description || tx.type} (${date})`;
                    })
                    .join('\n');

                embed.addFields({
                    name: "📊 Lịch Sử Giao Dịch Gần Nhất",
                    value: transactionList,
                    inline: false,
                });
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in balance command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi lấy thông tin tài khoản. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
