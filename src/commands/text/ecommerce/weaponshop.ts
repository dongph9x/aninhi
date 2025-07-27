import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { Bot } from "@/classes";
import { EcommerceService } from "@/utils/ecommerce-db";
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

    // Lấy balance của user
    const balance = await EcommerceService.getBalance(userId, guildId);

    // Danh sách vũ khí có sẵn
    const weapons = WeaponService.getAllWeapons();
    
    let shopText = `💰 **Balance:** ${balance.toLocaleString()} AniCoin\n\n`;
    shopText += "⚔️ **Danh sách vũ khí:**\n\n";

    weapons.forEach((weapon, index) => {
        const emoji = getWeaponEmoji(weapon.type);
        shopText += `${index + 1}. ${emoji} **${weapon.name}**\n`;
        shopText += `   💰 Giá: ${weapon.price.toLocaleString()} AniCoin\n`;
        shopText += `   ⚔️ Sức mạnh: +${weapon.power} ATK\n`;
        shopText += `   🛡️ Phòng thủ: +${weapon.defense} DEF\n`;
        shopText += `   🎯 Độ chính xác: +${weapon.accuracy}%\n`;
        shopText += `   📝 ${weapon.description}\n\n`;
    });

    shopText += "💡 **Cách sử dụng:**\n";
    shopText += "• `n.weaponshop buy <weapon_id> [số lượng]` - Mua vũ khí\n";
    shopText += "• `n.weaponshop inventory` - Xem kho vũ khí\n";
    shopText += "• `n.weaponshop equip <weapon_id>` - Trang bị vũ khí\n";
    shopText += "• `n.weaponshop info <weapon_id>` - Xem thông tin vũ khí";

    embed.setDescription(shopText);

    // Thêm footer
    embed.setFooter({
        text: "Fish Weapon Shop - Tăng sức mạnh cho cá của bạn!",
        iconURL: message.client.user.displayAvatarURL()
    });

    // Tạo buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('weapon_shop_buy')
                .setLabel('🛒 Mua Vũ Khí')
                .setStyle(ButtonStyle.Primary),
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

    message.reply({ embeds: [embed], components: [row] });
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
        const balance = await EcommerceService.getBalance(userId, guildId);

        if (balance < totalCost) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không đủ tiền")
                .setDescription(`Bạn cần ${totalCost.toLocaleString()} AniCoin để mua ${quantity}x ${weapon.name}\nHiện tại: ${balance.toLocaleString()} AniCoin`)
                .setColor("#ff0000");
            return message.reply({ embeds: [errorEmbed] });
        }

        // Thực hiện mua
        await EcommerceService.subtractMoney(userId, guildId, Number(totalCost), `Mua ${quantity}x ${weapon.name}`);
        
        // Thêm vũ khí vào inventory của user
        await WeaponService.addWeaponToInventory(userId, guildId, weaponId, quantity);

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Mua thành công!")
            .setColor("#00ff00")
            .setDescription(`🎉 Đã mua thành công **${quantity}x ${weapon.name}**\n💰 Chi phí: ${totalCost.toLocaleString()} AniCoin\n💳 Balance còn lại: ${(balance - totalCost).toLocaleString()} AniCoin`)
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .addFields(
                { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
                { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
                { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}%`, inline: true }
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

    let inventoryText = "🎒 **Kho vũ khí của bạn:**\n\n";
    
    inventory.forEach((item, index) => {
        const weapon = WeaponService.getWeaponById(item.weaponId);
        if (!weapon) return;

        const emoji = getWeaponEmoji(weapon.type);
        const equippedStatus = item.isEquipped ? " ⚔️ **ĐANG TRANG BỊ**" : "";
        
        inventoryText += `${index + 1}. ${emoji} **${weapon.name}**${equippedStatus}\n`;
        inventoryText += `   📦 Số lượng: ${item.quantity}\n`;
        inventoryText += `   ⚔️ Sức mạnh: +${weapon.power} ATK\n`;
        inventoryText += `   🛡️ Phòng thủ: +${weapon.defense} DEF\n`;
        inventoryText += `   🎯 Độ chính xác: +${weapon.accuracy}%\n`;
        inventoryText += `   ⭐ Hiếm: ${weapon.rarity}\n\n`;
    });

    if (equippedWeapon) {
        const equippedWeaponInfo = WeaponService.getWeaponById(equippedWeapon.weaponId);
        if (equippedWeaponInfo) {
            inventoryText += "⚔️ **Vũ khí đang trang bị:**\n";
            inventoryText += `${getWeaponEmoji(equippedWeaponInfo.type)} **${equippedWeaponInfo.name}**\n`;
            inventoryText += `   ⚔️ +${equippedWeaponInfo.power} ATK | 🛡️ +${equippedWeaponInfo.defense} DEF | 🎯 +${equippedWeaponInfo.accuracy}%\n\n`;
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
                { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}%`, inline: true }
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
        .setTitle(`${getWeaponEmoji(weapon.type)} ${weapon.name}`)
        .setColor("#ff6b6b")
        .setDescription(weapon.description)
        .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
        .addFields(
            { name: "💰 Giá", value: `${weapon.price.toLocaleString()} AniCoin`, inline: true },
            { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
            { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
            { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}%`, inline: true },
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



function getWeaponEmoji(type: string): string {
    const emojiMap: Record<string, string> = {
        sword: "⚔️",
        shield: "🛡️",
        spear: "🔱",
        bow: "🏹",
        axe: "🪓",
        staff: "🔮",
        dagger: "🗡️"
    };
    return emojiMap[type] || "⚔️";
} 