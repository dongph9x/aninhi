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
import { FISHING_RODS, BAITS } from "@/config/fish-data";

export default Bot.createMessageComponent<ComponentType.StringSelect, { action: string }>({
    type: ComponentType.StringSelect,
    run: async ({ interaction, data }) => {
        try {
            const action = data.action;
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            switch (action) {
                case "set_rod":
                    await setCurrentRod(interaction, userId, guildId);
                    break;
                case "set_bait":
                    await setCurrentBait(interaction, userId, guildId);
                    break;
                default:
                    await interaction.reply({ 
                        content: "❌ Hành động không hợp lệ!", 
                        ephemeral: true 
                    });
            }
        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
});

async function setCurrentRod(interaction: any, userId: string, guildId: string) {
    const rodType = interaction.values[0];
    
    // Đặt cần câu hiện tại
    await FishingService.setCurrentRod(userId, guildId, rodType);
    
    const rodInfo = FISHING_RODS[rodType as keyof typeof FISHING_RODS];
    
    const successEmbed = new EmbedBuilder()
        .setTitle("🎣 Đã Đặt Cần Câu!")
        .setDescription(
            `**${interaction.user.username}** đã đặt:\n\n` +
            `${rodInfo.emoji} **${rodInfo.name}** làm cần câu hiện tại\n` +
            `🛡️ **Độ bền:** ${rodInfo.durability} lần\n` +
            `✨ **Bonus hiếm:** +${rodInfo.rarityBonus}%\n` +
            `📝 **Mô tả:** ${rodInfo.description}`
        )
        .setColor("#00ff00")
        .setTimestamp();

    await interaction.reply({ 
        embeds: [successEmbed], 
        ephemeral: true 
    });
}

async function setCurrentBait(interaction: any, userId: string, guildId: string) {
    const baitType = interaction.values[0];
    
    // Đặt mồi hiện tại
    await FishingService.setCurrentBait(userId, guildId, baitType);
    
    const baitInfo = BAITS[baitType as keyof typeof BAITS];
    
    const successEmbed = new EmbedBuilder()
        .setTitle("🪱 Đã Đặt Mồi!")
        .setDescription(
            `**${interaction.user.username}** đã đặt:\n\n` +
            `${baitInfo.emoji} **${baitInfo.name}** làm mồi hiện tại\n` +
            `✨ **Bonus hiếm:** +${baitInfo.rarityBonus}%\n` +
            `📝 **Mô tả:** ${baitInfo.description}`
        )
        .setColor("#00ff00")
        .setTimestamp();

    await interaction.reply({ 
        embeds: [successEmbed], 
        ephemeral: true 
    });
}

 