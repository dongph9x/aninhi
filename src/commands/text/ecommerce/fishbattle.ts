import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { Bot } from "@/classes";
import { FishBattleService } from "@/utils/fish-battle";
import { BattleFishInventoryService } from "@/utils/battle-fish-inventory";
import { FishBreedingService } from "@/utils/fish-breeding";
import { BattleFishUI } from "@/components/MessageComponent/BattleFishUI";
import { BattleFishHandler } from "@/components/MessageComponent/BattleFishHandler";

// Lưu trữ lời mời battle tạm thời
interface BattleInvite {
    inviterId: string;
    inviterName: string;
    targetId: string;
    targetName: string;
    guildId: string;
    fishId: string;
    fishName: string;
    timestamp: number;
    messageId: string;
}

// Map để lưu trữ lời mời battle
const battleInvites = new Map<string, BattleInvite>();

export default Bot.createCommand({
    structure: {
        name: "fishbattle",
        aliases: ["battle", "fb"],
    },
    options: {
        cooldown: 5000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const args = message.content.split(" ").slice(1);
        const guildId = message.guildId!;
        const userId = message.author.id;

        if (args.length === 0) {
            // Thay vì hiển thị help, tìm đối thủ ngẫu nhiên
            return await findRandomBattle(message, userId, guildId);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "help":
                return await showBattleHelp(message);
            case "ui":
                return await showBattleUI(message, userId, guildId);
            case "add":
                return await addFishToBattleInventory(message, userId, guildId, args.slice(1));
            case "list":
                return await showBattleInventory(message, userId, guildId);
            case "remove":
                return await removeFishFromBattleInventory(message, userId, guildId, args.slice(1));
            case "stats":
                return await showBattleStats(message, userId, guildId);
            case "history":
                return await showBattleHistory(message, userId, guildId);
            case "leaderboard":
                return await showBattleLeaderboard(message, guildId);
            case "invite":
                return await invitePlayerToBattle(message, userId, guildId, args.slice(1));
            default:
                return await findRandomBattle(message, userId, guildId);
        }
    },
});

async function showBattleUI(message: any, userId: string, guildId: string) {
    try {
        // Lấy dữ liệu
        const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
        const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(userId, guildId);
        const dailyBattleInfo = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
        
        // Tạo UI
        const ui = new BattleFishUI(inventory, eligibleFish, userId, guildId, undefined, dailyBattleInfo);
        const embed = ui.createEmbed();
        const components = ui.createComponents();

        // Gửi message
        const sentMessage = await message.reply({
            embeds: [embed],
            components: components
        });

        // Lưu message data để xử lý interaction
        BattleFishHandler.setMessageData(sentMessage.id, {
            userId,
            guildId,
            inventory,
            eligibleFish,
            selectedFishId: undefined,
            dailyBattleInfo
        });

    } catch (error) {
        console.error('Error showing battle UI:', error);
        message.reply('❌ Có lỗi xảy ra khi mở giao diện đấu cá!');
    }
}

async function showBattleHelp(message: any) {
    const helpEmbed = new EmbedBuilder()
        .setTitle('⚔️ Hệ Thống Đấu Cá')
        .setColor('#FF6B6B')
        .setDescription('Đấu cá với các thuộc tính di truyền!')
        .addFields(
            { name: '🎯 Cách sử dụng', value: '`n.fishbattle ui` - Mở giao diện đấu cá (Khuyến nghị)\n`n.fishbattle` - Tìm đối thủ ngẫu nhiên\n`n.fishbattle invite @người_chơi` - Mời người chơi khác đấu cá\n`n.fishbattle add <fish_id>` - Thêm cá vào túi đấu\n`n.fishbattle list` - Xem túi đấu cá\n`n.fishbattle remove <fish_id>` - Xóa cá khỏi túi đấu\n`n.fishbattle stats` - Xem thống kê đấu cá\n`n.fishbattle history` - Xem lịch sử đấu gần đây\n`n.fishbattle leaderboard` - Bảng xếp hạng đấu cá\n**Trong UI:** Chọn cá và nhấn "✏️ Đổi Tên" để đổi tên cá', inline: false },
            { name: '📊 Thuộc tính cá', value: '💪 Sức mạnh | 🏃 Thể lực | 🧠 Trí tuệ | 🛡️ Phòng thủ | 🍀 May mắn', inline: false },
            { name: '💰 Phần thưởng', value: 'Người thắng: 150% sức mạnh tổng\nNgười thua: 30% sức mạnh tổng', inline: false },
            { name: '⚠️ Điều kiện cá đấu', value: '• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (level 10)\n• Túi đấu tối đa 5 cá', inline: false },
            { name: '⏰ Giới hạn đấu cá', value: '• Tối đa 20 lần đấu cá mỗi ngày\n• Reset vào 00:00 ngày mai\n• Cooldown 1 phút giữa các lần đấu', inline: false },
            { name: '🤝 Mời đấu cá', value: '• Sử dụng `n.fishbattle invite @người_chơi` để mời\n• Người được mời có 5 phút để chấp nhận/từ chối\n• Cả hai người phải có cá trong túi đấu\n• Không thể mời chính mình', inline: false }
        )
        .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
}

async function addFishToBattleInventory(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length === 0) {
        return message.reply('❌ Vui lòng cung cấp ID của cá! Ví dụ: `n.fishbattle add <fish_id>`');
    }

    const fishId = args[0];
    const result = await BattleFishInventoryService.addFishToBattleInventory(userId, guildId, fishId);

    if (result.success && result.inventoryItem) {
        const embed = new EmbedBuilder()
            .setTitle('✅ Đã thêm cá vào túi đấu!')
            .setColor('#00FF00')
            .setDescription(`🐟 **${result.inventoryItem.fish.name}** đã được thêm vào túi đấu`)
            .addFields(
                { name: '📊 Thông tin cá', value: `Level: ${result.inventoryItem.fish.level} | Thế hệ: ${result.inventoryItem.fish.generation}`, inline: true },
                { name: '💰 Giá trị', value: `${result.inventoryItem.fish.value.toLocaleString()} coins`, inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không thể thêm cá!')
            .setColor('#FF0000')
            .setDescription(result.error || 'Không thể thêm cá vào túi đấu')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}

async function showBattleInventory(message: any, userId: string, guildId: string) {
    const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
    const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(userId, guildId);

    const embed = new EmbedBuilder()
        .setTitle('⚔️ Túi Đấu Cá')
        .setColor('#4ECDC4')
        .setDescription(`**${inventory.items.length}/${inventory.capacity}** cá trong túi đấu`);

    if (inventory.items.length > 0) {
        embed.addFields({ name: '🐟 Cá trong túi đấu', value: inventory.items.map((item: any, index: number) => 
            `${index + 1}. **${item.fish.name}** (Lv.${item.fish.level}, Gen.${item.fish.generation}) - 💰${item.fish.value.toLocaleString()}`
        ).join('\n'), inline: false });
    }

    if (eligibleFish.length > 0) {
        embed.addFields({ name: '📋 Cá có thể thêm vào túi đấu', value: eligibleFish.slice(0, 5).map((fish: any, index: number) => 
            `${index + 1}. **${fish.name}** (Lv.${fish.level}, Gen.${fish.generation}) - 💰${fish.value.toLocaleString()}`
        ).join('\n'), inline: false });
    }

    embed.setTimestamp();
    return message.reply({ embeds: [embed] });
}

async function removeFishFromBattleInventory(message: any, userId: string, guildId: string, args: string[]) {
    if (args.length === 0) {
        return message.reply('❌ Vui lòng cung cấp ID của cá! Ví dụ: `n.fishbattle remove <fish_id>`');
    }

    const fishId = args[0];
    const result = await BattleFishInventoryService.removeFishFromBattleInventory(userId, guildId, fishId);

    if (result.success) {
        const embed = new EmbedBuilder()
            .setTitle('✅ Đã xóa cá khỏi túi đấu!')
            .setColor('#00FF00')
            .setDescription('Cá đã được xóa khỏi túi đấu thành công')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không thể xóa cá!')
            .setColor('#FF0000')
            .setDescription(result.error || 'Không thể xóa cá khỏi túi đấu')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
}

async function findRandomBattle(message: any, userId: string, guildId: string) {
    // Kiểm tra daily battle limit
    const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
    if (!dailyLimitCheck.canBattle) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Đã Đạt Giới Hạn Đấu Cá!')
            .setColor('#FF0000')
            .setDescription(dailyLimitCheck.error || 'Bạn đã đạt giới hạn đấu cá trong ngày!')
            .addFields(
                { name: '📊 Giới Hạn', value: '20 lần đấu cá mỗi ngày', inline: true },
                { name: '🕐 Reset', value: 'Vào 00:00 ngày mai', inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Lấy battle inventory để chọn cá
    const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
    const battleFish = inventory.items;

    if (battleFish.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không có cá để đấu!')
            .setColor('#FF0000')
            .setDescription('Bạn cần có ít nhất 1 cá trong túi đấu để đấu.\n\n**Điều kiện cá đấu:**\n• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (level 10)\n\nSử dụng `n.fishbattle add <fish_id>` để thêm cá vào túi đấu!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Chọn cá đầu tiên (có thể cải thiện để cho user chọn)
    const selectedFish = battleFish[0].fish;
    
    // Tìm đối thủ
    const opponentResult = await FishBattleService.findRandomOpponent(userId, guildId, selectedFish.id);
    
    if (!opponentResult.success) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không tìm thấy đối thủ!')
            .setColor('#FF0000')
            .setDescription(opponentResult.error || 'Không có đối thủ nào trong server!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Kiểm tra opponent có tồn tại không
    if (!opponentResult.opponent) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Lỗi tìm đối thủ!')
            .setColor('#FF0000')
            .setDescription('Không thể tìm thấy thông tin đối thủ!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Kiểm tra xem có phải BOT đối thủ không
    const isBotOpponent = opponentResult.isBot || false;

    // Hiển thị thông tin trước khi đấu
    const stats = selectedFish.stats || {};
    const opponentStats = opponentResult.opponent.stats || {};
    const userPower = FishBreedingService.calculateTotalPowerWithLevel(selectedFish);
    const opponentPower = FishBreedingService.calculateTotalPowerWithLevel(opponentResult.opponent);

    // Tạo embed với thông tin đối thủ (có thể là BOT hoặc người chơi)
    const opponentType = isBotOpponent ? '🤖 BOT' : '👤 Người chơi';
    const embedColor = isBotOpponent ? '#9B59B6' : '#FFD700'; // Màu tím cho BOT, vàng cho người chơi
    const embedTitle = isBotOpponent ? '🤖 Tìm Thấy BOT Đối Thủ!' : '⚔️ Tìm Thấy Đối Thủ!';
    const embedDescription = isBotOpponent ? '🤖 Sẵn sàng đấu với BOT! React với ⚔️ để bắt đầu đấu!' : 'React với ⚔️ để bắt đầu đấu!';

    const embed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setColor(embedColor)
        .addFields(
            { name: '🐟 Cá của bạn', value: `${selectedFish.name} (Lv.${selectedFish.level})`, inline: true },
            { name: '🐟 Đối thủ', value: `${opponentResult.opponent.name} (Lv.${opponentResult.opponent.level})`, inline: true },
            { name: '👤 Loại đối thủ', value: opponentType, inline: true },
            { name: '💪 Sức mạnh', value: `${userPower} vs ${opponentPower}`, inline: true },
            { name: '📊 Stats của bạn', value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0}`, inline: false },
            { name: '📊 Stats đối thủ', value: `💪${opponentStats.strength || 0} 🏃${opponentStats.agility || 0} 🧠${opponentStats.intelligence || 0} 🛡️${opponentStats.defense || 0} 🍀${opponentStats.luck || 0} 🎯${opponentStats.accuracy || 0}`, inline: false },
            { name: '⏰ Giới Hạn Đấu Cá Hôm Nay', value: `✅ Còn **${dailyLimitCheck.remainingBattles}/20** lần đấu cá`, inline: true }
        )
        .setDescription(embedDescription)
        .setTimestamp();

    // Tạo buttons Accept và Cancel
    const acceptButton = new ButtonBuilder()
        .setCustomId(`battle_accept_${selectedFish.id}_${opponentResult.opponent.id}`)
        .setLabel(' Chấp Nhận Đấu')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚔️');

    const cancelButton = new ButtonBuilder()
        .setCustomId(`battle_cancel_${selectedFish.id}_${opponentResult.opponent.id}`)
        .setLabel(' Hủy Đấu')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌');

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(acceptButton, cancelButton);

    const battleMessage = await message.reply({ 
        embeds: [embed], 
        components: [buttonRow] 
    });

    // Tạo collector để chờ button interaction
    const buttonFilter = (interaction: any) => interaction.user.id === userId;
    const buttonCollector = battleMessage.createMessageComponentCollector({ 
        filter: buttonFilter, 
        time: 30000, 
        max: 1 
    });

    buttonCollector.on('collect', async (interaction: any) => {
        if (interaction.customId.startsWith('battle_cancel_')) {
            // Người dùng hủy đấu
            const cancelEmbed = new EmbedBuilder()
                .setTitle('❌ Đã Hủy Đấu')
                .setColor('#FF0000')
                .setDescription('Bạn đã hủy trận đấu.')
                .setTimestamp();

            await interaction.update({ 
                embeds: [cancelEmbed], 
                components: [] 
            });
            return;
        }

        if (interaction.customId.startsWith('battle_accept_')) {
            // Người dùng chấp nhận đấu
            await interaction.deferUpdate();

            // Bắt đầu battle với visual system mới - kết thúc khi HP về 0
            try {
            // Import BattleVisualSystem
            const { BattleVisualSystem } = await import("@/utils/battle-visual");
            
            const userMaxHP = calculateMaxHP(selectedFish);
            const opponentMaxHP = calculateMaxHP(opponentResult.opponent);
            
            // Tạo animation data (kết thúc khi HP về 0)
            const battleRounds = BattleVisualSystem.createBattleAnimation(
                selectedFish, 
                opponentResult.opponent, 
                userMaxHP, 
                opponentMaxHP
            );
            
            // Hiển thị từng hiệp với delay
            for (let i = 0; i < battleRounds.length; i++) {
                const roundData = battleRounds[i];
                const roundDisplay = BattleVisualSystem.createMultiRoundBattle(
                    selectedFish, 
                    opponentResult.opponent, 
                    [roundData]
                );
                
                const battleEmbed = new EmbedBuilder()
                    .setTitle(`⚔️ HIỆP ${roundData.round} - BATTLE ARENA`)
                    .setColor('#FF6B6B')
                    .setDescription(`\`\`\`\n${roundDisplay}\n\`\`\``)
                    .setTimestamp();

                await battleMessage.edit({ embeds: [battleEmbed] });
                
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
                .setDescription(`**${selectedFish.name}** vs **${opponentResult.opponent.name}**`)
                .setTimestamp();

            await battleMessage.edit({ embeds: [battleEmbed] });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Thực hiện battle
        const battleResult = await FishBattleService.battleFish(userId, guildId, selectedFish.id, opponentResult.opponent.id, opponentResult.opponent);
        
        if ('success' in battleResult && !battleResult.success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi đấu cá!')
                .setColor('#FF0000')
                .setDescription(battleResult.error)
                .setTimestamp();

            return battleMessage.edit({ embeds: [errorEmbed] });
        }

        const result = battleResult as any;
        const isUserWinner = result.winner.id === selectedFish.id;
        const reward = isUserWinner ? result.rewards.winner : result.rewards.loser;

        // Lấy thông tin daily battle limit mới sau khi đấu
        const updatedDailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
        
        // Kiểm tra quyền admin
        const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
        
        // Hiển thị kết quả với visual system mới
        try {
            // Import BattleVisualSystem
            const { BattleVisualSystem } = await import("@/utils/battle-visual");
            const battleResultDisplay = BattleVisualSystem.createSummaryBattleResult(result, isUserWinner, result.battleId);
            
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
            
            // Tạo button "Xem chi tiết" nếu có battleId
            const components = [];
            if (result.battleId) {
                const viewDetailsButton = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`view_battle_details_${result.battleId}`)
                            .setLabel('📜 Xem Chi Tiết')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🔍')
                    );
                components.push(viewDetailsButton);
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

            battleMessage.edit({ 
                embeds: [battleEmbed],
                components: components.length > 0 ? components : undefined
            });
        } catch (error) {
            console.error('Error creating visual battle result:', error);
            // Fallback to old display
            const fallbackComponents = [];
            if (result.battleId) {
                const viewDetailsButton = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`view_battle_details_${result.battleId}`)
                            .setLabel('📜 Xem Chi Tiết')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🔍')
                    );
                fallbackComponents.push(viewDetailsButton);
            }

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

            battleMessage.edit({ 
                embeds: [battleEmbed],
                components: fallbackComponents.length > 0 ? fallbackComponents : undefined
            });
            }
        }
    });

    buttonCollector.on('end', (collected: any) => {
        if (collected.size === 0) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Hết thời gian!')
                .setColor('#FFA500')
                .setDescription('Bạn không phản hồi kịp thời. Trận đấu bị hủy.')
                .setTimestamp();

            battleMessage.edit({ embeds: [timeoutEmbed], components: [] });
        }
    });
}

async function showBattleStats(message: any, userId: string, guildId: string) {
    const stats = await FishBattleService.getBattleStats(userId, guildId);

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

    message.reply({ embeds: [embed] });
}

async function showBattleHistory(message: any, userId: string, guildId: string) {
    const battles = await FishBattleService.getRecentBattles(userId, guildId, 5);

    if (battles.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('📜 Lịch Sử Đấu Cá')
            .setColor('#FFA500')
            .setDescription('Bạn chưa có trận đấu nào!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
        .setTitle('📜 Lịch Sử Đấu Cá Gần Đây')
        .setColor('#4ECDC4')
        .setTimestamp();

    battles.forEach((battle, index) => {
        const result = battle.userWon ? '🏆' : '💀';
        const fishName = battle.userFish?.name || 'Unknown';
        const reward = battle.reward.toLocaleString();
        const date = new Date(battle.battledAt).toLocaleDateString('vi-VN');

        embed.addFields({
            name: `${result} Trận ${index + 1} (${date})`,
            value: `🐟 ${fishName} | 💰 ${reward} coins | 💪 ${battle.userPower} vs ${battle.opponentPower}`,
            inline: false
        });
    });

    message.reply({ embeds: [embed] });
}

async function showBattleLeaderboard(message: any, guildId: string) {
    const leaderboard = await FishBattleService.getBattleLeaderboard(guildId, 10);

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
            
            // Kiểm tra nếu user có dữ liệu đấu cá thực tế hoặc không phải user test
            const hasRealBattleData = user.totalBattles > 0 || user.totalEarnings > 0;
            const isTestUser = user.userId.includes('test-') || user.userId.includes('test_') || user.userId.includes('real-battle-user');
            
            if (hasRealBattleData && !isTestUser) {
                // Hiển thị user thực tế có dữ liệu đấu cá
                if (i === 0) {
                    // Top 1: Tạo embed riêng với GIF ở trên cùng và căn giữa
                    hasRealTop1 = true;
                    top1Embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setThumbnail('https://media.discordapp.net/attachments/1396335030216822875/1398569225718861854/113_144.gif?ex=6885d697&is=68848517&hm=e4170005d400feac541c4b903b2fa4d329a734c157da76a12b9dbc13e840145f&=&width=260&height=104')
                        .setDescription(`**<@${user.userId}>**\n🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`);
                } else {
                    // Các vị trí khác: Hiển thị emoji bình thường
                    embed.addFields({
                        name: `${medal} <@${user.userId}>`,
                        value: `🏆 ${user.wins}W/${user.totalBattles}L (${winRate}%) | 🐟 ${user.totalEarnings.toLocaleString()} FishCoin`,
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
    
    message.reply({ embeds });
}

// Helper function để tính max HP
function calculateMaxHP(fish: any): number {
    try {
        const baseHP = 100;
        const levelBonus = (fish.level || 1) * 10;
        const defenseBonus = (fish.stats?.defense || 0) * 5;
        return baseHP + levelBonus + defenseBonus;
    } catch (error) {
        console.error('Error calculating max HP:', error);
        return 100;
    }
}

async function invitePlayerToBattle(message: any, userId: string, guildId: string, args: string[]) {
    // Kiểm tra tham số
    if (args.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Thiếu tham số!')
            .setColor('#FF0000')
            .setDescription('Vui lòng mention người chơi bạn muốn mời đấu!\n\n**Cách sử dụng:** `n.fishbattle invite @người_chơi`')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Lấy mention từ message
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không tìm thấy người chơi!')
            .setColor('#FF0000')
            .setDescription('Vui lòng mention người chơi bạn muốn mời đấu!\n\n**Cách sử dụng:** `n.fishbattle invite @người_chơi`')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    const targetId = mentionedUser.id;
    const targetName = mentionedUser.displayName || mentionedUser.username;

    // Không thể mời chính mình
    if (targetId === userId) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không thể mời chính mình!')
            .setColor('#FF0000')
            .setDescription('Bạn không thể mời chính mình đấu cá!')
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Kiểm tra daily battle limit
    const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
    if (!dailyLimitCheck.canBattle) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Đã Đạt Giới Hạn Đấu Cá!')
            .setColor('#FF0000')
            .setDescription(dailyLimitCheck.error || 'Bạn đã đạt giới hạn đấu cá trong ngày!')
            .addFields(
                { name: '📊 Giới Hạn', value: '20 lần đấu cá mỗi ngày', inline: true },
                { name: '🕐 Reset', value: 'Vào 00:00 ngày mai', inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Lấy battle inventory để chọn cá
    const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
    const battleFish = inventory.items;

    if (battleFish.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Không có cá để đấu!')
            .setColor('#FF0000')
            .setDescription('Bạn cần có ít nhất 1 cá trong túi đấu để mời đấu.\n\n**Điều kiện cá đấu:**\n• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (level 10)\n\nSử dụng `n.fishbattle add <fish_id>` để thêm cá vào túi đấu!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Chọn cá đầu tiên (có thể cải thiện để cho user chọn)
    const selectedFish = battleFish[0].fish;

    // Kiểm tra xem người được mời có cá để đấu không
    const targetInventory = await BattleFishInventoryService.getBattleFishInventory(targetId, guildId);
    if (targetInventory.items.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Người chơi không có cá để đấu!')
            .setColor('#FF0000')
            .setDescription(`<@${targetId}> chưa có cá nào trong túi đấu!\n\nHọ cần sử dụng \`n.fishbattle add <fish_id>\` để thêm cá vào túi đấu trước.`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Kiểm tra xem có lời mời đang chờ từ người này không
    const existingInvite = Array.from(battleInvites.values()).find(
        invite => invite.inviterId === userId && invite.targetId === targetId && 
        (Date.now() - invite.timestamp) < 300000 // 5 phút
    );

    if (existingInvite) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Đã có lời mời đang chờ!')
            .setColor('#FF0000')
            .setDescription(`Bạn đã gửi lời mời đấu cá cho <@${targetId}> rồi!\nVui lòng chờ họ phản hồi hoặc lời mời hết hạn (5 phút).`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Tạo lời mời battle với ID ngắn hơn
    const inviteId = `invite_${Date.now().toString(36)}`;
    const inviterName = message.author.displayName || message.author.username;

    const invite: BattleInvite = {
        inviterId: userId,
        inviterName: inviterName,
        targetId: targetId,
        targetName: targetName,
        guildId: guildId,
        fishId: selectedFish.id,
        fishName: selectedFish.name,
        timestamp: Date.now(),
        messageId: ''
    };

    // Tạo embed lời mời
    const stats = selectedFish.stats || {};
    const userPower = FishBreedingService.calculateTotalPowerWithLevel(selectedFish);

    const embed = new EmbedBuilder()
        .setTitle('⚔️ Lời Mời Đấu Cá!')
        .setColor('#FFD700')
        .setDescription(`<@${targetId}>, <@${userId}> muốn mời bạn đấu cá!`)
        .addFields(
            { name: '🐟 Cá của người mời', value: `${selectedFish.name} (Lv.${selectedFish.level})`, inline: true },
            { name: '💪 Sức mạnh', value: `${userPower}`, inline: true },
            { name: '📊 Stats', value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0}`, inline: false },
            { name: '⏰ Thời gian hết hạn', value: '5 phút', inline: true }
        )
        .setTimestamp();

    // Tạo buttons Accept và Decline
    const acceptButton = new ButtonBuilder()
        .setCustomId(`battle_invite_accept_${inviteId}`)
        .setLabel(' Chấp Nhận')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

    const declineButton = new ButtonBuilder()
        .setCustomId(`battle_invite_decline_${inviteId}`)
        .setLabel(' Từ Chối')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌');

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(acceptButton, declineButton);

    const inviteMessage = await message.reply({ 
        embeds: [embed], 
        components: [buttonRow] 
    });

    // Lưu message ID và lời mời
    invite.messageId = inviteMessage.id;
    battleInvites.set(inviteId, invite);

    // Tạo collector để chờ button interaction
    const buttonFilter = (interaction: any) => interaction.user.id === targetId;
    const buttonCollector = inviteMessage.createMessageComponentCollector({ 
        filter: buttonFilter, 
        time: 300000, // 5 phút
        max: 1 
    });

    buttonCollector.on('collect', async (interaction: any) => {
        if (interaction.customId.startsWith('battle_invite_decline_')) {
            // Người được mời từ chối
            const declineEmbed = new EmbedBuilder()
                .setTitle('❌ Đã Từ Chối Lời Mời')
                .setColor('#FF0000')
                .setDescription(`<@${targetId}> đã từ chối lời mời đấu cá.`)
                .setTimestamp();

            try {
                await interaction.update({ 
                    embeds: [declineEmbed], 
                    components: [] 
                });
            } catch (error) {
                console.error('Error updating decline interaction:', error);
            }

            // Xóa lời mời khỏi map
            battleInvites.delete(inviteId);
            return;
        }

        if (interaction.customId.startsWith('battle_invite_accept_')) {
            // Người được mời chấp nhận
            try {
                // Chỉ defer nếu chưa được defer
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }
            } catch (error) {
                console.error('Error deferring interaction:', error);
                // Nếu interaction đã hết hạn, xóa lời mời và return
                battleInvites.delete(inviteId);
                return;
            }

            // Kiểm tra lại daily battle limit cho cả hai người
            const inviterDailyCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
            const targetDailyCheck = await FishBattleService.checkAndResetDailyBattleCount(targetId, guildId);

            if (!inviterDailyCheck.canBattle) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Lỗi Đấu Cá!')
                    .setColor('#FF0000')
                    .setDescription(`<@${userId}> đã đạt giới hạn đấu cá trong ngày!`)
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ embeds: [errorEmbed], components: [] });
                } catch (error) {
                    console.error('Error updating inviter limit message:', error);
                }
                battleInvites.delete(inviteId);
                return;
            }

            if (!targetDailyCheck.canBattle) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Lỗi Đấu Cá!')
                    .setColor('#FF0000')
                    .setDescription(`<@${targetId}> đã đạt giới hạn đấu cá trong ngày!`)
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ embeds: [errorEmbed], components: [] });
                } catch (error) {
                    console.error('Error updating target limit message:', error);
                }
                battleInvites.delete(inviteId);
                return;
            }

            // Lấy cá của người được mời
            const targetInventory = await BattleFishInventoryService.getBattleFishInventory(targetId, guildId);
            const targetFish = targetInventory.items[0].fish;

            // Ẩn buttons ngay khi bắt đầu battle
            const battleStartEmbed = new EmbedBuilder()
                .setTitle('⚔️ Trận Đấu Đang Diễn Ra!')
                .setColor('#FF6B6B')
                .setDescription('Trận đấu đang được xử lý, vui lòng chờ...')
                .setTimestamp();

            try {
                await inviteMessage.edit({ 
                    embeds: [battleStartEmbed], 
                    components: [] // Ẩn tất cả buttons
                });
            } catch (error) {
                console.error('Error hiding buttons at battle start:', error);
            }

            // Bắt đầu battle
            try {
                // Import BattleVisualSystem
                const { BattleVisualSystem } = await import("@/utils/battle-visual");
                
                const userMaxHP = calculateMaxHP(selectedFish);
                const targetMaxHP = calculateMaxHP(targetFish);
                
                // Tạo animation data
                const battleRounds = BattleVisualSystem.createBattleAnimation(
                    selectedFish, 
                    targetFish, 
                    userMaxHP, 
                    targetMaxHP
                );
                
                // Hiển thị từng hiệp với delay
                for (let i = 0; i < battleRounds.length; i++) {
                    const roundData = battleRounds[i];
                    const roundDisplay = BattleVisualSystem.createMultiRoundBattle(
                        selectedFish, 
                        targetFish, 
                        [roundData]
                    );
                    
                    const battleEmbed = new EmbedBuilder()
                        .setTitle(`⚔️ HIỆP ${roundData.round} - BATTLE ARENA`)
                        .setColor('#FF6B6B')
                        .setDescription(`\`\`\`\n${roundDisplay}\n\`\`\``)
                        .setTimestamp();

                    try {
                        await inviteMessage.edit({ embeds: [battleEmbed] });
                    } catch (error) {
                        console.error('Error updating battle animation:', error);
                        break; // Thoát khỏi vòng lặp nếu không thể edit
                    }
                    
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
                    .setDescription(`**${selectedFish.name}** vs **${targetFish.name}**`)
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ embeds: [battleEmbed] });
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('Error updating fallback battle message:', error);
                }
            }

            // Thực hiện battle
            const battleResult = await FishBattleService.battleFish(userId, guildId, selectedFish.id, targetFish.id, targetFish);
            
            if ('success' in battleResult && !battleResult.success) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Lỗi đấu cá!')
                    .setColor('#FF0000')
                    .setDescription(battleResult.error)
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ embeds: [errorEmbed] });
                } catch (error) {
                    console.error('Error updating battle error message:', error);
                }
                battleInvites.delete(inviteId);
                return;
            }

            const result = battleResult as any;
            const isUserWinner = result.winner.id === selectedFish.id;
            const reward = isUserWinner ? result.rewards.winner : result.rewards.loser;

            // Hiển thị kết quả với visual system
            try {
                const { BattleVisualSystem } = await import("@/utils/battle-visual");
                const battleResultDisplay = BattleVisualSystem.createSummaryBattleResult(result, isUserWinner, result.battleId);
                
                // Kiểm tra độ dài và chia nhỏ nếu cần
                const maxLength = 1000;
                let displayValue = `\`\`\`\n${battleResultDisplay}\n\`\`\``;
                
                if (displayValue.length > maxLength) {
                    let shortDisplay = `🏆 **${result.winner.name}** thắng **${result.loser.name}**\n💪 Sức mạnh: ${result.winnerPower} vs ${result.loserPower}\n💰 Phần thưởng: ${reward.toLocaleString()} FishCoin`;
                    
                    if (result.finalHP) {
                        const winnerHP = result.finalHP.winner;
                        const loserHP = result.finalHP.loser;
                        shortDisplay += `\n❤️ HP Người thắng: ${winnerHP.current}/${winnerHP.max} (${winnerHP.percentage}%)\n💔 HP Người thua: ${loserHP.current}/${loserHP.max} (${loserHP.percentage}%)`;
                    }
                    
                    displayValue = `\`\`\`\n${shortDisplay}\n\`\`\``;
                }
                
                // Tạo button "Xem chi tiết" nếu có battleId
                const components = [];
                if (result.battleId) {
                    const viewDetailsButton = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`view_battle_details_${result.battleId}`)
                                .setLabel('📜 Xem Chi Tiết')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🔍')
                        );
                    components.push(viewDetailsButton);
                }

                const battleEmbed = new EmbedBuilder()
                    .setTitle(isUserWinner ? '🏆 Chiến Thắng!' : '💀 Thất Bại!')
                    .setColor(isUserWinner ? '#00FF00' : '#FF0000')
                    .addFields(
                        { 
                            name: '⚔️ Kết Quả Trận Đấu', 
                            value: displayValue, 
                            inline: false 
                        }
                    )
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ 
                        embeds: [battleEmbed],
                        components: components.length > 0 ? components : undefined
                    });
                } catch (error) {
                    console.error('Error updating final battle result:', error);
                }
            } catch (error) {
                console.error('Error creating visual battle result:', error);
                // Fallback to old display
                const fallbackComponents = [];
                if (result.battleId) {
                    const viewDetailsButton = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`view_battle_details_${result.battleId}`)
                                .setLabel('📜 Xem Chi Tiết')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🔍')
                        );
                    fallbackComponents.push(viewDetailsButton);
                }

                const battleEmbed = new EmbedBuilder()
                    .setTitle(isUserWinner ? '🏆 Chiến Thắng!' : '💀 Thất Bại!')
                    .setColor(isUserWinner ? '#00FF00' : '#FF0000')
                    .addFields(
                        { name: '🐟 Người thắng', value: result.winner.name, inline: true },
                        { name: '🐟 Người thua', value: result.loser.name, inline: true },
                        { name: '🐟 Phần thưởng', value: `${reward.toLocaleString()} FishCoin`, inline: true },
                        { name: '💪 Sức mạnh', value: `${result.winnerPower} vs ${result.loserPower}`, inline: true }
                    )
                    .setDescription(result.battleLog.join('\n'))
                    .setTimestamp();

                try {
                    await inviteMessage.edit({ 
                        embeds: [battleEmbed],
                        components: fallbackComponents.length > 0 ? fallbackComponents : undefined
                    });
                } catch (error) {
                    console.error('Error updating fallback battle result:', error);
                }
            }

            // Xóa lời mời khỏi map
            battleInvites.delete(inviteId);
        }
    });

    buttonCollector.on('end', async (collected: any) => {
        if (collected.size === 0) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Lời mời hết hạn!')
                .setColor('#FFA500')
                .setDescription('Lời mời đấu cá đã hết hạn (5 phút).')
                .setTimestamp();

            try {
                await inviteMessage.edit({ embeds: [timeoutEmbed], components: [] });
            } catch (error) {
                console.error('Error updating timeout message:', error);
            }
            battleInvites.delete(inviteId);
        }
    });
} 