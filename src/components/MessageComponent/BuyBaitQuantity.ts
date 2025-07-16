import { 
    EmbedBuilder, 
    ComponentType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService, BAITS } from "@/utils/fishing";

export default Bot.createMessageComponent<ComponentType.StringSelect, { baitType: string, userId: string, guildId: string }>({
    type: ComponentType.StringSelect,
    run: async ({ interaction, data }) => {
        try {
            const quantity = parseInt(interaction.values[0]);
            const { baitType, userId, guildId } = data;

            // Mua mồi với số lượng đã chọn
            const result = await FishingService.buyBait(userId, guildId, baitType, quantity);

            const baitInfo = BAITS[baitType as keyof typeof BAITS];
            
            const successEmbed = new EmbedBuilder()
                .setTitle("🪱 Mua Mồi Thành Công!")
                .setDescription(
                    `**${interaction.user.username}** đã mua:\n\n` +
                    `${baitInfo.emoji} **${baitInfo.name}** x${quantity}\n` +
                    `💰 **Giá mỗi cái:** ${baitInfo.price} AniCoin\n` +
                    `💵 **Tổng giá:** ${result.totalCost} AniCoin\n` +
                    `✨ **Bonus hiếm:** +${baitInfo.rarityBonus}%\n` +
                    `📝 **Mô tả:** ${baitInfo.description}\n\n` +
                    `✅ **Đã tự động đặt làm mồi hiện tại!**`
                )
                .setColor("#00ff00")
                .setTimestamp();

            const backRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "shop" } }))
                        .setLabel("🏠 Về Cửa Hàng")
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ 
                embeds: [successEmbed], 
                components: [backRow],
                ephemeral: true 
            });

        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi khi mua mồi!")
                .setColor("#ff0000")
                .setTimestamp();

            const backRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "buy_bait" } }))
                        .setLabel("⬅️ Thử Lại")
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ 
                embeds: [errorEmbed], 
                components: [backRow],
                ephemeral: true 
            });
        }
    },
}); 