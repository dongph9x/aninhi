import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import { BattleFishInventoryService } from "@/utils/battle-fish-inventory";
import { FishBattleService } from "@/utils/fish-battle";

export class BattleFishUI {
    private inventory: any;
    private eligibleFish: any[];
    private selectedFishId?: string;
    private userId: string;
    private guildId: string;
    private dailyBattleInfo?: { canBattle: boolean; remainingBattles: number; error?: string };
    private isAdmin?: boolean;

    constructor(inventory: any, eligibleFish: any[], userId: string, guildId: string, selectedFishId?: string, dailyBattleInfo?: { canBattle: boolean; remainingBattles: number; error?: string }, isAdmin?: boolean) {
        this.inventory = inventory;
        this.eligibleFish = eligibleFish;
        this.userId = userId;
        this.guildId = guildId;
        this.selectedFishId = selectedFishId;
        this.dailyBattleInfo = dailyBattleInfo;
        this.isAdmin = isAdmin;
    }

    createEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Hệ Thống Đấu Cá')
            .setColor('#FF6B6B')
            .setDescription('Quản lý cá đấu và tìm đối thủ!')
            .setTimestamp();

        // Thông tin daily battle limit
        if (this.dailyBattleInfo) {
            if (this.isAdmin) {
                // Admin hiển thị thông tin đặc biệt
                embed.addFields({
                    name: '⏰ Giới Hạn Đấu Cá Hôm Nay (👑 Admin)',
                    value: `✅ Còn **${this.dailyBattleInfo.remainingBattles}/20** lần đấu cá\n👑 **Không bị giới hạn - có thể đấu vô hạn**`,
                    inline: true
                });
            } else if (this.dailyBattleInfo.canBattle) {
                embed.addFields({
                    name: '⏰ Giới Hạn Đấu Cá Hôm Nay',
                    value: `✅ Còn **${this.dailyBattleInfo.remainingBattles}/20** lần đấu cá`,
                    inline: true
                });
            } else {
                embed.addFields({
                    name: '⏰ Giới Hạn Đấu Cá Hôm Nay',
                    value: `❌ **Đã đạt giới hạn!** (0/20)\n${this.dailyBattleInfo.error || 'Vui lòng thử lại vào ngày mai'}`,
                    inline: true
                });
            }
        }

        // Thông tin túi đấu
        embed.addFields({
            name: '📦 Túi Đấu Cá',
            value: `**${this.inventory.items.length}/${this.inventory.capacity}** cá trong túi đấu`,
            inline: false
        });

        // Hiển thị cá trong túi đấu
        if (this.inventory.items.length === 0) {
            embed.addFields({
                name: '🐟 Cá Trong Túi Đấu',
                value: '❌ Chưa có cá nào trong túi đấu!\nSử dụng nút "Thêm Cá" bên dưới.',
                inline: false
            });
        } else if (this.selectedFishId && this.selectedFishId.startsWith('battle_')) {
            // Chỉ hiển thị cá được chọn
            const actualFishId = this.selectedFishId.replace('battle_', '');
            const selectedItem = this.inventory.items.find((item: any) => item.fish.id === actualFishId);
            
            if (selectedItem) {
                const fish = selectedItem.fish;
                const stats = fish.stats || {};
                const power = this.calculatePower(fish);
                
                embed.addFields({
                    name: '🎯 Cá Được Chọn',
                    value: `**${fish.name}** (Lv.${fish.level}, Gen.${fish.generation})\n` +
                           `💪 Power: ${power} | 🐟 ${fish.value.toLocaleString()} FishCoin\n` +
                           `📊 Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`,
                    inline: false
                });
            }
        } else {
            // Hiển thị tất cả cá trong túi đấu
            const battleFishList = this.inventory.items.map((item: any, index: number) => {
                const fish = item.fish;
                const stats = fish.stats || {};
                const power = this.calculatePower(fish);
                
                return `**${index + 1}. ${fish.name}** (Lv.${fish.level}, Gen.${fish.generation})\n` +
                       `💪 Power: ${power} | 🐟 ${fish.value.toLocaleString()} FishCoin\n` +
                       `📊 Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`;
            }).join('\n\n');

            embed.addFields({
                name: '🐟 Cá Trong Túi Đấu',
                value: battleFishList,
                inline: false
            });
        }

        // Hiển thị cá có thể thêm
        if (this.eligibleFish.length > 0) {
            const eligibleList = this.eligibleFish.slice(0, 3).map((fish: any, index: number) => {
                const stats = fish.stats || {};
                const power = this.calculatePower(fish);
                
                return `**${index + 1}. ${fish.name}** (Lv.${fish.level}, Gen.${fish.generation})\n` +
                       `💪 Power: ${power} | 🐟 ${fish.value.toLocaleString()} FishCoin\n` +
                       `📊 Stats: 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`;
            }).join('\n\n');

            embed.addFields({
                name: '📋 Cá Có Thể Thêm Vào Túi Đấu',
                value: eligibleList + (this.eligibleFish.length > 3 ? '\n\n*... và ' + (this.eligibleFish.length - 3) + ' cá khác*' : ''),
                inline: false
            });
        } else {
            embed.addFields({
                name: '📋 Cá Có Thể Thêm Vào Túi Đấu',
                value: '❌ Không có cá nào đủ điều kiện!\n\n**Điều kiện:**\n• Thế hệ 2 trở lên\n• Level 10 (trưởng thành)',
                inline: false
            });
        }

        // Thông tin hướng dẫn
        embed.addFields({
            name: '🎯 Cách Sử Dụng',
            value: '1. **Chọn cá** từ dropdown bên dưới để xem chi tiết\n2. **Thêm cá** vào túi đấu\n3. **Tìm đối thủ** để đấu\n4. **Xóa cá** khỏi túi đấu nếu cần',
            inline: false
        });

        return embed;
    }

    createComponents(): ActionRowBuilder<any>[] {
        const rows: ActionRowBuilder<any>[] = [];

        // Row 1: Dropdown chọn cá
        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('battle_fish_select')
            .setPlaceholder('Chọn cá để thao tác...')
            .setMinValues(1)
            .setMaxValues(1);

        // Thêm option cho cá trong túi đấu
        if (this.inventory.items.length > 0) {
            selectMenu.addOptions(
                this.inventory.items.map((item: any, index: number) => {
                    const fish = item.fish;
                    const power = this.calculatePower(fish);
                    const isSelected = fish.id === this.selectedFishId;
                    
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${fish.name} (Lv.${fish.level}, Gen.${fish.generation})`)
                        .setDescription(`Power: ${power} | 🐟${fish.value.toLocaleString()} | ${isSelected ? 'Đã chọn' : 'Trong túi đấu'}`)
                        .setValue(`battle_${fish.id}`)
                        .setEmoji(isSelected ? '🎯' : '🐟');
                })
            );
        }

        // Thêm option cho cá có thể thêm
        if (this.eligibleFish.length > 0) {
            selectMenu.addOptions(
                this.eligibleFish.slice(0, 5).map((fish: any, index: number) => {
                    const power = this.calculatePower(fish);
                    
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${fish.name} (Lv.${fish.level}, Gen.${fish.generation})`)
                        .setDescription(`Power: ${power} | 🐟${fish.value.toLocaleString()} | Có thể thêm`)
                        .setValue(`eligible_${fish.id}`)
                        .setEmoji('➕');
                })
            );
        }

        // Thêm option mặc định nếu không có cá nào
        if (this.inventory.items.length === 0 && this.eligibleFish.length === 0) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Không có cá nào')
                    .setDescription('Tạo cá thế hệ 2+ và nuôi lên level 10')
                    .setValue('no_fish')
                    .setEmoji('❌')
            );
        }

        selectRow.addComponents(selectMenu);
        rows.push(selectRow);

        // Row 2: Các nút thao tác
        const buttonRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút thêm cá
        const addButton = new ButtonBuilder()
            .setCustomId('battle_fish_add')
            .setLabel('➕ Thêm Cá')
            .setStyle(ButtonStyle.Success)
            .setDisabled(this.eligibleFish.length === 0 || !this.selectedFishId || !this.selectedFishId.startsWith('eligible_'));

        // Nút tìm đối thủ
        const battleButton = new ButtonBuilder()
            .setCustomId('battle_fish_fight')
            .setLabel('⚔️ Tìm Đối Thủ')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(this.inventory.items.length === 0);

        // Nút xóa cá
        const removeButton = new ButtonBuilder()
            .setCustomId('battle_fish_remove')
            .setLabel('🗑️ Xóa Cá')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(!this.selectedFishId || !this.selectedFishId.startsWith('battle_'));

        // Nút xem thống kê
        const statsButton = new ButtonBuilder()
            .setCustomId('battle_fish_stats')
            .setLabel('📊 Thống Kê')
            .setStyle(ButtonStyle.Secondary);

        buttonRow.addComponents(addButton, battleButton, removeButton, statsButton);
        rows.push(buttonRow);

        // Row 3: Các nút phụ
        const utilityRow = new ActionRowBuilder<ButtonBuilder>();

        // Nút xem lịch sử
        const historyButton = new ButtonBuilder()
            .setCustomId('battle_fish_history')
            .setLabel('📜 Lịch Sử')
            .setStyle(ButtonStyle.Secondary);

        // Nút bảng xếp hạng
        const leaderboardButton = new ButtonBuilder()
            .setCustomId('battle_fish_leaderboard')
            .setLabel('🏆 Bảng Xếp Hạng')
            .setStyle(ButtonStyle.Secondary);

        // Nút làm mới
        const refreshButton = new ButtonBuilder()
            .setCustomId('battle_fish_refresh')
            .setLabel('🔄 Làm Mới')
            .setStyle(ButtonStyle.Secondary);

        // Nút hướng dẫn
        const helpButton = new ButtonBuilder()
            .setCustomId('battle_fish_help')
            .setLabel('❓ Hướng Dẫn')
            .setStyle(ButtonStyle.Secondary);

        utilityRow.addComponents(historyButton, leaderboardButton, refreshButton, helpButton);
        rows.push(utilityRow);

        return rows;
    }

    private calculatePower(fish: any): number {
        const stats = fish.stats || {};
        const basePower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
        return Math.floor(basePower * (1 + fish.level * 0.1));
    }

    // Cập nhật selected fish ID
    updateSelectedFish(fishId: string): void {
        this.selectedFishId = fishId;
    }

    // Lấy selected fish ID
    getSelectedFishId(): string | undefined {
        return this.selectedFishId;
    }

    // Kiểm tra xem có thể thêm cá được chọn không
    canAddSelectedFish(): boolean {
        return this.selectedFishId !== undefined && this.selectedFishId.startsWith('eligible_');
    }

    // Kiểm tra xem có thể xóa cá được chọn không
    canRemoveSelectedFish(): boolean {
        return this.selectedFishId !== undefined && this.selectedFishId.startsWith('battle_');
    }

    // Lấy fish ID thực từ selected fish ID
    getActualFishId(): string | undefined {
        if (!this.selectedFishId) return undefined;
        return this.selectedFishId.replace('battle_', '').replace('eligible_', '');
    }
} 