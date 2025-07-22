import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { fishCoinDB } from "@/utils/fish-coin";

export default Bot.createCommand({
    structure: {
        name: "fishgive",
        aliases: ["fishadd", "fishremove", "fishset"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        // Kiểm tra quyền admin
        const { FishBattleService } = await import('@/utils/fish-battle');
        const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
        
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
                                .setTitle("🐟 Admin FishCoin Commands")
                                .setDescription(
                                    "**Cú pháp:** `!fishgive @user <số lượng>`\n" +
                                    "**Ví dụ:** `!fishgive @username 1000`\n" +
                                    "**Ví dụ cho chính mình:** `!fishgive @yourself 1000`\n\n" +
                                    "**Các lệnh khác:**\n" +
                                    "• `!fishadd @user <số lượng>` - Thêm FishCoin\n" +
                                    "• `!fishremove @user <số lượng>` - Bớt FishCoin\n" +
                                    "• `!fishset @user <số lượng>` - Set FishCoin (sẽ tạo migration riêng)\n\n" +
                                    "**Lưu ý:**\n" +
                                    "• Chỉ admin mới có quyền sử dụng\n" +
                                    "• Có thể thao tác với chính mình\n" +
                                    "• Số lượng có thể âm để bớt FishCoin"
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
                    .setDescription("Vui lòng mention người dùng!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            const targetUserId = mentionedUser.id;

            // Lấy số lượng FishCoin
            const amount = parseInt(args[1]);
            if (isNaN(amount)) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Số lượng FishCoin phải là số!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            }

            // Xác định loại thao tác
            const command = message.content.toLowerCase();
            let operation = "add";
            let description = "";

            if (command.includes("remove") || command.includes("subtract")) {
                operation = "subtract";
                description = `Admin removed ${Math.abs(amount)} FishCoin`;
            } else if (command.includes("set")) {
                operation = "set";
                description = `Admin set FishCoin to ${amount}`;
            } else {
                description = `Admin added ${amount} FishCoin`;
            }

            let result;
            let oldBalance = 0n;
            let newBalance = 0n;

            if (operation === "set") {
                // Set balance (sẽ implement sau)
                const errorEmbed = new EmbedBuilder()
                    .setTitle("⚠️ Tính Năng Chưa Hoàn Thiện")
                    .setDescription("Lệnh set FishCoin sẽ được implement trong migration tiếp theo!")
                    .setColor("#ffa500")
                    .setTimestamp();

                return message.reply({ embeds: [errorEmbed] });
            } else if (operation === "subtract") {
                // Bớt FishCoin
                oldBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);
                await fishCoinDB.subtractFishCoin(targetUserId, guildId, Math.abs(amount), description);
                newBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);
            } else {
                // Thêm FishCoin
                oldBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);
                await fishCoinDB.addFishCoin(targetUserId, guildId, amount, description);
                newBalance = await fishCoinDB.getFishBalance(targetUserId, guildId);
            }

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Admin FishCoin Operation")
                .setDescription(
                    `**Admin:** ${message.author.username}\n` +
                    `**Người dùng:** ${mentionedUser.username}\n` +
                    `**Thao tác:** ${operation === "subtract" ? "Bớt" : "Thêm"} **${Math.abs(amount).toLocaleString()}** FishCoin\n\n` +
                    `**Số dư thay đổi:**\n` +
                    `🐟 **Trước:** ${oldBalance.toLocaleString()} FishCoin\n` +
                    `🐟 **Sau:** ${newBalance.toLocaleString()} FishCoin\n` +
                    `📊 **Thay đổi:** ${operation === "subtract" ? "-" : "+"}${Math.abs(amount).toLocaleString()} FishCoin`
                )
                .setColor("#00FF00")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: `Admin FishCoin Operation | ${new Date().toLocaleDateString('vi-VN')}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            return message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Error in fishgive command:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi thực hiện thao tác FishCoin!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }
    },
}); 