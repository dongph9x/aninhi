import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { fishCoinDB } from "@/utils/fish-coin";

export default Bot.createCommand({
    structure: {
        name: "fishremove",
        aliases: ["fishsubtract", "fishminus"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        // Kiểm tra quyền admin
        const { FishBattleService } = await import('@/utils/fish-battle');
        const isAdmin = await FishBattleService.isAdministrator(userId, guildId, message.client);
        
        if (!isAdmin) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không Có Quyền")
                .setDescription("Bạn không có quyền sử dụng lệnh này!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }

        if (args.length < 2) {
            const helpEmbed = new EmbedBuilder()
                .setTitle("🐟 Admin Remove FishCoin")
                .setDescription(
                    "**Cú pháp:** `!fishremove @user <số lượng>`\n" +
                    "**Ví dụ:** `!fishremove @username 500`\n" +
                    "**Ví dụ cho chính mình:** `!fishremove @yourself 500`\n\n" +
                    "**Lưu ý:**\n" +
                    "• Chỉ admin mới có quyền sử dụng\n" +
                    "• Có thể thao tác với chính mình\n" +
                    "• Số lượng phải là số nguyên dương\n" +
                    "• Sẽ bớt FishCoin từ tài khoản người dùng"
                )
                .setColor("#ff6b6b")
                .setTimestamp();

            return message.reply({ embeds: [helpEmbed] });
        }

        try {
            // Lấy user được mention
            const mentionedUser = message.mentions.users.first();
            if (!mentionedUser) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Vui lòng mention người dùng!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            const targetUserId = mentionedUser.id;

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

            // Lấy balance hiện tại
            const oldBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);
            
            // Kiểm tra có đủ FishCoin để bớt không
            if (oldBalance < BigInt(amount)) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Không Đủ FishCoin")
                    .setDescription(
                        `**${mentionedUser.username}** chỉ có **${oldBalance.toString()}** FishCoin!\n` +
                        `Không thể bớt **${amount}** FishCoin.`
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            // Bớt FishCoin
            await fishCoinDB.subtractFishCoin(
                targetUserId, 
                guildId, 
                amount, 
                `Admin removed ${amount} FishCoin`
            );

            const newBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Admin Removed FishCoin")
                .setDescription(
                    `**Admin:** ${message.author.username}\n` +
                    `**Người dùng:** ${mentionedUser.username}\n` +
                    `**Thao tác:** Bớt **${amount.toLocaleString()}** FishCoin\n\n` +
                    `**Số dư thay đổi:**\n` +
                    `🐟 **Trước:** ${oldBalance.toLocaleString()} FishCoin\n` +
                    `🐟 **Sau:** ${newBalance.toLocaleString()} FishCoin\n` +
                    `📊 **Thay đổi:** -${amount.toLocaleString()} FishCoin`
                )
                .setColor("#ff6b6b")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `Admin FishCoin Removal | ${new Date().toLocaleDateString('vi-VN')}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            return message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Error in fishremove command:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi bớt FishCoin!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }
    },
}); 