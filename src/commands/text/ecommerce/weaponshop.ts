import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { Bot } from "@/classes";
import { FishCoinService } from "@/utils/fish-coin";
import { WeaponService } from "@/utils/weapon";

export default Bot.createCommand({
    structure: {
        name: "weaponshop",
        aliases: ["weapon", "weapons", "fishweapon", "fishweapons"],
    },
    options: {
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;
        const userId = message.author.id;

        try {
            // Xử lý subcommand
            const subcommand = args[0]?.toLowerCase();

            if (!subcommand || subcommand === "shop" || subcommand === "list") {
                await showWeaponShop(message, guildId, userId);
            } else if (subcommand === "buy" || subcommand === "purchase") {
                const weaponId = args[1];
                const quantity = parseInt(args[2]) || 1;
                await buyWeapon(message, guildId, userId, weaponId, quantity);
            } else if (subcommand === "inventory" || subcommand === "inv") {
                await showWeaponInventory(message, guildId, userId);
            } else if (subcommand === "equip") {
                const weaponId = args[1];
                await equipWeapon(message, guildId, userId, weaponId);
            } else if (subcommand === "unequip") {
                await unequipWeapon(message, guildId, userId);
            } else if (subcommand === "info") {
                const weaponId = args[1];
                await showWeaponInfo(message, guildId, userId, weaponId);
            } else if (subcommand === "help") {
                await showHelp(message);
            } else {
                await showHelp(message);
            }
        } catch (error) {
            console.error("Error in weaponshop command:", error);
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi truy cập weapon shop!")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

async function showWeaponShop(message: any, guildId: string, userId: string) {
    const embed = new EmbedBuilder()
        .setTitle("⚔️ Fish Weapon Shop")
        .setColor("#ff6b6b")
        .setDescription("Cửa hàng vũ khí cho cá - Tăng sức mạnh cho cá của bạn!")
        .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
        .setTimestamp();

    // Lấy FishCoin balance của user
    const balance = await FishCoinService.getFishBalance(userId, guildId);
    embed.addFields({ name: "🐟 FishCoin Balance", value: `${balance.toLocaleString()} FishCoin`, inline: false });

    // Danh sách vũ khí có sẵn
    const weapons = WeaponService.getAllWeapons();
    
    // Tạo dropdown options với emoji đúng
    const options = weapons.map(weapon => {
        const canAfford = balance >= weapon.price;
        const emoji = getWeaponEmoji(weapon.type, weapon.id);
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${weapon.name} - ${weapon.price.toLocaleString()} FishCoin`)
            .setDescription(`${weapon.description} ${canAfford ? '✅' : '❌'}`)
            .setValue(weapon.id)
            .setEmoji(emoji);
    });

    // Tạo select menu
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('weapon_shop_buy_select')
        .setPlaceholder('Chọn vũ khí để mua...')
        .addOptions(options);

    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    // Tạo buttons
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('weapon_shop_inventory')
                .setLabel('🎒 Kho Vũ Khí')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('weapon_shop_equip')
                .setLabel('⚔️ Trang Bị')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('weapon_shop_help')
                .setLabel('❓ Trợ Giúp')
                .setStyle(ButtonStyle.Secondary)
        );

    // Thêm footer
    embed.setFooter({
        text: "Fish Weapon Shop - Tăng sức mạnh cho cá của bạn!",
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed], components: [selectRow, buttonRow] });
}

async function buyWeapon(message: any, guildId: string, userId: string, weaponId: string, quantity: number) {
    if (!weaponId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Vui lòng nhập ID vũ khí muốn mua!\nVí dụ: `n.weaponshop buy sword 1`")
            .setColor("#ff0000");
        return message.reply({ embeds: [errorEmbed] });
    }

    if (quantity <= 0 || quantity > 10) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Số lượng phải từ 1-10!")
            .setColor("#ff0000");
        return message.reply({ embeds: [errorEmbed] });
    }

    try {
        const weapons = WeaponService.getAllWeapons();
        const weapon = weapons.find(w => w.id === weaponId.toLowerCase());

        if (!weapon) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(`Không tìm thấy vũ khí với ID: \`${weaponId}\`\nSử dụng \`n.weaponshop\` để xem danh sách vũ khí`)
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        const totalCost = weapon.price * BigInt(quantity);
        const balance = await FishCoinService.getFishBalance(userId, guildId);

        if (balance < totalCost) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không đủ FishCoin")
                .setDescription(`Bạn cần ${totalCost.toLocaleString()} FishCoin để mua ${quantity}x ${weapon.name}\nHiện tại: ${balance.toLocaleString()} FishCoin`)
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        // Thực hiện mua với FishCoin
        await FishCoinService.subtractFishCoin(userId, guildId, totalCost, `Mua ${quantity}x ${weapon.name}`);
        
        // Thêm vũ khí vào inventory của user
        await WeaponService.addWeaponToInventory(userId, guildId, weaponId, quantity);

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Mua thành công!")
            .setColor("#00ff00")
            .setDescription(`🎉 Đã mua thành công **${quantity}x ${weapon.name}**\n🐟 Chi phí: ${totalCost.toLocaleString()} FishCoin\n💳 Balance còn lại: ${(balance - totalCost).toLocaleString()} FishCoin`)
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .addFields(
                { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
                { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
                { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}`, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [successEmbed] });

    } catch (error) {
        console.error("Error buying weapon:", error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Có lỗi xảy ra khi mua vũ khí!")
            .setColor("#ff0000");
        message.reply({ embeds: [errorEmbed] });
    }
}

async function showWeaponInventory(message: any, guildId: string, userId: string) {
    const embed = new EmbedBuilder()
        .setTitle("🎒 Kho Vũ Khí")
        .setColor("#ff6b6b")
        .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
        .setTimestamp();

    // Lấy inventory vũ khí của user
    const inventory = await WeaponService.getUserWeaponInventory(userId, guildId);
    const equippedWeapon = await WeaponService.getEquippedWeapon(userId, guildId);
    
    if (inventory.length === 0) {
        embed.setDescription("🎒 **Kho vũ khí của bạn:**\n\n📭 Kho vũ khí trống!\n\n💡 Sử dụng `n.weaponshop` để mua vũ khí");
        return message.reply({ embeds: [embed] });
    }

    let inventoryText = "**Vũ khí của bạn:**\n\n";
    
    inventory.forEach((item, index) => {
        const weapon = WeaponService.getWeaponById(item.weaponId);
        if (!weapon) return;

        const emoji = getWeaponEmoji(weapon.type, weapon.id);
        const equippedStatus = item.isEquipped ? " ⚔️ **ĐANG TRANG BỊ**" : "";
        
        inventoryText += `${index + 1}. ${emoji} **${weapon.name}**${equippedStatus}\n`;
        inventoryText += `   📦 Số lượng: ${item.quantity}\n`;
        inventoryText += `   ⚔️ Sức mạnh: +${weapon.power} ATK\n`;
        inventoryText += `   🛡️ Phòng thủ: +${weapon.defense} DEF\n`;
        inventoryText += `   🎯 Độ chính xác: +${weapon.accuracy}\n`;
        inventoryText += `   ⭐ Hiếm: ${weapon.rarity}\n\n`;
    });

    if (equippedWeapon) {
        const equippedWeaponInfo = WeaponService.getWeaponById(equippedWeapon.weaponId);
        if (equippedWeaponInfo) {
            inventoryText += "⚔️ **Vũ khí đang trang bị:**\n";
            inventoryText += `${getWeaponEmoji(equippedWeaponInfo.type, equippedWeaponInfo.id)} **${equippedWeaponInfo.name}**\n`;
            inventoryText += `   ⚔️ +${equippedWeaponInfo.power} ATK | 🛡️ +${equippedWeaponInfo.defense} DEF | 🎯 +${equippedWeaponInfo.accuracy}\n\n`;
        }
    }

    inventoryText += "💡 **Lệnh hữu ích:**\n";
    inventoryText += "• `n.weaponshop equip <weapon_id>` - Trang bị vũ khí\n";
    inventoryText += "• `n.weaponshop unequip` - Gỡ trang bị\n";
    inventoryText += "• `n.weaponshop info <weapon_id>` - Xem thông tin vũ khí";

    embed.setDescription(inventoryText);

    message.reply({ embeds: [embed] });
}

async function equipWeapon(message: any, guildId: string, userId: string, weaponId: string) {
    if (!weaponId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Vui lòng nhập ID vũ khí muốn trang bị!\nVí dụ: `n.weaponshop equip sword`")
            .setColor("#ff0000");
        return message.reply({ embeds: [errorEmbed] });
    }

    try {
        const success = await WeaponService.equipWeapon(userId, guildId, weaponId);
        
        if (!success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(`Bạn không có vũ khí **${weaponId}**!\nSử dụng \`n.weaponshop inventory\` để xem kho vũ khí`)
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        const weapon = WeaponService.getWeaponById(weaponId);
        if (!weapon) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(`Không tìm thấy thông tin vũ khí **${weaponId}**!`)
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚔️ Trang Bị Thành Công!")
            .setColor("#00ff00")
            .setDescription(`🎯 Đã trang bị thành công **${weapon.name}**!`)
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .addFields(
                { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
                { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
                { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}`, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Error equipping weapon:", error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Có lỗi xảy ra khi trang bị vũ khí!")
            .setColor("#ff0000");
        message.reply({ embeds: [errorEmbed] });
    }
}

async function unequipWeapon(message: any, guildId: string, userId: string) {
    try {
        const success = await WeaponService.unequipWeapon(userId, guildId);
        
        if (!success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Bạn chưa trang bị vũ khí nào!")
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        const embed = new EmbedBuilder()
            .setTitle("🛡️ Gỡ Trang Bị Thành Công!")
            .setColor("#ff6b6b")
            .setDescription("✅ Đã gỡ trang bị vũ khí thành công!")
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .setTimestamp();

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Error unequipping weapon:", error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Có lỗi xảy ra khi gỡ trang bị vũ khí!")
            .setColor("#ff0000");
        message.reply({ embeds: [errorEmbed] });
    }
}

async function showWeaponInfo(message: any, guildId: string, userId: string, weaponId: string) {
    if (!weaponId) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Vui lòng nhập ID vũ khí muốn xem thông tin!\nVí dụ: `n.weaponshop info sword`")
            .setColor("#ff0000");
        return message.reply({ embeds: [errorEmbed] });
    }

    const weapons = WeaponService.getAllWeapons();
    const weapon = weapons.find(w => w.id === weaponId.toLowerCase());

    if (!weapon) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription(`Không tìm thấy vũ khí với ID: \`${weaponId}\``)
            .setColor("#ff0000");
        return message.reply({ embeds: [errorEmbed] });
    }

    const embed = new EmbedBuilder()
        .setTitle(`${getWeaponEmoji(weapon.type, weapon.id)} ${weapon.name}`)
        .setColor("#ff6b6b")
        .setDescription(weapon.description)
        .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
        .addFields(
            { name: "🐟 Giá", value: `${weapon.price.toLocaleString()} FishCoin`, inline: true },
            { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
            { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
            { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}`, inline: true },
            { name: "🏷️ Loại", value: weapon.type, inline: true },
            { name: "⭐ Hiếm", value: weapon.rarity, inline: true }
        )
        .setFooter({
            text: `ID: ${weapon.id}`,
            iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

    message.reply({ embeds: [embed] });
}

async function showHelp(message: any) {
    const embed = new EmbedBuilder()
        .setTitle("⚔️ Hướng Dẫn Fish Weapon Shop")
        .setColor("#ff6b6b")
        .setDescription("Cửa hàng vũ khí cho cá - Tăng sức mạnh cho cá của bạn!")
        .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
        .addFields(
            { name: "🛒 Mua vũ khí", value: "`n.weaponshop buy <weapon_id> [số lượng]`", inline: true },
            { name: "🎒 Xem kho", value: "`n.weaponshop inventory`", inline: true },
            { name: "⚔️ Trang bị", value: "`n.weaponshop equip <weapon_id>`", inline: true },
            { name: "🛡️ Gỡ trang bị", value: "`n.weaponshop unequip`", inline: true },
            { name: "📝 Xem thông tin", value: "`n.weaponshop info <weapon_id>`", inline: true },
            { name: "❓ Trợ giúp", value: "`n.weaponshop help`", inline: true }
        )
        .addFields(
            { name: "💡 Ví dụ", value: "`n.weaponshop buy sword 2` - Mua 2 thanh kiếm\n`n.weaponshop equip sword` - Trang bị kiếm\n`n.weaponshop info sword` - Xem thông tin kiếm", inline: false }
        )
        .setFooter({
            text: "Fish Weapon Shop - Tăng sức mạnh cho cá của bạn!",
            iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

    message.reply({ embeds: [embed] });
}



function getWeaponEmoji(type: string, weaponId?: string): string {
    // Special case: Legendary Sword uses different emoji
    if (weaponId === "legendary_sword") {
        return "<a:than_kiem_sp:1415894929925865543>"; // Legendary sword emoji
    }
    
    // Try custom emoji first, fallback to Unicode if not available
    const customEmojiMap: Record<string, string> = {
        sword: "<a:kiem_shop:1415891704023875756>", // Animated emoji format (Iron Sword)
        shield: "<a:khien_shop:1415888932641701959>", // Animated shield emoji
        spear: "<a:giao_shop:1415907542080553102>", // Animated spear emoji
        bow: "<a:cung_shop:1415887183797157999>", // Animated bow emoji
        axe: "<a:riu_shop:1415909549197496401>", // Animated axe emoji
        staff: "<a:cau_phep_sp:1415899585464762368>", // Animated staff emoji
        dagger: "<a:than_kiem_sp:1415894929925865543>" // Animated dagger emoji
    };
    
    const unicodeEmojiMap: Record<string, string> = {
        sword: "⚔️",
        shield: "🛡️",
        spear: "🔱",
        bow: "🏹",
        axe: "🪓",
        staff: "🔮",
        dagger: "🗡️"
    };
    
    // Use custom animated emoji
    return customEmojiMap[type] || unicodeEmojiMap[type] || "⚔️";
} 