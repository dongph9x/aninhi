import { EmbedBuilder } from "discord.js";
import { Bot } from "@/classes";
import { FishBattleService } from "@/utils/fish-battle";
import { BattleFishInventoryService } from "@/utils/battle-fish-inventory";
import { FishBreedingService } from "@/utils/fish-breeding";
import { BattleFishUI } from "@/components/MessageComponent/BattleFishUI";
import { BattleFishHandler } from "@/components/MessageComponent/BattleFishHandler";

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
            { name: '🎯 Cách sử dụng', value: '`n.fishbattle ui` - Mở giao diện đấu cá (Khuyến nghị)\n`n.fishbattle` - Tìm đối thủ ngẫu nhiên\n`n.fishbattle add <fish_id>` - Thêm cá vào túi đấu\n`n.fishbattle list` - Xem túi đấu cá\n`n.fishbattle remove <fish_id>` - Xóa cá khỏi túi đấu\n`n.fishbattle stats` - Xem thống kê đấu cá\n`n.fishbattle history` - Xem lịch sử đấu gần đây\n`n.fishbattle leaderboard` - Bảng xếp hạng đấu cá', inline: false },
            { name: '📊 Thuộc tính cá', value: '💪 Sức mạnh | 🏃 Thể lực | 🧠 Trí tuệ | 🛡️ Phòng thủ | 🍀 May mắn', inline: false },
            { name: '💰 Phần thưởng', value: 'Người thắng: 150% sức mạnh tổng\nNgười thua: 30% sức mạnh tổng', inline: false },
            { name: '⚠️ Điều kiện cá đấu', value: '• Phải là cá thế hệ 2 trở lên\n• Phải là cá trưởng thành (level 10)\n• Túi đấu tối đa 5 cá', inline: false },
            { name: '⏰ Giới hạn đấu cá', value: '• Tối đa 20 lần đấu cá mỗi ngày\n• Reset vào 00:00 ngày mai\n• Cooldown 1 phút giữa các lần đấu', inline: false }
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
            .setDescription(result.error)
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

    // Hiển thị thông tin trước khi đấu
    const stats = selectedFish.stats || {};
    const opponentStats = opponentResult.opponent.stats || {};
    const userPower = FishBreedingService.calculateTotalPowerWithLevel(selectedFish);
    const opponentPower = FishBreedingService.calculateTotalPowerWithLevel(opponentResult.opponent);

    const embed = new EmbedBuilder()
        .setTitle('⚔️ Tìm Thấy Đối Thủ!')
        .setColor('#FFD700')
        .addFields(
            { name: '🐟 Cá của bạn', value: `${selectedFish.name} (Lv.${selectedFish.level})`, inline: true },
            { name: '🐟 Đối thủ', value: `${opponentResult.opponent.name} (Lv.${opponentResult.opponent.level})`, inline: true },
            { name: '💪 Sức mạnh', value: `${userPower} vs ${opponentPower}`, inline: true },
            { name: '📊 Stats của bạn', value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`, inline: false },
            { name: '📊 Stats đối thủ', value: `💪${opponentStats.strength || 0} 🏃${opponentStats.agility || 0} 🧠${opponentStats.intelligence || 0} 🛡️${opponentStats.defense || 0} 🍀${opponentStats.luck || 0}`, inline: false },
            { name: '⏰ Giới Hạn Đấu Cá Hôm Nay', value: `✅ Còn **${dailyLimitCheck.remainingBattles}/20** lần đấu cá`, inline: true }
        )
        .setDescription('React với ⚔️ để bắt đầu đấu!')
        .setTimestamp();

    const battleMessage = await message.reply({ embeds: [embed] });
    
    // Thêm reaction để xác nhận đấu
    await battleMessage.react('⚔️');

    // Tạo collector để chờ reaction
    const filter = (reaction: any, user: any) => reaction.emoji.name === '⚔️' && user.id === userId;
    const collector = battleMessage.createReactionCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async (collected: any, user: any) => {
        // Bắt đầu animation với GIF
        const battleGifUrl = "https://cdn.discordapp.com/attachments/1362234245392765201/1397459618434650203/youtube_video_0r2OSVD2A8_8.gif?ex=6881cd30&is=68807bb0&hm=835f0a83c15c79348d507e57bfa33a2b78220ea02cab55ec46fa29231a8f607a&";
        
        const animationFrames = [
            '⚔️ **Bắt đầu chiến đấu!** ⚔️',
            '🔯 **Nhận buff/debuff** 🔯',
            '💥 **Đang đấu...** 💥',
            '⚡ **Chiến đấu gay cấn!** ⚡',
            '🔥 **Kết quả sắp có!** 🔥'
        ];

        const animationEmbed = new EmbedBuilder()
            .setTitle('⚔️ Đang Chiến Đấu...')
            .setColor('#FF6B6B')
            .setDescription(animationFrames[0])
            .setImage(battleGifUrl) // Thêm GIF animation
            .setTimestamp();

        await battleMessage.edit({ embeds: [animationEmbed] });

        // Chạy animation trong 3 giây với GIF
        for (let i = 1; i < animationFrames.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600)); // 600ms mỗi frame
            
            const currentFrame = animationFrames[i]
                .replace('${selectedFish.name}', selectedFish.name)
                .replace('${opponentResult.opponent.name}', opponentResult.opponent.name);
            
            // Sử dụng EmbedBuilder.from để tránh nháy GIF
            const updatedEmbed = EmbedBuilder.from(battleMessage.embeds[0])
                .setDescription(currentFrame);
            
            await battleMessage.edit({ embeds: [updatedEmbed] });
        }

        // Thực hiện battle
        const battleResult = await FishBattleService.battleFish(userId, guildId, selectedFish.id, opponentResult.opponent.id);
        
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

        battleMessage.edit({ embeds: [battleEmbed] });
    });

    collector.on('end', (collected) => {
        if (collected.size === 0) {
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Hết thời gian!')
                .setColor('#FFA500')
                .setDescription('Bạn không phản hồi kịp thời. Trận đấu bị hủy.')
                .setTimestamp();

            battleMessage.edit({ embeds: [timeoutEmbed] });
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
        const fishName = battle.fish?.name || 'Unknown';
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