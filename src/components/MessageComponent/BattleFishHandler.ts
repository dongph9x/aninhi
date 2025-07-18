import { 
    ButtonInteraction, 
    StringSelectMenuInteraction, 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { BattleFishInventoryService } from "@/utils/battle-fish-inventory";
import { FishBattleService } from "@/utils/fish-battle";
import { BattleFishUI } from "./BattleFishUI";

export class BattleFishHandler {
    private static battleFishMessages = new Map<string, {
        userId: string;
        guildId: string;
        inventory: any;
        eligibleFish: any[];
        selectedFishId?: string;
    }>();

    static async handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction) {
        const customId = interaction.customId;
        const messageId = interaction.message.id;
        const userId = interaction.user.id;
        const guildId = interaction.guildId!;

        // Lấy thông tin message từ cache
        const messageData = this.battleFishMessages.get(messageId);
        if (!messageData || messageData.userId !== userId) {
            return interaction.reply({ 
                content: '❌ Không tìm thấy dữ liệu hoặc bạn không phải chủ sở hữu!', 
                ephemeral: true 
            });
        }

        try {
            if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(interaction, messageData);
            } else if (interaction.isButton()) {
                await this.handleButton(interaction, messageData);
            }
        } catch (error) {
            console.error('Error handling battle fish interaction:', error);
            await interaction.reply({ 
                content: '❌ Có lỗi xảy ra khi xử lý tương tác!', 
                ephemeral: true 
            });
        }
    }

    private static async handleSelectMenu(interaction: StringSelectMenuInteraction, messageData: any) {
        const selectedValue = interaction.values[0];
        
        if (selectedValue === 'no_fish') {
            await interaction.reply({ 
                content: '❌ Không có cá nào để chọn! Hãy tạo cá thế hệ 2+ và nuôi lên level 10.', 
                ephemeral: true 
            });
            return;
        }

        // Cập nhật selected fish ID
        messageData.selectedFishId = selectedValue;

        // Làm mới UI
        await this.refreshUI(interaction, messageData);
        await interaction.reply({ 
            content: `✅ Đã chọn cá! Sử dụng các nút bên dưới để thao tác.`, 
            ephemeral: true 
        });
    }

    private static async handleButton(interaction: ButtonInteraction, messageData: any) {
        const customId = interaction.customId;

        switch (customId) {
            case 'battle_fish_add':
                await this.handleAddFish(interaction, messageData);
                break;
            case 'battle_fish_remove':
                await this.handleRemoveFish(interaction, messageData);
                break;
            case 'battle_fish_fight':
                await this.handleFindOpponent(interaction, messageData);
                break;
            case 'battle_fish_stats':
                await this.handleShowStats(interaction, messageData);
                break;
            case 'battle_fish_history':
                await this.handleShowHistory(interaction, messageData);
                break;
            case 'battle_fish_leaderboard':
                await this.handleShowLeaderboard(interaction, messageData);
                break;
            case 'battle_fish_refresh':
                await this.handleRefresh(interaction, messageData);
                break;
            case 'battle_fish_help':
                await this.handleShowHelp(interaction, messageData);
                break;
            default:
                await interaction.reply({ 
                    content: '❌ Hành động không hợp lệ!', 
                    ephemeral: true 
                });
        }
    }

    private static async handleAddFish(interaction: ButtonInteraction, messageData: any) {
        const actualFishId = messageData.selectedFishId?.replace('eligible_', '');
        
        if (!actualFishId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn cá để thêm!', 
                ephemeral: true 
            });
            return;
        }

        const result = await BattleFishInventoryService.addFishToBattleInventory(
            messageData.userId, 
            messageData.guildId, 
            actualFishId
        );

        if (result.success) {
            // Cập nhật dữ liệu
            await this.updateMessageData(messageData);
            
            // Làm mới UI
            await this.refreshUI(interaction, messageData);
            
            await interaction.reply({ 
                content: `✅ Đã thêm **${result.inventoryItem.fish.name}** vào túi đấu!`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: `❌ Không thể thêm cá: ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    private static async handleRemoveFish(interaction: ButtonInteraction, messageData: any) {
        const actualFishId = messageData.selectedFishId?.replace('battle_', '');
        
        if (!actualFishId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn cá trong túi đấu để xóa!', 
                ephemeral: true 
            });
            return;
        }

        const result = await BattleFishInventoryService.removeFishFromBattleInventory(
            messageData.userId, 
            messageData.guildId, 
            actualFishId
        );

        if (result.success) {
            // Cập nhật dữ liệu
            await this.updateMessageData(messageData);
            
            // Reset selected fish
            messageData.selectedFishId = undefined;
            
            // Làm mới UI
            await this.refreshUI(interaction, messageData);
            
            await interaction.reply({ 
                content: '✅ Đã xóa cá khỏi túi đấu!', 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: `❌ Không thể xóa cá: ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    private static async handleFindOpponent(interaction: ButtonInteraction, messageData: any) {
        if (messageData.inventory.items.length === 0) {
            await interaction.reply({ 
                content: '❌ Không có cá nào trong túi đấu!', 
                ephemeral: true 
            });
            return;
        }

        // Chọn cá đầu tiên trong túi đấu
        const selectedFish = messageData.inventory.items[0].fish;
        
        const opponentResult = await FishBattleService.findRandomOpponent(
            messageData.userId, 
            messageData.guildId, 
            selectedFish.id
        );

        if (!opponentResult.success) {
            await interaction.reply({ 
                content: `❌ Không tìm thấy đối thủ: ${opponentResult.error}`, 
                ephemeral: true 
            });
            return;
        }

        // Tạo embed thông tin trước khi đấu
        const stats = selectedFish.stats || {};
        const opponentStats = opponentResult.opponent?.stats || {};
        const userPower = this.calculatePower(selectedFish);
        const opponentPower = this.calculatePower(opponentResult.opponent || {});

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Tìm Thấy Đối Thủ!')
            .setColor('#FFD700')
            .addFields(
                { name: '🐟 Cá của bạn', value: `${selectedFish.name} (Lv.${selectedFish.level})`, inline: true },
                { name: '🐟 Đối thủ', value: `${opponentResult.opponent.name} (Lv.${opponentResult.opponent.level})`, inline: true },
                { name: '💪 Sức mạnh', value: `${userPower} vs ${opponentPower}`, inline: true },
                { name: '📊 Stats của bạn', value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`, inline: false },
                { name: '📊 Stats đối thủ', value: `💪${opponentStats.strength || 0} 🏃${opponentStats.agility || 0} 🧠${opponentStats.intelligence || 0} 🛡️${opponentStats.defense || 0} 🍀${opponentStats.luck || 0}`, inline: false }
            )
            .setDescription('React với ⚔️ để bắt đầu đấu!')
            .setTimestamp();

        const battleButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('battle_fish_confirm_fight')
                    .setLabel('⚔️ Bắt Đầu Đấu')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [battleButton],
            ephemeral: true 
        });
    }

    private static async handleShowStats(interaction: ButtonInteraction, messageData: any) {
        const stats = await FishBattleService.getBattleStats(messageData.userId, messageData.guildId);

        const embed = new EmbedBuilder()
            .setTitle('📊 Thống Kê Đấu Cá')
            .setColor('#4ECDC4')
            .addFields(
                { name: '⚔️ Tổng số trận', value: stats.totalBattles.toString(), inline: true },
                { name: '🏆 Chiến thắng', value: stats.wins.toString(), inline: true },
                { name: '💀 Thất bại', value: stats.losses.toString(), inline: true },
                { name: '📈 Tỷ lệ thắng', value: `${stats.winRate}%`, inline: true },
                { name: '💰 Tổng thu nhập', value: stats.totalEarnings.toLocaleString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleShowHistory(interaction: ButtonInteraction, messageData: any) {
        const battles = await FishBattleService.getRecentBattles(messageData.userId, messageData.guildId, 5);

        if (battles.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📜 Lịch Sử Đấu Cá')
                .setColor('#FFA500')
                .setDescription('Bạn chưa có trận đấu nào!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('📜 Lịch Sử Đấu Cá Gần Đây')
            .setColor('#4ECDC4')
            .setTimestamp();

        battles.forEach((battle: any, index: number) => {
            const result = battle.userWon ? '🏆' : '💀';
            const fishName = battle.fish?.name || 'Unknown';
            const reward = battle.reward.toLocaleString();
            const date = new Date(battle.battledAt).toLocaleDateString('vi-VN');

            embed.addFields({
                name: `${result} Trận ${index + 1} (${date})`,
                value: `🐟 ${fishName} | 💰 ${reward} coins | 💪 ${battle.userPower} vs ${battle.opponentPower}`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleShowLeaderboard(interaction: ButtonInteraction, messageData: any) {
        const leaderboard = await FishBattleService.getBattleLeaderboard(messageData.guildId, 10);

        if (leaderboard.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('🏆 Bảng Xếp Hạng Đấu Cá')
                .setColor('#FFA500')
                .setDescription('Chưa có dữ liệu đấu cá nào!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Bảng Xếp Hạng Đấu Cá')
            .setColor('#FFD700')
            .setTimestamp();

        leaderboard.forEach((user: any, index: number) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;

            embed.addFields({
                name: `${medal} <@${user.userId}>`,
                value: `🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 💰 ${user.totalEarnings.toLocaleString()} coins`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
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

    private static async handleShowHelp(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('❓ Hướng Dẫn Hệ Thống Đấu Cá')
            .setColor('#FF6B6B')
            .setDescription('Hướng dẫn sử dụng hệ thống đấu cá!')
            .addFields(
                { name: '🎯 Cách sử dụng', value: '1. **Chọn cá** từ dropdown\n2. **Thêm cá** vào túi đấu\n3. **Tìm đối thủ** để đấu\n4. **Xóa cá** khỏi túi đấu nếu cần', inline: false },
                { name: '📊 Thuộc tính cá', value: '💪 Sức mạnh | 🏃 Thể lực | 🧠 Trí tuệ | 🛡️ Phòng thủ | 🍀 May mắn', inline: false },
                { name: '💰 Phần thưởng', value: 'Người thắng: 150% sức mạnh tổng\nNgười thua: 30% sức mạnh tổng', inline: false },
                { name: '⚠️ Điều kiện cá đấu', value: '• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (level 10)\n• Túi đấu tối đa 5 cá', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async updateMessageData(messageData: any) {
        // Cập nhật inventory và eligible fish
        messageData.inventory = await BattleFishInventoryService.getBattleFishInventory(
            messageData.userId, 
            messageData.guildId
        );
        messageData.eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(
            messageData.userId, 
            messageData.guildId
        );
    }

    private static async refreshUI(interaction: ButtonInteraction | StringSelectMenuInteraction, messageData: any) {
        const ui = new BattleFishUI(
            messageData.inventory,
            messageData.eligibleFish,
            messageData.userId,
            messageData.guildId,
            messageData.selectedFishId
        );

        const embed = ui.createEmbed();
        const components = ui.createComponents();

        await interaction.message.edit({
            embeds: [embed],
            components: components
        });
    }

    private static calculatePower(fish: any): number {
        const stats = fish.stats || {};
        const basePower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
        return Math.floor(basePower * (1 + fish.level * 0.1));
    }

    // Lưu message data vào cache
    static setMessageData(messageId: string, data: any) {
        this.battleFishMessages.set(messageId, data);
    }

    // Xóa message data khỏi cache
    static removeMessageData(messageId: string) {
        this.battleFishMessages.delete(messageId);
    }
} 