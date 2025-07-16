import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { InventoryService } from "@/utils/inventory";

export default Bot.createCommand({
    structure: {
        name: "inventory",
        aliases: ["inv", "bag", "items"],
    },
    options: {
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;
        const userId = message.author.id;

        try {
            // Parse target user (optional)
            const targetUser = message.mentions.users.first() || { id: userId };
            const isOwnInventory = targetUser.id === userId;

            // Lấy inventory
            const inventory = await InventoryService.getInventory(targetUser.id, guildId);
            const items = inventory.items;

            if (items.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🎒 Túi Đồ Trống")
                    .setDescription(
                        isOwnInventory 
                            ? "Túi đồ của bạn đang trống.\nHãy tham gia các hoạt động để nhận items!"
                            : `Túi đồ của <@${targetUser.id}> đang trống.`
                    )
                    .setColor("#ffa500")
                    .setFooter({
                        text: `Sức chứa: ${inventory.capacity} slots`,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Tạo danh sách items
            const itemsList = items.map((item: any, index: number) => {
                const rarityEmojiMap: Record<string, string> = {
                    common: "⚪",
                    rare: "🔵",
                    epic: "🟣",
                    legendary: "🟡",
                    mythic: "🔴"
                };

                const typeEmojiMap: Record<string, string> = {
                    weapon: "⚔️",
                    armor: "🛡️",
                    consumable: "🧪",
                    material: "📦",
                    special: "✨"
                };

                const rarityEmoji = rarityEmojiMap[item.itemRarity] || "⚪";
                const typeEmoji = typeEmojiMap[item.itemType] || "📦";

                const equippedText = item.isEquipped ? ` **[${item.equippedSlot}]**` : "";
                const durabilityText = item.durability && item.maxDurability 
                    ? ` (${item.durability}/${item.maxDurability})` 
                    : "";
                const quantityText = item.quantity > 1 ? ` x${item.quantity}` : "";

                return `${index + 1}. ${rarityEmoji}${typeEmoji} **${item.itemName}**${equippedText}${durabilityText}${quantityText}`;
            }).join("\n");

            // Tạo embed
            const username = 'username' in targetUser ? targetUser.username : targetUser.id;
            const embed = new EmbedBuilder()
                .setTitle(`🎒 Túi Đồ - ${username}`)
                .setDescription(itemsList)
                .setColor("#51cf66")
                .addFields({
                    name: "📊 Thông Tin",
                    value: `**Sức chứa:** ${inventory.capacity} slots\n**Đã sử dụng:** ${items.length} slots\n**Còn trống:** ${inventory.capacity - items.length} slots`,
                    inline: true
                })
                .setFooter({
                    text: `${items.length} items`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Thêm thumbnail nếu có items
            if (items.length > 0) {
                const firstItem = items[0];
                const rarityColorMap: Record<string, string> = {
                    common: "#ffffff",
                    rare: "#4dabf7",
                    epic: "#be4bdb",
                    legendary: "#ffd43b",
                    mythic: "#fa5252"
                };

                const rarityColor = rarityColorMap[firstItem.itemRarity] || "#ffffff";
                embed.setColor(rarityColor as any);
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in inventory command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Khi Lấy Túi Đồ")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy túi đồ. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 