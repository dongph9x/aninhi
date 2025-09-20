import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Bot } from '@/classes';
import prisma from '../../../utils/prisma';

// Helper function để format số
function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

// Interface cho game Đua Ngựa
interface HorseRacingGame {
  id: string;
  hostId: string;
  hostName: string;
  hostBalance: number;
  guildId: string;
  channelId: string;
  messageId: string;
  startTime: number;
  endTime: number;
  bets: Map<string, BetInfo>; // userId -> BetInfo
  isActive: boolean;
  raceResults: HorseResult[];
}

interface BetInfo {
  userId: string;
  username: string;
  horseId: string;
  amount: number;
  timestamp: number;
}

interface HorseResult {
  horseId: string;
  name: string;
  emoji: string;
  position: number;
  time: number;
}

// 6 con ngựa trong cuộc đua
const HORSES = [
  { id: 'thunder', name: 'Thunder', emoji: '⚡', speed: 85, stamina: 90 },
  { id: 'lightning', name: 'Lightning', emoji: '⚡', speed: 95, stamina: 80 },
  { id: 'storm', name: 'Storm', emoji: '🌩️', speed: 80, stamina: 95 },
  { id: 'blaze', name: 'Blaze', emoji: '🔥', speed: 90, stamina: 85 },
  { id: 'shadow', name: 'Shadow', emoji: '🌙', speed: 75, stamina: 100 },
  { id: 'phoenix', name: 'Phoenix', emoji: '🔥', speed: 100, stamina: 70 }
];

// Lưu trữ các game đang hoạt động
export const activeHorseRacingGames = new Map<string, HorseRacingGame>();

export default Bot.createCommand({
  structure: {
    name: 'horseracing',
    aliases: ['hr', 'duangua'],
  },
  run: async ({ message, t }) => {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    const channelId = message.channel.id;

    if (!guildId) {
      return message.reply('❌ Lệnh này chỉ có thể sử dụng trong server!');
    }

    try {
      // Kiểm tra xem đã có game nào đang hoạt động trong channel này chưa
      const existingGame = Array.from(activeHorseRacingGames.values()).find(
        game => game.channelId === channelId && game.isActive
      );

      if (existingGame) {
        return message.reply('❌ Đã có game Đua Ngựa đang diễn ra trong channel này! Vui lòng chờ game kết thúc.');
      }

      // Lấy thông tin user và balance
      const user = await prisma.user.findUnique({
        where: { 
          userId_guildId: {
            userId: userId,
            guildId: guildId
          }
        }
      });

      if (!user) {
        return message.reply('❌ Không tìm thấy thông tin user!');
      }

      const userBalance = BigInt(user.fishBalance || 0);

      if (userBalance <= 0n) {
        return message.reply('❌ Bạn không có đủ FishCoin để tạo game!');
      }

      // Tạo game mới
      const gameId = `horseracing_${Date.now()}_${userId}`;
      const startTime = Date.now();
      const endTime = startTime + 30000; // 30 giây

      const game: HorseRacingGame = {
        id: gameId,
        hostId: userId,
        hostName: message.author.displayName || message.author.username,
        hostBalance: Number(userBalance),
        guildId,
        channelId,
        messageId: '', // Sẽ được set sau khi tạo message
        startTime,
        endTime,
        bets: new Map(),
        isActive: true,
        raceResults: []
      };

      // Tạo embed và buttons
      const embed = createRaceEmbed(game);
      const buttons = createBetButtons(gameId);

      const gameMessage = await message.reply({
        embeds: [embed],
        components: buttons
      });

      // Lưu messageId
      game.messageId = gameMessage.id;
      activeHorseRacingGames.set(gameId, game);

      // Không cần collector vì đã có handler trong interactionCreate
      // Chỉ cần timer để kết thúc game
      setTimeout(async () => {
        await endRace(gameId, gameMessage);
      }, 30000);

      // Tạo timer để cập nhật embed
      let lastBetCount = 0;
      const updateInterval = setInterval(async () => {
        const currentGame = activeHorseRacingGames.get(gameId);
        if (!currentGame || !currentGame.isActive) {
          clearInterval(updateInterval);
          return;
        }

        const timeLeft = Math.max(0, Math.ceil((currentGame.endTime - Date.now()) / 1000));
        
        if (timeLeft <= 0) {
          clearInterval(updateInterval);
          return;
        }

        // Chỉ cập nhật khi có thay đổi về số lượng cược hoặc thời gian quan trọng
        const currentBetCount = currentGame.bets.size;
        const shouldUpdate = currentBetCount !== lastBetCount || timeLeft <= 10;
        
        if (shouldUpdate) {
          try {
            const updatedEmbed = createRaceEmbed(currentGame);
            await gameMessage.edit({
              embeds: [updatedEmbed],
              components: createBetButtons(gameId)
            });
            lastBetCount = currentBetCount;
          } catch (error) {
            console.error('Error updating race embed:', error);
          }
        }
      }, 2000);

      console.log(`🏇 Game Đua Ngựa created by ${message.author.username} in ${message.guild?.name}`);

    } catch (error) {
      console.error('Error in horseracing command:', error);
      message.reply('❌ Có lỗi xảy ra khi tạo game!');
    }
  }
});

function createRaceEmbed(game: HorseRacingGame): EmbedBuilder {
  const timeLeft = Math.max(0, Math.ceil((game.endTime - Date.now()) / 1000));
  const totalBets = Array.from(game.bets.values()).reduce((sum, bet) => sum + bet.amount, 0);
  
  const embed = new EmbedBuilder()
    .setTitle('🏇 **CUỘC ĐUA NGỰA** 🏇')
    .setColor('#FFD700')
    .setDescription(`**Chủ phòng:** ${game.hostName}\n**Số dư chủ phòng:** ${formatNumber(game.hostBalance)} FishCoin\n**Tổng cược hiện tại:** ${formatNumber(totalBets)} FishCoin`)
    .setImage('https://cdn.discordapp.com/attachments/1399016226189086720/1418611452486619246/horse-racing.gif')
    .addFields(
      {
        name: '⏰ Thời gian còn lại',
        value: `${timeLeft} giây`,
        inline: true
      },
      {
        name: '👥 Số người tham gia',
        value: `${game.bets.size} người`,
        inline: true
      },
      {
        name: '💰 Tỷ lệ thắng',
        value: '1:1 (vị trí 1), 1:2 (vị trí 2), 1:3 (vị trí 3)',
        inline: true
      },
      {
        name: '🎯 Giới hạn cược',
        value: '100 - 1,000,000 FishCoin',
        inline: true
      }
    );

  // Hiển thị danh sách ngựa
  const horsesList = HORSES.map(horse => 
    `${horse.emoji} **${horse.name}** (Tốc độ: ${horse.speed}, Sức bền: ${horse.stamina})`
  ).join('\n');

  embed.addFields({
    name: '🐎 Danh sách ngựa',
    value: horsesList,
    inline: false
  });

  // Hiển thị danh sách cược
  if (game.bets.size > 0) {
    const betList = Array.from(game.bets.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(bet => {
        const horse = HORSES.find(h => h.id === bet.horseId);
        return `**${bet.username}** cược **${horse?.emoji} ${horse?.name}** - ${formatNumber(bet.amount)} FishCoin`;
      })
      .join('\n');

    embed.addFields({
      name: '📋 Danh sách cược',
      value: betList || 'Chưa có ai cược',
      inline: false
    });
  }

  embed.setFooter({ text: 'Nhấn nút bên dưới để tham gia cược!' });

  return embed;
}

function createBetButtons(gameId: string): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  // Chia 6 con ngựa thành 2 hàng: 3 con đầu và 3 con sau
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  const secondRow = new ActionRowBuilder<ButtonBuilder>();

  HORSES.forEach((horse, index) => {
    const button = new ButtonBuilder()
      .setCustomId(`bet_${gameId}_${horse.id}`)
      .setLabel(`${horse.emoji} ${horse.name}`)
      .setStyle(ButtonStyle.Primary);

    if (index < 3) {
      firstRow.addComponents(button);
    } else {
      secondRow.addComponents(button);
    }
  });

  rows.push(firstRow);
  rows.push(secondRow);

  return rows;
}

export async function handleBetInteraction(interaction: any, game: HorseRacingGame) {
  try {
    console.log('🔍 DEBUG: handleBetInteraction called');
    console.log('🔍 DEBUG: interaction.isButton():', interaction.isButton());
    console.log('🔍 DEBUG: interaction.customId:', interaction.customId);
    console.log('🔍 DEBUG: game.id:', game.id);
    
    if (!interaction.isButton()) {
      console.log('🔍 DEBUG: Not a button interaction, returning');
      return;
    }

    const customId = interaction.customId;
    const parts = customId.split('_');
    
    console.log('🔍 DEBUG: customId parts:', parts);
    
    if (parts.length < 4 || parts[0] !== 'bet') {
      console.log('🔍 DEBUG: Invalid customId format, returning');
      return;
    }

    // Tìm horseId (phần cuối cùng)
    const horseId = parts[parts.length - 1];
    
    // Tìm gameId (tất cả phần giữa bet và horseId)
    const betGameId = parts.slice(1, -1).join('_');

    console.log('🔍 DEBUG: betGameId:', betGameId, 'game.id:', game.id);

    if (betGameId !== game.id) {
      console.log('🔍 DEBUG: Game ID mismatch, returning');
      return;
    }

    console.log(`🏇 Bet interaction: ${interaction.user.username} betting on ${horseId} in game ${game.id}`);

    const userId = interaction.user.id;
    const horse = HORSES.find(h => h.id === horseId);

    if (!horse) {
      return interaction.reply({ content: '❌ Con ngựa không hợp lệ!', flags: 64 });
    }

    // Kiểm tra xem user đã cược chưa
    if (game.bets.has(userId)) {
      return interaction.reply({ content: '❌ Bạn đã cược rồi! Mỗi người chỉ được cược 1 lần.', flags: 64 });
    }

    // Kiểm tra xem user có đủ FishCoin không
    console.log('🔍 DEBUG: Looking up user:', userId, 'in guild:', game.guildId);
    
    const user = await prisma.user.findUnique({
      where: { 
        userId_guildId: {
          userId: userId,
          guildId: game.guildId
        }
      }
    });

    console.log('🔍 DEBUG: User found:', user ? 'Yes' : 'No');
    console.log('🔍 DEBUG: User balance:', user?.fishBalance);

    if (!user) {
      console.log('🔍 DEBUG: User not found, replying with error');
      return interaction.reply({ content: '❌ Không tìm thấy thông tin user!', flags: 64 });
    }

    const userBalance = BigInt(user.fishBalance || 0);
    const minBet = 100n; // Cược tối thiểu 100 FishCoin
    const maxBetLimit = 1000000n; // Cược tối đa 1 triệu FishCoin

    if (userBalance < minBet) {
      return interaction.reply({ 
        content: `❌ Bạn cần ít nhất ${formatNumber(Number(minBet))} FishCoin để tham gia cược!`, 
        flags: 64 
      });
    }

    // Tính số tiền cược tối đa (không quá 1 triệu và không quá số dư host)
    const currentTotalBets = Array.from(game.bets.values()).reduce((sum, bet) => sum + bet.amount, 0);
    const maxBet = Math.min(Number(userBalance), game.hostBalance - currentTotalBets, Number(maxBetLimit));

    if (maxBet < Number(minBet)) {
      return interaction.reply({ 
        content: '❌ Chủ phòng không đủ tiền để nhận thêm cược!', 
        flags: 64 
      });
    }

    // Hiển thị modal để nhập số tiền cược
    const modal = new ModalBuilder()
      .setCustomId(`horseracing_modal_${game.id}_${horseId}`)
      .setTitle(`Cược ${horse.emoji} ${horse.name}`);

    const betAmountInput = new TextInputBuilder()
      .setCustomId('bet_amount')
      .setLabel(`Số tiền cược (Tối đa: ${formatNumber(maxBet)} FishCoin)`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Nhập số tiền cược (${formatNumber(Number(minBet))} - ${formatNumber(Number(maxBetLimit))})`)
      .setRequired(true)
      .setMaxLength(10);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(betAmountInput);
    modal.addComponents(actionRow);

    console.log('🔍 DEBUG: Showing modal for bet amount...');
    
    // Kiểm tra xem interaction còn hợp lệ không
    if (interaction.replied || interaction.deferred) {
      console.log('🔍 DEBUG: Interaction already replied/deferred, cannot show modal');
      return;
    }
    
    try {
      await interaction.showModal(modal);
    } catch (error) {
      console.error('Error showing modal:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: '❌ Không thể hiển thị form cược. Vui lòng thử lại!', 
          ephemeral: true 
        });
      }
    }

  } catch (error) {
    console.error('Error in handleBetInteraction:', error);
    return interaction.reply({ content: '❌ Có lỗi xảy ra khi xử lý cược!', flags: 64 });
  }
}

async function endRace(gameId: string, gameMessage?: any) {
  const game = activeHorseRacingGames.get(gameId);
  if (!game || !game.isActive) return;

  game.isActive = false;

  try {
    // Tạo animation cuộc đua
    await createRaceAnimation(gameMessage, game);
    
    // Tính toán kết quả cuộc đua
    const raceResults = calculateRaceResults();
    game.raceResults = raceResults;

    // Tính toán thắng thua
    const results = [];
    let totalWinnings = 0;
    let totalLosses = 0;

    for (const [userId, bet] of game.bets) {
      const horseResult = raceResults.find(r => r.horseId === bet.horseId);
      const position = horseResult?.position || 999;
      
      let winnings = 0;
      if (position === 1) {
        winnings = bet.amount * 3; // Vị trí 1: 1:3
      } else if (position === 2) {
        winnings = bet.amount * 2; // Vị trí 2: 1:2
      } else if (position === 3) {
        winnings = bet.amount; // Vị trí 3: 1:1
      }
      
      if (winnings > 0) {
        results.push({
          userId,
          username: bet.username,
          horseId: bet.horseId,
          amount: bet.amount,
          winnings,
          position,
          isWin: true
        });
        totalWinnings += winnings;
      } else {
        results.push({
          userId,
          username: bet.username,
          horseId: bet.horseId,
          amount: bet.amount,
          winnings: 0,
          position,
          isWin: false
        });
        totalLosses += bet.amount;
      }
    }

    // Cập nhật database
    for (const result of results) {
      if (result.isWin) {
        // Người thắng: cộng tiền cược gốc + tiền thắng (tiền cược đã được trừ khi đặt cược)
        const totalPayout = result.amount + result.winnings; // Hoàn tiền cược + tiền thắng
        console.log(`💰 DEBUG: Trả tiền cho ${result.username}: tiền cược ${result.amount} + tiền thắng ${result.winnings} = ${totalPayout} FishCoin`);
        
        await prisma.user.update({
          where: { 
            userId_guildId: {
              userId: result.userId,
              guildId: game.guildId
            }
          },
          data: {
            fishBalance: {
              increment: BigInt(totalPayout)
            }
          }
        });
        console.log(`🎉 ${result.username} thắng ${result.winnings} FishCoin + hoàn ${result.amount} FishCoin cược = ${totalPayout} FishCoin`);
      } else {
        // Người thua: không cần làm gì vì tiền đã được trừ khi đặt cược
        console.log(`💸 ${result.username} thua ${result.amount} FishCoin (đã trừ khi đặt cược)`);
      }
    }

    // Cập nhật balance của chủ phòng
    const totalPayoutToWinners = results
      .filter(r => r.isWin)
      .reduce((sum, r) => sum + r.amount + r.winnings, 0);
    
    const hostNetResult = totalLosses - totalPayoutToWinners;
    console.log(`💰 Chủ phòng: nhận ${totalLosses} từ người thua, trả ${totalPayoutToWinners} cho người thắng, lãi/lỗ: ${hostNetResult}`);
    
    await prisma.user.update({
      where: { 
        userId_guildId: {
          userId: game.hostId,
          guildId: game.guildId
        }
      },
      data: {
        fishBalance: {
          increment: BigInt(hostNetResult)
        }
      }
    });

    // Tạo embed kết quả
    const resultEmbed = createResultEmbed(game, raceResults, results, hostNetResult);
    
    // Cập nhật message
    if (gameMessage) {
      try {
        await gameMessage.edit({
          embeds: [resultEmbed],
          components: []
        });
      } catch (error) {
        console.error('Error updating result message:', error);
      }
    }

    // Xóa game khỏi active games
    activeHorseRacingGames.delete(gameId);

    console.log(`🏇 Game Đua Ngựa ${gameId} ended. Host result: ${hostNetResult} FishCoin`);

  } catch (error) {
    console.error('Error ending race:', error);
  }
}

function calculateRaceResults(): HorseResult[] {
  // Tạo kết quả ngẫu nhiên dựa trên stats của ngựa
  const results: HorseResult[] = [];
  
  for (const horse of HORSES) {
    // Tính điểm dựa trên tốc độ, sức bền và yếu tố ngẫu nhiên
    const speedFactor = horse.speed / 100;
    const staminaFactor = horse.stamina / 100;
    const randomFactor = Math.random();
    
    const totalScore = (speedFactor * 0.6 + staminaFactor * 0.3 + randomFactor * 0.1) * 100;
    
    results.push({
      horseId: horse.id,
      name: horse.name,
      emoji: horse.emoji,
      position: 0, // Sẽ được sắp xếp sau
      time: totalScore
    });
  }
  
  // Sắp xếp theo thời gian (thấp nhất = nhanh nhất)
  results.sort((a, b) => a.time - b.time);
  
  // Gán vị trí
  results.forEach((result, index) => {
    result.position = index + 1;
  });
  
  return results;
}

async function createRaceAnimation(gameMessage: any, game: HorseRacingGame) {
  if (!gameMessage) return;

  try {
    // Tạo embed cho animation
    const animationEmbed = new EmbedBuilder()
      .setTitle('🏇 **CUỘC ĐUA ĐANG DIỄN RA...** 🏇')
      .setColor('#FFA500')
      .setDescription('**Chủ phòng:** ' + game.hostName + '\n**Các con ngựa đang chạy, vui lòng chờ...**')
      .addFields(
        {
          name: '🏁 Trạng thái cuộc đua',
          value: '🐎 🐎 🐎 🐎 🐎 🐎',
          inline: false
        }
      )
      .setFooter({ text: 'Kết quả sẽ hiển thị trong giây lát...' });

    // Cập nhật message với animation
    await gameMessage.edit({
      embeds: [animationEmbed],
      components: []
    });

    // Tạo hiệu ứng đua ngựa với 5 lần cập nhật
    const raceEffects = ['🏇', '💨', '⚡', '🔥', '🌟'];
    
    for (let round = 0; round < 5; round++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Tạo kết quả ngẫu nhiên cho animation
      const randomResults = HORSES.map(horse => ({
        ...horse,
        progress: Math.random() * 100
      })).sort((a, b) => b.progress - a.progress);
      
      const raceDisplay = randomResults.map((horse, index) => 
        `${horse.emoji} ${horse.name} ${'█'.repeat(Math.floor(horse.progress / 10))}${'░'.repeat(10 - Math.floor(horse.progress / 10))}`
      ).join('\n');
      
      const raceEffect = raceEffects[round % raceEffects.length];
      
      const roundEmbed = new EmbedBuilder()
        .setTitle(`${raceEffect} **CUỘC ĐUA ĐANG DIỄN RA...** ${raceEffect}`)
        .setColor(round < 3 ? '#FFA500' : '#FF6B6B')
        .setDescription(`**Chủ phòng:** ${game.hostName}\n**Các con ngựa đang chạy, vui lòng chờ...**`)
        .addFields(
          {
            name: '🏁 Tiến độ cuộc đua',
            value: raceDisplay,
            inline: false
          }
        )
        .setFooter({ text: `Lần cập nhật thứ ${round + 1}/5... ${'🏇'.repeat(round + 1)}` });

      await gameMessage.edit({
        embeds: [roundEmbed],
        components: []
      });
    }

    // Hiệu ứng đếm ngược cuối cùng
    const countdownSteps = [
      { text: '🏇 **KẾT QUẢ CUỐI CÙNG!** 🏇', color: '#FF6B6B', desc: '**Kết quả đang được tính toán...**', footer: '3...' },
      { text: '🏁 **SẮP RA KẾT QUẢ!** 🏁', color: '#FF4444', desc: '**Đang chuẩn bị kết quả cuối cùng...**', footer: '2...' },
      { text: '🎉 **KẾT QUẢ NGAY BÂY GIỜ!** 🎉', color: '#FF0000', desc: '**Kết quả sẽ hiển thị ngay!**', footer: '1...' }
    ];

    for (let i = 0; i < countdownSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const step = countdownSteps[i];
      const countdownEmbed = new EmbedBuilder()
        .setTitle(step.text)
        .setColor(step.color as any)
        .setDescription(`**Chủ phòng:** ${game.hostName}\n${step.desc}`)
        .setFooter({ text: step.footer });

      await gameMessage.edit({
        embeds: [countdownEmbed],
        components: []
      });
    }

    // Chờ thêm 1 giây trước khi hiển thị kết quả thật
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.error('Error in race animation:', error);
  }
}

function createResultEmbed(game: HorseRacingGame, raceResults: HorseResult[], results: any[], hostResult: number): EmbedBuilder {
  // Tạo hiệu ứng dựa trên kết quả
  const isHostWin = hostResult > 0;
  const titleEmoji = isHostWin ? '🎉' : '😢';
  const color = isHostWin ? '#00FF00' : '#FF6B6B';
  
  const embed = new EmbedBuilder()
    .setTitle(`${titleEmoji} **KẾT QUẢ CUỘC ĐUA NGỰA** ${titleEmoji}`)
    .setColor(color)
    .setDescription(`**Chủ phòng:** ${game.hostName}\n**Kết quả chủ phòng:** ${hostResult >= 0 ? '+' : ''}${formatNumber(hostResult)} FishCoin`)
    .setImage('https://cdn.discordapp.com/attachments/1399016226189086720/1418611452486619246/horse-racing-finish.gif');

  // Hiển thị kết quả cuộc đua
  const raceDisplay = raceResults.map((result, index) => {
    const position = index + 1;
    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
    return `${medal} **Vị trí ${position}:** ${result.emoji} ${result.name}`;
  }).join('\n');

  embed.addFields({
    name: '🏁 Kết quả cuộc đua',
    value: raceDisplay,
    inline: false
  });

  // Hiển thị kết quả người chơi
  if (results.length > 0) {
    const resultList = results.map(result => {
      const horse = HORSES.find(h => h.id === result.horseId);
      const status = result.isWin ? '🎉' : '💸';
      const change = result.isWin ? `+${formatNumber(result.amount + result.winnings)}` : `-${formatNumber(result.amount)}`;
      const winLoseText = result.isWin ? 'THẮNG' : 'THUA';
      const positionText = result.isWin ? `(Vị trí ${result.position})` : '';
      const winDetails = result.isWin ? `(cược: ${formatNumber(result.amount)} + thắng: ${formatNumber(result.winnings)})` : '';
      return `${status} **${result.username}** cược ${horse?.emoji} ${horse?.name}: **${winLoseText}** ${change} FishCoin ${positionText} ${winDetails}`;
    }).join('\n');

    const winCount = results.filter(r => r.isWin).length;
    const loseCount = results.length - winCount;
    
    embed.addFields({
      name: `📊 Kết quả người chơi (${winCount} thắng, ${loseCount} thua)`,
      value: resultList,
      inline: false
    });
  }

  // Tạo footer với thông tin thú vị
  const totalBets = results.reduce((sum, r) => sum + r.amount, 0);
  const totalPayoutToWinners = results.filter(r => r.isWin).reduce((sum, r) => sum + r.amount + r.winnings, 0);
  const footerText = `🏇 Cuộc đua đã kết thúc! Tổng cược: ${formatNumber(totalBets)} | Tổng trả thắng: ${formatNumber(totalPayoutToWinners)} FishCoin`;
  
  embed.setFooter({ text: footerText });

  return embed;
}

// Handler cho modal submission
export async function handleHorseRacingModalSubmission(interaction: any, game: HorseRacingGame | null = null) {
  try {
    console.log('🔍 DEBUG: handleHorseRacingModalSubmission called');
    console.log('🔍 DEBUG: interaction.customId:', interaction.customId);
    
    if (!interaction.isModalSubmit()) {
      console.log('🔍 DEBUG: Not a modal submission, returning');
      return;
    }

    const customId = interaction.customId;
    const parts = customId.split('_');
    
    console.log('🔍 DEBUG: modal customId parts:', parts);
    
    if (parts.length < 4 || parts[0] !== 'horseracing' || parts[1] !== 'modal') {
      console.log('🔍 DEBUG: Invalid modal customId format, returning');
      return;
    }

    // Tìm gameId và horseId
    const gameId = parts.slice(2, -1).join('_');
    const horseId = parts[parts.length - 1];

    console.log('🔍 DEBUG: modal gameId:', gameId);
    console.log('🔍 DEBUG: modal horseId:', horseId);

    // Nếu game không được truyền vào, tìm game từ activeHorseRacingGames
    if (!game) {
      const foundGame = activeHorseRacingGames.get(gameId);
      if (!foundGame) {
        console.log('🔍 DEBUG: Game not found in activeHorseRacingGames, returning');
        return interaction.reply({ content: '❌ Game không tồn tại hoặc đã kết thúc!', flags: 64 });
      }
      game = foundGame;
    }

    if (gameId !== game.id) {
      console.log('🔍 DEBUG: Game ID mismatch in modal, returning');
      return;
    }

    const horse = HORSES.find(h => h.id === horseId);
    if (!horse) {
      console.log('🔍 DEBUG: Invalid horse in modal, replying with error');
      return interaction.reply({ content: '❌ Con ngựa không hợp lệ!', flags: 64 });
    }

    // Lấy số tiền cược từ modal
    const betAmountStr = interaction.fields.getTextInputValue('bet_amount');
    const betAmount = parseInt(betAmountStr);

    console.log('🔍 DEBUG: betAmount from modal:', betAmount);

    if (isNaN(betAmount) || betAmount <= 0) {
      console.log('🔍 DEBUG: Invalid bet amount, replying with error');
      return interaction.reply({ content: '❌ Số tiền cược không hợp lệ!', flags: 64 });
    }

    const userId = interaction.user.id;
    const minBet = 100;
    const maxBetLimit = 1000000;
    const currentTotalBets = Array.from(game.bets.values()).reduce((sum, bet) => sum + bet.amount, 0);
    
    // Lấy balance từ database
    const user = await prisma.user.findUnique({
      where: { 
        userId_guildId: {
          userId: userId,
          guildId: game.guildId
        }
      }
    });

    if (!user) {
      console.log('🔍 DEBUG: User not found in modal validation, replying with error');
      return interaction.reply({ content: '❌ Không tìm thấy thông tin user!', flags: 64 });
    }

    const userBalance = BigInt(user.fishBalance || 0);
    const maxBet = Math.min(Number(userBalance), game.hostBalance - currentTotalBets, maxBetLimit);
    
    console.log('🔍 DEBUG: User balance:', userBalance);
    console.log('🔍 DEBUG: Host balance:', game.hostBalance);
    console.log('🔍 DEBUG: Current total bets:', currentTotalBets);
    console.log('🔍 DEBUG: Calculated maxBet:', maxBet);

    if (betAmount < minBet) {
      console.log('🔍 DEBUG: Bet amount too low, replying with error');
      return interaction.reply({ 
        content: `❌ Số tiền cược tối thiểu là ${formatNumber(minBet)} FishCoin!`, 
        flags: 64 
      });
    }

    if (betAmount > maxBet) {
      console.log('🔍 DEBUG: Bet amount too high, replying with error');
      let errorMessage = `❌ Số tiền cược tối đa là ${formatNumber(maxBet)} FishCoin!`;
      
      if (maxBet === maxBetLimit) {
        errorMessage = `❌ Số tiền cược tối đa là ${formatNumber(maxBetLimit)} FishCoin (giới hạn game)!`;
      } else if (maxBet === Number(userBalance)) {
        errorMessage = `❌ Bạn không đủ FishCoin! Số dư hiện tại: ${formatNumber(Number(userBalance))} FishCoin`;
      } else if (maxBet === game.hostBalance - currentTotalBets) {
        errorMessage = `❌ Chủ phòng không đủ tiền để nhận thêm cược! Tối đa: ${formatNumber(maxBet)} FishCoin`;
      }
      
      return interaction.reply({ 
        content: errorMessage, 
        flags: 64 
      });
    }

    // Kiểm tra xem user đã cược chưa
    if (game.bets.has(userId)) {
      console.log('🔍 DEBUG: User already bet in modal, replying with error');
      return interaction.reply({ content: '❌ Bạn đã cược rồi! Mỗi người chỉ được cược 1 lần.', flags: 64 });
    }

    // Kiểm tra xem user có đủ FishCoin không
    console.log('🔍 DEBUG: User balance check in modal:', userBalance);

    if (userBalance < BigInt(betAmount)) {
      console.log('🔍 DEBUG: User balance too low in modal, replying with error');
      return interaction.reply({ 
        content: `❌ Bạn không đủ FishCoin! Số dư hiện tại: ${formatNumber(Number(userBalance))} FishCoin`, 
        flags: 64 
      });
    }

    // Thêm cược vào game
    const betInfo: BetInfo = {
      userId: userId,
      username: interaction.user.displayName || interaction.user.username,
      horseId: horseId,
      amount: betAmount,
      timestamp: Date.now()
    };
    
    console.log('🔍 DEBUG: Adding bet to game from modal:', betInfo);
    game.bets.set(userId, betInfo);
    
    console.log('🔍 DEBUG: Updating user balance from modal...');
    // Trừ tiền từ user khi đặt cược
    await prisma.user.update({
      where: { 
        userId_guildId: {
          userId: userId,
          guildId: game.guildId
        }
      },
      data: {
        fishBalance: {
          decrement: BigInt(betAmount)
        }
      }
    });
    console.log(`💸 Đã trừ ${betAmount} FishCoin từ ${interaction.user.username} khi đặt cược`);

    console.log('🔍 DEBUG: Sending reply from modal...');
    // Thông báo cược thành công
    try {
      await interaction.reply({ 
        content: `✅ **${interaction.user.username}** đã cược **${horse.emoji} ${horse.name}** với số tiền **${formatNumber(betAmount)} FishCoin**!`, 
        ephemeral: false 
      });
    } catch (error) {
      console.error('Error replying to modal submission:', error);
      // Nếu không thể reply, thử followUp
      try {
        await interaction.followUp({ 
          content: `✅ **${interaction.user.username}** đã cược **${horse.emoji} ${horse.name}** với số tiền **${formatNumber(betAmount)} FishCoin**!`, 
          ephemeral: false 
        });
      } catch (followUpError) {
        console.error('Error with followUp:', followUpError);
      }
    }
    
    // Cập nhật embed ngay lập tức khi có cược mới
    try {
      const updatedEmbed = createRaceEmbed(game);
      const gameMessage = await interaction.channel?.messages.fetch(game.messageId);
      if (gameMessage) {
        await gameMessage.edit({
          embeds: [updatedEmbed],
          components: createBetButtons(game.id)
        });
      }
    } catch (error) {
      console.error('Error updating embed after bet:', error);
    }
    
    console.log('🔍 DEBUG: Modal submission completed successfully');

  } catch (error) {
    console.error('Error in handleHorseRacingModalSubmission:', error);
    return interaction.reply({ content: '❌ Có lỗi xảy ra khi xử lý cược!', flags: 64 });
  }
}
