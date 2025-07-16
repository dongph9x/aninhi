import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ecommerceDB } from "@/utils/ecommerce-db";

// Interface cho target user
interface TargetUser {
    id: string;
}

export default Bot.createCommand({
    structure: {
        name: "give",
        aliases: ["pay", "send", "transfer"],
    },
    run: async ({ message, t, args }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `n.give <người dùng> <số tiền>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.give @user 1000`\n" +
                        "• `n.give 123456789 500`",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            // Lấy target user từ mention hoặc ID
            let targetUser: TargetUser | undefined = message.mentions.users.first() || undefined;
            
            // Nếu không có mention, thử parse từ args[0] như ID
            if (!targetUser && args[0] && args[0].match(/^\d+$/)) {
                targetUser = { id: args[0] };
            }

            // Nếu có nhiều mention, lấy mention đầu tiên
            if (message.mentions.users.size > 1) {
                console.log("Multiple mentions detected, using first one");
            }

            // Debug logging
            console.log("Give command debug:");
            console.log("- User ID:", userId);
            console.log("- Target user:", targetUser);
            console.log("- Mentions:", message.mentions.users.map(u => u.id));
            console.log("- Args:", args);

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const amount = parseInt(args[1]!);
            if (isNaN(amount) || amount <= 0) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Số Tiền Không Hợp Lệ")
                    .setDescription("Vui lòng cung cấp một số dương hợp lệ cho số tiền.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Debug logging for self-transfer check
            console.log("- Self-transfer check:", targetUser.id === userId);
            console.log("- Target ID:", targetUser.id);
            console.log("- User ID:", userId);

            // Kiểm tra xem có phải chuyển cho chính mình không
            if (targetUser.id === userId) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Chuyển Cho Chính Mình")
                    .setDescription(
                        "Bạn không thể chuyển tiền cho chính mình!\n\n" +
                        "**Cách sử dụng đúng:**\n" +
                        "• `n.give @user_other 1000` - Chuyển cho user khác\n" +
                        "• `n.give 123456789012345678 1000` - Chuyển bằng ID\n\n" +
                        "**Lưu ý:** Đảm bảo bạn mention hoặc nhập ID của user khác, không phải chính mình.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Kiểm tra số dư hiện tại
            const currentUser = await ecommerceDB.getUser(userId, guildId);
            if (currentUser.balance < amount) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Số Dư Không Đủ")
                    .setDescription(
                        "Bạn không có đủ AniCoin!\n\n" +
                            `**Số dư hiện tại:** ${currentUser.balance.toLocaleString()} AniCoin\n` +
                            `**Số tiền muốn chuyển:** ${amount.toLocaleString()} AniCoin\n` +
                            `**Thiếu:** ${(amount - currentUser.balance).toLocaleString()} AniCoin`,
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Thực hiện transfer sử dụng database
            const result = await ecommerceDB.transferMoney(userId, targetUser.id, guildId, amount);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Chuyển Tiền Thất Bại")
                    .setDescription(result.message)
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Lấy thông tin user sau khi transfer
            const sender = await ecommerceDB.getUser(userId, guildId);
            const receiver = await ecommerceDB.getUser(targetUser.id, guildId);

            const embed = new EmbedBuilder()
                .setTitle("✅ Chuyển Tiền Thành Công")
                .setDescription(
                    `**${message.author.username}** đã chuyển **${amount.toLocaleString()}** AniCoin cho **<@${targetUser.id}>**\n\n` +
                        "💰 **Số Dư Mới:**\n" +
                        `• **${message.author.username}:** ${sender.balance.toLocaleString()} AniCoin\n` +
                        `• **<@${targetUser.id}>:** ${receiver.balance.toLocaleString()} AniCoin`,
                )
                .setColor("#51cf66")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({
                    text: "Chuyển tiền hoàn tất | Database Version",
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in give command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Chuyển Tiền Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi trong quá trình chuyển tiền. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
