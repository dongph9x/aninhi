import { EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { EcommerceService } from "@/utils/ecommerce-db";
import { FishingService, FISH_LIST, FISHING_RODS, BAITS } from "@/utils/fishing";
import { prisma } from "@/utils/database";

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

export default Bot.createCommand({
    structure: {
        name: "fishing",
        aliases: ["fish", "f"],
    },
    options: {
        cooldown: 3000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        if (args.length === 0) {
            // Mặc định là câu cá với animation
            return await fishWithAnimation(message);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "fish":
            case "câu":
                return await fishWithAnimation(message);
            case "shop":
            case "cửa hàng":
                return await showShop(message);
            case "buy":
            case "mua":
                return await buyItem(message, args.slice(1));
            case "sell":
            case "bán":
                return await sellFish(message, args.slice(1));
            case "inventory":
            case "inv":
            case "túi đồ":
            case "túi":
                return await showInventory(message);
            case "stats":
            case "thống kê":
                return await showStats(message);
            case "help":
                return await showHelp(message);
            default:
                // Nếu không có subcommand hợp lệ, mặc định là câu cá với animation
                return await fishWithAnimation(message);
        }
    },
});

async function fishWithAnimation(message: Message) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    try {
        // Kiểm tra cooldown trước khi bắt đầu animation
        const cooldownCheck = await FishingService.canFish(userId, guildId);
        if (!cooldownCheck.canFish) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("⏰ Cooldown")
                .setDescription(`Bạn cần đợi ${Math.ceil(cooldownCheck.remainingTime / 1000)} giây nữa để câu cá!`)
                .setColor("#ff9900")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Kiểm tra số dư
        const balance = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        if (!balance || balance.balance < 10) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không đủ tiền")
                .setDescription("Bạn cần ít nhất 10 AniCoin để câu cá!")
                .setColor("#ff0000")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Bắt đầu animation câu cá
        const fishingEmbed = new EmbedBuilder()
            .setTitle("🎣 Đang Câu Cá...")
            .setDescription(
                `**${message.author.username}** đang câu cá...\n\n` +
                `🎣 **Cần câu:** ${FISHING_RODS[await FishingService.getFishingData(userId, guildId).then(data => data.currentRod)]?.name || "Cơ bản"}\n` +
                `🪱 **Mồi:** ${BAITS[await FishingService.getFishingData(userId, guildId).then(data => data.currentBait)]?.name || "Cơ bản"}\n\n` +
                `⏳ Đang chờ cá cắn câu...`
            )
            .setColor("#0099ff")
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

        const fishingMsg = await message.reply({ embeds: [fishingEmbed] });

        // Animation 3 giây với các bước khác nhau
        const animationSteps = [
            "🎣 Đang thả mồi...",
            "🌊 Đang chờ cá cắn câu...",
            "🐟 Có gì đó đang cắn câu!",
            "🎣 Đang kéo cá lên..."
        ];

        for (let i = 0; i < animationSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 750)); // 750ms mỗi bước = 3 giây tổng
            
            const updatedEmbed = new EmbedBuilder()
                .setTitle("🎣 Đang Câu Cá...")
                .setDescription(
                    `**${message.author.username}** đang câu cá...\n\n` +
                    `🎣 **Cần câu:** ${FISHING_RODS[await FishingService.getFishingData(userId, guildId).then(data => data.currentRod)]?.name || "Cơ bản"}\n` +
                    `🪱 **Mồi:** ${BAITS[await FishingService.getFishingData(userId, guildId).then(data => data.currentBait)]?.name || "Cơ bản"}\n\n` +
                    `⏳ ${animationSteps[i]}`
                )
                .setColor("#0099ff")
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            await fishingMsg.edit({ embeds: [updatedEmbed] });
        }

        // Thực hiện câu cá
        const result = await FishingService.fish(userId, guildId);
        const { fish, value, newBalance } = result;

        const successEmbed = new EmbedBuilder()
            .setTitle("🎣 Câu Cá Thành Công!")
            .setDescription(
                `**${message.author.username}** đã câu được:\n\n` +
                `${fish.emoji} **${fish.name}**\n` +
                `${getRarityEmoji(fish.rarity)} **${getRarityText(fish.rarity)}**\n` +
                `💰 **Giá trị:** ${value} AniCoin\n\n`
            )
            .setColor(getRarityColor(fish.rarity))
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

        await fishingMsg.edit({ embeds: [successEmbed] });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi câu cá!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function fish(message: Message) {
    // Redirect to fishWithAnimation for consistency
    return await fishWithAnimation(message);
}

async function showShop(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("🏪 Cửa Hàng Câu Cá")
        .setDescription("**Cần câu:**\n" +
            Object.entries(FISHING_RODS).map(([key, rod]) =>
                `${rod.emoji} **${rod.name}** - ${rod.price} AniCoin\n` +
                `└ ${rod.description}`
            ).join("\n\n") +
            "\n\n**Mồi:**\n" +
            Object.entries(BAITS).map(([key, bait]) =>
                `${bait.emoji} **${bait.name}** - ${bait.price} AniCoin\n` +
                `└ ${bait.description}`
            ).join("\n\n") +
            "\n\n**Cách mua:** `n.fishing buy <loại> <số lượng>`\n" +
            "**Ví dụ:** `n.fishing buy copper 1` hoặc `n.fishing buy good 5`"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function buyItem(message: Message, args: string[]) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.fishing buy <loại> [số lượng]`");
    }

    const itemType = args[0].toLowerCase();
    const quantity = parseInt(args[1]) || 1;

    if (quantity <= 0) {
        return message.reply("❌ Số lượng phải lớn hơn 0!");
    }

    try {
        if (FISHING_RODS[itemType]) {
            // Mua cần câu
            const rod = await FishingService.buyRod(userId, guildId, itemType);
            const embed = new EmbedBuilder()
                .setTitle("✅ Mua Thành Công!")
                .setDescription(
                    `**${message.author.username}** đã mua:\n\n` +
                    `${rod.emoji} **${rod.name}**\n` +
                    `💰 **Giá:** ${rod.price} AniCoin\n` +
                    `🔧 **Độ bền:** ${rod.durability}\n` +
                    `📈 **Tăng tỷ lệ hiếm:** +${rod.rarityBonus}%`
                )
                .setColor("#00ff00")
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } else if (BAITS[itemType]) {
            // Mua mồi
            const result = await FishingService.buyBait(userId, guildId, itemType, quantity);
            const embed = new EmbedBuilder()
                .setTitle("✅ Mua Thành Công!")
                .setDescription(
                    `**${message.author.username}** đã mua:\n\n` +
                    `${result.bait.emoji} **${result.bait.name}** x${quantity}\n` +
                    `💰 **Tổng giá:** ${result.totalCost} AniCoin\n` +
                    `📈 **Tăng tỷ lệ hiếm:** +${result.bait.rarityBonus}%`
                )
                .setColor("#00ff00")
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } else {
            return message.reply("❌ Loại vật phẩm không hợp lệ! Dùng `n.fishing shop` để xem danh sách.");
        }
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi mua vật phẩm!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function sellFish(message: Message, args: string[]) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.fishing sell <tên cá> [số lượng]`");
    }

    // Parse fishName and quantity, hỗ trợ tên cá có dấu cách và ngoặc kép
    let fishName = args[0];
    let quantity = 1;
    if (fishName.startsWith('"')) {
        let i = 1;
        while (i < args.length && !args[i].endsWith('"')) {
            fishName += ' ' + args[i];
            i++;
        }
        if (i < args.length) {
            fishName += ' ' + args[i];
            quantity = parseInt(args[i + 1]) || 1;
            // Bỏ dấu ngoặc kép
            fishName = fishName.slice(1, -1);
        } else {
            // Nếu không có dấu " đóng, fallback lấy hết
            fishName = fishName.slice(1);
        }
    } else if (args.length > 1) {
        quantity = parseInt(args[1]) || 1;
    }

    if (quantity <= 0) {
        return message.reply("❌ Số lượng phải lớn hơn 0!");
    }

    try {
        const result = await FishingService.sellFish(userId, guildId, fishName, quantity);
        const embed = new EmbedBuilder()
            .setTitle("💰 Bán Thành Công!")
            .setDescription(
                `**${message.author.username}** đã bán:\n\n` +
                `🐟 **${result.fishName}** x${result.quantity}\n` +
                `💰 **Tổng giá:** ${result.totalValue} AniCoin`
            )
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi bán cá!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function showInventory(message: Message) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    try {
        const fishingData = await FishingService.getFishingData(userId, guildId);

        const embed = new EmbedBuilder()
            .setTitle("🎒 Túi Đồ Câu Cá")
            .setDescription(`**${message.author.username}**\n\n` +
                `🎣 **Cần câu hiện tại:** ${FISHING_RODS[fishingData.currentRod]?.name || "Không có"}\n` +
                `🪱 **Mồi hiện tại:** ${BAITS[fishingData.currentBait]?.name || "Không có"}\n\n` +
                `**Cá đã bắt:**\n` +
                                 (fishingData.fish.length > 0 
                     ? fishingData.fish.map((f: any) => 
                         `${FISH_LIST.find(fish => fish.name === f.fishName)?.emoji || "🐟"} **${f.fishName}** x${f.quantity} (${f.fishValue} AniCoin)`
                     ).join("\n")
                     : "Chưa có cá nào"
                 )
            )
            .setColor(config.embedColor)
            .setTimestamp();

        // Tạo components với nút bán nhanh cho từng loại cá
        const components = [];
        if (fishingData.fish.length > 0) {
            const rows = [];
            for (let i = 0; i < fishingData.fish.length; i += 3) {
                const row = {
                    type: 1 as const,
                    components: fishingData.fish.slice(i, i + 3).map((f: any, index: number) => ({
                        type: 2 as const,
                        style: 3 as const, // Green button
                        label: `Bán ${f.fishName}`,
                        custom_id: JSON.stringify({
                            n: "SellFish",
                            d: {
                                fishId: f.id,
                                fishName: f.fishName
                            }
                        }),
                        emoji: { name: "💰" }
                    }))
                };
                rows.push(row);
            }
            components.push(...rows);
        }

        await message.reply({ 
            embeds: [embed],
            components: components.length > 0 ? components : undefined
        });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi xem túi đồ!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function showStats(message: Message) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    try {
        const fishingData = await FishingService.getFishingData(userId, guildId);

        const embed = new EmbedBuilder()
            .setTitle("📊 Thống Kê Câu Cá")
            .setDescription(`**${message.author.username}**\n\n` +
                `🎣 **Tổng số lần câu:** ${fishingData.totalFish}\n` +
                `💰 **Tổng thu nhập:** ${fishingData.totalEarnings} AniCoin\n` +
                `🐟 **Cá lớn nhất:** ${fishingData.biggestFish || "Chưa có"} (${fishingData.biggestValue} AniCoin)\n` +
                `${getRarityEmoji(fishingData.rarestRarity)} **Cá hiếm nhất:** ${fishingData.rarestFish || "Chưa có"} (${getRarityText(fishingData.rarestRarity)})`
            )
            .setColor(config.embedColor)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi xem thống kê!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function showHelp(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("🎣 Hệ Thống Câu Cá - Hướng Dẫn")
        .setDescription(
            "**Câu cá:** `n.fishing` (với animation 3 giây)\n" +
            "**Xem cửa hàng:** `n.fishing shop`\n" +
            "**Mua vật phẩm:** `n.fishing buy <loại> [số lượng]`\n" +
            "**Bán cá:** `n.fishing sell <tên cá> [số lượng]`\n" +
            "**Xem túi đồ:** `n.fishing inv` hoặc `n.fishing inventory`\n" +
            "**Xem thống kê:** `n.fishing stats`\n\n" +
            "**Ví dụ:**\n" +
            "• `n.fishing` - Câu cá với animation\n" +
            "• `n.fishing fish` - Câu cá với animation\n" +
            "• `n.fishing buy copper 1` - Mua cần câu đồng\n" +
            "• `n.fishing buy good 5` - Mua 5 mồi ngon\n" +
            "• `n.fishing sell \"Cá rô phi\" 1` - Bán 1 con cá rô phi\n\n" +
            "**Lưu ý:**\n" +
            "• Mỗi lần câu tốn 10 AniCoin\n" +
            "• Cooldown 30 giây giữa các lần câu\n" +
            "• Animation câu cá kéo dài 3 giây\n" +
            "• Cần câu và mồi tốt hơn sẽ tăng tỷ lệ bắt cá hiếm\n" +
            "• Cần câu có độ bền, mồi có số lượng giới hạn\n" +
            "• Trong túi đồ có nút \"Bán ngay\" để bán cá nhanh"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
} 