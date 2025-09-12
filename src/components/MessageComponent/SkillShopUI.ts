import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import type { FishSkillDefinition } from "@/config/fish-skills";
import { FishSkillHelper } from "@/config/fish-skills";
import { FishSkillService } from "@/utils/fish-skills";
import { formatMultipleEffects } from "@/utils/effect-translator";

export class SkillShopUI {
    private skills: FishSkillDefinition[];
    private battleFish: any[];
    private selectedSkillId?: string;
    private selectedFishId?: string;
    private userId: string;
    private guildId: string;
    private userBalance: number;

    constructor(
        skills: FishSkillDefinition[],
        battleFish: any[],
        userId: string,
        guildId: string,
        userBalance: number,
        selectedSkillId?: string,
        selectedFishId?: string
    ) {
        this.skills = skills;
        this.battleFish = battleFish;
        this.userId = userId;
        this.guildId = guildId;
        this.userBalance = userBalance;
        this.selectedSkillId = selectedSkillId;
        this.selectedFishId = selectedFishId;
    }

    createEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle('🏪 Skill Shop UI - Cửa Hàng Kỹ Năng')
            .setColor('#FF6B6B')
            .setDescription('Mua và trang bị skills cho cá đấu của bạn!')
            .setTimestamp();

        // Thông tin FishCoin
        embed.addFields({
            name: '💰 FishCoin Của Bạn',
            value: `${this.userBalance.toLocaleString()} FishCoin`,
            inline: true
        });

        // Thông tin cá đấu
        embed.addFields({
            name: '🐟 Cá Đấu Có Sẵn',
            value: `${this.battleFish.length} cá trong túi đấu`,
            inline: true
        });

        // Quy tắc đơn giản
        embed.addFields({
            name: '📋 Quy Tắc Đơn Giản',
            value: `• **1 cá chỉ học được 1 skill duy nhất**
• Chỉ cần có đủ FishCoin là mua được
• Cá đã có skill sẽ hiển thị ❌ ĐÃ CÓ SKILL`,
            inline: false
        });

        // Hiển thị skill được chọn
        if (this.selectedSkillId) {
            const selectedSkill = this.skills.find(s => s.id === this.selectedSkillId);
            
            if (selectedSkill) {
                const damage = FishSkillHelper.calculateSkillDamage(selectedSkill, 1);
                const successRate = FishSkillHelper.calculateSkillSuccessRate(selectedSkill, 1);
                const canAfford = this.userBalance >= selectedSkill.baseCost;
                
                let skillInfo = `**${selectedSkill.emoji}** **${selectedSkill.name}**\n`;
                skillInfo += `📝 ${selectedSkill.description}\n`;
                skillInfo += `💥 Damage: ${damage}\n`;
                skillInfo += `🎯 Thành công: ${Math.round(successRate * 100)}%\n`;
                skillInfo += `💰 Cost: ${selectedSkill.baseCost.toLocaleString()} FishCoin\n`;
                
                if (selectedSkill.effects) {
                    let effectsText = '';
                    
                    // New effect system
                    if (selectedSkill.effects.effectIds && selectedSkill.effects.effectIds.length > 0) {
                        const effectDetails = formatMultipleEffects(
                            selectedSkill.effects.effectIds,
                            selectedSkill.effects.effectChances,
                            selectedSkill.effects.effectIntensities
                        );
                        
                        effectsText = `✨ **Effects:** ${effectDetails}`;
                    }
                    // Legacy effect system (backward compatibility)
                    else {
                        const legacyEffects = Object.entries(selectedSkill.effects)
                            .filter(([key]) => !['effectIds', 'effectChances', 'effectIntensities'].includes(key))
                            .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
                            .join(', ');
                        
                        if (legacyEffects) {
                            effectsText = `✨ **Effects:** ${legacyEffects}`;
                        }
                    }
                    
                    if (effectsText) {
                        skillInfo += `${effectsText}\n`;
                    }
                }
                
                if (selectedSkill.requirements) {
                    const reqs = Object.entries(selectedSkill.requirements)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    skillInfo += `📋 Requirements: ${reqs}\n`;
                }
                
                if (!canAfford) {
                    skillInfo += `❌ **Không đủ FishCoin!**`;
                } else {
                    skillInfo += `✅ Có thể mua`;
                }

                embed.addFields({
                    name: '🔍 Chi Tiết Skill',
                    value: skillInfo,
                    inline: false
                });
            }
        }

        // Hiển thị cá được chọn
        if (this.selectedFishId) {
            const selectedFish = this.battleFish.find(f => f.id === this.selectedFishId);
            
            if (selectedFish) {
                const stats = selectedFish.stats || {};
                let fishInfo = `🐟 **${selectedFish.name}** (Lv.${selectedFish.level}, Gen.${selectedFish.generation})\n`;
                fishInfo += `📊 Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`;

                embed.addFields({
                    name: '🐟 Cá Được Chọn',
                    value: fishInfo,
                    inline: false
                });
            }
        }

        // Hướng dẫn sử dụng
        embed.addFields({
            name: '🎯 Cách Sử Dụng',
            value: '1. **Chọn skill** từ dropdown để xem chi tiết\n2. **Chọn cá** từ dropdown cá đấu\n3. **Mua skill** cho cá đã chọn\n4. **Xem inventory** để quản lý skills đã mua',
            inline: false
        });

        return embed;
    }

    createComponents(): ActionRowBuilder<any>[] {
        const rows: ActionRowBuilder<any>[] = [];

        // Row 1: Dropdown chọn skill
        const skillSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const skillSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('skill_shop_select_skill')
            .setPlaceholder(this.selectedSkillId ? '✅ Đã chọn skill' : 'Chọn skill để xem chi tiết...')
            .setMinValues(1)
            .setMaxValues(1);

        // Nhóm skills theo element
        const skillsByElement = this.skills.reduce((acc: Record<string, FishSkillDefinition[]>, skill) => {
            if (!acc[skill.element]) acc[skill.element] = [];
            acc[skill.element].push(skill);
            return acc;
        }, {} as Record<string, FishSkillDefinition[]>);

        const elementEmojis = {
            fire: '🔥',
            water: '💧',
            earth: '🪨',
            air: '💨',
            light: '✨',
            dark: '🌑'
        };

        console.log('🔍 DEBUG: Creating skill options...');
        let optionCount = 0;

        Object.entries(skillsByElement).forEach(([element, skills]) => {
            const elementEmoji = elementEmojis[element as keyof typeof elementEmojis] || '❓';
            
            skills.forEach(skill => {
                optionCount++;
                const isSelected = skill.id === this.selectedSkillId;
                const canAfford = this.userBalance >= skill.baseCost;
                const rarity = skill.requirements?.rarity || 'common';
                const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                
                // Rút ngắn tên skill nếu quá dài (Discord giới hạn 25 ký tự cho label)
                const skillName = skill.name.length > 20 ? skill.name.substring(0, 17) + '...' : skill.name;
                const label = `${isSelected ? '🎯 ' : ''}${skillName}`;
                
                console.log(`🔍 DEBUG: Option ${optionCount} - ${skill.name}`);
                console.log(`  - Original name: "${skill.name}" (${skill.name.length} chars)`);
                console.log(`  - Truncated name: "${skillName}" (${skillName.length} chars)`);
                console.log(`  - Final label: "${label}" (${label.length} chars)`);
                
                if (label.length > 25) {
                    console.log(`  ❌ LABEL TOO LONG: ${label.length} > 25`);
                }
                
                skillSelectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(label)
                        .setDescription(`${skill.emoji} ${elementEmoji} ${element} | ${skill.baseCost.toLocaleString()} FishCoin | ${rarityFormatted}${isSelected ? ' | ✅ CHỌN' : ''}`)
                        .setValue(skill.id)
                        .setEmoji(isSelected ? '🎯' : '➕')
                );
            });
        });

        // Note: Discord.js v14 không hỗ trợ setDefaultValues cho StringSelectMenuBuilder
        // Selection sẽ được hiển thị thông qua emoji và description
        
        // Chỉ thêm skillSelectRow nếu có options
        if (skillSelectMenu.data.options && skillSelectMenu.data.options.length > 0) {
            skillSelectRow.addComponents(skillSelectMenu);
            rows.push(skillSelectRow);
        } else {
            console.log('⚠️  WARNING: No skill options available, skipping skill select menu');
        }

        // Row 2: Dropdown chọn cá
        const fishSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const fishSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('skill_shop_select_fish')
            .setPlaceholder(this.selectedFishId ? '✅ Đã chọn cá' : 'Chọn cá để trang bị skill...')
            .setMinValues(1)
            .setMaxValues(1);

        console.log('🔍 DEBUG: Creating fish options...');
        let fishOptionCount = 0;

        if (this.battleFish.length > 0) {
            this.battleFish.forEach(fish => {
                fishOptionCount++;
                const isSelected = fish.id === this.selectedFishId;
                const stats = fish.stats || {};
                const hasSkills = fish.fishSkills && fish.fishSkills.length > 0;
                const skillStatus = hasSkills ? ' | ❌ ĐÃ CÓ SKILL' : ' | ✅ CHƯA CÓ SKILL';
                
                // Rút ngắn tên cá nếu quá dài (Discord giới hạn 25 ký tự cho label)
                // Cần tính toán: emoji (3) + tên + " (Lv.X)" (7) = tối đa 25
                // Nếu có "..." thì cần thêm 3 ký tự nữa
                const maxNameLength = 25 - 3 - 7; // 15 ký tự cho tên
                const fishName = fish.name.length > maxNameLength ? fish.name.substring(0, maxNameLength - 6) + '...' : fish.name;
                const fishLabel = `${isSelected ? '🎯 ' : ''}${fishName} (Lv.${fish.level})`;
                
                console.log(`🔍 DEBUG: Fish Option ${fishOptionCount} - ${fish.name}`);
                console.log(`  - Original name: "${fish.name}" (${fish.name.length} chars)`);
                console.log(`  - Max name length: ${maxNameLength}`);
                console.log(`  - Truncated name: "${fishName}" (${fishName.length} chars)`);
                console.log(`  - Final label: "${fishLabel}" (${fishLabel.length} chars)`);
                
                if (fishLabel.length > 25) {
                    console.log(`  ❌ FISH LABEL TOO LONG: ${fishLabel.length} > 25`);
                }
                
                fishSelectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(fishLabel)
                        .setDescription(`Gen.${fish.generation} | 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}${skillStatus}${isSelected ? ' | ✅ CHỌN' : ''}`)
                        .setValue(fish.id)
                        .setEmoji(isSelected ? '🎯' : (hasSkills ? '❌' : '🐟'))
                );
            });
        } else {
            fishSelectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Không có cá đấu')
                    .setDescription('Thêm cá vào túi đấu trước')
                    .setValue('no_fish')
                    .setEmoji('❌')
            );
        }

        // Note: Discord.js v14 không hỗ trợ setDefaultValues cho StringSelectMenuBuilder
        // Selection sẽ được hiển thị thông qua emoji và description
        
        // Chỉ thêm fishSelectRow nếu có options
        if (fishSelectMenu.data.options && fishSelectMenu.data.options.length > 0) {
            fishSelectRow.addComponents(fishSelectMenu);
            rows.push(fishSelectRow);
        } else {
            console.log('⚠️  WARNING: No fish options available, skipping fish select menu');
        }

        // Row 3: Các nút thao tác
        const buttonRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút mua skill
        const buyButton = new ButtonBuilder()
            .setCustomId('skill_shop_buy')
            .setLabel('🛒 Mua Skill')
            .setStyle(ButtonStyle.Success)
            .setDisabled(!this.canBuySelectedSkill());

        // Nút xem inventory
        const inventoryButton = new ButtonBuilder()
            .setCustomId('skill_shop_inventory')
            .setLabel('🎒 Skills Đã Mua')
            .setStyle(ButtonStyle.Primary);

        // Nút làm mới
        const refreshButton = new ButtonBuilder()
            .setCustomId('skill_shop_refresh')
            .setLabel('🔄 Làm Mới')
            .setStyle(ButtonStyle.Secondary);

        // Nút đóng
        const closeButton = new ButtonBuilder()
            .setCustomId('skill_shop_close')
            .setLabel('❌ Đóng')
            .setStyle(ButtonStyle.Secondary);

        buttonRow.addComponents(buyButton, inventoryButton, refreshButton, closeButton);
        rows.push(buttonRow);

        // Row 4: Các nút phụ
        const utilityRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút xem tất cả skills
        const allSkillsButton = new ButtonBuilder()
            .setCustomId('skill_shop_all_skills')
            .setLabel('📋 Tất Cả Skills')
            .setStyle(ButtonStyle.Secondary);

        // Nút xem skills theo hệ
        const elementButton = new ButtonBuilder()
            .setCustomId('skill_shop_elements')
            .setLabel('🎨 Skills Theo Hệ')
            .setStyle(ButtonStyle.Secondary);

        // Nút battle fish UI
        const battleFishButton = new ButtonBuilder()
            .setCustomId('skill_shop_battle_fish')
            .setLabel('⚔️ Túi Đấu Cá')
            .setStyle(ButtonStyle.Secondary);

        utilityRow.addComponents(allSkillsButton, elementButton, battleFishButton);
        rows.push(utilityRow);

        console.log('🔍 DEBUG: Final components created:');
        console.log(`  - Total rows: ${rows.length}`);
        rows.forEach((row, index) => {
            console.log(`  - Row ${index + 1}: ${row.components.length} components`);
            row.components.forEach((component, compIndex) => {
                if (component.data.type === 3) { // StringSelectMenu
                    console.log(`    - Component ${compIndex + 1}: StringSelectMenu with ${component.data.options?.length || 0} options`);
                    if (component.data.options) {
                        component.data.options.forEach((option, optIndex) => {
                            console.log(`      - Option ${optIndex + 1}: "${option.label}" (${option.label?.length || 0} chars)`);
                            if (option.label && option.label.length > 25) {
                                console.log(`        ❌ OPTION LABEL TOO LONG: ${option.label.length} > 25`);
                            }
                        });
                    }
                }
            });
        });

        return rows;
    }

    // Helper methods
    canBuySelectedSkill(): boolean {
        if (!this.selectedSkillId || !this.selectedFishId) {
            return false;
        }

        const skill = this.skills.find(s => s.id === this.selectedSkillId);
        const fish = this.battleFish.find(f => f.id === this.selectedFishId);
        
        if (!skill || !fish) return false;

        // Đơn giản: chỉ cần có tiền và cá chưa học skill nào
        const hasEnoughMoney = this.userBalance >= skill.baseCost;
        const fishHasNoSkills = !fish.fishSkills || fish.fishSkills.length === 0;
        
        return hasEnoughMoney && fishHasNoSkills;
    }

    // Cập nhật selected skill
    updateSelectedSkill(skillId: string): void {
        this.selectedSkillId = skillId;
    }

    // Cập nhật selected fish
    updateSelectedFish(fishId: string): void {
        this.selectedFishId = fishId;
    }

    // Lấy selected skill ID
    getSelectedSkillId(): string | undefined {
        return this.selectedSkillId;
    }

    // Lấy selected fish ID
    getSelectedFishId(): string | undefined {
        return this.selectedFishId;
    }

    // Cập nhật user balance
    updateUserBalance(balance: number): void {
        this.userBalance = balance;
    }
}
