import { 
    ButtonInteraction, 
    StringSelectMenuInteraction, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { FishSkillService } from "@/utils/fish-skills";
import { FISH_SKILLS, FishSkillHelper } from "@/config/fish-skills";
import { SkillShopUI } from "./SkillShopUI";
import prisma from "@/utils/prisma";

export class SkillShopHandler {
    private static skillShopMessages = new Map<string, {
        userId: string;
        guildId: string;
        userBalance: number;
        skillsByElement?: Record<string, any[]>;
        battleFish?: any[];
        messageType: string;
    }>();

    static setMessageData(messageId: string, data: any): void {
        this.skillShopMessages.set(messageId, data);
    }

    static getMessageData(messageId: string): any {
        return this.skillShopMessages.get(messageId);
    }

    static async handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<void> {
        try {
            const messageData = this.getMessageData(interaction.message.id);
            if (!messageData) {
                await interaction.reply({ 
                    content: '❌ Không tìm thấy dữ liệu message!', 
                    ephemeral: true 
                });
                return;
            }

            // Kiểm tra quyền truy cập
            if (interaction.user.id !== messageData.userId) {
                await interaction.reply({ 
                    content: '❌ Bạn không có quyền sử dụng lệnh này!', 
                    ephemeral: true 
                });
                return;
            }

            if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(interaction, messageData);
            } else if (interaction.isButton()) {
                await this.handleButton(interaction, messageData);
            }
        } catch (error) {
            console.error('Error handling skill shop interaction:', error);
            await interaction.reply({ 
                content: '❌ Có lỗi xảy ra khi xử lý tương tác!', 
                ephemeral: true 
            });
        }
    }

    private static async handleSelectMenu(interaction: StringSelectMenuInteraction, messageData: any): Promise<void> {
        const customId = interaction.customId;
        const selectedValue = interaction.values[0];

        if (customId === 'skill_shop_select_skill') {
            await this.handleSkillSelection(interaction, messageData, selectedValue);
        } else if (customId === 'skill_shop_select_fish') {
            await this.handleFishSelection(interaction, messageData, selectedValue);
        }
    }

    private static async handleButton(interaction: ButtonInteraction, messageData: any): Promise<void> {
        const customId = interaction.customId;

        switch (customId) {
            case 'skill_shop_ui':
                await this.showSkillShopUI(interaction, messageData);
                break;
            case 'skill_inventory':
                await this.showSkillInventory(interaction, messageData);
                break;
            case 'skill_shop_help':
                await this.showSkillShopHelp(interaction, messageData);
                break;
            case 'skill_shop_buy':
                await this.buySelectedSkill(interaction, messageData);
                break;
            case 'skill_shop_inventory':
                await this.showSkillInventory(interaction, messageData);
                break;
            case 'skill_shop_refresh':
                await this.refreshSkillShop(interaction, messageData);
                break;
            case 'skill_shop_close':
                await this.closeSkillShop(interaction, messageData);
                break;
            case 'skill_shop_all_skills':
                await this.showAllSkills(interaction, messageData);
                break;
            case 'skill_shop_elements':
                await this.showSkillsByElement(interaction, messageData);
                break;
            case 'skill_shop_battle_fish':
                await this.showBattleFishUI(interaction, messageData);
                break;
            case 'skill_shop_back_to_main':
                await this.showSkillShopUI(interaction, messageData);
                break;
            default:
                await interaction.reply({ 
                    content: '❌ Hành động không hợp lệ!', 
                    ephemeral: true 
                });
        }
    }

    private static async handleSkillSelection(interaction: StringSelectMenuInteraction, messageData: any, skillId: string): Promise<void> {
        try {
            await interaction.deferUpdate();

            // Lấy skills từ database
            const skills = await FishSkillService.getAllSkillDefinitions();
            
            // Cập nhật message data TRƯỚC KHI tạo UI
            messageData.selectedSkillId = skillId;
            // Tự động chọn fish đầu tiên nếu chưa có
            if (!messageData.selectedFishId && messageData.battleFish && messageData.battleFish.length > 0) {
                messageData.selectedFishId = messageData.battleFish[0].id;
            }
            
            // Cập nhật UI với skill được chọn
            const ui = new SkillShopUI(
                skills,
                messageData.battleFish || [],
                messageData.userId,
                messageData.guildId,
                messageData.userBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            const embed = ui.createEmbed();
            const components = ui.createComponents();

            this.setMessageData(interaction.message.id, messageData);

            await interaction.editReply({
                embeds: [embed],
                components: components
            });
        } catch (error) {
            console.error('Error handling skill selection:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi chọn skill!', 
                ephemeral: true 
            });
        }
    }

    private static async handleFishSelection(interaction: StringSelectMenuInteraction, messageData: any, fishId: string): Promise<void> {
        try {
            await interaction.deferUpdate();

            if (fishId === 'no_fish') {
                await interaction.followUp({ 
                    content: '❌ Bạn cần có cá trong túi đấu để trang bị skills!', 
                    ephemeral: true 
                });
                return;
            }

            // Lấy skills từ database
            const skills = await FishSkillService.getAllSkillDefinitions();
            
            // Cập nhật message data TRƯỚC KHI tạo UI
            messageData.selectedFishId = fishId;
            // Tự động chọn skill đầu tiên nếu chưa có
            if (!messageData.selectedSkillId && skills && skills.length > 0) {
                messageData.selectedSkillId = skills[0].id;
            }
            
            // Cập nhật UI với cá được chọn
            const ui = new SkillShopUI(
                skills,
                messageData.battleFish || [],
                messageData.userId,
                messageData.guildId,
                messageData.userBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            const embed = ui.createEmbed();
            const components = ui.createComponents();

            this.setMessageData(interaction.message.id, messageData);

            await interaction.editReply({
                embeds: [embed],
                components: components
            });
        } catch (error) {
            console.error('Error handling fish selection:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi chọn cá!', 
                ephemeral: true 
            });
        }
    }

    private static async buySelectedSkill(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            const selectedSkillId = messageData.selectedSkillId;
            const selectedFishId = messageData.selectedFishId;

            if (!selectedSkillId || !selectedFishId) {
                await interaction.followUp({ 
                    content: '❌ Vui lòng chọn skill và cá trước khi mua!', 
                    ephemeral: true 
                });
                return;
            }

            // Thực hiện mua skill
            const result = await FishSkillService.learnSkill(selectedFishId, selectedSkillId, messageData.userId, messageData.guildId);

            if (result.success) {
                // Cập nhật user balance
                const user = await prisma.user.findUnique({
                    where: { userId_guildId: { userId: messageData.userId, guildId: messageData.guildId } }
                });
                const newBalance = Number(user?.fishBalance || 0);
                messageData.userBalance = newBalance;

                // Tạo embed thành công
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Đã Mua Skill Thành Công!')
                    .setColor('#00FF00')
                    .setDescription(`Cá đã học skill mới thành công!`)
                    .addFields(
                        { name: '💰 Chi Phí', value: `${result.cost?.toLocaleString()} FishCoin`, inline: true },
                        { name: '📈 Level Skill', value: `Level ${result.newLevel}`, inline: true },
                        { name: '💰 FishCoin Còn Lại', value: `${newBalance.toLocaleString()} FishCoin`, inline: true }
                    )
                    .setTimestamp();

                // Lấy skills từ database
                const skills = await FishSkillService.getAllSkillDefinitions();
                
                // Cập nhật UI
                const ui = new SkillShopUI(
                    skills,
                    messageData.battleFish || [],
                    messageData.userId,
                    messageData.guildId,
                    newBalance,
                    selectedSkillId,
                    selectedFishId
                );

                const embed = ui.createEmbed();
                const components = ui.createComponents();

                // Cập nhật message data
                this.setMessageData(interaction.message.id, messageData);

                await interaction.editReply({
                    embeds: [embed],
                    components: components
                });

                // Gửi thông báo thành công
                await interaction.followUp({
                    embeds: [successEmbed],
                    ephemeral: true
                });
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Không Thể Mua Skill!')
                    .setColor('#FF0000')
                    .setDescription(result.error || 'Không thể mua skill!')
                    .setTimestamp();

                await interaction.followUp({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error buying skill:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi mua skill!', 
                ephemeral: true 
            });
        }
    }

    private static async showSkillInventory(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            // Lấy tất cả cá của user
            const userFish = await prisma.fish.findMany({
                where: { userId: messageData.userId, guildId: messageData.guildId },
                include: {
                    fishSkills: {
                        include: {
                            skillDefinition: true
                        }
                    }
                }
            });

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
                        const skillDef = fishSkill.skillDefinition;
                        if (!skillDef) return '';
                        
                        const damage = FishSkillHelper.calculateSkillDamage({
                            baseDamage: skillDef.baseDamage,
                            damageMultiplier: Number(skillDef.damageMultiplier),
                            damagePerLevel: Number(skillDef.damagePerLevel)
                        }, fishSkill.level);
                        const successRate = FishSkillHelper.calculateSkillSuccessRate({
                            baseSuccessRate: Number(skillDef.baseSuccessRate),
                            successRatePerLevel: Number(skillDef.successRatePerLevel)
                        }, fishSkill.level);
                        
                        return `**${skillDef.emoji}** **${skillDef.name}** (Lv.${fishSkill.level})\n` +
                               `💥 ${damage} damage | 🎯 ${Math.round(successRate * 100)}% thành công`;
                    }).join('\n\n');

                    embed.addFields({
                        name: `🐟 ${fish.species} (Lv.${fish.level})`,
                        value: skillsText,
                        inline: false
                    });
                }
            });

            if (!hasSkills) {
                embed.addFields({
                    name: '❌ Chưa Mua Skill Nào',
                    value: 'Sử dụng shop để mua skills cho cá!',
                    inline: false
                });
            }

            // Tạo button quay lại
            const row = new ActionRowBuilder<ButtonBuilder>();
            const backButton = new ButtonBuilder()
                .setCustomId('skill_shop_back_to_main')
                .setLabel('🔙 Quay Lại Shop')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error('Error showing skill inventory:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi xem skills đã mua!', 
                ephemeral: true 
            });
        }
    }

    private static async refreshSkillShop(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            // Cập nhật user balance
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: messageData.userId, guildId: messageData.guildId } }
            });
            const newBalance = Number(user?.fishBalance || 0);
            messageData.userBalance = newBalance;

            // Cập nhật battle fish
            const { BattleFishInventoryService } = await import("@/utils/battle-fish-inventory");
            const inventory = await BattleFishInventoryService.getBattleFishInventory(messageData.userId, messageData.guildId);
            messageData.battleFish = inventory.items.map(item => item.fish);

            // Lấy skills từ database
            const skills = await FishSkillService.getAllSkillDefinitions();
            
            // Tạo UI mới
            const ui = new SkillShopUI(
                skills,
                messageData.battleFish,
                messageData.userId,
                messageData.guildId,
                newBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            const embed = ui.createEmbed();
            const components = ui.createComponents();

            // Cập nhật message data
            this.setMessageData(interaction.message.id, messageData);

            await interaction.editReply({
                embeds: [embed],
                components: components
            });
        } catch (error) {
            console.error('Error refreshing skill shop:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi làm mới shop!', 
                ephemeral: true 
            });
        }
    }

    private static async closeSkillShop(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            const embed = new EmbedBuilder()
                .setTitle('🏪 Skill Shop - Đã Đóng')
                .setColor('#FF6B6B')
                .setDescription('Cửa hàng skills đã được đóng. Sử dụng `n.skillshop` để mở lại!')
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                components: []
            });

            // Xóa message data
            this.skillShopMessages.delete(interaction.message.id);
        } catch (error) {
            console.error('Error closing skill shop:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi đóng shop!', 
                ephemeral: true 
            });
        }
    }

    private static async showSkillShopUI(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            // Cập nhật user balance và battle fish
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId: messageData.userId, guildId: messageData.guildId } }
            });
            const newBalance = Number(user?.fishBalance || 0);

            const { BattleFishInventoryService } = await import("@/utils/battle-fish-inventory");
            const inventory = await BattleFishInventoryService.getBattleFishInventory(messageData.userId, messageData.guildId);

            // Lấy skills từ database
            const skills = await FishSkillService.getAllSkillDefinitions();
            
            // Tạo UI
            const ui = new SkillShopUI(
                skills,
                inventory.items.map(item => item.fish),
                messageData.userId,
                messageData.guildId,
                newBalance
            );

            const embed = ui.createEmbed();
            const components = ui.createComponents();

            // Cập nhật message data
            messageData.userBalance = newBalance;
            messageData.battleFish = inventory.items.map(item => item.fish);
            messageData.messageType = 'skill_shop_ui';
            this.setMessageData(interaction.message.id, messageData);

            await interaction.editReply({
                embeds: [embed],
                components: components
            });
        } catch (error) {
            console.error('Error showing skill shop UI:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi mở giao diện shop!', 
                ephemeral: true 
            });
        }
    }

    private static async showSkillShopHelp(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            const helpEmbed = new EmbedBuilder()
                .setTitle('🏪 Skill Shop - Hướng Dẫn Sử Dụng')
                .setColor('#FF6B6B')
                .setDescription('Hệ thống mua và trang bị skills cho cá đấu!')
                .addFields(
                    { name: '🎯 Cách sử dụng', value: '`n.skillshop` - Mở shop chính\n`n.skillshop ui` - Mở giao diện shop (Khuyến nghị)\n`n.skillshop buy <skill_id> <fish_id>` - Mua skill cho cá\n`n.skillshop sell <skill_id> <fish_id>` - Bán skill (hoàn lại FishCoin)\n`n.skillshop inventory` - Xem skills đã mua', inline: false },
                    { name: '💰 Hệ Thống Tiền Tệ', value: '• Sử dụng FishCoin để mua skills\n• Mỗi skill có giá khác nhau tùy theo độ hiếm\n• Có thể bán skill để hoàn lại một phần FishCoin', inline: false },
                    { name: '📊 Thuộc Tính Skills', value: '🔥 Fire | 💧 Water | 🪨 Earth | 💨 Air | ✨ Light | 🌑 Dark', inline: false },
                    { name: '⚠️ Điều Kiện Mua Skills', value: '• Cá phải đạt level yêu cầu\n• Cá phải có đủ stats yêu cầu\n• Cá phải đúng rarity yêu cầu\n• Phải có đủ FishCoin', inline: false }
                )
                .setTimestamp();

            // Tạo button quay lại
            const row = new ActionRowBuilder<ButtonBuilder>();
            const backButton = new ButtonBuilder()
                .setCustomId('skill_shop_back_to_main')
                .setLabel('🔙 Quay Lại Shop')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            await interaction.editReply({
                embeds: [helpEmbed],
                components: [row]
            });
        } catch (error) {
            console.error('Error showing skill shop help:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi hiển thị hướng dẫn!', 
                ephemeral: true 
            });
        }
    }

    private static async showAllSkills(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            // Lấy skills từ database
            const skills = await FishSkillService.getAllSkillDefinitions();
            
            // Nhóm skills theo element
            const skillsByElement = skills.reduce((acc: Record<string, any[]>, skill) => {
                if (!acc[skill.element]) acc[skill.element] = [];
                acc[skill.element].push(skill);
                return acc;
            }, {} as Record<string, any[]>);

            const embed = new EmbedBuilder()
                .setTitle('📋 Tất Cả Skills Có Sẵn')
                .setColor('#FF6B6B')
                .setDescription('Danh sách tất cả skills có sẵn trong hệ thống!')
                .setTimestamp();

            const elementEmojis = {
                fire: '🔥',
                water: '💧',
                earth: '🪨',
                air: '💨',
                light: '✨',
                dark: '🌑'
            };

            Object.entries(skillsByElement).forEach(([element, skills]) => {
                const elementEmoji = elementEmojis[element as keyof typeof elementEmojis] || '❓';
                const skillsText = skills.map((skill: any) => {
                    const damage = skill.baseDamage > 0 ? skill.baseDamage : 'Support';
                    const cost = skill.baseCost.toLocaleString();
                    const rarity = skill.requirements?.rarity || 'common';
                    const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                    const level = skill.requirements?.level || 1;
                    const successRate = Math.round((skill.baseSuccessRate || 0.5) * 100);
                    
                    return `**${skill.emoji}** **${skill.name}**\n` +
                           `💰 ${cost} FishCoin | 💥 ${damage} damage | 🎯 ${successRate}% thành công\n` +
                           `📋 Level ${level} | ${rarityFormatted}`;
                }).join('\n\n');

                embed.addFields({
                    name: `${elementEmoji} ${element.toUpperCase()} Skills (${skills.length})`,
                    value: skillsText,
                    inline: false
                });
            });

            // Tạo button quay lại
            const row = new ActionRowBuilder<ButtonBuilder>();
            const backButton = new ButtonBuilder()
                .setCustomId('skill_shop_back_to_main')
                .setLabel('🔙 Quay Lại Shop')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error('Error showing all skills:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi hiển thị tất cả skills!', 
                ephemeral: true 
            });
        }
    }

    private static async showSkillsByElement(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            const embed = new EmbedBuilder()
                .setTitle('🎨 Skills Theo Hệ Element')
                .setColor('#FF6B6B')
                .setDescription('Chọn hệ element để xem chi tiết skills!')
                .setTimestamp();

            const elementEmojis = {
                fire: '🔥',
                water: '💧',
                earth: '🪨',
                air: '💨',
                light: '✨',
                dark: '🌑'
            };

            const elementInfo = Object.entries(elementEmojis).map(([element, emoji]) => {
                const skills = FISH_SKILLS.filter(s => s.element === element);
                return `${emoji} **${element.toUpperCase()}** - ${skills.length} skills`;
            }).join('\n');

            embed.addFields({
                name: '🎨 Các Hệ Element',
                value: elementInfo,
                inline: false
            });

            // Tạo button quay lại
            const row = new ActionRowBuilder<ButtonBuilder>();
            const backButton = new ButtonBuilder()
                .setCustomId('skill_shop_back_to_main')
                .setLabel('🔙 Quay Lại Shop')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error('Error showing skills by element:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi hiển thị skills theo hệ!', 
                ephemeral: true 
            });
        }
    }

    private static async showBattleFishUI(interaction: ButtonInteraction, messageData: any): Promise<void> {
        try {
            await interaction.deferUpdate();

            const embed = new EmbedBuilder()
                .setTitle('⚔️ Túi Đấu Cá')
                .setColor('#4ECDC4')
                .setDescription('Quản lý cá trong túi đấu!')
                .setTimestamp();

            // Lấy battle fish inventory
            const { BattleFishInventoryService } = await import("@/utils/battle-fish-inventory");
            const inventory = await BattleFishInventoryService.getBattleFishInventory(messageData.userId, messageData.guildId);

            if (inventory.items.length > 0) {
                const fishText = inventory.items.map((item: any, index: number) => 
                    `${index + 1}. **${item.fish.name}** (Lv.${item.fish.level}, Gen.${item.fish.generation}) - 💰${item.fish.value.toLocaleString()}`
                ).join('\n');

                embed.addFields({
                    name: `🐟 Cá Trong Túi Đấu (${inventory.items.length}/${inventory.capacity})`,
                    value: fishText,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '❌ Không Có Cá Trong Túi Đấu',
                    value: 'Sử dụng `n.fishbattle add <fish_id>` để thêm cá vào túi đấu!',
                    inline: false
                });
            }

            // Tạo button quay lại
            const row = new ActionRowBuilder<ButtonBuilder>();
            const backButton = new ButtonBuilder()
                .setCustomId('skill_shop_back_to_main')
                .setLabel('🔙 Quay Lại Shop')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error('Error showing battle fish UI:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi hiển thị túi đấu cá!', 
                ephemeral: true 
            });
        }
    }
}
