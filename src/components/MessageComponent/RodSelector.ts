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
import { FishingService } from "@/utils/fishing";
import { FISHING_RODS } from "@/config/fish-data";

export default Bot.createMessageComponent<ComponentType.Button, {}>({
    type: ComponentType.Button,
    run: async ({ interaction }) => {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;
            
            const fishingData = await FishingService.getFishingData(userId, guildId);
            
            if (fishingData.rods.length === 0) {
                await interaction.reply({ 
                    content: "❌ Bạn chưa có cần câu nào! Hãy mua cần câu trước.", 
                    ephemeral: true 
                });
                return;
            }

            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(JSON.stringify({ n: "ManageEquipment", d: { action: "set_rod" } }))
                        .setPlaceholder("Chọn cần câu để đặt...")
                        .addOptions(
                            fishingData.rods.map((rod: any) => {
                                const rodInfo = FISHING_RODS[rod.rodType as keyof typeof FISHING_RODS];
                                return new StringSelectMenuOptionBuilder()
                                    .setLabel(`${rodInfo?.name || rod.rodType} (${rod.durability}/${rodInfo?.durability || 0})`)
                                    .setDescription(`Độ bền: ${rod.durability}, Bonus: +${rodInfo?.rarityBonus || 0}%`)
                                    .setValue(rod.rodType)
                                    .setEmoji(rodInfo?.emoji || "🎣");
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
                content: "🎣 Chọn cần câu để đặt làm cần câu hiện tại:",
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