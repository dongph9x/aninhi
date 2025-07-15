import { EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { addMoney, getBalance, subtractMoney, recordGame } from "@/utils/ecommerce";

// Interface cho cá
interface Fish {
    name: string;
    emoji: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    minValue: number;
    maxValue: number;
    chance: number;
}

// Interface cho cần câu
interface FishingRod {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    durability: number;
    description: string;
}

// Interface cho mồi
interface Bait {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    description: string;
}

// Interface cho cá đã bắt
interface CaughtFish {
    name: string;
    emoji: string;
    rarity: string;
    value: number;
    quantity: number;
}

// Interface cho người chơi
interface Fisher {
    userId: string;
    guildId: string;
    totalFish: number;
    totalEarnings: number;
    biggestFish: { name: string; value: number };
    rarestFish: { name: string; rarity: string };
    fishingTime: number;
    rods: Record<string, number>; // rodId -> durability
    baits: Record<string, number>; // baitId -> quantity
    caughtFish: Record<string, CaughtFish>; // fishName -> fish data
    currentRod: string;
    currentBait: string;
    lastFished: number;
}

// Danh sách cá
const FISH_LIST: Fish[] = [
    // Cá thường (60-70%)
    { name: "Cá rô phi", emoji: "🐟", rarity: "common", minValue: 10, maxValue: 50, chance: 25 },
    { name: "Cá chép", emoji: "🐟", rarity: "common", minValue: 20, maxValue: 80, chance: 20 },
    { name: "Cá trắm", emoji: "🐟", rarity: "common", minValue: 30, maxValue: 100, chance: 15 },
    { name: "Cá mè", emoji: "🐟", rarity: "common", minValue: 15, maxValue: 60, chance: 10 },

    // Cá hiếm (20-25%)
    { name: "Cá lóc", emoji: "🐠", rarity: "rare", minValue: 100, maxValue: 300, chance: 8 },
    { name: "Cá trê", emoji: "🐠", rarity: "rare", minValue: 150, maxValue: 400, chance: 7 },
    { name: "Cá quả", emoji: "🐠", rarity: "rare", minValue: 200, maxValue: 500, chance: 6 },
    { name: "Cá chình", emoji: "🐠", rarity: "rare", minValue: 300, maxValue: 800, chance: 4 },

    // Cá quý hiếm (8-12%)
    { name: "Cá tầm", emoji: "🦈", rarity: "epic", minValue: 500, maxValue: 1500, chance: 3 },
    { name: "Cá hồi", emoji: "🦈", rarity: "epic", minValue: 800, maxValue: 2000, chance: 2.5 },
    { name: "Cá ngừ", emoji: "🦈", rarity: "epic", minValue: 1000, maxValue: 3000, chance: 2 },
    { name: "Cá mập", emoji: "🦈", rarity: "epic", minValue: 2000, maxValue: 5000, chance: 1.5 },

    // Cá huyền thoại (1-3%)
    { name: "Cá voi", emoji: "🐋", rarity: "legendary", minValue: 5000, maxValue: 15000, chance: 0.8 },
    { name: "Cá mực khổng lồ", emoji: "🦑", rarity: "legendary", minValue: 8000, maxValue: 20000, chance: 0.6 },
    { name: "Cá rồng biển", emoji: "🐉", rarity: "legendary", minValue: 15000, maxValue: 50000, chance: 0.4 },
    { name: "Cá thần", emoji: "✨", rarity: "legendary", minValue: 50000, maxValue: 100000, chance: 0.2 },
];

// Danh sách cần câu
const FISHING_RODS: Record<string, FishingRod> = {
    "basic": { name: "Cần câu cơ bản", emoji: "🎣", price: 100, rarityBonus: 0, durability: 10, description: "Cần câu cơ bản, độ bền thấp" },
    "copper": { name: "Cần câu đồng", emoji: "🎣", price: 1000, rarityBonus: 10, durability: 25, description: "Tăng 10% tỷ lệ hiếm, độ bền trung bình" },
    "silver": { name: "Cần câu bạc", emoji: "🎣", price: 5000, rarityBonus: 20, durability: 50, description: "Tăng 20% tỷ lệ hiếm, độ bền cao" },
    "gold": { name: "Cần câu vàng", emoji: "🎣", price: 15000, rarityBonus: 35, durability: 100, description: "Tăng 35% tỷ lệ hiếm, độ bền rất cao" },
    "diamond": { name: "Cần câu kim cương", emoji: "💎", price: 50000, rarityBonus: 50, durability: 200, description: "Tăng 50% tỷ lệ hiếm, độ bền tối đa" },
};

// Danh sách mồi
const BAITS: Record<string, Bait> = {
    "basic": { name: "Mồi cơ bản", emoji: "🪱", price: 10, rarityBonus: 0, description: "Mồi cơ bản, tỷ lệ thường" },
    "good": { name: "Mồi ngon", emoji: "🦐", price: 50, rarityBonus: 15, description: "Tăng 15% tỷ lệ hiếm" },
    "premium": { name: "Mồi thượng hạng", emoji: "🦀", price: 200, rarityBonus: 30, description: "Tăng 30% tỷ lệ hiếm" },
    "divine": { name: "Mồi thần", emoji: "🌟", price: 1000, rarityBonus: 50, description: "Tăng 50% tỷ lệ hiếm" },
};

// Lưu trữ dữ liệu người chơi
const fishers: Record<string, Fisher> = {};

// Hệ thống giá cá động
interface FishPrice {
    name: string;
    basePrice: number;
    currentPrice: number;
    lastUpdate: number;
}

const fishPrices: Record<string, FishPrice> = {};
const PRICE_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 phút
const PRICE_VOLATILITY = 0.1; // Độ biến động giá ±10%

// Cooldown cho câu cá (30 giây)
const FISHING_COOLDOWN = 30000;

// Chi phí mỗi lần câu
const FISHING_COST = 10;

function getFisherKey(userId: string, guildId: string): string {
    return `${userId}_${guildId}`;
}

// Hàm khởi tạo giá cá
function initializeFishPrices() {
    FISH_LIST.forEach(fish => {
        const basePrice = Math.floor((fish.minValue + fish.maxValue) / 2);
        fishPrices[fish.name] = {
            name: fish.name,
            basePrice: basePrice,
            currentPrice: basePrice,
            lastUpdate: Date.now()
        };
    });
}

// Hàm cập nhật giá cá
function updateFishPrices() {
    const now = Date.now();
    FISH_LIST.forEach(fish => {
        if (!fishPrices[fish.name]) {
            initializeFishPrices();
            return;
        }

        const priceData = fishPrices[fish.name];
        if (now - priceData.lastUpdate >= PRICE_UPDATE_INTERVAL) {
            // Tạo biến động giá ngẫu nhiên
            const volatility = (Math.random() - 0.5) * 2 * PRICE_VOLATILITY; // -30% đến +30%
            const newPrice = Math.floor(priceData.basePrice * (1 + volatility));
            
            // Đảm bảo giá không quá thấp hoặc quá cao
            const minPrice = Math.floor(priceData.basePrice * 0.5);
            const maxPrice = Math.floor(priceData.basePrice * 2);
            
            fishPrices[fish.name] = {
                name: fish.name,
                basePrice: priceData.basePrice,
                currentPrice: Math.max(minPrice, Math.min(maxPrice, newPrice)),
                lastUpdate: now
            };
        }
    });
}

// Hàm lấy giá hiện tại của cá
function getCurrentFishPrice(fishName: string): number {
    updateFishPrices();
    return fishPrices[fishName]?.currentPrice || 0;
}

// Hàm lấy thông tin giá cá
function getFishPriceInfo(fishName: string): FishPrice | null {
    updateFishPrices();
    return fishPrices[fishName] || null;
}

function getRarityColor(rarity: string): number {
    switch (rarity) {
        case "common": return 0xffffff;
        case "rare": return 0x0099ff;
        case "epic": return 0x9932cc;
        case "legendary": return 0xffd700;
        default: return 0xffffff;
    }
}

function getRarityText(rarity: string): string {
    switch (rarity) {
        case "common": return "Thường";
        case "rare": return "Hiếm";
        case "epic": return "Quý hiếm";
        case "legendary": return "Huyền thoại";
        default: return "Thường";
    }
}

function getRarityEmoji(rarity: string): string {
    switch (rarity) {
        case "common": return "⚪";
        case "rare": return "🔵";
        case "epic": return "🟣";
        case "legendary": return "🟡";
        default: return "⚪";
    }
}

function getRandomFish(fisher: Fisher): Fish {
    const rod = FISHING_RODS[fisher.currentRod];
    const bait = BAITS[fisher.currentBait];
    const totalBonus = rod.rarityBonus + bait.rarityBonus;

    // Tạo danh sách cá với tỷ lệ đã điều chỉnh
    const adjustedFish = FISH_LIST.map(fish => {
        let adjustedChance = fish.chance;
        
        // Tăng tỷ lệ cho cá hiếm hơn dựa trên bonus
        if (fish.rarity === "rare") {
            adjustedChance += totalBonus * 0.5;
        } else if (fish.rarity === "epic") {
            adjustedChance += totalBonus * 0.3;
        } else if (fish.rarity === "legendary") {
            adjustedChance += totalBonus * 0.1;
        }

        return { ...fish, adjustedChance };
    });

    // Chọn cá ngẫu nhiên dựa trên tỷ lệ
    const totalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    let random = Math.random() * totalChance;

    for (const fish of adjustedFish) {
        random -= fish.adjustedChance;
        if (random <= 0) {
            return fish;
        }
    }

    // Fallback về cá thường
    return FISH_LIST[0];
}

function createFishingEmbed(fisher: Fisher, fish?: Fish, value?: number): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("🎣 Hệ thống Câu Cá")
        .setColor(config.embedColor)
        .setTimestamp();

    if (fish && value !== undefined) {
        // Kết quả câu cá
        const rarityColor = getRarityColor(fish.rarity);
        const rarityText = getRarityText(fish.rarity);
        const rarityEmoji = getRarityEmoji(fish.rarity);

        embed.setColor(rarityColor)
            .setTitle(`${fish.emoji} Bắt được cá!`)
            .setDescription(`Bạn đã bắt được một con **${fish.name}**!`)
            .addFields(
                { name: "🐟 Loại cá", value: `${fish.emoji} ${fish.name}`, inline: true },
                { name: "⭐ Độ hiếm", value: `${rarityEmoji} ${rarityText}`, inline: true },
                { name: "💰 Giá trị", value: `${value.toLocaleString()} AniCoin`, inline: true },
                { name: "🎣 Cần câu", value: `${FISHING_RODS[fisher.currentRod].emoji} ${FISHING_RODS[fisher.currentRod].name}`, inline: true },
                { name: "🪱 Mồi", value: `${BAITS[fisher.currentBait].emoji} ${BAITS[fisher.currentBait].name}`, inline: true },
                { name: "💸 Chi phí", value: `${FISHING_COST} AniCoin`, inline: true }
            );
    } else {
        // Thông tin câu cá
        embed.setDescription("Sử dụng `n.fish` để câu cá!")
            .addFields(
                { name: "🎣 Cần câu hiện tại", value: fisher.currentRod === "none" ? "❌ Chưa có cần câu" : `${FISHING_RODS[fisher.currentRod].emoji} ${FISHING_RODS[fisher.currentRod].name} (${fisher.rods[fisher.currentRod] || 0} độ bền)`, inline: true },
                { name: "🪱 Mồi hiện tại", value: fisher.currentBait === "none" ? "❌ Chưa có mồi" : `${BAITS[fisher.currentBait].emoji} ${BAITS[fisher.currentBait].name} (${fisher.baits[fisher.currentBait] || 0} cái)`, inline: true },
                { name: "🐟 Tổng cá đã bắt", value: fisher.totalFish.toString(), inline: true },
                { name: "💰 Tổng thu nhập", value: fisher.totalEarnings.toLocaleString(), inline: true },
                { name: "🐋 Cá lớn nhất", value: fisher.biggestFish.name, inline: true },
                { name: "⭐ Cá hiếm nhất", value: fisher.rarestFish.name, inline: true }
            );
    }

    return embed;
}

function createShopEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("🏪 Cửa hàng Câu Cá")
        .setDescription("Mua cần câu và mồi để tăng tỷ lệ bắt cá hiếm!")
        .setColor(config.embedColor)
        .setTimestamp();

    // Cần câu
    let rodText = "";
    for (const [id, rod] of Object.entries(FISHING_RODS)) {
        if (id === "basic") continue;
        rodText += `${rod.emoji} **${rod.name}** - ${rod.price.toLocaleString()} AniCoin\n`;
        rodText += `└ ${rod.description} (${rod.durability} độ bền)\n\n`;
    }
    embed.addFields({ name: "🎣 Cần câu", value: rodText || "Không có", inline: false });

    // Mồi
    let baitText = "";
    for (const [id, bait] of Object.entries(BAITS)) {
        if (id === "basic") continue;
        baitText += `${bait.emoji} **${bait.name}** - ${bait.price.toLocaleString()} AniCoin\n`;
        baitText += `└ ${bait.description}\n\n`;
    }
    embed.addFields({ name: "🪱 Mồi", value: baitText || "Không có", inline: false });

    return embed;
}

function createStatsEmbed(fisher: Fisher): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("📊 Thống kê Câu Cá")
        .setColor(config.embedColor)
        .setTimestamp()
        .addFields(
            { name: "🐟 Tổng cá đã bắt", value: fisher.totalFish.toString(), inline: true },
            { name: "💰 Tổng thu nhập", value: fisher.totalEarnings.toLocaleString(), inline: true },
            { name: "🎣 Cần câu hiện tại", value: FISHING_RODS[fisher.currentRod].name, inline: true },
            { name: "🪱 Mồi hiện tại", value: BAITS[fisher.currentBait].name, inline: true },
            { name: "🐋 Cá lớn nhất", value: `${fisher.biggestFish.name} (${fisher.biggestFish.value.toLocaleString()} AniCoin)`, inline: true },
            { name: "⭐ Cá hiếm nhất", value: `${fisher.rarestFish.name} (${getRarityText(fisher.rarestFish.rarity)})`, inline: true }
        );

    return embed;
}

export default Bot.createCommand({
    structure: {
        name: "fishing",
        aliases: ["fish", "cau"],
    },
    options: {
        cooldown: 3000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const args = message.content.split(" ").slice(1);
        const guildId = message.guildId!;
        const userId = message.author.id;
        const fisherKey = getFisherKey(userId, guildId);

        // Khởi tạo giá cá nếu chưa có
        if (Object.keys(fishPrices).length === 0) {
            initializeFishPrices();
        }

        // Khởi tạo người chơi nếu chưa có
        if (!fishers[fisherKey]) {
            fishers[fisherKey] = {
                userId,
                guildId,
                totalFish: 0,
                totalEarnings: 0,
                biggestFish: { name: "Chưa có", value: 0 },
                rarestFish: { name: "Chưa có", rarity: "common" },
                fishingTime: 0,
                rods: {}, // Không có cần câu nào ban đầu
                baits: {}, // Không có mồi nào ban đầu
                caughtFish: {}, // Không có cá nào ban đầu
                currentRod: "none",
                currentBait: "none",
                lastFished: 0,
            };
        }

        const fisher = fishers[fisherKey];

        if (args.length === 0) {
            // Lệnh câu cá chính
            return await fish(message, fisher);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "shop":
                return await showShop(message);
            case "stats":
                return await showStats(message, fisher);
            case "inventory":
            case "inv":
                return await showInventory(message, fisher);
            case "list":
                return await showFishList(message);
            case "prices":
                return await showFishPrices(message);
            case "buy":
                return await buyItem(message, args.slice(1), fisher);
            case "sell":
                return await sellFish(message, args.slice(1), fisher);
            case "help":
                return await showHelp(message);
            default:
                return message.reply("❌ Lệnh không hợp lệ! Dùng `n.fish help` để xem hướng dẫn.");
        }
    },
});

async function fish(message: Message, fisher: Fisher) {
    const now = Date.now();
    const timeSinceLastFish = now - fisher.lastFished;

    if (timeSinceLastFish < FISHING_COOLDOWN) {
        const remainingTime = Math.ceil((FISHING_COOLDOWN - timeSinceLastFish) / 1000);
        return message.reply(`⏰ Bạn cần đợi **${remainingTime} giây** nữa mới có thể câu cá!`);
    }

    // Kiểm tra cần câu
    if (fisher.currentRod === "none" || !fisher.rods[fisher.currentRod] || fisher.rods[fisher.currentRod] <= 0) {
        return message.reply(`❌ Bạn chưa có cần câu! Mua cần câu với \`n.fish buy rod <loại>\`\n**Loại cần câu:** \`basic\`, \`copper\`, \`silver\`, \`gold\`, \`diamond\``);
    }

    // Kiểm tra mồi
    if (fisher.currentBait === "none" || !fisher.baits[fisher.currentBait] || fisher.baits[fisher.currentBait] <= 0) {
        return message.reply(`❌ Bạn chưa có mồi! Mua mồi với \`n.fish buy bait <loại>\`\n**Loại mồi:** \`basic\`, \`good\`, \`premium\`, \`divine\``);
    }

    const balance = await getBalance(message.author.id, fisher.guildId);
    if (balance < FISHING_COST) {
        return message.reply(`❌ Bạn không đủ AniCoin để câu cá! Cần: ${FISHING_COST}, Có: ${balance}`);
    }

    // Trừ chi phí câu cá
    await subtractMoney(message.author.id, fisher.guildId, FISHING_COST, "Chi phí câu cá");

    // Tiêu thụ mồi
    fisher.baits[fisher.currentBait]--;

    // Giảm độ bền cần câu
    fisher.rods[fisher.currentRod]--;

    // Hiển thị đang câu
    const fishingMsg = await message.reply("🎣 Đang câu cá...");

    // Giả lập thời gian câu (1-3 giây)
    const fishingTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, fishingTime));

    // Bắt cá
    const caughtFish = getRandomFish(fisher);
    
    // Lưu cá vào inventory với giá hiện tại
    const currentPrice = getCurrentFishPrice(caughtFish.name);
    
    if (!fisher.caughtFish[caughtFish.name]) {
        fisher.caughtFish[caughtFish.name] = {
            name: caughtFish.name,
            emoji: caughtFish.emoji,
            rarity: caughtFish.rarity,
            value: currentPrice,
            quantity: 0
        };
    }
    fisher.caughtFish[caughtFish.name].quantity++;
    
    // Cập nhật giá cá trong inventory theo giá hiện tại
    fisher.caughtFish[caughtFish.name].value = currentPrice;

    // Cập nhật thống kê
    fisher.totalFish++;
    fisher.lastFished = now;

    // Cập nhật cá lớn nhất
    if (currentPrice > fisher.biggestFish.value) {
        fisher.biggestFish = { name: caughtFish.name, value: currentPrice };
    }

    // Cập nhật cá hiếm nhất
    const rarityOrder = { "common": 1, "rare": 2, "epic": 3, "legendary": 4 };
    if (rarityOrder[caughtFish.rarity as keyof typeof rarityOrder] > rarityOrder[fisher.rarestFish.rarity as keyof typeof rarityOrder]) {
        fisher.rarestFish = { name: caughtFish.name, rarity: caughtFish.rarity };
    }

    // Ghi lại lịch sử
    await recordGame(
        message.author.id,
        fisher.guildId,
        "fishing",
        FISHING_COST,
        currentPrice,
        "win"
    );

    // Tạo embed kết quả
    const embed = createFishingEmbed(fisher, caughtFish, currentPrice);

    // Xóa tin nhắn đang câu và gửi kết quả
    await fishingMsg.delete().catch(() => {});
    await message.reply({ embeds: [embed] });
}

async function showShop(message: Message) {
    const embed = createShopEmbed();
    await message.reply({ embeds: [embed] });
}

async function showStats(message: Message, fisher: Fisher) {
    const embed = createStatsEmbed(fisher);
    await message.reply({ embeds: [embed] });
}

async function showInventory(message: Message, fisher: Fisher) {
    const embed = new EmbedBuilder()
        .setTitle("🎒 Inventory Câu Cá")
        .setColor(config.embedColor)
        .setTimestamp();

    // Hiển thị cần câu
    let rodText = "";
    for (const [rodId, durability] of Object.entries(fisher.rods)) {
        if (durability > 0) {
            const rod = FISHING_RODS[rodId];
            const isCurrent = rodId === fisher.currentRod;
            rodText += `${rod.emoji} **${rod.name}** - ${durability} độ bền${isCurrent ? " (Đang dùng)" : ""}\n`;
        }
    }
    embed.addFields({ name: "🎣 Cần câu", value: rodText || "❌ Không có cần câu nào", inline: false });

    // Hiển thị mồi
    let baitText = "";
    for (const [baitId, quantity] of Object.entries(fisher.baits)) {
        if (quantity > 0) {
            const bait = BAITS[baitId];
            const isCurrent = baitId === fisher.currentBait;
            baitText += `${bait.emoji} **${bait.name}** - ${quantity} cái${isCurrent ? " (Đang dùng)" : ""}\n`;
        }
    }
    embed.addFields({ name: "🪱 Mồi", value: baitText || "❌ Không có mồi nào", inline: false });

    // Hiển thị cá đã bắt
    let fishText = "";
    for (const [fishName, fish] of Object.entries(fisher.caughtFish)) {
        if (fish.quantity > 0) {
            const rarityEmoji = getRarityEmoji(fish.rarity);
            fishText += `${fish.emoji} **${fish.name}** - ${fish.quantity} con (${fish.value.toLocaleString()} AniCoin/con)\n`;
        }
    }
    embed.addFields({ name: "🐟 Cá đã bắt", value: fishText || "❌ Không có cá nào", inline: false });

    await message.reply({ embeds: [embed] });
}

async function buyItem(message: Message, args: string[], fisher: Fisher) {
    if (args.length === 0) {
        return message.reply("❌ Thiếu thông tin! Dùng: `n.fish buy rod <loại> [số lượng]` hoặc `n.fish buy bait <loại> [số lượng]`");
    }

    const itemType = args[0].toLowerCase();
    const itemId = args[1]?.toLowerCase();
    const quantity = parseInt(args[2]) || 1;

    if (!itemId) {
        return message.reply("❌ Thiếu loại item! Dùng: `n.fish buy rod <loại> [số lượng]` hoặc `n.fish buy bait <loại> [số lượng]`");
    }

    if (quantity <= 0 || quantity > 100) {
        return message.reply("❌ Số lượng phải từ 1-100!");
    }

    const balance = await getBalance(message.author.id, fisher.guildId);

    if (itemType === "rod") {
        const rod = FISHING_RODS[itemId];
        if (!rod) {
            return message.reply("❌ Loại cần câu không tồn tại!");
        }

        const totalPrice = rod.price * quantity;
        if (balance < totalPrice) {
            return message.reply(`❌ Bạn không đủ AniCoin! Cần: ${totalPrice.toLocaleString()}, Có: ${balance.toLocaleString()}`);
        }

        await subtractMoney(message.author.id, fisher.guildId, totalPrice, `Mua cần câu: ${rod.name} x${quantity}`);
        
        // Thêm cần câu vào inventory
        if (!fisher.rods[itemId]) {
            fisher.rods[itemId] = 0;
        }
        fisher.rods[itemId] += rod.durability * quantity;
        
        // Tự động chuyển sang cần câu mới nếu tốt hơn hoặc chưa có cần câu
        if (fisher.currentRod === "none" || itemId !== "basic") {
            fisher.currentRod = itemId;
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Mua thành công!")
            .setDescription(`Bạn đã mua **${quantity}x ${rod.name}** với giá ${totalPrice.toLocaleString()} AniCoin!\n🎣 Tổng độ bền: ${rod.durability * quantity} lần sử dụng`)
            .setColor(0x00ff00)
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } else if (itemType === "bait") {
        const bait = BAITS[itemId];
        if (!bait) {
            return message.reply("❌ Loại mồi không tồn tại!");
        }

        const totalPrice = bait.price * quantity;
        if (balance < totalPrice) {
            return message.reply(`❌ Bạn không đủ AniCoin! Cần: ${totalPrice.toLocaleString()}, Có: ${balance.toLocaleString()}`);
        }

        await subtractMoney(message.author.id, fisher.guildId, totalPrice, `Mua mồi: ${bait.name} x${quantity}`);
        
        // Thêm mồi vào inventory
        if (!fisher.baits[itemId]) {
            fisher.baits[itemId] = 0;
        }
        fisher.baits[itemId] += quantity;
        
        // Tự động chuyển sang mồi mới nếu tốt hơn hoặc chưa có mồi
        if (fisher.currentBait === "none" || itemId !== "basic") {
            fisher.currentBait = itemId;
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Mua thành công!")
            .setDescription(`Bạn đã mua **${quantity}x ${bait.name}** với giá ${totalPrice.toLocaleString()} AniCoin!\n🪱 Tổng số lượng: ${quantity}`)
            .setColor(0x00ff00)
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } else {
        return message.reply("❌ Loại item không hợp lệ! Dùng: `rod` hoặc `bait`");
    }
}

async function sellFish(message: Message, args: string[], fisher: Fisher) {
    if (args.length === 0) {
        // Bán tất cả cá với giá hiện tại
        let totalValue = 0;
        let totalFish = 0;
        const soldFish: string[] = [];

        for (const [fishName, fish] of Object.entries(fisher.caughtFish)) {
            if (fish.quantity > 0) {
                const currentPrice = getCurrentFishPrice(fish.name);
                const fishValue = currentPrice * fish.quantity;
                totalValue += fishValue;
                totalFish += fish.quantity;
                soldFish.push(`${fish.emoji} ${fish.name} x${fish.quantity} (${currentPrice.toLocaleString()}/con)`);
                fish.quantity = 0; // Reset số lượng
            }
        }

        if (totalFish === 0) {
            return message.reply("❌ Bạn không có cá nào để bán!");
        }

        await addMoney(message.author.id, fisher.guildId, totalValue, `Bán tất cả cá (${totalFish} con)`);
        fisher.totalEarnings += totalValue;

        const embed = new EmbedBuilder()
            .setTitle("💰 Bán cá thành công!")
            .setDescription(`Bạn đã bán **${totalFish} con cá** với giá **${totalValue.toLocaleString()} AniCoin**!`)
            .addFields(
                { name: "🐟 Cá đã bán", value: soldFish.join("\n") || "Không có", inline: false },
                { name: "💰 Tổng thu nhập", value: `${totalValue.toLocaleString()} AniCoin`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        return;
    }

    // Bán cá cụ thể với giá hiện tại
    const fishName = args[0];
    const quantity = parseInt(args[1]) || 1;

    if (quantity <= 0) {
        return message.reply("❌ Số lượng phải lớn hơn 0!");
    }

    const fish = fisher.caughtFish[fishName];
    if (!fish || fish.quantity <= 0) {
        return message.reply(`❌ Bạn không có cá **${fishName}** để bán!`);
    }

    if (fish.quantity < quantity) {
        return message.reply(`❌ Bạn chỉ có ${fish.quantity} con cá **${fishName}**!`);
    }

    const currentPrice = getCurrentFishPrice(fishName);
    const totalValue = currentPrice * quantity;
    await addMoney(message.author.id, fisher.guildId, totalValue, `Bán cá: ${fishName} x${quantity}`);
    fisher.totalEarnings += totalValue;

    fish.quantity -= quantity;
    if (fish.quantity <= 0) {
        delete fisher.caughtFish[fishName];
    }

    const embed = new EmbedBuilder()
        .setTitle("💰 Bán cá thành công!")
        .setDescription(`Bạn đã bán **${quantity}x ${fish.emoji} ${fish.name}** với giá **${totalValue.toLocaleString()} AniCoin**!`)
        .addFields(
            { name: "💰 Giá hiện tại", value: `${currentPrice.toLocaleString()} AniCoin/con`, inline: true },
            { name: "📊 Tổng thu nhập", value: `${totalValue.toLocaleString()} AniCoin`, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function showFishPrices(message: Message) {
    updateFishPrices();
    
    const embed = new EmbedBuilder()
        .setTitle("💰 Bảng giá cá hiện tại")
        .setDescription("Giá cá thay đổi mỗi 10 phút. Bán khi giá cao để có lợi nhuận tốt nhất!")
        .setColor(config.embedColor)
        .setTimestamp();

    // Nhóm cá theo độ hiếm
    const fishByRarity = {
        common: FISH_LIST.filter(fish => fish.rarity === "common"),
        rare: FISH_LIST.filter(fish => fish.rarity === "rare"),
        epic: FISH_LIST.filter(fish => fish.rarity === "epic"),
        legendary: FISH_LIST.filter(fish => fish.rarity === "legendary")
    };

    // Cá thường
    if (fishByRarity.common.length > 0) {
        const commonFish = fishByRarity.common.map(fish => {
            const priceInfo = getFishPriceInfo(fish.name);
            const currentPrice = priceInfo?.currentPrice || 0;
            const basePrice = priceInfo?.basePrice || 0;
            const priceChange = currentPrice - basePrice;
            const changeEmoji = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
            const changeText = priceChange > 0 ? `+${priceChange}` : priceChange < 0 ? `${priceChange}` : "0";
            
            return `${fish.emoji} **${fish.name}**\n   💰 ${currentPrice.toLocaleString()} AniCoin ${changeEmoji} ${changeText}`;
        }).join("\n\n");
        
        embed.addFields({
            name: "⚪ Cá thường (Common)",
            value: commonFish,
            inline: false
        });
    }

    // Cá hiếm
    if (fishByRarity.rare.length > 0) {
        const rareFish = fishByRarity.rare.map(fish => {
            const priceInfo = getFishPriceInfo(fish.name);
            const currentPrice = priceInfo?.currentPrice || 0;
            const basePrice = priceInfo?.basePrice || 0;
            const priceChange = currentPrice - basePrice;
            const changeEmoji = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
            const changeText = priceChange > 0 ? `+${priceChange}` : priceChange < 0 ? `${priceChange}` : "0";
            
            return `${fish.emoji} **${fish.name}**\n   💰 ${currentPrice.toLocaleString()} AniCoin ${changeEmoji} ${changeText}`;
        }).join("\n\n");
        
        embed.addFields({
            name: "🔵 Cá hiếm (Rare)",
            value: rareFish,
            inline: false
        });
    }

    // Cá quý hiếm
    if (fishByRarity.epic.length > 0) {
        const epicFish = fishByRarity.epic.map(fish => {
            const priceInfo = getFishPriceInfo(fish.name);
            const currentPrice = priceInfo?.currentPrice || 0;
            const basePrice = priceInfo?.basePrice || 0;
            const priceChange = currentPrice - basePrice;
            const changeEmoji = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
            const changeText = priceChange > 0 ? `+${priceChange}` : priceChange < 0 ? `${priceChange}` : "0";
            
            return `${fish.emoji} **${fish.name}**\n   💰 ${currentPrice.toLocaleString()} AniCoin ${changeEmoji} ${changeText}`;
        }).join("\n\n");
        
        embed.addFields({
            name: "🟣 Cá quý hiếm (Epic)",
            value: epicFish,
            inline: false
        });
    }

    // Cá huyền thoại
    if (fishByRarity.legendary.length > 0) {
        const legendaryFish = fishByRarity.legendary.map(fish => {
            const priceInfo = getFishPriceInfo(fish.name);
            const currentPrice = priceInfo?.currentPrice || 0;
            const basePrice = priceInfo?.basePrice || 0;
            const priceChange = currentPrice - basePrice;
            const changeEmoji = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
            const changeText = priceChange > 0 ? `+${priceChange}` : priceChange < 0 ? `${priceChange}` : "0";
            
            return `${fish.emoji} **${fish.name}**\n   💰 ${currentPrice.toLocaleString()} AniCoin ${changeEmoji} ${changeText}`;
        }).join("\n\n");
        
        embed.addFields({
            name: "🟡 Cá huyền thoại (Legendary)",
            value: legendaryFish,
            inline: false
        });
    }

    // Thông tin cập nhật
    const nextUpdate = Math.ceil(PRICE_UPDATE_INTERVAL / 60000);
    embed.addFields({
        name: "⏰ Thông tin cập nhật",
        value: `📈📉 Giá cá thay đổi mỗi **${nextUpdate} phút**\n` +
               `📊 Độ biến động: **±${PRICE_VOLATILITY * 100}%**\n` +
               `💡 **Mẹo:** Bán khi giá cao (📈) để có lợi nhuận tốt nhất!`,
        inline: false
    });

    await message.reply({ embeds: [embed] });
}

async function showFishList(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("🐟 Danh sách các loại cá")
        .setDescription("Chi tiết về tất cả các loại cá có thể bắt được trong hệ thống câu cá")
        .setColor(config.embedColor)
        .setTimestamp();

    // Nhóm cá theo độ hiếm
    const fishByRarity = {
        common: FISH_LIST.filter(fish => fish.rarity === "common"),
        rare: FISH_LIST.filter(fish => fish.rarity === "rare"),
        epic: FISH_LIST.filter(fish => fish.rarity === "epic"),
        legendary: FISH_LIST.filter(fish => fish.rarity === "legendary")
    };

    // Cá thường
    if (fishByRarity.common.length > 0) {
        const commonFish = fishByRarity.common.map(fish => 
            `${fish.emoji} **${fish.name}**\n` +
            `   ⚪ Thường | 💰 ${fish.minValue.toLocaleString()}-${fish.maxValue.toLocaleString()} | 📊 ${fish.chance}%`
        ).join("\n\n");
        
        embed.addFields({
            name: "⚪ Cá thường (Common)",
            value: commonFish,
            inline: false
        });
    }

    // Cá hiếm
    if (fishByRarity.rare.length > 0) {
        const rareFish = fishByRarity.rare.map(fish => 
            `${fish.emoji} **${fish.name}**\n` +
            `   🔵 Hiếm | 💰 ${fish.minValue.toLocaleString()}-${fish.maxValue.toLocaleString()} | 📊 ${fish.chance}%`
        ).join("\n\n");
        
        embed.addFields({
            name: "🔵 Cá hiếm (Rare)",
            value: rareFish,
            inline: false
        });
    }

    // Cá quý hiếm
    if (fishByRarity.epic.length > 0) {
        const epicFish = fishByRarity.epic.map(fish => 
            `${fish.emoji} **${fish.name}**\n` +
            `   🟣 Quý hiếm | 💰 ${fish.minValue.toLocaleString()}-${fish.maxValue.toLocaleString()} | 📊 ${fish.chance}%`
        ).join("\n\n");
        
        embed.addFields({
            name: "🟣 Cá quý hiếm (Epic)",
            value: epicFish,
            inline: false
        });
    }

    // Cá huyền thoại
    if (fishByRarity.legendary.length > 0) {
        const legendaryFish = fishByRarity.legendary.map(fish => 
            `${fish.emoji} **${fish.name}**\n` +
            `   🟡 Huyền thoại | 💰 ${fish.minValue.toLocaleString()}-${fish.maxValue.toLocaleString()} | 📊 ${fish.chance}%`
        ).join("\n\n");
        
        embed.addFields({
            name: "🟡 Cá huyền thoại (Legendary)",
            value: legendaryFish,
            inline: false
        });
    }

    // Thêm thông tin tổng quan
    const totalFish = FISH_LIST.length;
    const totalValue = FISH_LIST.reduce((sum, fish) => sum + fish.minValue + fish.maxValue, 0) / 2;
    
    embed.addFields({
        name: "📊 Thống kê tổng quan",
        value: `🐟 **Tổng số loại cá:** ${totalFish}\n` +
               `💰 **Giá trị trung bình:** ${Math.round(totalValue / totalFish).toLocaleString()} AniCoin\n` +
               `🎯 **Tỷ lệ hiếm:** Tăng theo cần câu và mồi tốt hơn`,
        inline: false
    });

    await message.reply({ embeds: [embed] });
}

async function showHelp(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("🎣 Hướng dẫn Câu Cá")
        .setDescription(
            "**Câu cá:** `n.fish`\n" +
            "**Xem giá cá:** `n.fish prices`\n" +
            "**Xem danh sách cá:** `n.fish list`\n" +
            "**Xem cửa hàng:** `n.fish shop`\n" +
            "**Xem thống kê:** `n.fish stats`\n" +
            "**Xem inventory:** `n.fish inventory`\n" +
            "**Mua cần câu:** `n.fish buy rod <loại> [số lượng]`\n" +
            "**Mua mồi:** `n.fish buy bait <loại> [số lượng]`\n" +
            "**Bán cá:** `n.fish sell [tên cá] [số lượng]`\n\n" +
            "**Loại cần câu:**\n" +
            "• `basic` - Cần câu cơ bản (100 AniCoin, 10 độ bền)\n" +
            "• `copper` - Cần câu đồng (1,000 AniCoin, 25 độ bền)\n" +
            "• `silver` - Cần câu bạc (5,000 AniCoin, 50 độ bền)\n" +
            "• `gold` - Cần câu vàng (15,000 AniCoin, 100 độ bền)\n" +
            "• `diamond` - Cần câu kim cương (50,000 AniCoin, 200 độ bền)\n\n" +
            "**Loại mồi:**\n" +
            "• `basic` - Mồi cơ bản (10 AniCoin)\n" +
            "• `good` - Mồi ngon (50 AniCoin)\n" +
            "• `premium` - Mồi thượng hạng (200 AniCoin)\n" +
            "• `divine` - Mồi thần (1,000 AniCoin)\n\n" +
            "**Ví dụ:**\n" +
            "• `n.fish buy bait basic 10` - Mua 10 mồi cơ bản\n" +
            "• `n.fish sell` - Bán tất cả cá\n" +
            "• `n.fish sell Cá_rô_phi 5` - Bán 5 con cá rô phi\n\n" +
            "**Lưu ý:**\n" +
            "• Cooldown: 30 giây giữa các lần câu\n" +
            "• Chi phí: 10 AniCoin mỗi lần câu\n" +
            "• Mỗi lần câu tiêu thụ 1 mồi và 1 độ bền cần câu\n" +
            "• Cá sẽ được lưu trong inventory, dùng lệnh sell để bán\n" +
            "• Giá cá thay đổi mỗi 10 phút, dùng `n.fish prices` để xem giá hiện tại\n" +
            "• Cần câu và mồi tốt hơn sẽ tăng tỷ lệ bắt cá hiếm"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
} 