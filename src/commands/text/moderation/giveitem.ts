import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { InventoryService } from "@/utils/inventory";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "giveitem",
        aliases: ["additem", "item"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        // Kiểm tra arguments
        if (args.length < 3) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!giveitem <người dùng> <item_id> <số lượng> [durability]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!giveitem @user sword_001 1`\n" +
                        "• `p!giveitem @user health_potion 5`\n" +
                        "• `p!giveitem @user armor_001 1 100`\n\n" +
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

            // Parse item data
            const itemId = args[1]!;
            const quantity = parseInt(args[2]!);
            const durability = args[3] ? parseInt(args[3]) : undefined;

            if (isNaN(quantity) || quantity <= 0) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Số Lượng Không Hợp Lệ")
                    .setDescription("Vui lòng cung cấp một số dương hợp lệ cho số lượng.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Lấy item template
            const itemTemplate = await InventoryService.getItemTemplate(itemId);
            if (!itemTemplate) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Item Không Tồn Tại")
                    .setDescription(`Item với ID "${itemId}" không tồn tại trong database.`)
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Tạo item data
            const itemData = {
                itemId: itemTemplate.itemId,
                itemName: itemTemplate.itemName,
                itemType: itemTemplate.itemType,
                itemRarity: itemTemplate.itemRarity,
                durability: durability,
                maxDurability: itemTemplate.maxDurability
            };

            // Thêm item vào inventory
            const addedItem = await InventoryService.addItem(
                targetUser.id,
                guildId,
                itemData,
                quantity
            );

            // Ghi lại moderation log
            await ModerationService.logAction({
                guildId,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                action: "add_item",
                reason: `Admin give item: ${itemTemplate.itemName}`,
                amount: quantity,
                channelId: message.channelId,
                messageId: message.id
            });

            const embed = new EmbedBuilder()
                .setTitle("✅ Đã Thêm Item")
                .setDescription(
                    `**${message.author.username}** đã thêm **${quantity}x ${itemTemplate.itemName}** cho **<@${targetUser.id}>**\n\n` +
                        `📦 **Item:** ${itemTemplate.itemName}\n` +
                        `🏷️ **ID:** ${itemTemplate.itemId}\n` +
                        `📊 **Loại:** ${itemTemplate.itemType}\n` +
                        `⭐ **Độ hiếm:** ${itemTemplate.itemRarity}` +
                        (durability ? `\n🔧 **Độ bền:** ${durability}/${itemTemplate.maxDurability || 'N/A'}` : "")
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
            console.error("Error in giveitem command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Thêm Item Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi thêm item. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 