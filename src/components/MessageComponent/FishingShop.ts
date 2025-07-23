import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ComponentType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService, FISHING_RODS, BAITS } from "@/utils/fishing";

export default Bot.createMessageComponent<ComponentType.Button, { action: string }>({
    type: ComponentType.Button,
    run: async ({ interaction, data }) => {
        try {
            const action = data.action;
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            switch (action) {
                case "shop":
                    await showShop(interaction);
                    break;
                case "buy_rod":
                    await showRodShop(interaction);
                    break;
                case "buy_bait":
                    await showBaitShop(interaction);
                    break;
                case "buy_food":
                    await showFoodShop(interaction);
                    break;
                case "manage":
                    await showManageEquipment(interaction, userId, guildId);
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

async function showShop(interaction: any) {
    const embed = new EmbedBuilder()
        .setTitle("🎣 Cửa Hàng Câu Cá")
        .setDescription("Chào mừng đến với cửa hàng câu cá! Chọn hành động bạn muốn thực hiện:")
        .setColor("#0099ff")
        .addFields(
            { name: "🛒 Mua Cần Câu", value: "Mua các loại cần câu với độ bền và bonus khác nhau", inline: true },
            { name: "🪱 Mua Mồi", value: "Mua các loại mồi để tăng tỷ lệ câu được cá hiếm", inline: true },
            { name: "🍽️ Mua Thức Ăn", value: "Mua thức ăn để cho cá ăn và tăng level", inline: true },
            { name: "⚙️ Quản Lý", value: "Xem và thay đổi cần câu, mồi hiện tại", inline: true }
        )
        .setTimestamp();

    const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "buy_rod" } }))
                .setLabel("🛒 Mua Cần Câu")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "buy_bait" } }))
                .setLabel("🪱 Mua Mồi")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "buy_food" } }))
                .setLabel("🍽️ Mua Thức Ăn")
                .setStyle(ButtonStyle.Primary)
        );

    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "manage" } }))
                .setLabel("⚙️ Quản Lý")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row1, row2],
        ephemeral: true 
    });
}

async function showRodShop(interaction: any) {
    const embed = new EmbedBuilder()
        .setTitle("🛒 Cửa Hàng Cần Câu")
        .setDescription("Chọn loại cần câu bạn muốn mua:")
        .setColor("#00ff00")
        .setTimestamp();

    // Rút gọn thông tin từng loại cần câu
    Object.entries(FISHING_RODS).forEach(([key, rod]) => {
        embed.addFields({
            name: `${rod.emoji} ${rod.name}`,
            value: `Giá: ${rod.price}🐟 | Độ bền: ${rod.durability} | Bonus: +${rod.rarityBonus}%`,
            inline: true
        });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(JSON.stringify({ n: "BuyRod", d: {} }))
                .setPlaceholder("Chọn loại cần câu...")
                .addOptions(
                    Object.entries(FISHING_RODS).map(([key, rod]) => 
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${rod.name} - ${rod.price}🐟`)
                            .setDescription(`Độ bền: ${rod.durability} | Bonus: +${rod.rarityBonus}%`)
                            .setValue(key)
                            .setEmoji(rod.emoji)
                    )
                )
        );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "shop" } }))
                .setLabel("⬅️ Quay Lại")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row, backRow],
        ephemeral: true 
    });
}

async function showBaitShop(interaction: any) {
    const embed = new EmbedBuilder()
        .setTitle("🪱 Cửa Hàng Mồi")
        .setDescription("Chọn loại mồi bạn muốn mua:")
        .setColor("#ff9900")
        .setTimestamp();

    // Rút gọn thông tin từng loại mồi
    Object.entries(BAITS).forEach(([key, bait]) => {
                    embed.addFields({
                name: `${bait.emoji} ${bait.name}`,
                value: `Giá: ${bait.price}🐟 | Bonus: +${bait.rarityBonus}%`,
                inline: true
            });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(JSON.stringify({ n: "BuyBait", d: {} }))
                .setPlaceholder("Chọn loại mồi...")
                .addOptions(
                    Object.entries(BAITS).map(([key, bait]) => 
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${bait.name} - ${bait.price}🐟`)
                            .setDescription(`Bonus: +${bait.rarityBonus}%`)
                            .setValue(key)
                            .setEmoji(bait.emoji)
                    )
                )
        );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "shop" } }))
                .setLabel("⬅️ Quay Lại")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row, backRow],
        ephemeral: true 
    });
}

async function showFoodShop(interaction: any) {
    const { FISH_FOOD_TYPES } = await import('@/utils/fish-food');
    
    const embed = new EmbedBuilder()
        .setTitle("🍽️ Cửa Hàng Thức Ăn")
        .setDescription("Chọn loại thức ăn bạn muốn mua:")
        .setColor("#00ff99")
        .setTimestamp();

    // Hiển thị thông tin từng loại thức ăn
    Object.entries(FISH_FOOD_TYPES).forEach(([key, food]) => {
        embed.addFields({
            name: `${food.emoji} ${food.name}`,
            value: `Giá: ${food.price.toLocaleString()}🐟 | Exp: +${food.expBonus} | ${food.description}`,
            inline: false
        });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(JSON.stringify({ n: "BuyFishFood", d: {} }))
                .setPlaceholder("Chọn loại thức ăn...")
                .addOptions(
                    Object.entries(FISH_FOOD_TYPES).map(([key, food]) => 
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${food.name} - ${food.price.toLocaleString()}🐟`)
                            .setDescription(`Exp: +${food.expBonus} | ${food.description}`)
                            .setValue(key)
                            .setEmoji(food.emoji)
                    )
                )
        );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "shop" } }))
                .setLabel("⬅️ Quay Lại")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row, backRow],
        ephemeral: true 
    });
}

async function showManageEquipment(interaction: any, userId: string, guildId: string) {
    const fishingData = await FishingService.getFishingData(userId, guildId);
    
    const embed = new EmbedBuilder()
        .setTitle("⚙️ Quản Lý Trang Bị")
        .setDescription("Thông tin trang bị hiện tại của bạn:")
        .setColor("#9932cc")
        .setTimestamp();

    // Thông tin cần câu hiện tại
    const currentRod = fishingData.rods.find((r: any) => r.rodType === fishingData.currentRod);
    if (currentRod) {
        const rodInfo = FISHING_RODS[currentRod.rodType as keyof typeof FISHING_RODS];
        embed.addFields({
            name: "🎣 Cần Câu Hiện Tại",
            value: `${currentRod.rodType} (Độ bền: ${currentRod.durability}/${rodInfo?.durability || 0})`,
            inline: false
        });
    } else {
        embed.addFields({
            name: "🎣 Cần Câu Hiện Tại",
            value: "❌ Không có cần câu nào được chọn",
            inline: false
        });
    }

    // Thông tin mồi hiện tại
    const currentBait = fishingData.baits.find((b: any) => b.baitType === fishingData.currentBait);
    if (currentBait) {
        embed.addFields({
            name: "🪱 Mồi Hiện Tại",
            value: `${currentBait.baitType} (Số lượng: ${currentBait.quantity})`,
            inline: false
        });
    } else {
        embed.addFields({
            name: "🪱 Mồi Hiện Tại",
            value: "❌ Không có mồi nào được chọn",
            inline: false
        });
    }

    // Danh sách cần câu sở hữu
    if (fishingData.rods.length > 0) {
        const rodList = fishingData.rods.map((r: any) => {
            const rodInfo = FISHING_RODS[r.rodType as keyof typeof FISHING_RODS];
            return `${r.rodType} (${r.durability}/${rodInfo?.durability || 0})`;
        }).join("\n");
        embed.addFields({
            name: "📦 Cần Câu Sở Hữu",
            value: rodList,
            inline: true
        });
    }

    // Danh sách mồi sở hữu
    if (fishingData.baits.length > 0) {
        const baitList = fishingData.baits.map((b: any) => 
            `${b.baitType} (${b.quantity})`
        ).join("\n");
        embed.addFields({
            name: "📦 Mồi Sở Hữu",
            value: baitList,
            inline: true
        });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "RodSelector", d: {} }))
                .setLabel("🎣 Đổi Cần Câu")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "BaitSelector", d: {} }))
                .setLabel("🪱 Đổi Mồi")
                .setStyle(ButtonStyle.Primary)
        );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ n: "FishingShop", d: { action: "shop" } }))
                .setLabel("⬅️ Quay Lại")
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ 
        embeds: [embed], 
        components: [row, backRow],
        ephemeral: true 
    });
} 