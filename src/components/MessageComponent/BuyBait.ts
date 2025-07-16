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
            const baitType = interaction.values[0];
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Hiển thị menu chọn số lượng
            await showQuantitySelector(interaction, baitType, userId, guildId);

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

async function showQuantitySelector(interaction: any, baitType: string, userId: string, guildId: string) {
    const baitInfo = BAITS[baitType as keyof typeof BAITS];
    const quantities = [1, 5, 10, 20, 50];
    
    const embed = new EmbedBuilder()
        .setTitle("🪱 Chọn Số Lượng")
        .setDescription(`Bạn đã chọn: ${baitInfo.emoji} **${baitInfo.name}**\nChọn số lượng bạn muốn mua:`)
        .setColor("#ff9900")
        .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(JSON.stringify({ n: "BuyBaitQuantity", d: { baitType, userId, guildId } }))
                .setPlaceholder("Chọn số lượng...")
                .addOptions(
                    quantities.map(qty => 
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${baitInfo.name} x${qty} - ${baitInfo.price * qty} AniCoin`)
                            .setDescription(`${qty} cái - ${baitInfo.price * qty} AniCoin`)
                            .setValue(qty.toString())
                            .setEmoji(baitInfo.emoji)
                    )
                )
        );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "buy_bait" } }))
                .setLabel("⬅️ Quay Lại")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row, backRow],
        ephemeral: true 
    });
} 