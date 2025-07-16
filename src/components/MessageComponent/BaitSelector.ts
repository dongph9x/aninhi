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

export default Bot.createMessageComponent<ComponentType.Button, {}>({
    type: ComponentType.Button,
    run: async ({ interaction }) => {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;
            
            const fishingData = await FishingService.getFishingData(userId, guildId);
            
            if (fishingData.baits.length === 0) {
                await interaction.reply({ 
                    content: "❌ Bạn chưa có mồi nào! Hãy mua mồi trước.", 
                    ephemeral: true 
                });
                return;
            }

            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(JSON.stringify({ n: "ManageEquipment", d: { action: "set_bait" } }))
                        .setPlaceholder("Chọn mồi để đặt...")
                        .addOptions(
                            fishingData.baits.map((bait: any) => {
                                const baitInfo = BAITS[bait.baitType as keyof typeof BAITS];
                                return new StringSelectMenuOptionBuilder()
                                    .setLabel(`${baitInfo?.name || bait.baitType} (${bait.quantity})`)
                                    .setDescription(`Số lượng: ${bait.quantity}, Bonus: +${baitInfo?.rarityBonus || 0}%`)
                                    .setValue(bait.baitType)
                                    .setEmoji(baitInfo?.emoji || "🪱");
                            })
                        )
                );

            const backRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "manage" } }))
                        .setLabel("⬅️ Quay Lại")
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ 
                content: "🪱 Chọn mồi để đặt làm mồi hiện tại:",
                components: [row, backRow],
                ephemeral: true 
            });

        } catch (error: any) {
            await interaction.reply({ 
                content: `❌ Lỗi: ${error.message}`, 
                ephemeral: true 
            });
        }
    },
}); 