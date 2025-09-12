import { 
    ButtonInteraction, 
    StringSelectMenuInteraction, 
    ModalSubmitInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { BattleFishInventoryService } from "@/utils/battle-fish-inventory";
import { FishBattleService } from "@/utils/fish-battle";
import { BattleFishUI } from "./BattleFishUI";
import { BattleVisualSystem } from "@/utils/battle-visual";
import { BattleLogHandler } from "./BattleLogHandler";

export class BattleFishHandler {
    private static battleFishMessages = new Map<string, {
        userId: string;
        guildId: string;
        inventory: any;
        eligibleFish: any[];
        selectedFishId?: string;
        currentOpponent?: any;
        currentUserFish?: any;
    }>();

    static async handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
        const customId = interaction.customId;
        const userId = interaction.user.id;
        const guildId = interaction.guildId!;

        console.log(`🔍 [DEBUG] handleInteraction called:`);
        console.log(`  - customId: ${customId}`);
        console.log(`  - userId: ${userId}`);
        console.log(`  - guildId: ${guildId}`);
        console.log(`  - Cache size: ${this.battleFishMessages.size}`);

        // Đối với modal submit, không có messageId, tìm bằng userId và guildId
        let messageData: any = null;
        
        if (interaction.isModalSubmit()) {
            // Tìm data bằng user ID và guild ID cho modal submit
            for (const [key, data] of this.battleFishMessages.entries()) {
                if (data.userId === userId && data.guildId === guildId) {
                    messageData = data;
                    console.log(`  - ✅ Found messageData for modal using key: ${key}`);
                    break;
                }
            }
        } else {
            // Đối với button và select menu, sử dụng messageId
            const messageId = interaction.message.id;
            console.log(`  - messageId: ${messageId}`);
            messageData = this.battleFishMessages.get(messageId);
            
            // Fallback: Tìm data bằng user ID và guild ID nếu không tìm thấy bằng message ID
            if (!messageData) {
                console.log(`  - ❌ No messageData found for messageId: ${messageId}`);
                console.log(`  - Available keys: ${Array.from(this.battleFishMessages.keys()).join(', ')}`);
                
                // Tìm data bằng user ID và guild ID
                for (const [key, data] of this.battleFishMessages.entries()) {
                    if (data.userId === userId && data.guildId === guildId) {
                        messageData = data;
                        console.log(`  - ✅ Found messageData using fallback key: ${key}`);
                        break;
                    }
                }
            }
        }
        
        console.log(`  - Found messageData: ${!!messageData}`);
        
        if (!messageData) {
            console.log(`  - ❌ No messageData found`);
            console.log(`  - Available keys: ${Array.from(this.battleFishMessages.keys()).join(', ')}`);
            return interaction.reply({ 
                content: '❌ Không tìm thấy dữ liệu hoặc bạn không phải chủ sở hữu!', 
                ephemeral: true 
            });
        }

        if (messageData.userId !== userId) {
            console.log(`  - ❌ User ID mismatch: ${messageData.userId} !== ${userId}`);
            return interaction.reply({ 
                content: '❌ Không tìm thấy dữ liệu hoặc bạn không phải chủ sở hữu!', 
                ephemeral: true 
            });
        }

        console.log(`  - ✅ MessageData found and validated`);
        console.log(`  - Current User Fish: ${messageData.currentUserFish?.name || 'undefined'}`);
        console.log(`  - Current Opponent: ${messageData.currentOpponent?.name || 'undefined'}`);

        try {
            if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenu(interaction, messageData);
            } else if (interaction.isButton()) {
                await this.handleButton(interaction, messageData);
            } else if (interaction.isModalSubmit()) {
                await this.handleModalSubmit(interaction, messageData);
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
                content: '❌ Không có cá nào để chọn! Hãy tạo cá thế hệ 2+ và nuôi lên max level.', 
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

        // Xử lý button "Xem chi tiết" battle log
        if (customId.startsWith('view_battle_details_')) {
            await BattleLogHandler.handleViewBattleDetails(interaction);
            return;
        }

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
            case 'battle_fish_confirm_fight':
                await this.handleConfirmFight(interaction, messageData);
                break;
            case 'battle_fish_help':
                await this.handleShowHelp(interaction, messageData);
                break;
            case 'battle_fish_rename':
                await this.handleRenameFish(interaction, messageData);
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
        console.log(`🔍 [DEBUG] handleFindOpponent called:`);
        console.log(`  - messageId: ${interaction.message.id}`);
        console.log(`  - userId: ${messageData.userId}`);
        console.log(`  - guildId: ${messageData.guildId}`);
        console.log(`  - inventory items: ${messageData.inventory?.items?.length || 0}`);
        
        if (messageData.inventory.items.length === 0) {
            console.log(`  - ❌ No fish in battle inventory`);
            await interaction.reply({ 
                content: '❌ Không có cá nào trong túi đấu!', 
                ephemeral: true 
            });
            return;
        }

        // Chọn cá đầu tiên trong túi đấu
        const selectedFish = messageData.inventory.items[0].fish;
        console.log(`  - Selected fish: ${selectedFish.name} (ID: ${selectedFish.id})`);
        
        const opponentResult = await FishBattleService.findRandomOpponent(
            messageData.userId, 
            messageData.guildId, 
            selectedFish.id
        );

        if (!opponentResult.success) {
            console.log(`  - ❌ No opponent found: ${opponentResult.error}`);
            await interaction.reply({ 
                content: `❌ Không tìm thấy đối thủ: ${opponentResult.error}`, 
                ephemeral: true 
            });
            return;
        }

        console.log(`  - ✅ Found opponent: ${opponentResult.opponent.name} (ID: ${opponentResult.opponent.id})`);

        // Lưu thông tin đối thủ để sử dụng sau
        messageData.currentOpponent = opponentResult.opponent;
        messageData.currentUserFish = selectedFish;

        // Lấy thông tin daily battle limit
        const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(
            messageData.userId, 
            messageData.guildId
        );

        // Tạo embed thông tin trước khi đấu
        const stats = selectedFish.stats || {};
        const opponentStats = opponentResult.opponent?.stats || {};
        const userPower = this.calculatePower(selectedFish);
        const opponentPower = this.calculatePower(opponentResult.opponent || {});

        // Kiểm tra xem có phải BOT đối thủ không
        const isBotOpponent = opponentResult.isBot || false;
        const opponentType = isBotOpponent ? '🤖 BOT' : '👤 Người chơi';
        const embedColor = isBotOpponent ? '#9B59B6' : '#FFD700'; // Màu tím cho BOT, vàng cho người chơi
        const embedTitle = isBotOpponent ? '🤖 Tìm Thấy BOT Đối Thủ!' : '⚔️ Tìm Thấy Đối Thủ!';
        const embedDescription = isBotOpponent ? '🤖 Sẵn sàng đấu với BOT! React với ⚔️ để bắt đầu đấu!' : 'React với ⚔️ để bắt đầu đấu!';

        // Tạo visual comparison sử dụng BattleVisualSystem
        let battleVisual = '';
        try {
            battleVisual = BattleVisualSystem.createStatsComparison(stats, opponentStats);
        } catch (error) {
            console.error('Error creating battle visual:', error);
            battleVisual = '❌ Lỗi hiển thị thông tin trận đấu';
        }

        const embed = new EmbedBuilder()
            .setTitle(embedTitle)
            .setColor(embedColor)
            .addFields(
                // Thông tin cơ bản - 2 cột
                { name: '🐟 **CÁ CỦA BẠN**', value: `${selectedFish.name} (Lv.${selectedFish.level})\n💪 Power: ${userPower}`, inline: true },
                { name: '🐟 **ĐỐI THỦ**', value: `${opponentResult.opponent.name} (Lv.${opponentResult.opponent.level})\n💪 Power: ${opponentPower}`, inline: true },
                { name: '👤 **Loại đối thủ**', value: opponentType, inline: true },
                
                // Stats comparison - sử dụng visual system
                { name: '📊 **SO SÁNH STATS**', value: `\`\`\`\n${battleVisual}\n\`\`\``, inline: false },
                
                // Thông tin chi tiết - 2 cột
                { name: '📊 **STATS CỦA BẠN**', value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0}\n🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0}`, inline: true },
                { name: '📊 **STATS ĐỐI THỦ**', value: `💪${opponentStats.strength || 0} 🏃${opponentStats.agility || 0} 🧠${opponentStats.intelligence || 0}\n🛡️${opponentStats.defense || 0} 🍀${opponentStats.luck || 0} 🎯${opponentStats.accuracy || 0}`, inline: true },
                { name: `⏰ **Giới Hạn Đấu Cá**${dailyLimitCheck.isAdmin ? ' 👑 Admin' : ''}`, value: `✅ Còn **${dailyLimitCheck.remainingBattles}/${dailyLimitCheck.isAdmin ? '100' : '20'}** lần đấu cá`, inline: true }
            )
            .setDescription(embedDescription)
            .setTimestamp();

        const battleButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('battle_fish_confirm_fight')
                    .setLabel('⚔️ Bắt Đầu Đấu')
                    .setStyle(ButtonStyle.Danger)
            );

        const reply = await interaction.reply({ 
            embeds: [embed], 
            components: [battleButton],
            ephemeral: true 
        });

        // Lưu messageData cho reply mới
        this.battleFishMessages.set(reply.id, messageData);
        
        // Fallback: Lưu data bằng cách khác nếu reply.id không hoạt động
        const fallbackKey = `battle_${messageData.userId}_${messageData.guildId}_${Date.now()}`;
        this.battleFishMessages.set(fallbackKey, messageData);
        
        console.log(`🔍 [DEBUG] handleFindOpponent completed:`);
        console.log(`  - Original messageId: ${interaction.message.id}`);
        console.log(`  - Reply messageId: ${reply.id}`);
        console.log(`  - Fallback key: ${fallbackKey}`);
        console.log(`  - Cache size after save: ${this.battleFishMessages.size}`);
        console.log(`  - Available keys: ${Array.from(this.battleFishMessages.keys()).join(', ')}`);
        console.log(`  - Current User Fish saved: ${messageData.currentUserFish?.name || 'undefined'}`);
        console.log(`  - Current Opponent saved: ${messageData.currentOpponent?.name || 'undefined'}`);
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
            const userFishName = battle.userFish?.name || 'Unknown Fish';
            const opponentFishName = battle.opponentFish?.name || 'Unknown Opponent';
            const reward = battle.reward.toLocaleString();
            const date = new Date(battle.battledAt).toLocaleDateString('vi-VN');

            embed.addFields({
                name: `${result} Trận ${index + 1} (${date})`,
                value: `🐟 ${userFishName} vs ${opponentFishName} | 🐟 ${reward} FishCoin | 💪 ${battle.userPower} vs ${battle.opponentPower}`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleShowLeaderboard(interaction: ButtonInteraction, messageData: any) {
        const leaderboard = await FishBattleService.getBattleLeaderboard(messageData.guildId, 10);

        // Tạo embed chính cho leaderboard
        const embed = new EmbedBuilder()
            .setTitle('🏆 Bảng Xếp Hạng Đấu Cá')
            .setColor('#FFD700')
            .setTimestamp();

        // Tạo embed riêng cho top 1 với GIF ở chính giữa
        let top1Embed: EmbedBuilder | undefined;
        let hasRealTop1 = false;

        // Luôn hiển thị top 10, kể cả khi không có dữ liệu đấu cá
        for (let i = 0; i < 10; i++) {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            if (i < leaderboard.length) {
                const user = leaderboard[i];
                const winRate = user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0;
                
                // Chuyển đổi BigInt thành Number để tránh lỗi
                const totalEarnings = typeof user.totalEarnings === 'bigint' 
                    ? Number(user.totalEarnings) 
                    : user.totalEarnings;

                // Kiểm tra nếu user có dữ liệu đấu cá thực tế hoặc không phải user test
                const hasRealBattleData = user.totalBattles > 0 || totalEarnings > 0;
                const isTestUser = user.userId.includes('test-') || user.userId.includes('test_') || user.userId.includes('real-battle-user');
                
                if (hasRealBattleData && !isTestUser) {
                    // Hiển thị user thực tế có dữ liệu đấu cá
                    if (i === 0) {
                        // Top 1: Tạo embed riêng với GIF ở trên cùng và căn giữa
                        hasRealTop1 = true;
                        top1Embed = new EmbedBuilder()
                            .setColor('#FFD700')
                            .setThumbnail('https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif?ex=6885d697&is=68848517&hm=e4170005d400feac541c4b903b2fa4d329a734c157da76a12b9dbc13e840145f&=&width=260&height=104')
                            .setDescription(`**<@${user.userId}>**\n🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${totalEarnings.toLocaleString()} FishCoin`);
                    } else {
                        // Các vị trí khác: Hiển thị emoji bình thường
                        embed.addFields({
                            name: `${medal} <@${user.userId}>`,
                            value: `🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${totalEarnings.toLocaleString()} FishCoin`,
                            inline: false
                        });
                    }
                } else {
                    // Ẩn user test hoặc user không có dữ liệu đấu cá
                    embed.addFields({
                        name: `${medal} Trống`,
                        value: `🏆 0W/0L (0%) | 🐟 0 FishCoin`,
                        inline: false
                    });
                }
            } else {
                // Hiển thị tên trống cho các vị trí còn lại
                embed.addFields({
                    name: `${medal} Trống`,
                    value: `🏆 0W/0L (0%) | 🐟 0 FishCoin`,
                    inline: false
                });
            }
        }

        // Nếu không có top 1 thực tế, tạo embed với "Admin"
        if (!hasRealTop1) {
            top1Embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setDescription(`**Admin**\n🏆 0W/0L (0%) | 🐟 0 FishCoin`);
        }

        // Gửi embeds
        const embeds = [];
        if (top1Embed) {
            embeds.push(top1Embed);
        }
        embeds.push(embed);
        
        await interaction.reply({ embeds, ephemeral: true });
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

    private static async handleConfirmFight(interaction: ButtonInteraction, messageData: any) {
        // Kiểm tra xem có thông tin đối thủ đã tìm thấy không
        if (!messageData.currentOpponent || !messageData.currentUserFish) {
            await interaction.reply({ 
                content: '❌ Vui lòng tìm đối thủ trước khi đấu!', 
                ephemeral: true 
            });
            return;
        }

        const selectedFish = messageData.currentUserFish;
        const opponent = messageData.currentOpponent;

        // Bắt đầu battle với visual system
        await interaction.deferReply({ ephemeral: true });

        // Tạo battle animation với 3 hiệp
        try {
            console.log('🎨 Creating multi-round battle animation...');
            console.log('Selected fish:', selectedFish);
            console.log('Opponent:', opponent);
            
            const userMaxHP = this.calculateMaxHP(selectedFish);
            const opponentMaxHP = this.calculateMaxHP(opponent);
            
            // Tạo animation data (kết thúc khi HP về 0)
            const battleRounds = BattleVisualSystem.createBattleAnimation(
                selectedFish, 
                opponent, 
                userMaxHP, 
                opponentMaxHP
            );
            
            console.log('Battle rounds created:', battleRounds.length);
            
            // Lấy thông tin skills cho battle visual
            const { SkillBattleService } = await import("@/utils/skill-battle");
            const userBattleSkills = await SkillBattleService.initializeBattleSkills(selectedFish.id);
            const opponentBattleSkills = opponent.isBot ? 
                { skills: [], cooldowns: new Map() } : 
                await SkillBattleService.initializeBattleSkills(opponent.id);
            
            // Hiển thị từng hiệp với delay
            for (let i = 0; i < battleRounds.length; i++) {
                const roundData = battleRounds[i];
                const roundDisplay = BattleVisualSystem.createMultiRoundBattle(
                    selectedFish, 
                    opponent, 
                    [roundData],
                    userBattleSkills.skills,
                    opponentBattleSkills.skills
                );
                
                const battleEmbed = new EmbedBuilder()
                    .setTitle(`⚔️ HIỆP ${roundData.round} - BATTLE ARENA`)
                    .setColor('#FF6B6B')
                    .setDescription(`\`\`\`\n${roundDisplay}\n\`\`\``)
                    .setTimestamp();

                await interaction.editReply({ embeds: [battleEmbed] });
                
                // Chờ 0.5 giây giữa các hiệp
                if (i < battleRounds.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            // Chờ thêm 1 giây trước khi hiển thị kết quả
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error('❌ Error creating battle animation:', error);
            // Fallback to simple message
            const battleEmbed = new EmbedBuilder()
                .setTitle('⚔️ Đang Chiến Đấu...')
                .setColor('#FF6B6B')
                .setDescription(`**${selectedFish.name}** vs **${opponent.name}**`)
                .setTimestamp();

            await interaction.editReply({ embeds: [battleEmbed] });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Thực hiện battle
        const battleResult = await FishBattleService.battleFish(
            messageData.userId, 
            messageData.guildId, 
            selectedFish.id, 
            opponent.id,
            opponent // Truyền opponentData cho BOT
        );

        if ('success' in battleResult && !battleResult.success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi đấu cá!')
                .setColor('#FF0000')
                .setDescription(battleResult.error)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const result = battleResult as any;
        const isUserWinner = result.winner.id === selectedFish.id;
        const reward = isUserWinner ? result.rewards.winner : result.rewards.loser;

        // Lấy thông tin daily battle limit mới sau khi đấu
        const updatedDailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(
            messageData.userId, 
            messageData.guildId
        );

        // Kiểm tra quyền admin
        const isAdmin = await FishBattleService.isAdministrator(messageData.userId, messageData.guildId);

        // Hiển thị kết quả với visual system
        try {
            const battleResultDisplay = BattleVisualSystem.createDetailedBattleResult(result, isUserWinner, result.battleLog);
            
            // Kiểm tra độ dài và chia nhỏ nếu cần
            const maxLength = 1000; // Để lại chỗ cho markdown
            let displayValue = `\`\`\`\n${battleResultDisplay}\n\`\`\``;
            
            if (displayValue.length > maxLength) {
                // Rút gọn bằng cách chỉ hiển thị thông tin chính nhưng vẫn có HP
                let shortDisplay = `🏆 **${result.winner.name}** thắng **${result.loser.name}**\n💪 Sức mạnh: ${result.winnerPower} vs ${result.loserPower}\n💰 Phần thưởng: ${reward.toLocaleString()} FishCoin`;
                
                // Thêm HP nếu có
                if (result.finalHP) {
                    const winnerHP = result.finalHP.winner;
                    const loserHP = result.finalHP.loser;
                    shortDisplay += `\n❤️ HP Người thắng: ${winnerHP.current}/${winnerHP.max} (${winnerHP.percentage}%)\n💔 HP Người thua: ${loserHP.current}/${loserHP.max} (${loserHP.percentage}%)`;
                }
                
                displayValue = `\`\`\`\n${shortDisplay}\n\`\`\``;
            }
            
            const battleEmbed = new EmbedBuilder()
                .setTitle(isUserWinner ? '🏆 Chiến Thắng!' : '💀 Thất Bại!')
                .setColor(isUserWinner ? '#00FF00' : '#FF0000')
                .addFields(
                    { 
                        name: '⚔️ Kết Quả Trận Đấu', 
                        value: displayValue, 
                        inline: false 
                    },
                    { 
                        name: isAdmin ? '⏰ Giới Hạn Đấu Cá Hôm Nay (👑 Admin)' : '⏰ Giới Hạn Đấu Cá Hôm Nay', 
                        value: isAdmin 
                            ? `✅ Còn **${updatedDailyLimitCheck.remainingBattles}/20** lần đấu cá\n👑 **Không bị giới hạn - có thể đấu vô hạn**`
                            : `✅ Còn **${updatedDailyLimitCheck.remainingBattles}/20** lần đấu cá`, 
                        inline: true 
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [battleEmbed] });
        } catch (error) {
            console.error('Error creating visual battle result:', error);
            // Fallback to old display
            const battleEmbed = new EmbedBuilder()
                .setTitle(isUserWinner ? '🏆 Chiến Thắng!' : '💀 Thất Bại!')
                .setColor(isUserWinner ? '#00FF00' : '#FF0000')
                .addFields(
                    { name: '🐟 Người thắng', value: result.winner.name, inline: true },
                    { name: '🐟 Người thua', value: result.loser.name, inline: true },
                    { name: '🐟 Phần thưởng', value: `${reward.toLocaleString()} FishCoin`, inline: true },
                    { name: '💪 Sức mạnh', value: `${result.winnerPower} vs ${result.loserPower}`, inline: true },
                    { 
                        name: isAdmin ? '⏰ Giới Hạn Đấu Cá Hôm Nay (👑 Admin)' : '⏰ Giới Hạn Đấu Cá Hôm Nay', 
                        value: isAdmin 
                            ? `✅ Còn **${updatedDailyLimitCheck.remainingBattles}/20** lần đấu cá\n👑 **Không bị giới hạn - có thể đấu vô hạn**`
                            : `✅ Còn **${updatedDailyLimitCheck.remainingBattles}/20** lần đấu cá`, 
                        inline: true 
                    }
                )
                .setDescription(result.battleLog.join('\n'))
                .setTimestamp();

            await interaction.editReply({ embeds: [battleEmbed] });
        }
    }

    private static async handleShowHelp(interaction: ButtonInteraction, messageData: any) {
        const embed = new EmbedBuilder()
            .setTitle('❓ Hướng Dẫn Hệ Thống Đấu Cá')
            .setColor('#FF6B6B')
            .setDescription('Hướng dẫn sử dụng hệ thống đấu cá!')
            .addFields(
                { name: '🎯 Cách sử dụng', value: '1. **Chọn cá** từ dropdown\n2. **Thêm cá** vào túi đấu\n3. **Tìm đối thủ** để đấu\n4. **Xóa cá** khỏi túi đấu nếu cần\n5. **Đổi tên cá** trong túi đấu', inline: false },
                { name: '📊 Thuộc tính cá', value: '💪 Sức mạnh | 🏃 Thể lực | 🧠 Trí tuệ | 🛡️ Phòng thủ | 🍀 May mắn', inline: false },
                { name: '💰 Phần thưởng', value: 'Người thắng: 150% sức mạnh tổng\nNgười thua: 30% sức mạnh tổng', inline: false },
                { name: '⚠️ Điều kiện cá đấu', value: '• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (đạt max level)\n• Túi đấu tối đa 5 cá', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private static async handleRenameFish(interaction: ButtonInteraction, messageData: any) {
        const actualFishId = messageData.selectedFishId?.replace('battle_', '');
        
        if (!actualFishId) {
            await interaction.reply({ 
                content: '❌ Vui lòng chọn cá trong túi đấu để đổi tên!', 
                ephemeral: true 
            });
            return;
        }

        // Tìm cá được chọn để lấy tên hiện tại
        const selectedItem = messageData.inventory.items.find((item: any) => item.fish.id === actualFishId);
        if (!selectedItem) {
            await interaction.reply({ 
                content: '❌ Không tìm thấy cá được chọn!', 
                ephemeral: true 
            });
            return;
        }

        const currentName = selectedItem.fish.name || selectedItem.fish.species;

        // Tạo modal để nhập tên mới
        const { ModalBuilder, TextInputBuilder, TextInputStyle } = await import('discord.js');
        
        const modal = new ModalBuilder()
            .setCustomId(`rename_fish_modal_${actualFishId}`)
            .setTitle('✏️ Đổi Tên Cá');

        const nameInput = new TextInputBuilder()
            .setCustomId('new_fish_name')
            .setLabel('Tên mới cho cá')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(`Nhập tên mới cho cá (hiện tại: ${currentName})`)
            .setValue(currentName)
            .setRequired(true)
            .setMaxLength(50)
            .setMinLength(1);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    private static async handleModalSubmit(interaction: ModalSubmitInteraction, messageData: any) {
        const customId = interaction.customId;
        
        if (customId.startsWith('rename_fish_modal_')) {
            const fishId = customId.replace('rename_fish_modal_', '');
            const newName = interaction.fields.getTextInputValue('new_fish_name');
            
            // Đổi tên cá
            const result = await BattleFishInventoryService.renameFish(
                messageData.userId,
                messageData.guildId,
                fishId,
                newName
            );

            if (result.success) {
                // Cập nhật dữ liệu
                await this.updateMessageData(messageData);
                
                await interaction.reply({ 
                    content: `✅ Đã đổi tên cá thành **${newName}**!\n💡 Sử dụng \`n.fishbattle ui\` để xem giao diện đã cập nhật.`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: `❌ Không thể đổi tên cá: ${result.error}`, 
                    ephemeral: true 
                });
            }
        }
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
        
        // Cập nhật daily battle info
        messageData.dailyBattleInfo = await FishBattleService.checkAndResetDailyBattleCount(
            messageData.userId, 
            messageData.guildId
        );
    }

    private static async refreshUI(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction, messageData: any) {
        // Đối với modal submit, không thể refresh UI vì không có message
        if (interaction.isModalSubmit()) {
            return;
        }

        // Sử dụng daily battle info từ messageData nếu có, nếu không thì lấy mới
        const dailyBattleInfo = messageData.dailyBattleInfo || await FishBattleService.checkAndResetDailyBattleCount(
            messageData.userId, 
            messageData.guildId
        );
        
        const ui = new BattleFishUI(
            messageData.inventory,
            messageData.eligibleFish,
            messageData.userId,
            messageData.guildId,
            messageData.selectedFishId,
            dailyBattleInfo
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
        const basePower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0) + (stats.accuracy || 0);
        return Math.floor(basePower * (1 + fish.level * 0.1));
    }

    private static calculateMaxHP(fish: any): number {
        const baseHP = 1000;
        const levelBonus = (fish.level || 1) * 10;
        const defenseBonus = (fish.stats?.defense || 0) * 5;
        return baseHP + levelBonus + defenseBonus;
    }

    // Lưu message data vào cache
    static setMessageData(messageId: string, data: any) {
        console.log(`🔍 [DEBUG] setMessageData called:`);
        console.log(`  - messageId: ${messageId}`);
        console.log(`  - userId: ${data.userId}`);
        console.log(`  - guildId: ${data.guildId}`);
        console.log(`  - inventory items: ${data.inventory?.items?.length || 0}`);
        console.log(`  - eligibleFish: ${data.eligibleFish?.length || 0}`);
        console.log(`  - Cache size before: ${this.battleFishMessages.size}`);
        
        this.battleFishMessages.set(messageId, data);
        
        console.log(`  - Cache size after: ${this.battleFishMessages.size}`);
        console.log(`  - Available keys: ${Array.from(this.battleFishMessages.keys()).join(', ')}`);
    }

    // Xóa message data khỏi cache
    static removeMessageData(messageId: string) {
        this.battleFishMessages.delete(messageId);
    }
} 