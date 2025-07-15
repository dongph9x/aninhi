import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { canClaimDaily, claimDaily, getDailyCooldown, getUser } from "@/utils/ecommerce";

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
            const canClaim = await canClaimDaily(userId, guildId);

            if (!canClaim) {
                const cooldown = await getDailyCooldown(userId, guildId);
                const user = await getUser(userId, guildId);

                const embed = new EmbedBuilder()
                    .setTitle("⏰ Đã Nhận Thưởng Hôm Nay")
                    .setDescription(
                        "Bạn đã nhận thưởng hàng ngày hôm nay rồi!\n\n" +
                            `**Thời gian còn lại:** ${cooldown.remainingHours}h ${cooldown.remainingMinutes}m\n` +
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

            // Claim daily reward trước
            const user = await claimDaily(userId, guildId);

            // Tính toán reward breakdown để hiển thị
            const baseAmount = 100;
            const streakBonus = user.dailyStreak > 1 ? Math.floor((user.dailyStreak - 1) * 0.5) : 0;
            const totalAmount = baseAmount + streakBonus;

            const embed = new EmbedBuilder()
                .setTitle("🎉 Đã Nhận Thưởng Hàng Ngày!")
                .setDescription(
                    `**${message.author.username}** đã nhận thưởng hàng ngày!\n\n` +
                        "💰 **Chi Tiết Thưởng:**\n" +
                        `• Thưởng cơ bản: **${baseAmount}** AniCoin\n` +
                        `• Thưởng chuỗi: **${streakBonus}** AniCoin\n` +
                        `• **Tổng cộng:** **${totalAmount}** AniCoin\n\n` +
                        `🔥 **Chuỗi mới:** ${user.dailyStreak} ngày\n` +
                        `💎 **Số dư mới:** ${user.balance} AniCoin`,
                )
                .setColor("#51cf66")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `Chuỗi hàng ngày: ${user.dailyStreak} ngày`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            if (user.dailyStreak >= 7) {
                embed.setDescription(embed.data.description + "\n\n🔥 **🔥 Chuỗi 7+ Ngày! 🔥** 🔥");
            } else if (user.dailyStreak >= 3) {
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
