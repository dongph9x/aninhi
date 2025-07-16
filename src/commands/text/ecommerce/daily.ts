import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ecommerceDB } from "@/utils/ecommerce-db";

export default Bot.createCommand({
    structure: {
        name: "daily",
        aliases: ["claim", "reward"],
    },
    options: {
        cooldown: 1000,
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        try {
            // Xử lý daily claim sử dụng database
            const result = await ecommerceDB.processDailyClaim(userId, guildId);

            if (!result.success) {
                // Lấy thông tin user để hiển thị
                const user = await ecommerceDB.getUser(userId, guildId);
                const lastClaim = await ecommerceDB.getLastDailyClaim(userId, guildId);

                let cooldownText = "Hãy quay lại vào ngày mai!";
                if (lastClaim) {
                    const timeDiff = Date.now() - lastClaim.getTime();
                    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    cooldownText = `Còn ${23 - hoursDiff}h ${59 - minutesDiff}m`;
                }

                const embed = new EmbedBuilder()
                    .setTitle("⏰ Đã Nhận Thưởng Hôm Nay")
                    .setDescription(
                        "Bạn đã nhận thưởng hàng ngày hôm nay rồi!\n\n" +
                            `**Thời gian còn lại:** ${cooldownText}\n` +
                            `**Chuỗi hiện tại:** ${user.dailyStreak} ngày\n` +
                            `**Số dư hiện tại:** ${user.balance} AniCoin`,
                    )
                    .setColor("#ff6b6b")
                    .setFooter({
                        text: "Hãy quay lại vào ngày mai để nhận thưởng tiếp theo!",
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Lấy thông tin user sau khi claim
            const user = await ecommerceDB.getUser(userId, guildId);
            const settings = await ecommerceDB.getSettings();

            // Tính toán reward breakdown
            const baseAmount = settings.dailyBaseAmount;
            const streakBonus = Math.min(
                result.newStreak * settings.dailyStreakBonus,
                settings.maxStreakBonus
            );

            const embed = new EmbedBuilder()
                .setTitle("🎉 Đã Nhận Thưởng Hàng Ngày!")
                .setDescription(
                    `**${message.author.username}** đã nhận thưởng hàng ngày!\n\n` +
                        "💰 **Chi Tiết Thưởng:**\n" +
                        `• Thưởng cơ bản: **${baseAmount}** AniCoin\n` +
                        `• Thưởng chuỗi: **${streakBonus}** AniCoin\n` +
                        `• **Tổng cộng:** **${result.amount}** AniCoin\n\n` +
                        `🔥 **Chuỗi mới:** ${result.newStreak} ngày\n` +
                        `💎 **Số dư mới:** ${user.balance} AniCoin`,
                )
                .setColor("#51cf66")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `Chuỗi hàng ngày: ${result.newStreak} ngày | Database Version`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            if (result.newStreak >= 7) {
                embed.setDescription(embed.data.description + "\n\n🔥 **🔥 Chuỗi 7+ Ngày! 🔥** 🔥");
            } else if (result.newStreak >= 3) {
                embed.setDescription(embed.data.description + "\n\n🔥 **Chuỗi 3+ Ngày!** 🔥");
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in daily command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi xử lý thưởng hàng ngày. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
