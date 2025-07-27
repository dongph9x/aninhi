import { EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { EcommerceService } from "@/utils/ecommerce-db";
import { FishingService, FISH_LIST, FISHING_RODS, BAITS } from "@/utils/fishing";
import { AchievementService } from "@/utils/achievement";
import prisma from "@/utils/prisma";

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
        cooldown: 1000, // Giảm cooldown xuống 1 giây để tránh spam
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
            case "price":
            case "giá":
                return await showFishPrices(message, args.slice(1));
            case "setrod":
            case "setcần":
                return await setCurrentRod(message, args.slice(1));
            case "setbait":
            case "setmồi":
                return await setCurrentBait(message, args.slice(1));
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

// Map để lưu trạng thái đang câu cá của user
const fishingInProgress = new Map<string, boolean>();

async function fishWithAnimation(message: Message) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    // Kiểm tra xem user có đang câu cá không
    if (fishingInProgress.get(userId)) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("⏳ Đang Câu Cá...")
            .setDescription("Bạn đang câu cá, vui lòng đợi hoàn thành!")
            .setColor("#ff9900")
            .setTimestamp();

        return await message.reply({ embeds: [errorEmbed] });
    }

    try {
        // Đánh dấu user đang câu cá
        fishingInProgress.set(userId, true);

        // Kiểm tra quyền Admin
        const member = await message.guild?.members.fetch(userId);
        const isAdmin = member?.permissions.has('Administrator') || false;

        // Kiểm tra xem user có phải là top 1 fisher không
        const topFisher = await FishingService.getTopFisher(guildId);
        const isTopFisher = topFisher && topFisher.userId === userId;

        // Kiểm tra xem user có phải là top 1 lose không
        const { GameStatsService } = await import('@/utils/gameStats');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        const isTopLose = topLoseUser && topLoseUser.userId === userId;

        // Kiểm tra xem user có phải là top 1 FishCoin không
        const topFishCoinUser = await GameStatsService.getTopFishCoinUser(guildId);
        const isTopFishCoin = topFishCoinUser === userId;

        // Kiểm tra Achievement của user (PRIORITY CAO NHẤT)
        const userAchievement = await AchievementService.getHighestPriorityAchievement(userId);
        const hasAchievement = userAchievement !== null;

        // Kiểm tra điều kiện câu cá trước khi bắt đầu animation (Admin bypass)
        const cooldownCheck = await FishingService.canFish(userId, guildId, isAdmin);
        if (!cooldownCheck.canFish) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không thể câu cá")
                .setDescription(cooldownCheck.message || `Bạn cần đợi ${Math.ceil(cooldownCheck.remainingTime / 1000)} giây nữa để câu cá!`)
                .setColor("#ff9900")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Kiểm tra số dư FishCoin
        const balance = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        if (!balance || balance.fishBalance < 10n) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không đủ FishCoin")
                .setDescription("Bạn cần ít nhất 10 FishCoin để câu cá!")
                .setColor("#ff0000")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Lấy thông tin cần câu và mồi hiện tại
        const fishingData = await FishingService.getFishingData(userId, guildId);
        let rodName = "Không có";
        let baitName = "Không có";
        
        // Lưu thông tin cần câu ban đầu để so sánh sau này
        const originalRodName = fishingData.currentRod ? FISHING_RODS[fishingData.currentRod]?.name || 'Unknown' : 'None';
        // Lưu thông tin mồi ban đầu để so sánh sau này
        const originalBaitName = fishingData.currentBait ? BAITS[fishingData.currentBait]?.name || 'Unknown' : 'None';
        
        if (fishingData.currentRod && fishingData.currentRod !== "") {
            rodName = FISHING_RODS[fishingData.currentRod]?.name || "Không xác định";
        }
        
        if (fishingData.currentBait && fishingData.currentBait !== "") {
            baitName = BAITS[fishingData.currentBait]?.name || "Không xác định";
        }

        // Tối ưu: Load GIF một lần và tái sử dụng
        const fishingGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif?ex=6881950d&is=6880438d&hm=60523d4d9a24ab5f45a42e6fd1c8dddf28680e015cadf0e5fce617e12599f552&";
        
        // GIF đặc biệt cho Admin (hiển thị trên cùng)
        const adminGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1398569226188619787/113_146.gif?ex=6885d697&is=68848517&hm=51f234796bc3ada147d02b4b679afe6995bc1602f98f09571de115c5854cffb0&";
        
        // GIF đặc biệt cho Top 1 Fisher (theo yêu cầu)
        const topFisherGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398568859987869696/113_137.gif?ex=6885d640&is=688484c0&hm=caa5221123afc40711c4fcfc972f92181fc6ed9fbbc2052d689e7962b6a0e55d&=&width=480&height=184";
        
        // GIF đặc biệt cho Top 1 Lose (theo yêu cầu)
        const topLoseGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398569302663368714/113_156.gif?ex=6885d6a9&is=68848529&hm=e67d702c44f4916882ea5cb64940485e0b66aed91f74b7f7f5f6e53934fcd47d&=&width=408&height=192";
        
        // GIF đặc biệt cho Top 1 FishCoin (theo yêu cầu)
        const topFishCoinGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif?ex=6885d697&is=68848517&hm=6997312ba231ae7d566ffde7a4176d509ccc9dc85d2ff312934a34508c072e1c&=&width=600&height=168";
        
        // Animation 3 giây với các bước khác nhau (chỉ text thay đổi, GIF giữ nguyên)
        const animationSteps = [
            "🎣 Đang thả mồi...",
            "🌊 Đang chờ cá cắn câu...",
            "🐟 Có gì đó đang cắn câu!",
            "🎣 Đang kéo cá lên..."
        ];

        // Bắt đầu animation câu cá với GIF ngay từ đầu
        const fishingEmbed = new EmbedBuilder()
            .setTitle("🎣 Đang Câu Cá...")
            .setDescription(
                `**${message.author.username}** đang câu cá...\n\n` +
                `🎣 **Cần câu:** ${rodName}\n` +
                `🪱 **Mồi:** ${baitName}\n\n` +
                `⏳ ${animationSteps[0]}`
            )
            .setColor("#0099ff")
            .setThumbnail(message.author.displayAvatarURL())
            .setImage(fishingGifUrl) // Luôn giữ GIF câu cá cũ
            .setTimestamp();

        // Tạo embed cho Admin GIF (hiển thị nhỏ gọn - 100x50px equivalent)
        let adminEmbed: EmbedBuilder | undefined = undefined;
        if (isAdmin) {
            adminEmbed = new EmbedBuilder()
                .setThumbnail(adminGifUrl) // GIF đặc biệt cho Admin (nhỏ gọn)
                .setColor("#ffd700") // Màu vàng cho Admin
                .setTitle("👑 Admin Fishing"); // Tiêu đề nhỏ cho Admin
        }

        // Tạo embed cho Top 1 Fisher GIF (hiển thị nhỏ gọn)
        let topFisherEmbed: EmbedBuilder | undefined = undefined;
        if (isTopFisher && !isAdmin) {
            topFisherEmbed = new EmbedBuilder()
                .setThumbnail(topFisherGifUrl)
                .setColor("#ff6b35")
                .setTitle("🏆 Top 1 Câu Cá");
        }

        // Tạo embed cho Top 1 Lose GIF (hiển thị nhỏ gọn)
        let topLoseEmbed: EmbedBuilder | undefined = undefined;
        if (isTopLose && !isAdmin && !isTopFisher) {
            topLoseEmbed = new EmbedBuilder()
                .setThumbnail(topLoseGifUrl)
                .setColor("#ff4757")
                .setTitle("💸 Top 1 Thua Lỗ");
        }

        // Tạo embed cho Top 1 FishCoin GIF (hiển thị nhỏ gọn)
        let topFishCoinEmbed: EmbedBuilder | undefined = undefined;
        if (isTopFishCoin && !isAdmin && !isTopFisher) {
            topFishCoinEmbed = new EmbedBuilder()
                .setThumbnail(topFishCoinGifUrl)
                .setColor("#00d4aa")
                .setTitle("💰 Top 1 FishCoin");
        }

        // Tạo embed cho Achievement (PRIORITY CAO NHẤT)
        let achievementEmbed: EmbedBuilder | undefined = undefined;
        if (hasAchievement && userAchievement) {
            const achievementEmoji = AchievementService.getAchievementTypeEmoji(userAchievement.type);
            const achievementTypeName = AchievementService.getAchievementTypeName(userAchievement.type);
            
            achievementEmbed = new EmbedBuilder()
                .setThumbnail(userAchievement.link) // Sử dụng link ảnh từ achievement
                .setColor("#ff6b35") // Màu cam cho achievement
                // .setTitle(`${achievementEmoji} ${userAchievement.name}`) // Tên achievement
                .setTitle(`${userAchievement.name}`) // Tên achievement
                .setDescription(`🏅 **${achievementTypeName}**`); // Type achievement
        }

        // Gửi embed(s) dựa trên vai trò - Priority: Achievement > Admin > Top Fisher > Top FishCoin > Top Lose
        let embeds: EmbedBuilder[] = [fishingEmbed];
        if (hasAchievement && achievementEmbed) {
            embeds = [achievementEmbed, fishingEmbed]; // Achievement có priority cao nhất
        } else if (isAdmin && adminEmbed) {
            embeds = [adminEmbed, fishingEmbed];
        } else if (isTopFisher && topFisherEmbed) {
            embeds = [topFisherEmbed, fishingEmbed];
        } else if (isTopFishCoin && topFishCoinEmbed) {
            embeds = [topFishCoinEmbed, fishingEmbed];
        } else if (isTopLose && topLoseEmbed) {
            embeds = [topLoseEmbed, fishingEmbed];
        }
        const fishingMsg = await message.reply({ embeds });

        // Cập nhật các bước tiếp theo (chỉ thay đổi description, không động đến image để tránh nháy GIF)
        for (let i = 1; i < animationSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 750)); // 750ms mỗi bước = 3 giây tổng
            
            if (hasAchievement && achievementEmbed) {
                // Achievement: Cập nhật cả hai embed
                const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1]) // Embed thứ 2 là fishing embed
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                const updatedEmbeds = [achievementEmbed, updatedFishingEmbed];
                await fishingMsg.edit({ embeds: updatedEmbeds });
            } else if (isAdmin && adminEmbed) {
                // Admin: Cập nhật cả hai embed
                const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1]) // Embed thứ 2 là fishing embed
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                const updatedEmbeds = [adminEmbed, updatedFishingEmbed];
                await fishingMsg.edit({ embeds: updatedEmbeds });
            } else if (isTopFisher && topFisherEmbed) {
                // Top 1 Fisher: Cập nhật cả hai embed
                const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1]) // Embed thứ 2 là fishing embed
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                const updatedEmbeds = [topFisherEmbed, updatedFishingEmbed];
                await fishingMsg.edit({ embeds: updatedEmbeds });
            } else if (isTopFishCoin && topFishCoinEmbed) {
                // Top 1 FishCoin: Cập nhật cả hai embed
                const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1]) // Embed thứ 2 là fishing embed
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                const updatedEmbeds = [topFishCoinEmbed, updatedFishingEmbed];
                await fishingMsg.edit({ embeds: updatedEmbeds });
            } else if (isTopLose && topLoseEmbed) {
                // Top 1 Lose: Cập nhật cả hai embed
                const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1]) // Embed thứ 2 là fishing embed
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                const updatedEmbeds = [topLoseEmbed, updatedFishingEmbed];
                await fishingMsg.edit({ embeds: updatedEmbeds });
            } else {
                // Normal user: Chỉ cập nhật một embed
                const updatedEmbed = EmbedBuilder.from(fishingMsg.embeds[0])
                    .setDescription(
                        `**${message.author.username}** đang câu cá...\n\n` +
                        `🎣 **Cần câu:** ${rodName}\n` +
                        `🪱 **Mồi:** ${baitName}\n\n` +
                        `⏳ ${animationSteps[i]}`
                    );
                
                await fishingMsg.edit({ embeds: [updatedEmbed] });
            }
        }

        // Thực hiện câu cá
        const result = await FishingService.fish(userId, guildId, isAdmin);
        const { fish, value } = result;

        // Kiểm tra auto-switch bait sau khi câu cá
        let autoSwitchMessage = '';
        try {
            const fishingData = await FishingService.getFishingData(userId, guildId);
            const currentBait = fishingData.baits.find((b: any) => b.baitType === fishingData.currentBait);
            
            // Nếu mồi hiện tại hết, thông báo đã auto-switch
            if (!currentBait || currentBait.quantity <= 0) {
                // Tìm mồi mới được chọn
                const newBait = fishingData.baits.find((b: any) => b.baitType === fishingData.currentBait);
                if (newBait) {
                    const baitData = BAITS[newBait.baitType];
                    autoSwitchMessage = `\n\n🔄 **Tự động chuyển sang mồi:** ${baitData.emoji} ${baitData.name} (${newBait.quantity} còn lại)`;
                }
            }
        } catch (error) {
            console.error('Error checking auto-switch bait:', error);
        }

        // Kiểm tra auto-equip bait (trang bị mồi tự động)
        let autoEquipMessage = '';
        try {
            // So sánh với bait ban đầu để xem có auto-equip không
            if (originalBaitName !== baitName) {
                const baitData = BAITS[fishingData.currentBait];
                const currentBait = fishingData.baits.find((b: any) => b.baitType === fishingData.currentBait);
                if (baitData && currentBait) {
                    autoEquipMessage = `\n\n⚡ **Tự động trang bị mồi:** ${baitData.emoji} ${baitData.name} (${currentBait.quantity} còn lại)`;
                }
            }
        } catch (error) {
            console.error('Error checking auto-equip bait:', error);
        }

        // Kiểm tra auto-switch rod sau khi câu cá
        let autoSwitchRodMessage = '';
        try {
            const fishingData = await FishingService.getFishingData(userId, guildId);
            const currentRod = fishingData.rods.find((r: any) => r.rodType === fishingData.currentRod);
            if (!currentRod || currentRod.durability <= 0) {
                // Tìm cần mới được chọn
                const newRod = fishingData.rods.find((r: any) => r.rodType === fishingData.currentRod);
                if (newRod) {
                    const rodData = FISHING_RODS[newRod.rodType];
                    autoSwitchRodMessage = `\n\n🔄 **Tự động chuyển sang cần câu:** ${rodData.emoji} ${rodData.name} (Độ bền: ${newRod.durability})`;
                }
            }
        } catch (error) {
            console.error('Error checking auto-switch rod:', error);
        }

        // Kiểm tra auto-equip rod (trang bị cần tự động)
        let autoEquipRodMessage = '';
        try {
            if (originalRodName !== rodName) {
                const rodData = FISHING_RODS[fishingData.currentRod];
                const currentRod = fishingData.rods.find((r: any) => r.rodType === fishingData.currentRod);
                if (rodData && currentRod) {
                    autoEquipRodMessage = `\n\n⚡ **Tự động trang bị cần câu:** ${rodData.emoji} ${rodData.name} (Độ bền: ${currentRod.durability})`;
                }
            }
        } catch (error) {
            console.error('Error checking auto-equip rod:', error);
        }

        // Tự động thêm cá huyền thoại vào fish inventory
        let fishInventoryMessage = '';
        if (fish.rarity === 'legendary') {
            try {
                const { FishBreedingService } = await import('@/utils/fish-breeding');
                const { FishInventoryService } = await import('@/utils/fish-inventory');
                
                // Tạo cá trong hệ thống nuôi
                const fishData = {
                    userId,
                    guildId,
                    species: fish.name,
                    level: 1,
                    experience: 0,
                    rarity: 'legendary',
                    value: value, // Sử dụng value từ kết quả câu cá
                    generation: 1,
                    specialTraits: JSON.stringify(['Caught']),
                    status: 'growing',
                };
                
                const createdFish = await prisma.fish.create({ data: fishData });
                
                // Thêm vào fish inventory
                const addResult = await FishInventoryService.addFishToInventory(userId, guildId, createdFish.id);
                
                if (addResult.success) {
                    fishInventoryMessage = '\n\n🐟 **Cá huyền thoại đã được thêm vào rương nuôi!**\nDùng `n.fishbarn` để mở rương nuôi cá.';
                } else {
                    fishInventoryMessage = '\n\n⚠️ **Không thể thêm vào rương nuôi:** ' + addResult.error;
                }
            } catch (error) {
                console.error('Error adding legendary fish to inventory:', error);
                fishInventoryMessage = '\n\n⚠️ **Lỗi khi thêm vào rương nuôi!**';
            }
        }

        const successEmbed = new EmbedBuilder()
            .setTitle("🎣 Câu Cá Thành Công!")
            .setDescription(
                `**${message.author.username}** đã câu được:\n\n` +
                `${fish.emoji} **${fish.name}**\n` +
                `${getRarityEmoji(fish.rarity)} **${getRarityText(fish.rarity)}**\n` +
                `🐟 **Giá trị:** ${value} FishCoin${fishInventoryMessage}${autoSwitchMessage}${autoEquipMessage}${autoSwitchRodMessage}${autoEquipRodMessage}` +
                (isAdmin && fish.rarity === 'legendary' ? '\n\n👑 **Admin đã câu được cá huyền thoại!**' : '')
            )
            .setColor(getRarityColor(fish.rarity))
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();

        // Gửi kết quả dựa trên vai trò - Priority: Achievement > Admin > Top Fisher > Top FishCoin > Top Lose
        if (hasAchievement && achievementEmbed) {
            const finalEmbeds = [achievementEmbed, successEmbed];
            await fishingMsg.edit({ embeds: finalEmbeds });
        } else if (isAdmin && adminEmbed) {
            const finalEmbeds = [adminEmbed, successEmbed];
            await fishingMsg.edit({ embeds: finalEmbeds });
        } else if (isTopFisher && topFisherEmbed) {
            const finalEmbeds = [topFisherEmbed, successEmbed];
            await fishingMsg.edit({ embeds: finalEmbeds });
        } else if (isTopFishCoin && topFishCoinEmbed) {
            const finalEmbeds = [topFishCoinEmbed, successEmbed];
            await fishingMsg.edit({ embeds: finalEmbeds });
        } else if (isTopLose && topLoseEmbed) {
            const finalEmbeds = [topLoseEmbed, successEmbed];
            await fishingMsg.edit({ embeds: finalEmbeds });
        } else {
            await fishingMsg.edit({ embeds: [successEmbed] });
        }
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi câu cá!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    } finally {
        // Xóa trạng thái đang câu cá
        fishingInProgress.delete(userId);
    }
}

async function fish(message: Message) {
    // Redirect to fishWithAnimation for consistency
    return await fishWithAnimation(message);
}

async function showShop(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("🏪 Cửa Hàng Câu Cá")
        .setDescription(
            "**Cần câu:**\n" +
            Object.entries(FISHING_RODS).map(([key, rod]: [string, typeof FISHING_RODS[string]]) =>
                `${rod.emoji} **${rod.name}** - ${rod.price}🐟 | Độ bền: ${rod.durability} | Bonus: +${rod.rarityBonus}%`
            ).join("\n") +
            "\n\n**Mồi:**\n" +
            Object.entries(BAITS).map(([key, bait]: [string, typeof BAITS[string]]) =>
                `${bait.emoji} **${bait.name}** - ${bait.price}🐟 | Bonus: +${bait.rarityBonus}%`
            ).join("\n") +
            "\n\n**Mua:** `n.fishing buy <loại> <số lượng>`\n" +
            "Ví dụ: `n.fishing buy copper 1` hoặc `n.fishing buy good 5`\n" +
            "\n**Hoặc sử dụng Shop UI bên dưới để mua dễ dàng hơn!**"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    // Tạo nút mở shop UI
    const row = {
        type: 1 as const,
        components: [
            {
                type: 2 as const,
                style: 1 as const, // Primary button
                label: "🛒 Mở Shop UI",
                custom_id: JSON.stringify({
                    n: "FishingShop",
                    d: { action: "shop" }
                })
            }
        ]
    };

    await message.reply({ embeds: [embed], components: [row] });
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
                    `🐟 **Giá:** ${rod.price} FishCoin\n` +
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
                    `🐟 **Tổng giá:** ${result.totalCost} FishCoin\n` +
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
                `🐟 **Giá hiện tại:** ${result.currentPrice} FishCoin\n` +
                `💵 **Tổng giá:** ${result.totalValue} FishCoin`
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

        // Tạo thông tin cần câu và mồi
        let rodInfo = "Không có";
        let baitInfo = "Không có";
        
        if (fishingData.currentRod && fishingData.currentRod !== "") {
            const currentRod = fishingData.rods.find((r: any) => r.rodType === fishingData.currentRod);
            if (currentRod) {
                const rodData = FISHING_RODS[fishingData.currentRod];
                rodInfo = `${rodData.emoji} **${rodData.name}** (Độ bền: ${currentRod.durability})`;
            }
        }
        
        if (fishingData.currentBait && fishingData.currentBait !== "") {
            const currentBait = fishingData.baits.find((b: any) => b.baitType === fishingData.currentBait);
            if (currentBait) {
                const baitData = BAITS[fishingData.currentBait];
                baitInfo = `${baitData.emoji} **${baitData.name}** (Số lượng: ${currentBait.quantity})`;
            }
        }

        // Lọc ra chỉ cá thường (không phải legendary)
        const normalFish = fishingData.fish.filter((f: any) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            return fishInfo && fishInfo.rarity !== 'legendary';
        });

        const embed = new EmbedBuilder()
            .setTitle("🎒 Túi Đồ Câu Cá")
            .setDescription(`**${message.author.username}**\n\n` +
                `🎣 **Cần câu hiện tại:** ${rodInfo}\n` +
                `🪱 **Mồi hiện tại:** ${baitInfo}\n\n` +
                `**Cá đã bắt:**\n` +
                                 (normalFish.length > 0 
                     ? normalFish.map((f: any) => 
                         `${FISH_LIST.find(fish => fish.name === f.fishName)?.emoji || "🐟"} **${f.fishName}** x${f.quantity} (${f.fishValue} FishCoin)`
                     ).join("\n")
                     : "Chưa có cá nào"
                 )
            )
            .setColor(config.embedColor)
            .setTimestamp();

        // Tạo components với nút bán nhanh cho từng loại cá (giới hạn 5 components)
        const components = [];
        if (normalFish.length > 0) {
            // Chỉ hiển thị tối đa 4 loại cá để tránh vượt quá giới hạn 5 components
            const fishToShow = normalFish.slice(0, 4);
            
            for (let i = 0; i < fishToShow.length; i += 2) {
                const row = {
                    type: 1 as const,
                    components: fishToShow.slice(i, i + 2).map((f: any) => ({
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
                components.push(row);
            }
        }

        // Thêm nút quản lý trang bị (nếu chưa đủ 5 components)
        if (components.length < 5) {
            const manageRow = {
                type: 1 as const,
                components: [
                    {
                        type: 2 as const,
                        style: 2 as const, // Secondary button
                        label: "⚙️ Quản Lý Trang Bị",
                        custom_id: JSON.stringify({
                            n: "FishingShop",
                            d: { action: "manage" }
                        }),
                        emoji: { name: "⚙️" }
                    }
                ]
            };
            components.push(manageRow);
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
                `🐟 **Tổng thu nhập:** ${fishingData.totalEarnings} FishCoin\n` +
                `🐟 **Cá lớn nhất:** ${fishingData.biggestFish || "Chưa có"} (${fishingData.biggestValue} FishCoin)\n` +
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
            "**Xem giá cá:** `n.fishing price` hoặc `n.fishing price <tên cá>`\n" +
            "**Set cần câu:** `n.fishing setrod <loại>`\n" +
            "**Set mồi:** `n.fishing setbait <loại>`\n" +
            "**Xem túi đồ:** `n.fishing inv` hoặc `n.fishing inventory`\n" +
            "**Xem thống kê:** `n.fishing stats`\n\n" +
            "**Ví dụ:**\n" +
            "• `n.fishing` - Câu cá với animation\n" +
            "• `n.fishing fish` - Câu cá với animation\n" +
            "• `n.fishing buy copper 1` - Mua cần câu đồng\n" +
            "• `n.fishing buy good 5` - Mua 5 mồi ngon\n" +
            "• `n.fishing price` - Xem tất cả giá cá hiện tại\n" +
            "• `n.fishing price \"Cá rô phi\"` - Xem giá cá rô phi\n" +
            "• `n.fishing setrod copper` - Set cần câu đồng làm cần hiện tại\n" +
            "• `n.fishing setbait good` - Set mồi ngon làm mồi hiện tại\n" +
            "• `n.fishing sell \"Cá rô phi\" 1` - Bán 1 con cá rô phi\n\n" +
            "**Lưu ý:**\n" +
            "• **Bạn cần mua cần câu và mồi trước khi câu cá!**\n" +
                            "• Mỗi lần câu tốn 10 FishCoin\n" +
            "• Cooldown 30 giây giữa các lần câu\n" +
            "• Animation câu cá kéo dài 3 giây\n" +
            "• Cần câu và mồi tốt hơn sẽ tăng tỷ lệ bắt cá hiếm\n" +
            "• Cần câu có độ bền, mồi có số lượng giới hạn\n" +
            "• Khi hết độ bền hoặc mồi, bạn cần mua mới\n" +
            "• **Giá cá thay đổi mỗi 10 phút với biến động ±10%**\n" +
            "• Trong túi đồ có nút \"Bán tất cả\" để bán toàn bộ số lượng cá nhanh\n\n" +
            "**📋 Phân biệt các loại cá:**\n" +
            "• **Cá thường (Common/Rare/Epic):** Hiển thị trong `n.fishing inventory`\n" +
            "• **Cá huyền thoại (Legendary):** Chỉ hiển thị trong `n.fishbarn` (rương nuôi cá)\n" +
            "• **Cá huyền thoại không xuất hiện trong `n.fishing inventory`**"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function setCurrentRod(message: Message, args: string[]) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.fishing setrod <loại cần câu>`");
    }

    const rodType = args[0].toLowerCase();

    try {
        const rod = await FishingService.setCurrentRod(userId, guildId, rodType);
        const rodInfo = FISHING_RODS[rodType];
        const embed = new EmbedBuilder()
            .setTitle("✅ Đã Set Cần Câu!")
            .setDescription(
                `**${message.author.username}** đã set:\n\n` +
                `${rodInfo.emoji} **${rodInfo.name}** làm cần câu hiện tại\n` +
                `🔧 **Độ bền còn lại:** ${rod.durability}\n` +
                `📈 **Tăng tỷ lệ hiếm:** +${rodInfo.rarityBonus}%`
            )
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi set cần câu!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function setCurrentBait(message: Message, args: string[]) {
    const userId = message.author.id;
    const guildId = message.guildId!;

    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.fishing setbait <loại mồi>`");
    }

    const baitType = args[0].toLowerCase();

    try {
        const bait = await FishingService.setCurrentBait(userId, guildId, baitType);
        const baitInfo = BAITS[baitType];
        const embed = new EmbedBuilder()
            .setTitle("✅ Đã Set Mồi!")
            .setDescription(
                `**${message.author.username}** đã set:\n\n` +
                `${baitInfo.emoji} **${baitInfo.name}** làm mồi hiện tại\n` +
                `📦 **Số lượng còn lại:** ${bait.quantity}\n` +
                `📈 **Tăng tỷ lệ hiếm:** +${baitInfo.rarityBonus}%`
            )
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi set mồi!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function showFishPrices(message: Message, args: string[]) {
    try {
        // Import FishPriceService
        const { FishPriceService } = await import("@/utils/fishing");
        
        if (args.length > 0) {
            // Xem giá của một loại cá cụ thể
            const fishName = args.join(" ");
            
            // Kiểm tra xem có phải cá huyền thoại không
            const legendaryFish = FISH_LIST.find(f => f.name === fishName);
            if (legendaryFish && legendaryFish.rarity === 'legendary') {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("✨ Cá Huyền Thoại")
                    .setDescription(
                        `**${fishName}** là cá huyền thoại và chỉ có thể bán trong rương nuôi cá!\n\n` +
                        `🐟 **Sử dụng:** \`n.fishbarn\` để mở rương nuôi cá\n` +
                        `💰 **Giá trị:** Cá huyền thoại có giá trị cố định và không biến động\n` +
                        `🎣 **Cách có:** Chỉ có thể câu được cá huyền thoại khi câu cá`
                    )
                    .setColor("#FFD700")
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }
            
            const fishPriceInfo = await FishPriceService.getFishPriceInfo(fishName);
            
            if (!fishPriceInfo) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Không tìm thấy")
                    .setDescription(`Không tìm thấy thông tin giá của **${fishName}**`)
                    .setColor("#ff0000")
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            const fishInfo = FISH_LIST.find(f => f.name === fishName);
            const changeEmoji = fishPriceInfo.changePercent > 0 ? "📈" : fishPriceInfo.changePercent < 0 ? "📉" : "➡️";
            const changeColor = fishPriceInfo.changePercent > 0 ? "#00ff00" : fishPriceInfo.changePercent < 0 ? "#ff0000" : "#ffff00";

            const embed = new EmbedBuilder()
                .setTitle(`${fishInfo?.emoji || "🐟"} Giá ${fishName}`)
                .setDescription(
                                    `**Giá hiện tại:** ${fishPriceInfo.currentPrice} FishCoin\n` +
                `**Giá gốc:** ${fishPriceInfo.basePrice} FishCoin\n` +
                    `**Thay đổi:** ${changeEmoji} ${fishPriceInfo.priceChange > 0 ? "+" : ""}${fishPriceInfo.priceChange} (${fishPriceInfo.changePercent > 0 ? "+" : ""}${fishPriceInfo.changePercent.toFixed(1)}%)\n` +
                    `**Cập nhật lúc:** ${fishPriceInfo.lastUpdated.toLocaleString("vi-VN")}`
                )
                .setColor(changeColor)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } else {
            // Xem tất cả giá cá
            const allPrices = await FishPriceService.getAllFishPrices();
            
            if (allPrices.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Không có dữ liệu")
                    .setDescription("Chưa có thông tin giá cá. Hệ thống sẽ tự động khởi tạo.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            // Nhóm theo rarity
            const commonFish = allPrices.filter(p => {
                const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                return fishInfo?.rarity === "common";
            });
            
            const rareFish = allPrices.filter(p => {
                const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                return fishInfo?.rarity === "rare";
            });
            
            const epicFish = allPrices.filter(p => {
                const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                return fishInfo?.rarity === "epic";
            });
            
            const legendaryFishPrices = allPrices.filter(p => {
                const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                return fishInfo?.rarity === "legendary";
            });

            const embed = new EmbedBuilder()
                .setTitle("💰 Bảng Giá Cá Hiện Tại")
                .setDescription(
                    `**Cập nhật lúc:** ${new Date().toLocaleString("vi-VN")}\n\n` +
                    `**🐟 Cá thường:**\n` +
                    commonFish.map(p => {
                        const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                        const changeEmoji = p.changePercent > 0 ? "📈" : p.changePercent < 0 ? "📉" : "➡️";
                        return `${fishInfo?.emoji || "🐟"} **${p.fishName}:** ${p.currentPrice} (${p.changePercent > 0 ? "+" : ""}${p.changePercent.toFixed(1)}%) ${changeEmoji}`;
                    }).join("\n") +
                    `\n\n**🐠 Cá hiếm:**\n` +
                    rareFish.map(p => {
                        const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                        const changeEmoji = p.changePercent > 0 ? "📈" : p.changePercent < 0 ? "📉" : "➡️";
                        return `${fishInfo?.emoji || "🐠"} **${p.fishName}:** ${p.currentPrice} (${p.changePercent > 0 ? "+" : ""}${p.changePercent.toFixed(1)}%) ${changeEmoji}`;
                    }).join("\n") +
                    `\n\n**🦈 Cá quý hiếm:**\n` +
                    epicFish.map(p => {
                        const fishInfo = FISH_LIST.find(f => f.name === p.fishName);
                        const changeEmoji = p.changePercent > 0 ? "📈" : p.changePercent < 0 ? "📉" : "➡️";
                        return `${fishInfo?.emoji || "🦈"} **${p.fishName}:** ${p.currentPrice} (${p.changePercent > 0 ? "+" : ""}${p.changePercent.toFixed(1)}%) ${changeEmoji}`;
                    }).join("\n") +
                    `\n\n**✨ Cá huyền thoại:**\n` +
                    `*Cá huyền thoại chỉ có thể bán trong rương nuôi cá (\`n.fishbarn\`)*\n` +
                    `*Giá trị cố định, không biến động theo thị trường*` +
                    `\n\n**💡 Lưu ý:** Giá cá thay đổi mỗi 10 phút với biến động ±10%`
                )
                .setColor("#0099ff")
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }
    } catch (error: any) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(error.message || "Đã xảy ra lỗi khi xem giá cá!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
} 