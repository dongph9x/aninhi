import { ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService } from "@/utils/fishing";
import { FISH_LIST } from "@/config/fish-data";

export default Bot.createMessageComponent<ComponentType.Button, {}>({
    type: ComponentType.Button,
    run: async ({ interaction }) => {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Lấy dữ liệu fishing
            const fishingData = await FishingService.getFishingData(userId, guildId);

            // Lọc ra chỉ cá thường (không phải legendary)
            const normalFish = fishingData.fish.filter((f: any) => {
                const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
                return fishInfo && fishInfo.rarity !== 'legendary';
            });

            if (normalFish.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Không có cá để bán")
                    .setDescription("Bạn không có cá thường nào để bán!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return await interaction.reply({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            }

            // Tính tổng giá trị trước khi bán
            const totalValueBefore = normalFish.reduce((sum: number, f: any) => {
                return sum + (Number(f.fishValue) * f.quantity);
            }, 0);

            // Bán tất cả cá
            let totalEarnings = 0;
            const soldFish = [];

            for (const fish of normalFish) {
                try {
                    const result = await FishingService.sellFish(userId, guildId, fish.fishName, fish.quantity);
                    totalEarnings += result.totalValue;
                    soldFish.push({
                        name: fish.fishName,
                        quantity: fish.quantity,
                        value: result.totalValue
                    });
                } catch (error) {
                    console.error(`Error selling ${fish.fishName}:`, error);
                }
            }

            if (soldFish.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi bán cá")
                    .setDescription("Không thể bán được cá nào!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return await interaction.reply({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            }

            // Tạo embed thành công
            const successEmbed = new EmbedBuilder()
                .setTitle("💰 Bán Tất Cả Thành Công!")
                .setDescription(
                    `**${interaction.user.username}** đã bán tất cả cá thường:\n\n` +
                    soldFish.map(fish => 
                        `🐟 **${fish.name}** x${fish.quantity} - ${fish.value.toLocaleString()} FishCoin`
                    ).join("\n") +
                    `\n\n💵 **Tổng thu nhập:** ${totalEarnings.toLocaleString()} FishCoin`
                )
                .setColor("#00ff00")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [successEmbed]
            });

        } catch (error: any) {
            console.error("Error in SellAllFish:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi khi bán tất cả cá!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    }
}); 