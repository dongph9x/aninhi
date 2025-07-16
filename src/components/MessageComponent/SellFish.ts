import { ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService } from "@/utils/fishing";

export default Bot.createMessageComponent<ComponentType.Button, { fishId: string; fishName: string }>({
    type: ComponentType.Button,
    run: async ({ interaction, data }) => {
        try {
            const fishId = data.fishId;
            const fishName = data.fishName;
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Kiểm tra xem người dùng có cá này không
            const fishingData = await FishingService.getFishingData(userId, guildId);
            const caughtFish = fishingData.fish.find((f: any) => f.id === fishId);

            if (!caughtFish) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Bạn không có cá này hoặc đã bán hết!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return await interaction.reply({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            }

            // Bán toàn bộ số lượng cá
            const result = await FishingService.sellFish(userId, guildId, fishName, caughtFish.quantity);

            const successEmbed = new EmbedBuilder()
                .setTitle("💰 Bán Thành Công!")
                .setDescription(
                    `**${interaction.user.username}** đã bán:\n\n` +
                    `🐟 **${result.fishName}** x${result.quantity}\n` +
                    `💰 **Giá hiện tại:** ${result.currentPrice} AniCoin\n` +
                    `💵 **Tổng giá:** ${result.totalValue} AniCoin`
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
                .setDescription(error.message || "Đã xảy ra lỗi khi bán cá!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
}); 