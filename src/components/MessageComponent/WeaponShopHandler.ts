import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { WeaponService } from "../../utils/weapon";
import { EcommerceService } from "../../utils/ecommerce-db";

export class WeaponShopHandler {
    static async handleButton(interaction: ButtonInteraction) {
        const { customId } = interaction;
        const guildId = interaction.guildId!;
        const userId = interaction.user.id;

        try {
            switch (customId) {
                case 'weapon_shop_buy':
                    await this.handleBuyButton(interaction, guildId, userId);
                    break;
                case 'weapon_shop_inventory':
                    await this.handleInventoryButton(interaction, guildId, userId);
                    break;
                case 'weapon_shop_equip':
                    await this.handleEquipButton(interaction, guildId, userId);
                    break;
                case 'weapon_shop_help':
                    await this.handleHelpButton(interaction);
                    break;
                default:
                    await interaction.reply({ content: "❌ Lệnh không hợp lệ!", ephemeral: true });
            }
        } catch (error) {
            console.error("Error in WeaponShopHandler:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ Có lỗi xảy ra!", ephemeral: true });
            }
        }
    }

    static async handleSelectMenu(interaction: StringSelectMenuInteraction) {
        const { customId } = interaction;
        const guildId = interaction.guildId!;
        const userId = interaction.user.id;
        const selectedValue = interaction.values[0];

        try {
            switch (customId) {
                case 'weapon_buy_select':
                    await this.handleBuySelect(interaction, guildId, userId, selectedValue);
                    break;
                case 'weapon_equip_select':
                    await this.handleEquipSelect(interaction, guildId, userId, selectedValue);
                    break;
                default:
                    await interaction.reply({ content: "❌ Lệnh không hợp lệ!", ephemeral: true });
            }
        } catch (error) {
            console.error("Error in WeaponShopHandler select menu:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ Có lỗi xảy ra!", ephemeral: true });
            }
        }
    }

    static async handleBuyButton(interaction: ButtonInteraction, guildId: string, userId: string) {
        const weapons = WeaponService.getAllWeapons();
        
        const embed = new EmbedBuilder()
            .setTitle("🛒 Mua Vũ Khí")
            .setColor("#ff6b6b")
            .setDescription("Chọn vũ khí bạn muốn mua:")
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .setTimestamp();

        const balance = await EcommerceService.getBalance(userId, guildId);
        embed.addFields({ name: "💰 Balance", value: `${balance.toLocaleString()} AniCoin`, inline: false });

        const options = weapons.map(weapon => {
            const canAfford = balance >= weapon.price;
            const emoji = this.getWeaponEmoji(weapon.type);
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${weapon.name} - ${weapon.price.toLocaleString()} AniCoin`)
                .setDescription(`${emoji} ${weapon.description} ${canAfford ? '✅' : '❌'}`)
                .setValue(weapon.id)
                .setEmoji(emoji);
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('weapon_buy_select')
            .setPlaceholder('Chọn vũ khí để mua...')
            .addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    static async handleInventoryButton(interaction: ButtonInteraction, guildId: string, userId: string) {
        const embed = new EmbedBuilder()
            .setTitle("🎒 Kho Vũ Khí")
            .setColor("#ff6b6b")
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .setTimestamp();

        const inventory = await WeaponService.getUserWeaponInventory(userId, guildId);
        const equippedWeapon = await WeaponService.getEquippedWeapon(userId, guildId);
        
        if (inventory.length === 0) {
            embed.setDescription("🎒 **Kho vũ khí của bạn:**\n\n📭 Kho vũ khí trống!\n\n💡 Sử dụng `n.weaponshop` để mua vũ khí");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let inventoryText = "🎒 **Kho vũ khí của bạn:**\n\n";
        
        inventory.forEach((item, index) => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (!weapon) return;

            const emoji = this.getWeaponEmoji(weapon.type);
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
                inventoryText += `${this.getWeaponEmoji(equippedWeaponInfo.type)} **${equippedWeaponInfo.name}**\n`;
                inventoryText += `   ⚔️ +${equippedWeaponInfo.power} ATK | 🛡️ +${equippedWeaponInfo.defense} DEF | 🎯 +${equippedWeaponInfo.accuracy}%\n\n`;
            }
        }

        inventoryText += "💡 **Lệnh hữu ích:**\n";
        inventoryText += "• `n.weaponshop equip <weapon_id>` - Trang bị vũ khí\n";
        inventoryText += "• `n.weaponshop unequip` - Gỡ trang bị\n";
        inventoryText += "• `n.weaponshop info <weapon_id>` - Xem thông tin vũ khí";

        embed.setDescription(inventoryText);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    static async handleEquipButton(interaction: ButtonInteraction, guildId: string, userId: string) {
        const inventory = await WeaponService.getUserWeaponInventory(userId, guildId);
        
        if (inventory.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("🎒 Kho Vũ Khí")
                .setColor("#ff6b6b")
                .setDescription("📭 Kho vũ khí trống!\n\n💡 Sử dụng `n.weaponshop` để mua vũ khí")
                .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚔️ Trang Bị Vũ Khí")
            .setColor("#ff6b6b")
            .setDescription("Chọn vũ khí để trang bị:")
            .setThumbnail("https://media.discordapp.net/attachments/1396335030216822875/1398676895524192358/3516.png?ex=68863ade&is=6884e95e&hm=a6b593878a7a2af5807cf6c5b35a9d007a6939e9fdc72ea3f6889800331e5b15&=&format=webp&quality=lossless&width=664&height=592")
            .setTimestamp();

        const options = inventory.map(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (!weapon) return null;

            const emoji = this.getWeaponEmoji(weapon.type);
            const equippedStatus = item.isEquipped ? " ⚔️ ĐANG TRANG BỊ" : "";
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${weapon.name}${equippedStatus}`)
                .setDescription(`${emoji} +${weapon.power} ATK | +${weapon.defense} DEF | +${weapon.accuracy}%`)
                .setValue(weapon.id)
                .setEmoji(emoji);
        }).filter(Boolean);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('weapon_equip_select')
            .setPlaceholder('Chọn vũ khí để trang bị...')
            .addOptions(options as StringSelectMenuOptionBuilder[]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    static async handleHelpButton(interaction: ButtonInteraction) {
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
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    static async handleBuySelect(interaction: StringSelectMenuInteraction, guildId: string, userId: string, weaponId: string) {
        const weapon = WeaponService.getWeaponById(weaponId);
        if (!weapon) {
            return interaction.reply({ content: "❌ Không tìm thấy vũ khí!", ephemeral: true });
        }

        const balance = await EcommerceService.getBalance(userId, guildId);
        if (balance < weapon.price) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Không đủ tiền")
                .setColor("#ff0000")
                .setDescription(`Bạn cần ${weapon.price.toLocaleString()} AniCoin để mua ${weapon.name}\nHiện tại: ${balance.toLocaleString()} AniCoin`)
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Thực hiện mua
            await EcommerceService.subtractMoney(userId, guildId, Number(weapon.price), `Mua ${weapon.name}`);
            await WeaponService.addWeaponToInventory(userId, guildId, weaponId, 1);

            const embed = new EmbedBuilder()
                .setTitle("✅ Mua thành công!")
                .setColor("#00ff00")
                .setDescription(`🎉 Đã mua thành công **${weapon.name}**\n💰 Chi phí: ${weapon.price.toLocaleString()} AniCoin\n💳 Balance còn lại: ${(balance - weapon.price).toLocaleString()} AniCoin`)
                .addFields(
                    { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
                    { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
                    { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}%`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Error buying weapon:", error);
            await interaction.reply({ content: "❌ Có lỗi xảy ra khi mua vũ khí!", ephemeral: true });
        }
    }

    static async handleEquipSelect(interaction: StringSelectMenuInteraction, guildId: string, userId: string, weaponId: string) {
        const weapon = WeaponService.getWeaponById(weaponId);
        if (!weapon) {
            return interaction.reply({ content: "❌ Không tìm thấy vũ khí!", ephemeral: true });
        }

        const success = await WeaponService.equipWeapon(userId, guildId, weaponId);
        
        if (!success) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setColor("#ff0000")
                .setDescription(`Bạn không có vũ khí **${weapon.name}**!\nSử dụng \`n.weaponshop inventory\` để xem kho vũ khí`)
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚔️ Trang Bị Thành Công!")
            .setColor("#00ff00")
            .setDescription(`🎯 Đã trang bị thành công **${weapon.name}**!`)
            .addFields(
                { name: "⚔️ Sức mạnh", value: `+${weapon.power} ATK`, inline: true },
                { name: "🛡️ Phòng thủ", value: `+${weapon.defense} DEF`, inline: true },
                { name: "🎯 Độ chính xác", value: `+${weapon.accuracy}%`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    static getWeaponEmoji(type: string): string {
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
} 