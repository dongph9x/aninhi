import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import { FishSkillService, FishSkillData } from "@/utils/fish-skills";
import { FISH_SKILLS, FishSkillDefinition, FishSkillHelper } from "@/config/fish-skills";

export class FishSkillUI {
    private fish: any;
    private fishSkills: FishSkillData[];
    private availableSkills: FishSkillDefinition[];
    private selectedSkillId?: string;
    private userId: string;
    private guildId: string;
    private userBalance: number;

    constructor(
        fish: any,
        fishSkills: FishSkillData[],
        availableSkills: FishSkillDefinition[],
        userId: string,
        guildId: string,
        userBalance: number,
        selectedSkillId?: string
    ) {
        this.fish = fish;
        this.fishSkills = fishSkills;
        this.availableSkills = availableSkills;
        this.userId = userId;
        this.guildId = guildId;
        this.userBalance = userBalance;
        this.selectedSkillId = selectedSkillId;
    }

    createEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle(`🎯 Hệ Thống Skills - ${this.fish.species}`)
            .setColor('#FF6B6B')
            .setDescription('Quản lý skills cho cá của bạn!')
            .setTimestamp();

        // Thông tin cá
        const stats = this.fish.stats || {};
        embed.addFields({
            name: '🐟 Thông Tin Cá',
            value: `**${this.fish.species}** (Lv.${this.fish.level}, Gen.${this.fish.generation})\n` +
                   `📊 Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`,
            inline: false
        });

        // Thông tin FishCoin
        embed.addFields({
            name: '💰 FishCoin',
            value: `${this.userBalance.toLocaleString()} FishCoin`,
            inline: true
        });

        // Hiển thị skills đã học
        if (this.fishSkills.length > 0) {
            const learnedSkillsText = this.fishSkills.map(skill => {
                const damage = FishSkillHelper.calculateSkillDamage(skill.skillDefinition, skill.level);
                const successRate = FishSkillHelper.calculateSkillSuccessRate(skill.skillDefinition, skill.level);
                const nextLevelCost = skill.level < skill.skillDefinition.maxLevel 
                    ? FishSkillHelper.calculateUpgradeCost(skill.skillDefinition, skill.level)
                    : null;
                
                let skillText = `**${skill.skillDefinition.emoji}** **${skill.skillDefinition.name}** (Lv.${skill.level})\n`;
                skillText += `💥 Damage: ${damage} | 🎯 Thành công: ${Math.round(successRate * 100)}%\n`;
                
                if (nextLevelCost) {
                    skillText += `⬆️ Nâng cấp: ${nextLevelCost.toLocaleString()} FishCoin`;
                } else {
                    skillText += `✅ Đã đạt level tối đa`;
                }
                
                return skillText;
            }).join('\n\n');

            embed.addFields({
                name: '🎯 Skills Đã Học',
                value: learnedSkillsText,
                inline: false
            });
        } else {
            embed.addFields({
                name: '🎯 Skills Đã Học',
                value: '❌ Chưa học skill nào!',
                inline: false
            });
        }

        // Hiển thị skill được chọn
        if (this.selectedSkillId) {
            const selectedSkill = this.availableSkills.find(s => s.id === this.selectedSkillId) ||
                                 this.fishSkills.find(s => s.skillId === this.selectedSkillId)?.skillDefinition;
            
            if (selectedSkill) {
                const canLearn = FishSkillHelper.canLearnSkill(this.fish, selectedSkill);
                const damage = FishSkillHelper.calculateSkillDamage(selectedSkill, 1);
                const successRate = FishSkillHelper.calculateSkillSuccessRate(selectedSkill, 1);
                const upgradeCost = FishSkillHelper.calculateUpgradeCost(selectedSkill, 1);
                
                let skillInfo = `**${selectedSkill.emoji}** **${selectedSkill.name}**\n`;
                skillInfo += `📝 ${selectedSkill.description}\n`;
                skillInfo += `💥 Damage: ${damage}\n`;
                skillInfo += `🎯 Thành công: ${Math.round(successRate * 100)}%\n`;
                skillInfo += `💰 Cost: ${selectedSkill.baseCost.toLocaleString()} FishCoin\n`;
                
                if (selectedSkill.effects) {
                    const effects = Object.entries(selectedSkill.effects)
                        .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
                        .join(', ');
                    skillInfo += `✨ Effects: ${effects}\n`;
                }
                
                if (selectedSkill.requirements) {
                    const reqs = Object.entries(selectedSkill.requirements)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    skillInfo += `📋 Requirements: ${reqs}\n`;
                }
                
                if (!canLearn.canLearn) {
                    skillInfo += `❌ **${canLearn.reason}**`;
                } else {
                    skillInfo += `✅ Có thể học`;
                }

                embed.addFields({
                    name: '🔍 Chi Tiết Skill',
                    value: skillInfo,
                    inline: false
                });
            }
        }

        // Hướng dẫn sử dụng
        embed.addFields({
            name: '🎯 Cách Sử Dụng',
            value: '1. **Chọn skill** từ dropdown để xem chi tiết\n2. **Học skill** mới cho cá\n3. **Nâng cấp** skill đã học\n4. **Quên skill** để hoàn lại FishCoin',
            inline: false
        });

        return embed;
    }

    createComponents(): ActionRowBuilder<any>[] {
        const rows: ActionRowBuilder<any>[] = [];

        // Row 1: Dropdown chọn skill
        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('fish_skill_select')
            .setPlaceholder('Chọn skill để xem chi tiết...')
            .setMinValues(1)
            .setMaxValues(1);

        // Thêm skills đã học
        if (this.fishSkills.length > 0) {
            selectMenu.addOptions(
                this.fishSkills.map(skill => {
                    const isSelected = skill.skillId === this.selectedSkillId;
                    const canUpgrade = skill.level < skill.skillDefinition.maxLevel;
                    
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${skill.skillDefinition.name} (Lv.${skill.level})`)
                        .setDescription(`**${skill.skillDefinition.emoji}** ${skill.skillDefinition.element} | ${isSelected ? 'Đã chọn' : 'Đã học'} | ${canUpgrade ? 'Có thể nâng cấp' : 'Level tối đa'}`)
                        .setValue(`learned_${skill.skillId}`)
                        .setEmoji(isSelected ? '🎯' : '✅');
                })
            );
        }

        // Thêm skills có thể học
        if (this.availableSkills.length > 0) {
            selectMenu.addOptions(
                this.availableSkills.slice(0, 10).map(skill => {
                    const isSelected = skill.id === this.selectedSkillId;
                    const canLearn = FishSkillHelper.canLearnSkill(this.fish, skill);
                    
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${skill.name}`)
                        .setDescription(`**${skill.emoji}** ${skill.element} | ${skill.baseCost.toLocaleString()} FishCoin | ${canLearn.canLearn ? 'Có thể học' : canLearn.reason}`)
                        .setValue(`available_${skill.id}`)
                        .setEmoji(isSelected ? '🎯' : '➕');
                })
            );
        }

        // Thêm option mặc định nếu không có skill nào
        if (this.fishSkills.length === 0 && this.availableSkills.length === 0) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Không có skill nào')
                    .setDescription('Nâng level cá để mở khóa skills')
                    .setValue('no_skills')
                    .setEmoji('❌')
            );
        }

        selectRow.addComponents(selectMenu);
        rows.push(selectRow);

        // Row 2: Các nút thao tác
        const buttonRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút học skill
        const learnButton = new ButtonBuilder()
            .setCustomId('fish_skill_learn')
            .setLabel('📚 Học Skill')
            .setStyle(ButtonStyle.Success)
            .setDisabled(!this.canLearnSelectedSkill());

        // Nút nâng cấp skill
        const upgradeButton = new ButtonBuilder()
            .setCustomId('fish_skill_upgrade')
            .setLabel('⬆️ Nâng Cấp')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!this.canUpgradeSelectedSkill());

        // Nút quên skill
        const forgetButton = new ButtonBuilder()
            .setCustomId('fish_skill_forget')
            .setLabel('🗑️ Quên Skill')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(!this.canForgetSelectedSkill());

        // Nút làm mới
        const refreshButton = new ButtonBuilder()
            .setCustomId('fish_skill_refresh')
            .setLabel('🔄 Làm Mới')
            .setStyle(ButtonStyle.Secondary);

        buttonRow.addComponents(learnButton, upgradeButton, forgetButton, refreshButton);
        rows.push(buttonRow);

        // Row 3: Các nút phụ
        const utilityRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút xem tất cả skills
        const allSkillsButton = new ButtonBuilder()
            .setCustomId('fish_skill_all')
            .setLabel('📋 Tất Cả Skills')
            .setStyle(ButtonStyle.Secondary);

        // Nút xem skills theo hệ
        const elementButton = new ButtonBuilder()
            .setCustomId('fish_skill_elements')
            .setLabel('🎨 Skills Theo Hệ')
            .setStyle(ButtonStyle.Secondary);

        // Nút đóng
        const closeButton = new ButtonBuilder()
            .setCustomId('fish_skill_close')
            .setLabel('❌ Đóng')
            .setStyle(ButtonStyle.Secondary);

        utilityRow.addComponents(allSkillsButton, elementButton, closeButton);
        rows.push(utilityRow);

        return rows;
    }

    // Helper methods
    private canLearnSelectedSkill(): boolean {
        if (!this.selectedSkillId || !this.selectedSkillId.startsWith('available_')) {
            return false;
        }

        const skillId = this.selectedSkillId.replace('available_', '');
        const skill = this.availableSkills.find(s => s.id === skillId);
        
        if (!skill) return false;

        const canLearn = FishSkillHelper.canLearnSkill(this.fish, skill);
        return canLearn.canLearn && this.userBalance >= skill.baseCost;
    }

    private canUpgradeSelectedSkill(): boolean {
        if (!this.selectedSkillId || !this.selectedSkillId.startsWith('learned_')) {
            return false;
        }

        const skillId = this.selectedSkillId.replace('learned_', '');
        const fishSkill = this.fishSkills.find(s => s.skillId === skillId);
        
        if (!fishSkill || fishSkill.level >= fishSkill.skillDefinition.maxLevel) {
            return false;
        }

        const upgradeCost = FishSkillHelper.calculateUpgradeCost(fishSkill.skillDefinition, fishSkill.level);
        return this.userBalance >= upgradeCost;
    }

    private canForgetSelectedSkill(): boolean {
        if (!this.selectedSkillId || !this.selectedSkillId.startsWith('learned_')) {
            return false;
        }

        const skillId = this.selectedSkillId.replace('learned_', '');
        const fishSkill = this.fishSkills.find(s => s.skillId === skillId);
        
        return !!fishSkill;
    }

    // Cập nhật selected skill
    updateSelectedSkill(skillId: string): void {
        this.selectedSkillId = skillId;
    }

    // Lấy selected skill ID
    getSelectedSkillId(): string | undefined {
        return this.selectedSkillId;
    }

    // Lấy actual skill ID từ selected skill ID
    getActualSkillId(): string | undefined {
        if (!this.selectedSkillId) return undefined;
        return this.selectedSkillId.replace('learned_', '').replace('available_', '');
    }
}
