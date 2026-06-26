import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { fishCoinDB } from "@/utils/fish-coin";

export default Bot.createCommand({
    structure: {
        name: "fishtransfer",
        aliases: ["fishgive", "fishsend", "ft"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        if (args.length < 2) {
            const helpEmbed = new EmbedBuilder()
                .setTitle("🐟 Hướng Dẫn Chuyển FishCoin")
                .setDescription(
                    "**Cú pháp:** `!fishtransfer @user <số lượng>`\n" +
                    "**Ví dụ:** `!fishtransfer @username 1000`\n\n" +
                    "**Lưu ý:**\n" +
                    "• Số lượng phải là số nguyên dương\n" +
                    "• Bạn phải có đủ FishCoin để chuyển\n" +
                    "• Không thể chuyển cho chính mình"
                )
                .setColor("#00CED1")
                .setTimestamp();

            return message.reply({ embeds: [helpEmbed] });
        }

        try {
            // Lấy user được mention
            const mentionedUser = message.mentions.users.first();
            if (!mentionedUser) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Vui lòng mention người nhận FishCoin!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            const targetUserId = mentionedUser.id;

            // Kiểm tra không chuyển cho chính mình
            if (targetUserId === userId) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Bạn không thể chuyển FishCoin cho chính mình!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            // Lấy số lượng FishCoin
            const amount = parseInt(args[1]);
            if (isNaN(amount) || amount <= 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Số lượng FishCoin phải là số nguyên dương!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            // Thực hiện chuyển FishCoin
            const result = await fishCoinDB.transferFishCoin(
                userId,
                targetUserId,
                guildId,
                amount,
                `Transfer to ${mentionedUser.username}`
            );

            if (result.success) {
                // Lấy thông tin balance mới
                const senderBalance = await fishCoinDB.getFishBalance(userId, guildId);
                const receiverBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);

                const successEmbed = new EmbedBuilder()
                    .setTitle("✅ Chuyển FishCoin Thành Công")
                    .setDescription(
                        `**${message.author.username}** đã chuyển **${amount.toLocaleString()}** FishCoin cho **${mentionedUser.username}**\n\n` +
                        `**Số dư sau chuyển:**\n` +
                        `🐟 **${message.author.username}:** ${senderBalance.toLocaleString()} FishCoin\n` +
                        `🐟 **${mentionedUser.username}:** ${receiverBalance.toLocaleString()} FishCoin`
                    )
                    .setColor("#00FF00")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter({
                        text: `FishCoin Transfer | ${new Date().toLocaleDateString('vi-VN')}`,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                return message.reply({ embeds: [successEmbed] });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi Chuyển FishCoin")
                    .setDescription(result.message || "Có lỗi xảy ra khi chuyển FishCoin!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

        } catch (error) {
            console.error("Error in fishtransfer command:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi chuyển FishCoin!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }
    },
}); 