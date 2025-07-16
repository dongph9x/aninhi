import { 
    EmbedBuilder, 
    ComponentType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService, BAITS } from "@/utils/fishing";

export default Bot.createMessageComponent<ComponentType.StringSelect, {}>({
    type: ComponentType.StringSelect,
    run: async ({ interaction }) => {
        try {
            const selectedValue = interaction.values[0];
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Parse bait type and quantity from selected value
            const [baitType, quantityStr] = selectedValue.split(':');
            const quantity = parseInt(quantityStr) || 1;

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

            await interaction.reply({ 
                embeds: [successEmbed], 
                ephemeral: true 
            });

        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi khi mua mồi!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
}); 