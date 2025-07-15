import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { addMoney } from "@/utils/ecommerce";

export default Bot.createCommand({
    structure: {
        name: "add",
        aliases: ["addmoney", "giveadmin"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        // Kiểm tra arguments
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!add <người dùng> <số tiền>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!add @user 1000`\n" +
                        "• `p!add 123456789 500`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Moderate Members.",
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

            // Thực hiện thêm tiền
            const user = await addMoney(
                targetUser.id,
                guildId,
                amount,
                `Admin add by ${message.author.username}`,
            );

            const embed = new EmbedBuilder()
                .setTitle("✅ Đã Thêm Tiền")
                .setDescription(
                    `**${message.author.username}** đã thêm **${amount.toLocaleString()}** AniCoin cho **<@${targetUser.id}>**\n\n` +
                        `💰 **Số dư mới:** ${user.balance.toLocaleString()} AniCoin`,
                )
                .setColor("#51cf66")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Thêm bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in add command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Thêm Tiền Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi thêm tiền. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
