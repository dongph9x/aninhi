import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { Bot } from "@/classes";
import { FishMarketService } from "@/utils/fish-market";
import { FishInventoryService } from "@/utils/fish-inventory";
import { ecommerceDB } from "@/utils/ecommerce-db";
import { FishMarketUI } from "@/components/MessageComponent/FishMarketUI";
import { FishMarketHandler } from "@/components/MessageComponent/FishMarketHandler";

export default Bot.createCommand({
    structure: {
        name: "fishmarket",
        aliases: ["market", "fm"],
    },
    options: {
        cooldown: 3000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const args = message.content.split(" ").slice(1);
        const guildId = message.guildId!;
        const userId = message.author.id;

        if (args.length === 0) {
            return await showMarketListings(message, guildId);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "help":
                return await showMarketHelp(message);
            case "list":
            case "browse":
                return await showMarketListings(message, guildId, parseInt(args[1]) || 1);
            case "sell":
                return await sellFish(message, userId, guildId, args.slice(1));
            case "buy":
                return await buyFish(message, userId, guildId, args.slice(1));
            case "cancel":
                return await cancelListing(message, userId, guildId, args.slice(1));
            case "my":
            case "mylistings":
                return await showUserListings(message, userId, guildId);
            case "search":
                return await searchFish(message, guildId, args.slice(1));
            case "filter":
                return await filterFish(message, guildId, args.slice(1));
            case "stats":
                return await showMarketStats(message, guildId);
            case "ui":
                return await showMarketUI(message, userId, guildId);
            default:
                return await showMarketListings(message, guildId);
        }
    },
});

async function showMarketUI(message: any, userId: string, guildId: string) {
    try {
        // Lấy dữ liệu
        const result = await FishMarketService.getMarketListings(guildId, 1, 5);
        const userListings = await FishMarketService.getUserListings(userId, guildId);
        const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
        const listedFishIds = await FishMarketService.getListedFishIds(guildId);

        // Tạo UI
        const ui = new FishMarketUI(
            result.listings,
            userListings,
            userInventory,
            userId,
            guildId,
            1,
            result.totalPages,
            'browse',
            '',
            {},
            listedFishIds
        );
        const embed = ui.createEmbed();
        const components = ui.createComponents();

        // Gửi message
        const sentMessage = await message.reply({
            embeds: [embed],
            components: components
        });

        // Lưu message data để xử lý interaction
        FishMarketHandler.setMessageData(sentMessage.id, {
            userId,
            guildId,
            listings: result.listings,
            userListings,
            userInventory,
            currentPage: 1,
            totalPages: result.totalPages,
            mode: 'browse',
            searchQuery: '',
            filterOptions: {},
            listedFishIds
        });

    } catch (error) {
        console.error('Error showing market UI:', error);
        message.reply('❌ Có lỗi xảy ra khi mở giao diện market!');
    }
}

async function showMarketHelp(message: any) {
    const embed = new EmbedBuilder()
        .setTitle("🏪 Hướng Dẫn Sử Dụng Fish Market")
        .setColor("#4ECDC4")
        .setDescription("Hệ thống mua bán cá đấu - nơi giao dịch cá thế hệ 2+ trưởng thành")
        .addFields(
            { name: "📋 Xem danh sách", value: "`n.fishmarket` hoặc `n.fishmarket list [trang]`", inline: true },
            { name: "💰 Treo bán cá", value: "`n.fishmarket sell <fish_id> <giá> [thời_gian_giờ]`", inline: true },
            { name: "🛒 Mua cá", value: "`n.fishmarket buy <fish_id>`", inline: true },
            { name: "❌ Hủy bán", value: "`n.fishmarket cancel <fish_id>`", inline: true },
            { name: "📊 Cá của tôi", value: "`n.fishmarket my`", inline: true },
            { name: "🔍 Tìm kiếm", value: "`n.fishmarket search <tên_cá>`", inline: true },
            { name: "🎯 Lọc cá", value: "`n.fishmarket filter [gen] [min_price] [max_price]`", inline: true },
            { name: "📈 Thống kê", value: "`n.fishmarket stats`", inline: true }
        )
        .addFields(
            { name: "📝 Ví dụ", value: 
                "• `n.fishmarket sell cmd123 50000 48` - Bán cá với giá 50k trong 48h\n" +
                "• `n.fishmarket buy cmd456` - Mua cá có ID cmd456\n" +
                "• `n.fishmarket search Little` - Tìm cá có tên chứa 'Little'\n" +
                "• `n.fishmarket filter 2 10000 100000` - Lọc cá gen 2, giá 10k-100k"
            }
        )
        .addFields(
            { name: "⚠️ Lưu ý", value: 
                "• Chỉ cá thế hệ 2+ và trưởng thành mới được bán\n" +
                "• Cá trong túi đấu không thể bán\n" +
                "• Listing tự động hết hạn sau 24h (mặc định)\n" +
                "• Không thể mua cá của chính mình"
            }
        )
        .setTimestamp();

    return message.reply({ embeds: [embed] });
}

async function showMarketListings(message: any, guildId: string, page: number = 1) {
    try {
        const result = await FishMarketService.getMarketListings(guildId, page, 5);
        
        if (result.listings.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("🏪 Fish Market")
                .setColor("#FF6B6B")
                .setDescription("Hiện tại không có cá nào đang bán trong market!")
                .addFields(
                    { name: "💡 Gợi ý", value: "Sử dụng `n.fishmarket sell <fish_id> <giá>` để treo bán cá của bạn!" }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("🏪 Fish Market")
            .setColor("#4ECDC4")
            .setDescription(`**${result.total}** cá đang bán trong market (Trang ${page}/${result.totalPages})`);

        for (const listing of result.listings) {
            const fish = listing.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
            
            embed.addFields({
                name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()}`,
                value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity} | **Còn lại:** ${timeLeft}h\n` +
                       `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
                       `**ID:** \`${fish.id}\` | **Người bán:** <@${listing.sellerId}>`,
                inline: false
            });
        }

        // Tạo buttons cho navigation
        const buttons = new ActionRowBuilder<ButtonBuilder>();
        
        if (page > 1) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`market_prev_${page - 1}`)
                    .setLabel('◀️ Trước')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        
        if (page < result.totalPages) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`market_next_${page + 1}`)
                    .setLabel('Tiếp ▶️')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        const components = buttons.components.length > 0 ? [buttons] : [];

        return message.reply({ embeds: [embed], components });

    } catch (error) {
        console.error('Error showing market listings:', error);
        return message.reply('❌ Có lỗi xảy ra khi tải danh sách market!');
    }
}

async function sellFish(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length < 2) {
        return message.reply('❌ Cách dùng: `n.fishmarket sell <fish_id> <giá> [thời_gian_giờ]`\nVí dụ: `n.fishmarket sell cmd123 50000 48`');
    }

    const fishId = args[0];
    const price = parseInt(args[1]);
    const duration = args[2] ? parseInt(args[2]) : 24;

    if (isNaN(price) || price <= 0) {
        return message.reply('❌ Giá phải là số dương!');
    }

    if (isNaN(duration) || duration <= 0 || duration > 168) {
        return message.reply('❌ Thời gian phải từ 1-168 giờ (7 ngày)!');
    }

    try {
        const result = await FishMarketService.listFish(userId, guildId, fishId, price, duration);
        
        if (result.success) {
            const fish = result.listing.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            
            const embed = new EmbedBuilder()
                .setTitle("✅ Đã treo bán cá thành công!")
                .setColor("#51CF66")
                .setDescription(`🐟 **${fish.name}** đã được đưa lên market`)
                .addFields(
                    { name: "💰 Giá bán", value: `${price.toLocaleString()} coins`, inline: true },
                    { name: "⏰ Thời gian", value: `${duration} giờ`, inline: true },
                    { name: "📊 Thông tin cá", value: `Level: ${fish.level} | Gen: ${fish.generation} | Power: ${totalPower}`, inline: true },
                    { name: "📈 Stats", value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`, inline: false },
                    { name: "🆔 Fish ID", value: `\`${fish.id}\``, inline: false }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("❌ Không thể treo bán cá!")
                .setColor("#FF6B6B")
                .setDescription(result.error)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error selling fish:', error);
        return message.reply('❌ Có lỗi xảy ra khi treo bán cá!');
    }
}

async function buyFish(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length === 0) {
        return message.reply('❌ Cách dùng: `n.fishmarket buy <fish_id>`');
    }

    const fishId = args[0];

    try {
        const result = await FishMarketService.buyFish(userId, guildId, fishId);
        
        if (result.success) {
            const fish = result.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            
            const embed = new EmbedBuilder()
                .setTitle("🛒 Mua cá thành công!")
                .setColor("#51CF66")
                .setDescription(`🐟 **${fish.name}** đã được thêm vào inventory của bạn`)
                .addFields(
                    { name: "💰 Giá đã trả", value: `${result.price.toLocaleString()} coins`, inline: true },
                    { name: "📊 Thông tin cá", value: `Level: ${fish.level} | Gen: ${fish.generation} | Power: ${totalPower}`, inline: true },
                    { name: "📈 Stats", value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`, inline: false }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("❌ Không thể mua cá!")
                .setColor("#FF6B6B")
                .setDescription(result.error)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error buying fish:', error);
        return message.reply('❌ Có lỗi xảy ra khi mua cá!');
    }
}

async function cancelListing(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length === 0) {
        return message.reply('❌ Cách dùng: `n.fishmarket cancel <fish_id>`');
    }

    const fishId = args[0];

    try {
        const result = await FishMarketService.cancelListing(userId, guildId, fishId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle("✅ Đã hủy listing!")
                .setColor("#51CF66")
                .setDescription("Cá đã được gỡ khỏi market và trả về inventory của bạn.")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("❌ Không thể hủy listing!")
                .setColor("#FF6B6B")
                .setDescription(result.error)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error canceling listing:', error);
        return message.reply('❌ Có lỗi xảy ra khi hủy listing!');
    }
}

async function showUserListings(message: any, userId: string, guildId: string) {
    try {
        const listings = await FishMarketService.getUserListings(userId, guildId);
        
        if (listings.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("📊 Cá của tôi trên Market")
                .setColor("#FF6B6B")
                .setDescription("Bạn chưa có cá nào đang bán trên market!")
                .addFields(
                    { name: "💡 Gợi ý", value: "Sử dụng `n.fishmarket sell <fish_id> <giá>` để treo bán cá!" }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 Cá của tôi trên Market")
            .setColor("#4ECDC4")
            .setDescription(`**${listings.length}** cá đang bán`);

        for (const listing of listings) {
            const fish = listing.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
            const isExpired = timeLeft <= 0;
            
            embed.addFields({
                name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()} ${isExpired ? '⏰ HẾT HẠN' : ''}`,
                value: `**Power:** ${totalPower} | **Còn lại:** ${isExpired ? 'Hết hạn' : `${timeLeft}h`}\n` +
                       `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
                       `**ID:** \`${fish.id}\` | **Hủy:** \`n.fishmarket cancel ${fish.id}\``,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error showing user listings:', error);
        return message.reply('❌ Có lỗi xảy ra khi tải danh sách cá của bạn!');
    }
}

async function searchFish(message: any, guildId: string, args: string[]) {
    if (args.length === 0) {
        return message.reply('❌ Cách dùng: `n.fishmarket search <tên_cá>`');
    }

    const query = args.join(' ');

    try {
        const result = await FishMarketService.searchFish(guildId, query, 1, 5);
        
        if (result.listings.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("🔍 Kết quả tìm kiếm")
                .setColor("#FF6B6B")
                .setDescription(`Không tìm thấy cá nào có tên chứa "${query}"`)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🔍 Kết quả tìm kiếm: "${query}"`)
            .setColor("#4ECDC4")
            .setDescription(`Tìm thấy **${result.total}** kết quả`);

        for (const listing of result.listings) {
            const fish = listing.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            
            embed.addFields({
                name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()}`,
                value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity}\n` +
                       `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
                       `**ID:** \`${fish.id}\` | **Mua:** \`n.fishmarket buy ${fish.id}\``,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error searching fish:', error);
        return message.reply('❌ Có lỗi xảy ra khi tìm kiếm!');
    }
}

async function filterFish(message: any, guildId: string, args: string[]) {
    const generation = args[0] ? parseInt(args[0]) : undefined;
    const minPrice = args[1] ? parseInt(args[1]) : undefined;
    const maxPrice = args[2] ? parseInt(args[2]) : undefined;

    if (generation && (generation < 1 || generation > 10)) {
        return message.reply('❌ Thế hệ phải từ 1-10!');
    }

    if (minPrice && minPrice < 0) {
        return message.reply('❌ Giá tối thiểu phải >= 0!');
    }

    if (maxPrice && maxPrice < 0) {
        return message.reply('❌ Giá tối đa phải >= 0!');
    }

    if (minPrice && maxPrice && minPrice > maxPrice) {
        return message.reply('❌ Giá tối thiểu không thể lớn hơn giá tối đa!');
    }

    try {
        const result = await FishMarketService.filterFish(guildId, generation, minPrice, maxPrice, 1, 5);
        
        if (result.listings.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("🎯 Kết quả lọc")
                .setColor("#FF6B6B")
                .setDescription("Không tìm thấy cá nào phù hợp với điều kiện lọc")
                .addFields(
                    { name: "🔍 Điều kiện", value: 
                        `Thế hệ: ${generation || 'Tất cả'} | ` +
                        `Giá: ${minPrice ? minPrice.toLocaleString() : '0'} - ${maxPrice ? maxPrice.toLocaleString() : '∞'}`
                    }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎯 Kết quả lọc")
            .setColor("#4ECDC4")
            .setDescription(`Tìm thấy **${result.total}** kết quả phù hợp`);

        for (const listing of result.listings) {
            const fish = listing.fish;
            const stats = fish.stats || {};
            const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            
            embed.addFields({
                name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()}`,
                value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity}\n` +
                       `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
                       `**ID:** \`${fish.id}\` | **Mua:** \`n.fishmarket buy ${fish.id}\``,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error filtering fish:', error);
        return message.reply('❌ Có lỗi xảy ra khi lọc cá!');
    }
}

async function showMarketStats(message: any, guildId: string) {
    try {
        const stats = await FishMarketService.getMarketStats(guildId);
        
        const embed = new EmbedBuilder()
            .setTitle("📈 Thống Kê Fish Market")
            .setColor("#4ECDC4")
            .addFields(
                { name: "📊 Tổng số cá đang bán", value: `${stats.totalListings}`, inline: true },
                { name: "💰 Tổng giá trị", value: `${stats.totalValue.toLocaleString()} coins`, inline: true },
                { name: "📊 Giá trung bình", value: `${stats.averagePrice.toLocaleString()} coins`, inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error showing market stats:', error);
        return message.reply('❌ Có lỗi xảy ra khi tải thống kê!');
    }
} 