import { 
    ButtonInteraction, 
    StringSelectMenuInteraction, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { FishSkillService, FishSkillData } from "@/utils/fish-skills";
import { FISH_SKILLS, FishSkillDefinition } from "@/config/fish-skills";
import { FishSkillUI } from "./FishSkillUI";
import prisma from "@/utils/prisma";

export class FishSkillHandler {
    private static fishSkillMessages = new Map<string, {
        userId: string;
        guildId: string;
        fish: any;
        fishSkills: FishSkillData[];
        availableSkills: FishSkillDefinition[];
        userBalance: number;
        selectedSkillId?: string;
    }>();

    static async handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction) {
        const customId = interaction.customId;
        const userId = interaction.user.id;
        const guildId = interaction.guildId!;

        console.log(`🔍 [DEBUG] FishSkillHandler called:`);
        console.log(`  - customId: ${customId}`);
        console.log(`  - userId: ${userId}`);
        console.log(`  - guildId: ${guildId}`);

        // Lấy thông tin message từ cache
        let messageData = this.fishSkillMessages.get(interaction.message.id);
        
        if (!messageData) {
            return interaction.reply({ 
                content: '❌ Không tìm thấy dữ liệu hoặc bạn không phải chủ sở hữu!', 
                ephemeral: true 
            });
        }

        if (messageData.userId !== userId) {
            return interaction.reply({ 
                content: '❌ Không tìm thấy dữ liệu hoặc bạn không phải chủ sở hữu!', 
                ephemeral: true 
            });
        }

        try {
            // Xử lý message type 'all_skills'
            if (messageData.messageType === 'all_skills') {
                if (interaction.isButton()) {
                    await this.handleAllSkillsButton(interaction, messageData);
                } else if (interaction.isStringSelectMenu()) {
                    await this.handleAllSkillsSelectMenu(interaction, messageData);
                } else {
                    await interaction.reply({ 
                        content: '❌ Chỉ hỗ trợ button và select menu interactions cho all skills view!', 
                        ephemeral: true 
                    });
                }
                return;
            }

            // Xử lý message type 'fish_skills' (mặc định)
            if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(interaction, messageData);
            } else if (interaction.isButton()) {
                await this.handleButton(interaction, messageData);
            }
        } catch (error) {
            console.error('Error handling fish skill interaction:', error);
            await interaction.reply({ 
                content: '❌ Có lỗi xảy ra khi xử lý tương tác!', 
                ephemeral: true 
            });
        }
    }

    private static async handleSelectMenu(interaction: StringSelectMenuInteraction, messageData: any) {
        const selectedValue = interaction.values[0];
        
        if (selectedValue === 'no_skills') {
            await interaction.reply({ 
                content: '❌ Không có skill nào để chọn! Hãy nâng level cá để mở khóa skills.', 
                ephemeral: true 
            });
            return;
        }

        // Cập nhật selected skill ID
        messageData.selectedSkillId = selectedValue;

        // Làm mới UI
        await this.refreshUI(interaction, messageData);
        await interaction.reply({ 
            content: `✅ Đã chọn skill! Sử dụng các nút bên dưới để thao tác.`, 
            ephemeral: true 
        });
    }

    private static async handleButton(interaction: ButtonInteraction, messageData: any) {
        const customId = interaction.customId;

        switch (customId) {
            case 'fish_skill_learn':
                await this.handleLearnSkill(interaction, messageData);
                break;
            case 'fish_skill_upgrade':
                await this.handleUpgradeSkill(interaction, messageData);
                break;
            case 'fish_skill_forget':
                await this.handleForgetSkill(interaction, messageData);
                break;
            case 'fish_skill_refresh':
                await this.handleRefresh(interaction, messageData);
                break;
            case 'fish_skill_all':
                await this.handleShowAllSkills(interaction, messageData);
                break;
            case 'fish_skill_elements':
                await this.handleShowSkillsByElement(interaction, messageData);
                break;
            case 'fish_skill_close':
                await this.handleClose(interaction, messageData);
                break;
            case 'view_fish_skills':
                await this.handleViewFishSkills(interaction, messageData);
                break;
            case 'view_skills_by_element':
                await this.handleViewSkillsByElement(interaction, messageData);
                break;
            case 'view_skill_requirements':
                await this.handleViewSkillRequirements(interaction, messageData);
                break;
            default:
                await interaction.reply({ 
                    content: '❌ Hành động không hợp lệ!', 
                    ephemeral: true 
                });
        }
    }

    private static async handleLearnSkill(interaction: ButtonInteraction, messageData: any) {
        const actualSkillId = messageData.selectedSkillId?.replace('available_', '');
        
        if (!actualSkillId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn skill để học!', 
                ephemeral: true 
            });
            return;
        }

        const result = await FishSkillService.learnSkill(
            messageData.fish.id,
            actualSkillId,
            messageData.userId,
            messageData.guildId
        );

        if (result.success) {
            // Cập nhật dữ liệu
            await this.updateMessageData(messageData);
            
            // Làm mới UI
            await this.refreshUI(interaction, messageData);
            
            await interaction.reply({ 
                content: `✅ Đã học skill thành công! Chi phí: ${result.cost?.toLocaleString()} FishCoin`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: `❌ Không thể học skill: ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    private static async handleUpgradeSkill(interaction: ButtonInteraction, messageData: any) {
        const actualSkillId = messageData.selectedSkillId?.replace('learned_', '');
        
        if (!actualSkillId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn skill để nâng cấp!', 
                ephemeral: true 
            });
            return;
        }

        const result = await FishSkillService.upgradeSkill(
            messageData.fish.id,
            actualSkillId,
            messageData.userId,
            messageData.guildId
        );

        if (result.success) {
            // Cập nhật dữ liệu
            await this.updateMessageData(messageData);
            
            // Làm mới UI
            await this.refreshUI(interaction, messageData);
            
            await interaction.reply({ 
                content: `✅ Đã nâng cấp skill lên level ${result.newLevel}! Chi phí: ${result.cost?.toLocaleString()} FishCoin`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: `❌ Không thể nâng cấp skill: ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    private static async handleForgetSkill(interaction: ButtonInteraction, messageData: any) {
        const actualSkillId = messageData.selectedSkillId?.replace('learned_', '');
        
        if (!actualSkillId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn skill để quên!', 
                ephemeral: true 
            });
            return;
        }

        // Tạo modal xác nhận
        const { ModalBuilder, TextInputBuilder, TextInputStyle } = await import('discord.js');
        
        const modal = new ModalBuilder()
            .setCustomId(`forget_skill_modal_${actualSkillId}`)
            .setTitle('🗑️ Xác Nhận Quên Skill');

        const confirmInput = new TextInputBuilder()
            .setCustomId('confirm_forget')
            .setLabel('Nhập "QUÊN" để xác nhận')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('QUÊN')
            .setRequired(true)
            .setMaxLength(10)
            .setMinLength(4);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(confirmInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    private static async handleRefresh(interaction: ButtonInteraction, messageData: any) {
        // Cập nhật dữ liệu
        await this.updateMessageData(messageData);
        
        // Làm mới UI
        await this.refreshUI(interaction, messageData);
        
        await interaction.reply({ 
            content: '✅ Đã làm mới dữ liệu!', 
            ephemeral: true 
        });
    }

    private static async handleShowAllSkills(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Tất Cả Skills')
            .setColor('#4ECDC4')
            .setDescription('Danh sách tất cả skills có thể học:')
            .setTimestamp();

        // Nhóm skills theo element
        const skillsByElement = FISH_SKILLS.reduce((acc, skill) => {
            if (!acc[skill.element]) acc[skill.element] = [];
            acc[skill.element].push(skill);
            return acc;
        }, {} as Record<string, FishSkillDefinition[]>);

        Object.entries(skillsByElement).forEach(([element, skills]) => {
            const elementEmoji = {
                fire: '🔥',
                water: '💧',
                earth: '🪨',
                air: '💨',
                light: '✨',
                dark: '🌑'
            }[element] || '❓';

            const skillsText = skills.map(skill => {
                const canLearn = FishSkillHelper.canLearnSkill(messageData.fish, skill);
                const status = canLearn.canLearn ? '✅' : '❌';
                return `${status} **${skill.name}** - ${skill.baseCost.toLocaleString()} FishCoin`;
            }).join('\n');

            embed.addFields({
                name: `${elementEmoji} ${element.toUpperCase()} Skills`,
                value: skillsText,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleShowSkillsByElement(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('🎨 Skills Theo Hệ')
            .setColor('#FF6B6B')
            .setDescription('Chọn hệ để xem chi tiết skills:')
            .setTimestamp();

        const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark'];
        const elementEmojis = {
            fire: '🔥',
            water: '💧',
            earth: '🪨',
            air: '💨',
            light: '✨',
            dark: '🌑'
        };

        elements.forEach(element => {
            const skills = FISH_SKILLS.filter(s => s.element === element);
            const learnedSkills = messageData.fishSkills.filter((fs: FishSkillData) => fs.skillDefinition.element === element);
            
            let elementText = `**${skills.length}** skills tổng cộng\n`;
            elementText += `**${learnedSkills.length}** skills đã học\n`;
            elementText += `**${skills.length - learnedSkills.length}** skills chưa học`;

            embed.addFields({
                name: `${elementEmojis[element]} ${element.toUpperCase()}`,
                value: elementText,
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleClose(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Đã Đóng')
            .setColor('#FF0000')
            .setDescription('Đã đóng hệ thống skills.')
            .setTimestamp();

        await interaction.update({ 
            embeds: [embed], 
            components: [] 
        });

        // Xóa message data khỏi cache
        this.fishSkillMessages.delete(interaction.message.id);
    }

    private static async handleViewFishSkills(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('🐟 Skills Của Cá')
            .setColor('#4ECDC4')
            .setDescription('Để quản lý skills cho cá cụ thể, sử dụng:\n`n.fishbattle skills <fish_id>`\n\n**Ví dụ:**\n`n.fishbattle skills clx1234567890abcdef`')
            .addFields({
                name: '📋 Cách Lấy Fish ID',
                value: '• Sử dụng `n.fishbattle ui` để xem danh sách cá\n• Hoặc sử dụng `n.fishbarn` để xem cá trong kho\n• Fish ID là chuỗi dài bắt đầu bằng "clx"',
                inline: false
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleViewSkillsByElement(interaction: ButtonInteraction, messageData: any) {
        if (!messageData.skillsByElement) {
            await interaction.reply({ 
                content: '❌ Không có dữ liệu skills!', 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎨 Skills Theo Hệ')
            .setColor('#FF6B6B')
            .setDescription('Phân loại skills theo các hệ elements:')
            .setTimestamp();

        const elementEmojis = {
            fire: '🔥',
            water: '💧',
            earth: '🪨',
            air: '💨',
            light: '✨',
            dark: '🌑'
        };

        Object.entries(messageData.skillsByElement).forEach(([element, skills]: [string, any[]]) => {
            const elementEmoji = elementEmojis[element as keyof typeof elementEmojis] || '❓';
            const skillsList = skills.map(skill => skill.name).join(', ');
            
            embed.addFields({
                name: `${elementEmoji} ${element.toUpperCase()} (${skills.length} skills)`,
                value: skillsList,
                inline: true
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleViewSkillRequirements(interaction: ButtonInteraction, messageData: any) {
        if (!messageData.allSkills) {
            await interaction.reply({ 
                content: '❌ Không có dữ liệu skills!', 
                ephemeral: true 
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('📋 Requirements Skills')
            .setColor('#4ECDC4')
            .setDescription('Yêu cầu để học các skills:')
            .setTimestamp();

        // Nhóm theo rarity
        const skillsByRarity = messageData.allSkills.reduce((acc: any, skill: any) => {
            const rarity = skill.requirements?.rarity || 'common';
            if (!acc[rarity]) acc[rarity] = [];
            acc[rarity].push(skill);
            return acc;
        }, {});

        Object.entries(skillsByRarity).forEach(([rarity, skills]: [string, any[]]) => {
            const rarityEmoji = {
                common: '⚪',
                rare: '🔵',
                epic: '🟣',
                legendary: '🟡'
            }[rarity] || '❓';

            const requirementsText = skills.map((skill: any) => {
                const reqs = [];
                if (skill.requirements?.level > 1) reqs.push(`Level ${skill.requirements.level}`);
                if (skill.requirements?.strength > 0) reqs.push(`💪${skill.requirements.strength}`);
                if (skill.requirements?.agility > 0) reqs.push(`🏃${skill.requirements.agility}`);
                if (skill.requirements?.intelligence > 0) reqs.push(`🧠${skill.requirements.intelligence}`);
                if (skill.requirements?.defense > 0) reqs.push(`🛡️${skill.requirements.defense}`);
                if (skill.requirements?.luck > 0) reqs.push(`🍀${skill.requirements.luck}`);
                
                return `**${skill.name}**: ${reqs.join(' ')}`;
            }).join('\n');

            embed.addFields({
                name: `${rarityEmoji} ${rarity.toUpperCase()} Skills`,
                value: requirementsText,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleAllSkillsButton(interaction: ButtonInteraction, messageData: any) {
        const customId = interaction.customId;

        switch (customId) {
            case 'view_fish_skills':
                await this.handleViewFishSkills(interaction, messageData);
                break;
            case 'view_skills_by_element':
                await this.handleViewSkillsByElement(interaction, messageData);
                break;
            case 'view_skill_requirements':
                await this.handleViewSkillRequirements(interaction, messageData);
                break;
            case 'back_to_all_skills':
                await this.handleBackToAllSkills(interaction, messageData);
                break;
            case 'refresh_skills_view':
                await this.handleRefreshSkillsView(interaction, messageData);
                break;
            default:
                await interaction.reply({ 
                    content: '❌ Hành động không hợp lệ!', 
                    ephemeral: true 
                });
        }
    }

    private static async updateMessageData(messageData: any) {
        // Cập nhật fish skills
        messageData.fishSkills = await FishSkillService.getFishSkills(messageData.fish.id);
        
        // Cập nhật available skills
        messageData.availableSkills = await FishSkillService.getAvailableSkills(
            messageData.fish.id,
            messageData.userId,
            messageData.guildId
        );
        
        // Cập nhật user balance
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: messageData.userId, guildId: messageData.guildId } }
        });
        messageData.userBalance = user?.fishBalance || 0;
    }

    private static async refreshUI(interaction: ButtonInteraction | StringSelectMenuInteraction, messageData: any) {
        const ui = new FishSkillUI(
            messageData.fish,
            messageData.fishSkills,
            messageData.availableSkills,
            messageData.userId,
            messageData.guildId,
            messageData.userBalance,
            messageData.selectedSkillId
        );

        const embed = ui.createEmbed();
        const components = ui.createComponents();

        await interaction.message.edit({
            embeds: [embed],
            components: components
        });
    }

    // Lưu message data vào cache
    static setMessageData(messageId: string, data: any) {
        console.log(`🔍 [DEBUG] FishSkillHandler setMessageData:`);
        console.log(`  - messageId: ${messageId}`);
        console.log(`  - userId: ${data.userId}`);
        console.log(`  - guildId: ${data.guildId}`);
        console.log(`  - messageType: ${data.messageType || 'fish_skills'}`);
        
        if (data.fish) {
            console.log(`  - fish: ${data.fish.species}`);
        }
        if (data.fishSkills) {
            console.log(`  - fishSkills: ${data.fishSkills.length}`);
        }
        if (data.availableSkills) {
            console.log(`  - availableSkills: ${data.availableSkills.length}`);
        }
        if (data.allSkills) {
            console.log(`  - allSkills: ${data.allSkills.length}`);
        }
        if (data.skillsByElement) {
            console.log(`  - skillsByElement: ${Object.keys(data.skillsByElement).length} elements`);
        }
        
        this.fishSkillMessages.set(messageId, data);
    }

    // Xóa message data khỏi cache
    static removeMessageData(messageId: string) {
        this.fishSkillMessages.delete(messageId);
    }

    // Xử lý modal submit (forget skill confirmation)
    static async handleModalSubmit(interaction: any) {
        const customId = interaction.customId;
        
        if (customId.startsWith('forget_skill_modal_')) {
            const skillId = customId.replace('forget_skill_modal_', '');
            const confirmText = interaction.fields.getTextInputValue('confirm_forget');
            
            if (confirmText.toUpperCase() !== 'QUÊN') {
                await interaction.reply({ 
                    content: '❌ Xác nhận không đúng! Vui lòng nhập "QUÊN" để xác nhận.', 
                    ephemeral: true 
                });
                return;
            }

            // Lấy message data
            const messageData = this.fishSkillMessages.get(interaction.message.id);
            if (!messageData) {
                await interaction.reply({ 
                    content: '❌ Không tìm thấy dữ liệu!', 
                    ephemeral: true 
                });
                return;
            }

            const result = await FishSkillService.forgetSkill(
                messageData.fish.id,
                skillId,
                messageData.userId,
                messageData.guildId
            );

            if (result.success) {
                // Cập nhật dữ liệu
                await this.updateMessageData(messageData);
                
                // Làm mới UI
                await this.refreshUI(interaction, messageData);
                
                await interaction.reply({ 
                    content: `✅ Đã quên skill thành công! Hoàn lại: ${result.cost?.toLocaleString()} FishCoin`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: `❌ Không thể quên skill: ${result.error}`, 
                    ephemeral: true 
                });
            }
        }
    }

    private static async handleBackToAllSkills(interaction: ButtonInteraction, messageData: any) {
        try {
            await interaction.deferUpdate();

            // Import lại function showAllSkillsSystem từ fishbattle.ts
            const { showAllSkillsSystem } = await import("@/commands/text/ecommerce/fishbattle");
            
            // Tạo message giả để gọi function
            const fakeMessage = {
                reply: async (options: any) => {
                    await interaction.message.edit(options);
                    return { id: interaction.message.id };
                }
            };

            // Gọi lại function showAllSkillsSystem
            await showAllSkillsSystem(fakeMessage, messageData.userId, messageData.guildId);

        } catch (error) {
            console.error('Error handling back to all skills:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi quay lại!', 
                ephemeral: true 
            });
        }
    }

    private static async handleRefreshSkillsView(interaction: ButtonInteraction, messageData: any) {
        try {
            await interaction.deferUpdate();

            // Import lại function showAllSkillsSystem từ fishbattle.ts
            const { showAllSkillsSystem } = await import("@/commands/text/ecommerce/fishbattle");
            
            // Tạo message giả để gọi function
            const fakeMessage = {
                reply: async (options: any) => {
                    await interaction.message.edit(options);
                    return { id: interaction.message.id };
                }
            };

            // Gọi lại function showAllSkillsSystem
            await showAllSkillsSystem(fakeMessage, messageData.userId, messageData.guildId);

        } catch (error) {
            console.error('Error handling refresh skills view:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi làm mới!', 
                ephemeral: true 
            });
        }
    }

    private static async handleAllSkillsSelectMenu(interaction: StringSelectMenuInteraction, messageData: any) {
        try {
            await interaction.deferUpdate();

            const selectedElement = interaction.values[0];
            
            // Lấy tất cả skill definitions
            const { FishSkillService } = await import("@/utils/fish-skills");
            const allSkills = await FishSkillService.getAllSkillDefinitions();

            // Lọc skills theo element được chọn
            const elementSkills = allSkills.filter(skill => skill.element === selectedElement);

            // Tạo embed mới hiển thị tất cả skills của element
            const { EmbedBuilder } = await import("discord.js");
            const elementEmojis = {
                fire: '🔥',
                water: '💧',
                earth: '🪨',
                air: '💨',
                light: '✨',
                dark: '🌑'
            };

            const elementEmoji = elementEmojis[selectedElement as keyof typeof elementEmojis] || '❓';
            
            const embed = new EmbedBuilder()
                .setTitle(`${elementEmoji} ${selectedElement.toUpperCase()} Skills - Tất Cả`)
                .setColor('#FF6B6B')
                .setDescription(`Danh sách tất cả ${elementSkills.length} skills thuộc hệ ${selectedElement}!`)
                .setTimestamp();

            // Hiển thị tất cả skills của element
            const skillsText = elementSkills.map((skill: any) => {
                const damage = skill.baseDamage > 0 ? skill.baseDamage : 'Support';
                const cost = skill.baseCost.toLocaleString();
                const rarity = skill.requirements?.rarity || 'common';
                const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                const level = skill.requirements?.level || 1;
                const successRate = Math.round((skill.baseSuccessRate || 0.5) * 100);
                
                return `**${skill.emoji}** **${skill.name}**\n` +
                       `💰 ${cost} FishCoin | 💥 ${damage} damage | 🎯 ${successRate}% thành công\n` +
                       `📋 Level ${level} | ${rarityFormatted} | ${skill.element}`;
            }).join('\n\n');

            embed.addFields({
                name: `${elementEmoji} ${selectedElement.toUpperCase()} Skills (${elementSkills.length})`,
                value: skillsText,
                inline: false
            });

            // Tạo components để quay lại
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import("discord.js");
            const row = new ActionRowBuilder<ButtonBuilder>();
            
            const backButton = new ButtonBuilder()
                .setCustomId('back_to_all_skills')
                .setLabel('🔙 Quay Lại')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(backButton);

            // Cập nhật message
            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

            // Lưu message data
            messageData.selectedElement = selectedElement;
            this.setMessageData(interaction.message.id, messageData);

        } catch (error) {
            console.error('Error handling all skills select menu:', error);
            await interaction.followUp({ 
                content: '❌ Có lỗi xảy ra khi xem skills!', 
                ephemeral: true 
            });
        }
    }
}
