import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { EcommerceService } from "@/utils/ecommerce-db";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "subtract",
        aliases: ["sub", "takemoney", "remove"],
    },
    options: {
        permissions: ["Administrator"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        // Kiểm tra arguments
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `n.subtract <người dùng> <số tiền>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `n.subtract @user 1000`\n" +
                        "• `n.subtract 123456789 500`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Administrator.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null);

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

            // Parse amount
            const amount = parseInt(args[1]!);
            if (isNaN(amount) || amount <= 0) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Số Tiền Không Hợp Lệ")
                    .setDescription("Vui lòng cung cấp một số dương hợp lệ cho số tiền.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Kiểm tra số dư hiện tại của target user
            const currentUser = await EcommerceService.getUser(targetUser.id, guildId);
            if (currentUser.balance < amount) {
                const embed = new EmbedBuilder()
                    .setTitle("⚠️ Số Dư Không Đủ")
                    .setDescription(
                        `**<@${targetUser.id}>** không có đủ AniCoin!\n\n` +
                        `**Số dư hiện tại:** ${currentUser.balance.toLocaleString()} AniCoin\n` +
                        `**Số tiền muốn trừ:** ${amount.toLocaleString()} AniCoin\n` +
                        `**Thiếu:** ${(amount - currentUser.balance).toLocaleString()} AniCoin\n\n` +
                        "Bạn có muốn trừ toàn bộ số dư hiện tại không?"
                    )
                    .setColor("#ff9900")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Thực hiện trừ tiền
            const user = await EcommerceService.subtractMoney(
                targetUser.id,
                guildId,
                amount,
                `Admin subtract by ${message.author.username}`,
            );

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "subtract_money",
                reason: `Admin subtract by ${message.author.username}`,
                amount: amount,
                channelId: message.channelId,
                messageId: message.id
            });

            const embed = new EmbedBuilder()
                .setTitle("✅ Đã Trừ Tiền")
                .setDescription(
                    `**${message.author.username}** đã trừ **${amount.toLocaleString()}** AniCoin từ **<@${targetUser.id}>**\n\n` +
                        `💰 **Số dư mới:** ${user.balance.toLocaleString()} AniCoin`,
                )
                .setColor("#ff6b6b")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Trừ bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in subtract command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Trừ Tiền Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi trừ tiền. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
