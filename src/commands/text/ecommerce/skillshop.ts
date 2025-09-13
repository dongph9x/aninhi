import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { Bot } from "@/classes";
import { FishSkillService } from "@/utils/fish-skills";
import { FISH_SKILLS, FishSkillDefinition, FishSkillHelper } from "@/config/fish-skills";
import prisma from "@/utils/prisma";

export default Bot.createCommand({
    structure: {
        name: "skillshop",
        aliases: ["skillshop", "ss", "skillstore"],
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
            return await showSkillShop(message, userId, guildId);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "help":
                return await showSkillShopHelp(message);
            case "ui":
                return await showSkillShopUI(message, userId, guildId);
            case "buy":
                return await buySkill(message, userId, guildId, args.slice(1));
            case "sell":
                return await sellSkill(message, userId, guildId, args.slice(1));
            case "inventory":
                return await showSkillInventory(message, userId, guildId);
            case "equip":
                return await equipSkillToFish(message, userId, guildId, args.slice(1));
            case "unequip":
                return await unequipSkillFromFish(message, userId, guildId, args.slice(1));
            default:
                return await showSkillShop(message, userId, guildId);
        }
    },
});

async function showSkillShop(message: any, userId: string, guildId: string) {
    try {
        // Lấy user balance
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });
        const userBalance = Number(user?.fishBalance || 0);

        // Lấy skills từ database
        const skills = await FishSkillService.getAllSkillDefinitions();
        
        // Nhóm skills theo element
        const skillsByElement = skills.reduce((acc: Record<string, FishSkillDefinition[]>, skill) => {
            if (!acc[skill.element]) acc[skill.element] = [];
            acc[skill.element].push(skill);
            return acc;
        }, {} as Record<string, FishSkillDefinition[]>);

        // Tạo embed chính
        const embed = new EmbedBuilder()
            .setTitle('🏪 Skill Shop - Cửa Hàng Kỹ Năng')
            .setColor('#FF6B6B')
            .setDescription('Mua và trang bị skills cho cá đấu của bạn!')
            .addFields({
                name: '💰 FishCoin Của Bạn',
                value: `${userBalance.toLocaleString()} FishCoin`,
                inline: true
            })
            .setTimestamp();

        // Tạo dropdown options với emoji đúng
        const options = skills.map(skill => {
            const canAfford = userBalance >= skill.baseCost;
            const damage = skill.baseDamage > 0 ? skill.baseDamage : 'Support';
            const cost = skill.baseCost.toLocaleString();
            const rarity = skill.requirements?.rarity || 'common';
            const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            const level = skill.requirements?.level || 1;
            const successRate = Math.round((skill.baseSuccessRate || 0.5) * 100);
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${skill.name} - ${cost} FishCoin`)
                .setDescription(`${damage} damage | 🎯 ${successRate}% | Lv.${level} | ${rarityFormatted} ${canAfford ? '✅' : '❌'}`)
                .setValue(skill.id)
                .setEmoji(skill.emoji);
        });

        // Tạo select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('skill_shop_buy_select')
            .setPlaceholder('Chọn skill để mua...')
            .addOptions(options);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        // Thêm hướng dẫn
        embed.addFields({
            name: '🎯 Cách Sử Dụng',
            value: '• `n.skillshop ui` - Mở giao diện shop (Khuyến nghị)\n• `n.skillshop buy <skill_id> <fish_id>` - Mua skill cho cá\n• `n.skillshop inventory` - Xem skills đã mua\n• `n.skillshop equip <skill_id> <fish_id>` - Trang bị skill cho cá\n• `n.skillshop unequip <skill_id> <fish_id>` - Tháo skill khỏi cá',
            inline: false
        });

        // Tạo buttons
        const buttonRow = new ActionRowBuilder<ButtonBuilder>();
        
        const shopUIButton = new ButtonBuilder()
            .setCustomId('skill_shop_ui')
            .setLabel('🛒 Mở Shop UI')
            .setStyle(ButtonStyle.Primary);

        const inventoryButton = new ButtonBuilder()
            .setCustomId('skill_inventory')
            .setLabel('🎒 Skills Đã Mua')
            .setStyle(ButtonStyle.Secondary);

        const helpButton = new ButtonBuilder()
            .setCustomId('skill_shop_help')
            .setLabel('❓ Hướng Dẫn')
            .setStyle(ButtonStyle.Secondary);

        buttonRow.addComponents(shopUIButton, inventoryButton, helpButton);

        // Gửi message
        const sentMessage = await message.reply({
            embeds: [embed],
            components: [selectRow, buttonRow]
        });

        // Lưu message data để xử lý interaction
        const { SkillShopHandler } = await import("@/components/MessageComponent/SkillShopHandler");
        SkillShopHandler.setMessageData(sentMessage.id, {
            userId,
            guildId,
            userBalance,
            skillsByElement,
            messageType: 'skill_shop_main'
        });

    } catch (error) {
        console.error('Error showing skill shop:', error);
        message.reply('❌ Có lỗi xảy ra khi mở skill shop!');
    }
}

async function showSkillShopUI(message: any, userId: string, guildId: string) {
    try {
        // Lấy user balance
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });
        const userBalance = Number(user?.fishBalance || 0);

        // Lấy battle fish inventory để hiển thị cá có thể trang bị
        const { BattleFishInventoryService } = await import("@/utils/battle-fish-inventory");
        const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);

        // Lấy skills từ database
        const skills = await FishSkillService.getAllSkillDefinitions();
        
        // Tạo embed đơn giản
        const embed = new EmbedBuilder()
            .setTitle('🏪 Skill Shop UI - Cửa Hàng Kỹ Năng')
            .setColor('#FF6B6B')
            .setDescription('Mua và trang bị skills cho cá đấu của bạn!')
            .addFields(
                { name: '💰 FishCoin Của Bạn', value: `${userBalance.toLocaleString()} FishCoin`, inline: true },
                { name: '🐟 Cá Đấu Có Sẵn', value: `${inventory.items.length} cá trong túi đấu`, inline: true },
                { name: '📋 Quy Tắc Đơn Giản', value: '• 1 cá chỉ học được 1 skill duy nhất\n• Chỉ cần có đủ FishCoin là mua được\n• Cá đã có skill sẽ hiển thị ❌ ĐÃ CÓ SKILL', inline: false },
                { name: '🎯 Cách Sử Dụng', value: 'Chọn skill từ dropdown để xem chi tiết\nChọn cá từ dropdown cá đấu\nMua skill cho cá đã chọn\nXem inventory để quản lý skills đã mua', inline: false }
            )
            .setTimestamp();

        // Tạo dropdown options với emoji đúng
        const options = skills.map(skill => {
            const canAfford = userBalance >= skill.baseCost;
            const damage = skill.baseDamage > 0 ? skill.baseDamage : 'Support';
            const cost = skill.baseCost.toLocaleString();
            const rarity = skill.requirements?.rarity || 'common';
            const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            const level = skill.requirements?.level || 1;
            const successRate = Math.round((skill.baseSuccessRate || 0.5) * 100);
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${skill.name} - ${cost} FishCoin`)
                .setDescription(`${damage} damage | 🎯 ${successRate}% | Lv.${level} | ${rarityFormatted} ${canAfford ? '✅' : '❌'}`)
                .setValue(skill.id)
                .setEmoji(skill.emoji);
        });

        // Tạo select menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('skill_shop_ui_buy_select')
            .setPlaceholder('Chọn skill để mua...')
            .addOptions(options);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        // Tạo buttons
        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('skill_shop_ui')
                    .setLabel('🛒 Mở Shop UI')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('skill_inventory')
                    .setLabel('🎒 Skills Đã Mua')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('skill_shop_help')
                    .setLabel('❓ Hướng Dẫn')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Gửi message
        const sentMessage = await message.reply({
            embeds: [embed],
            components: [selectRow, buttonRow]
        });

        // Lưu message data để xử lý interaction
        const { SkillShopHandler } = await import("@/components/MessageComponent/SkillShopHandler");
        
        SkillShopHandler.setMessageData(sentMessage.id, {
            userId,
            guildId,
            userBalance,
            battleFish: inventory.items.map(item => item.fish),
            messageType: 'skill_shop_ui'
        });

    } catch (error) {
        console.error('Error showing skill shop UI:', error);
        message.reply('❌ Có lỗi xảy ra khi mở giao diện skill shop!');
    }
}

async function buySkill(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length < 2) {
        return message.reply('❌ Vui lòng cung cấp skill_id và fish_id! Ví dụ: `n.skillshop buy absolute_darkness <fish_id>`');
    }

    const skillId = args[0];
    const fishId = args[1];

    try {
        const result = await FishSkillService.learnSkill(fishId, skillId, userId, guildId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Đã Mua Skill Thành Công!')
                .setColor('#00FF00')
                .setDescription(`Cá đã học skill mới thành công!`)
                .addFields(
                    { name: '💰 Chi Phí', value: `${result.cost?.toLocaleString()} FishCoin`, inline: true },
                    { name: '📈 Level Skill', value: `Level ${result.newLevel}`, inline: true }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Không Thể Mua Skill!')
                .setColor('#FF0000')
                .setDescription(result.error || 'Không thể mua skill!')
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error buying skill:', error);
        message.reply('❌ Có lỗi xảy ra khi mua skill!');
    }
}

async function sellSkill(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length < 2) {
        return message.reply('❌ Vui lòng cung cấp skill_id và fish_id! Ví dụ: `n.skillshop sell absolute_darkness <fish_id>`');
    }

    const skillId = args[0];
    const fishId = args[1];

    try {
        const result = await FishSkillService.forgetSkill(fishId, skillId, userId, guildId);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Đã Bán Skill Thành Công!')
                .setColor('#00FF00')
                .setDescription(`Đã quên skill và hoàn lại FishCoin!`)
                .addFields(
                    { name: '💰 Hoàn Lại', value: `${result.refund?.toLocaleString()} FishCoin`, inline: true }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('❌ Không Thể Bán Skill!')
                .setColor('#FF0000')
                .setDescription(result.error || 'Không thể bán skill!')
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error selling skill:', error);
        message.reply('❌ Có lỗi xảy ra khi bán skill!');
    }
}

async function showSkillInventory(message: any, userId: string, guildId: string) {
    try {
        // Lấy tất cả cá của user
        const userFish = await prisma.fish.findMany({
            where: { userId, guildId },
            include: {
                fishSkills: {
                    include: {
                        fish: true
                    }
                }
            }
        });

        if (userFish.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Không Có Cá!')
                .setColor('#FF0000')
                .setDescription('Bạn chưa có cá nào!')
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎒 Skills Đã Mua')
            .setColor('#4ECDC4')
            .setDescription('Danh sách skills đã mua cho các cá của bạn!')
            .setTimestamp();

        let hasSkills = false;
        userFish.forEach(fish => {
            if (fish.fishSkills.length > 0) {
                hasSkills = true;
                const skillsText = fish.fishSkills.map(fishSkill => {
                    const skillDef = FISH_SKILLS.find(s => s.id === fishSkill.skillId);
                    if (!skillDef) return '';
                    
                    const damage = FishSkillHelper.calculateSkillDamage(skillDef, fishSkill.level);
                    const successRate = FishSkillHelper.calculateSkillSuccessRate(skillDef, fishSkill.level);
                    
                    return `**${skillDef.emoji}** **${skillDef.name}** (Lv.${fishSkill.level})\n` +
                           `💥 ${damage} damage | 🎯 ${Math.round(successRate * 100)}% thành công`;
                }).join('\n\n');

                embed.addFields({
                    name: `🐟 ${fish.name} (Lv.${fish.level})`,
                    value: skillsText,
                    inline: false
                });
            }
        });

        if (!hasSkills) {
            embed.addFields({
                name: '❌ Chưa Mua Skill Nào',
                value: 'Sử dụng `n.skillshop` để mua skills cho cá!',
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error showing skill inventory:', error);
        message.reply('❌ Có lỗi xảy ra khi xem skills đã mua!');
    }
}

async function equipSkillToFish(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length < 2) {
        return message.reply('❌ Vui lòng cung cấp skill_id và fish_id! Ví dụ: `n.skillshop equip absolute_darkness <fish_id>`');
    }

    const skillId = args[0];
    const fishId = args[1];

    try {
        // Kiểm tra cá có tồn tại không
        const fish = await prisma.fish.findFirst({
            where: { id: fishId, userId, guildId }
        });

        if (!fish) {
            return message.reply('❌ Không tìm thấy cá hoặc bạn không sở hữu cá này!');
        }

        // Kiểm tra cá đã học skill này chưa
        const fishSkill = await prisma.fishSkill.findFirst({
            where: { fishId, skillId }
        });

        if (!fishSkill) {
            return message.reply('❌ Cá chưa học skill này! Sử dụng `n.skillshop buy` để mua skill trước.');
        }

        const embed = new EmbedBuilder()
            .setTitle('✅ Skill Đã Được Trang Bị!')
            .setColor('#00FF00')
            .setDescription(`**${fish.name}** đã được trang bị skill thành công!`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error equipping skill:', error);
        message.reply('❌ Có lỗi xảy ra khi trang bị skill!');
    }
}

async function unequipSkillFromFish(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length < 2) {
        return message.reply('❌ Vui lòng cung cấp skill_id và fish_id! Ví dụ: `n.skillshop unequip absolute_darkness <fish_id>`');
    }

    const skillId = args[0];
    const fishId = args[1];

    try {
        // Kiểm tra cá có tồn tại không
        const fish = await prisma.fish.findFirst({
            where: { id: fishId, userId, guildId }
        });

        if (!fish) {
            return message.reply('❌ Không tìm thấy cá hoặc bạn không sở hữu cá này!');
        }

        // Kiểm tra cá đã học skill này chưa
        const fishSkill = await prisma.fishSkill.findFirst({
            where: { fishId, skillId }
        });

        if (!fishSkill) {
            return message.reply('❌ Cá chưa học skill này!');
        }

        const embed = new EmbedBuilder()
            .setTitle('✅ Đã Tháo Skill!')
            .setColor('#00FF00')
            .setDescription(`**${fish.name}** đã được tháo skill thành công!`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error unequipping skill:', error);
        message.reply('❌ Có lỗi xảy ra khi tháo skill!');
    }
}

async function showSkillShopHelp(message: any) {
    const helpEmbed = new EmbedBuilder()
        .setTitle('🏪 Skill Shop - Hướng Dẫn Sử Dụng')
        .setColor('#FF6B6B')
        .setDescription('Hệ thống mua và trang bị skills cho cá đấu!')
        .addFields(
            { name: '🎯 Cách sử dụng', value: '`n.skillshop` - Mở shop chính\n`n.skillshop ui` - Mở giao diện shop (Khuyến nghị)\n`n.skillshop buy <skill_id> <fish_id>` - Mua skill cho cá\n`n.skillshop sell <skill_id> <fish_id>` - Bán skill (hoàn lại FishCoin)\n`n.skillshop inventory` - Xem skills đã mua\n`n.skillshop equip <skill_id> <fish_id>` - Trang bị skill cho cá\n`n.skillshop unequip <skill_id> <fish_id>` - Tháo skill khỏi cá', inline: false },
            { name: '💰 Hệ Thống Tiền Tệ', value: '• Sử dụng FishCoin để mua skills\n• Mỗi skill có giá khác nhau tùy theo độ hiếm\n• Có thể bán skill để hoàn lại một phần FishCoin', inline: false },
            { name: '📊 Thuộc Tính Skills', value: '🔥 Fire | 💧 Water | 🪨 Earth | 💨 Air | ✨ Light | 🌑 Dark', inline: false },
            { name: '⚠️ Điều Kiện Mua Skills', value: '• Cá phải đạt level yêu cầu\n• Cá phải có đủ stats yêu cầu\n• Cá phải đúng rarity yêu cầu\n• Phải có đủ FishCoin', inline: false },
            { name: '🎮 Cách Sử Dụng Trong Battle', value: '• Skills sẽ tự động được sử dụng trong battle\n• Mỗi skill có tỷ lệ thành công khác nhau\n• Skills có thể gây damage hoặc buff/debuff', inline: false }
        )
        .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
}
