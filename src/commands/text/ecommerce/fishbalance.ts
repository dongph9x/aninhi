import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { fishCoinDB } from "@/utils/fish-coin";

export default Bot.createCommand({
    structure: {
        name: "fishbalance",
        aliases: ["fishbal", "fishcoin", "fishcoins", "fc"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        try {
            // Lấy thông tin user từ database
            const user = await fishCoinDB.getUser(userId, guildId);
            
            // Lấy lịch sử giao dịch FishCoin gần nhất
            const recentTransactions = await fishCoinDB.getFishTransactions(userId, guildId, 5);

            const embed = new EmbedBuilder()
                .setTitle("🐟 Thông Tin FishCoin")
                .setDescription(
                    `**${message.author.username}**\n\n` +
                        `🐟 **FishCoin hiện tại:** ${user.fishBalance.toLocaleString()} FishCoin\n` +
                        `💎 **AniCoin hiện tại:** ${user.balance.toLocaleString()} AniCoin\n` +
                        `🔥 **Chuỗi hàng ngày:** ${user.dailyStreak} ngày\n` +
                        `📅 **Tham gia từ:** ${user.createdAt.toLocaleDateString('vi-VN')}\n` +
                        `🔄 **Cập nhật lần cuối:** ${user.updatedAt.toLocaleDateString('vi-VN')}`
                )
                .setColor("#00CED1") // Màu xanh dương nhạt cho fish theme
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `ID: ${userId} | FishCoin System`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Thêm lịch sử giao dịch FishCoin
            if (recentTransactions.length > 0) {
                const transactionList = recentTransactions
                    .map(tx => {
                        const emoji = tx.amount > 0 ? "🐟" : "💸";
                        const date = tx.createdAt.toLocaleDateString('vi-VN');
                        const absAmount = tx.amount > 0 ? tx.amount : -tx.amount;
                        return `${emoji} **${absAmount.toLocaleString()}** FishCoin - ${tx.description || tx.type} (${date})`;
                    })
                    .join('\n');

                embed.addFields({
                    name: "📋 Lịch Sử Giao Dịch FishCoin Gần Đây",
                    value: transactionList,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: "📋 Lịch Sử Giao Dịch FishCoin",
                    value: "Chưa có giao dịch nào",
                    inline: false
                });
            }

            // Thêm thông tin về FishCoin
            embed.addFields({
                name: "ℹ️ Về FishCoin",
                value: "🐟 FishCoin là đồng tiền riêng cho hệ thống cá\n" +
                       "💰 Dùng để mua bán cá, thức ăn, và các dịch vụ liên quan\n" +
                       "🎯 Tách biệt với AniCoin thông thường",
                inline: false
            });

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in fishbalance command:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi lấy thông tin FishCoin!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }
    },
}); 