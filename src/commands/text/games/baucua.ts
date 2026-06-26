import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Bot } from '@/classes';
import prisma from '../../../utils/prisma';

// Helper function để format số
function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

// Interface cho game Bầu Cua
interface BaucuaGame {
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
}

interface BetInfo {
  userId: string;
  username: string;
  animal: string;
  amount: number;
  timestamp: number;
}

// 6 con vật trong Bầu Cua
const ANIMALS = [
  { id: 'bau', name: 'Bầu', emoji: '🎃' },
  { id: 'cua', name: 'Cua', emoji: '🦀' },
  { id: 'tom', name: 'Tôm', emoji: '🦐' },
  { id: 'ca', name: 'Cá', emoji: '🐟' },
  { id: 'ga', name: 'Gà', emoji: '🐔' },
  { id: 'nai', name: 'Nai', emoji: '🦌' }
];

// Lưu trữ các game đang hoạt động
export const activeGames = new Map<string, BaucuaGame>();

export default Bot.createCommand({
  structure: {
    name: 'baucua',
    aliases: ['bc'],
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
      const existingGame = Array.from(activeGames.values()).find(
        game => game.channelId === channelId && game.isActive
      );

      if (existingGame) {
        return message.reply('❌ Đã có game Bầu Cua đang diễn ra trong channel này! Vui lòng chờ game kết thúc.');
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
      const gameId = `baucua_${Date.now()}_${userId}`;
      const startTime = Date.now();
      const endTime = startTime + 30000; // 30 giây

      const game: BaucuaGame = {
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
        isActive: true
      };

      // Tạo embed và buttons
      const embed = createGameEmbed(game);
      const buttons = createBetButtons(gameId);

      const gameMessage = await message.reply({
        embeds: [embed],
        components: buttons
      });

      // Lưu messageId
      game.messageId = gameMessage.id;
      activeGames.set(gameId, game);

      // Tạo collector để xử lý button interactions
      const collector = gameMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000 // 30 giây
      });

      collector.on('collect', async (interaction) => {
        await handleBetInteraction(interaction, game);
      });

      collector.on('end', async () => {
        await endGame(gameId, gameMessage);
      });

      // Tạo timer để cập nhật embed chỉ khi cần thiết
      let lastBetCount = 0;
      const updateInterval = setInterval(async () => {
        const currentGame = activeGames.get(gameId);
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
        const shouldUpdate = currentBetCount !== lastBetCount || timeLeft <= 10; // Cập nhật khi có cược mới hoặc 10 giây cuối
        
        if (shouldUpdate) {
          try {
            const updatedEmbed = createGameEmbed(currentGame);
            await gameMessage.edit({
              embeds: [updatedEmbed],
              components: createBetButtons(gameId)
            });
            lastBetCount = currentBetCount;
          } catch (error) {
            console.error('Error updating game embed:', error);
          }
        }
      }, 2000); // Giảm tần suất từ 1 giây xuống 2 giây

      console.log(`🎲 Game Bầu Cua created by ${message.author.username} in ${message.guild?.name}`);

    } catch (error) {
      console.error('Error in baucua command:', error);
      message.reply('❌ Có lỗi xảy ra khi tạo game!');
    }
  }
});

function createGameEmbed(game: BaucuaGame): EmbedBuilder {
  const timeLeft = Math.max(0, Math.ceil((game.endTime - Date.now()) / 1000));
  const totalBets = Array.from(game.bets.values()).reduce((sum, bet) => sum + bet.amount, 0);
  
  const embed = new EmbedBuilder()
    .setTitle('🎲 **BẦU CUA TÔM CÁ** 🎲')
    .setColor('#FFD700')
    .setDescription(`**Chủ phòng:** ${game.hostName}\n**Số dư chủ phòng:** ${formatNumber(game.hostBalance)} FishCoin\n**Tổng cược hiện tại:** ${formatNumber(totalBets)} FishCoin`)
    .setImage('https://cdn.discordapp.com/attachments/1399016226189086720/1418611452486619246/bau-cua-tom-ca-02.gif?ex=68cec05e&is=68cd6ede&hm=0b37eee9189a39b88fb30e22cabaec6c1a37368f931018b2d975abe2ee883f55&')
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
        value: '1:1',
        inline: true
      },
      {
        name: '🎯 Giới hạn cược',
        value: '100 - 1,000,000 FishCoin',
        inline: true
      }
    );

  // Hiển thị danh sách cược
  if (game.bets.size > 0) {
    const betList = Array.from(game.bets.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10) // Chỉ hiển thị 10 cược gần nhất
      .map(bet => {
        const animal = ANIMALS.find(a => a.id === bet.animal);
        return `**${bet.username}** cược **${animal?.emoji} ${animal?.name}** - ${formatNumber(bet.amount)} FishCoin`;
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
  
  // Chia 6 con vật thành 2 hàng: 3 con đầu và 3 con sau
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  const secondRow = new ActionRowBuilder<ButtonBuilder>();

  ANIMALS.forEach((animal, index) => {
    const button = new ButtonBuilder()
      .setCustomId(`bet_${gameId}_${animal.id}`)
      .setLabel(`${animal.emoji} ${animal.name}`)
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

async function handleBetInteraction(interaction: any, game: BaucuaGame) {
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

    // Tìm animalId (phần cuối cùng)
    const animalId = parts[parts.length - 1];
    
    // Tìm gameId (tất cả phần giữa bet và animalId)
    const betGameId = parts.slice(1, -1).join('_');

    console.log('🔍 DEBUG: betGameId:', betGameId, 'game.id:', game.id);

    if (betGameId !== game.id) {
      console.log('🔍 DEBUG: Game ID mismatch, returning');
      return;
    }

    console.log(`🎲 Bet interaction: ${interaction.user.username} betting on ${animalId} in game ${game.id}`);

    const userId = interaction.user.id;
    const animal = ANIMALS.find(a => a.id === animalId);

    if (!animal) {
      return interaction.reply({ content: '❌ Con vật không hợp lệ!', flags: 64 });
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
      .setCustomId(`baucua_modal_${game.id}_${animalId}`)
      .setTitle(`Cược ${animal.emoji} ${animal.name}`);

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
    await interaction.showModal(modal);

  } catch (error) {
    console.error('Error in handleBetInteraction:', error);
    return interaction.reply({ content: '❌ Có lỗi xảy ra khi xử lý cược!', flags: 64 });
  }
}

async function endGame(gameId: string, gameMessage?: any) {
  const game = activeGames.get(gameId);
  if (!game || !game.isActive) return;

  game.isActive = false;

  try {
    // Tạo animation xóc xúc xắc
    await createDiceAnimation(gameMessage, game);
    
    // Xóc xúc xắc (3 con xúc xắc, mỗi con có 6 mặt)
    const diceResults = [];
    for (let i = 0; i < 3; i++) {
      const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      diceResults.push(randomAnimal);
    }

    // Tính kết quả
    const animalCounts = new Map<string, number>();
    diceResults.forEach(animal => {
      animalCounts.set(animal.id, (animalCounts.get(animal.id) || 0) + 1);
    });

    // Tính toán thắng thua
    const results = [];
    let totalWinnings = 0;
    let totalLosses = 0;

    for (const [userId, bet] of game.bets) {
      const count = animalCounts.get(bet.animal) || 0;
      const winnings = bet.amount * count; // Tiền thắng = tiền cược × số lần xuất hiện
      
      console.log(`🎲 DEBUG: ${bet.username} cược ${bet.animal}, xuất hiện ${count} lần, tiền cược: ${bet.amount}, tiền thắng: ${winnings}`);
      
      if (count > 0) {
        results.push({
          userId,
          username: bet.username,
          animal: bet.animal,
          amount: bet.amount,
          winnings,
          isWin: true
        });
        totalWinnings += winnings;
      } else {
        results.push({
          userId,
          username: bet.username,
          animal: bet.animal,
          amount: bet.amount,
          winnings: 0,
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
    // Chủ phòng nhận tiền từ người thua (đã được trừ khi đặt cược) và trả tiền cho người thắng
    // Tính tổng tiền phải trả cho người thắng (tiền cược gốc + tiền thắng)
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
    const resultEmbed = createResultEmbed(game, diceResults, results, hostNetResult);
    
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
    activeGames.delete(gameId);

    console.log(`🎲 Game Bầu Cua ${gameId} ended. Host result: ${hostNetResult} FishCoin`);

  } catch (error) {
    console.error('Error ending game:', error);
  }
}

async function createDiceAnimation(gameMessage: any, game: BaucuaGame) {
  if (!gameMessage) return;

  try {
    // Tạo embed cho animation
    const animationEmbed = new EmbedBuilder()
      .setTitle('🎲 **ĐANG XÓC XÚC XẮC...** 🎲')
      .setColor('#FFA500')
      .setDescription('**Chủ phòng:** ' + game.hostName + '\n**Đang xóc xúc xắc, vui lòng chờ...**')
      .addFields(
        {
          name: '🎯 Kết quả sắp ra',
          value: '🎲 🎲 🎲',
          inline: false
        }
      )
      .setFooter({ text: 'Kết quả sẽ hiển thị trong giây lát...' });

    // Cập nhật message với animation
    await gameMessage.edit({
      embeds: [animationEmbed],
      components: []
    });

    // Tạo hiệu ứng xóc xúc xắc với 5 lần cập nhật (tăng độ hấp dẫn)
    const soundEffects = ['🎲', '🎯', '🎪', '🎭', '🎨'];
    
    for (let round = 0; round < 5; round++) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Chờ 600ms
      
      // Tạo kết quả ngẫu nhiên cho animation
      const randomResults = [];
      for (let i = 0; i < 3; i++) {
        const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        randomResults.push(randomAnimal);
      }
      
      const diceDisplay = randomResults.map(animal => `${animal.emoji} ${animal.name}`).join(' | ');
      const soundEffect = soundEffects[round % soundEffects.length];
      
      const roundEmbed = new EmbedBuilder()
        .setTitle(`${soundEffect} **ĐANG XÓC XÚC XẮC...** ${soundEffect}`)
        .setColor(round < 3 ? '#FFA500' : '#FF6B6B') // Đổi màu khi gần kết thúc
        .setDescription(`**Chủ phòng:** ${game.hostName}\n**Đang xóc xúc xắc, vui lòng chờ...**`)
        .addFields(
          {
            name: '🎯 Kết quả tạm thời',
            value: diceDisplay,
            inline: false
          }
        )
        .setFooter({ text: `Lần xóc thứ ${round + 1}/5... ${'🎲'.repeat(round + 1)}` });

      await gameMessage.edit({
        embeds: [roundEmbed],
        components: []
      });
    }

    // Hiệu ứng đếm ngược cuối cùng với 3 bước
    const countdownSteps = [
      { text: '🎲 **KẾT QUẢ CUỐI CÙNG!** 🎲', color: '#FF6B6B', desc: '**Kết quả đang được tính toán...**', footer: '3...' },
      { text: '🎯 **SẮP RA KẾT QUẢ!** 🎯', color: '#FF4444', desc: '**Đang chuẩn bị kết quả cuối cùng...**', footer: '2...' },
      { text: '🎪 **KẾT QUẢ NGAY BÂY GIỜ!** 🎪', color: '#FF0000', desc: '**Kết quả sẽ hiển thị ngay!**', footer: '1...' }
    ];

    for (let i = 0; i < countdownSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    console.error('Error in dice animation:', error);
  }
}

function createResultEmbed(game: BaucuaGame, diceResults: any[], results: any[], hostResult: number): EmbedBuilder {
  // Tạo hiệu ứng dựa trên kết quả
  const isHostWin = hostResult > 0;
  const titleEmoji = isHostWin ? '🎉' : '😢';
  const color = isHostWin ? '#00FF00' : '#FF6B6B';
  
  const embed = new EmbedBuilder()
    .setTitle(`${titleEmoji} **KẾT QUẢ BẦU CUA** ${titleEmoji}`)
    .setColor(color)
    .setDescription(`**Chủ phòng:** ${game.hostName}\n**Kết quả chủ phòng:** ${hostResult >= 0 ? '+' : ''}${formatNumber(hostResult)} FishCoin`)
    .setImage('https://cdn.discordapp.com/attachments/1399016226189086720/1418611452486619246/bau-cua-tom-ca-02.gif?ex=68cec05e&is=68cd6ede&hm=0b37eee9189a39b88fb30e22cabaec6c1a37368f931018b2d975abe2ee883f55&');

  // Hiển thị kết quả xúc xắc
  const diceDisplay = diceResults.map(animal => `${animal.emoji} ${animal.name}`).join(' | ');
  embed.addFields({
    name: '🎯 Kết quả xúc xắc',
    value: diceDisplay,
    inline: false
  });

  // Hiển thị kết quả người chơi với hiệu ứng
  if (results.length > 0) {
    const resultList = results.map(result => {
      const animal = ANIMALS.find(a => a.id === result.animal);
      const status = result.isWin ? '🎉' : '💸';
      const change = result.isWin ? `+${formatNumber(result.amount + result.winnings)}` : `-${formatNumber(result.amount)}`;
      const winLoseText = result.isWin ? 'THẮNG' : 'THUA';
      const winDetails = result.isWin ? `(cược: ${formatNumber(result.amount)} + thắng: ${formatNumber(result.winnings)})` : '';
      return `${status} **${result.username}** cược ${animal?.emoji} ${animal?.name}: **${winLoseText}** ${change} FishCoin ${winDetails}`;
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
  const footerText = `🎲 Game đã kết thúc! Tổng cược: ${formatNumber(totalBets)} | Tổng trả thắng: ${formatNumber(totalPayoutToWinners)} FishCoin`;
  
  embed.setFooter({ text: footerText });

  return embed;
}

// Handler cho modal submission
export async function handleModalSubmission(interaction: any, game: BaucuaGame | null = null) {
  try {
    console.log('🔍 DEBUG: handleModalSubmission called');
    console.log('🔍 DEBUG: interaction.customId:', interaction.customId);
    
    if (!interaction.isModalSubmit()) {
      console.log('🔍 DEBUG: Not a modal submission, returning');
      return;
    }

    const customId = interaction.customId;
    const parts = customId.split('_');
    
    console.log('🔍 DEBUG: modal customId parts:', parts);
    
    if (parts.length < 4 || parts[0] !== 'baucua' || parts[1] !== 'modal') {
      console.log('🔍 DEBUG: Invalid modal customId format, returning');
      return;
    }

    // Tìm gameId và animalId
    const gameId = parts.slice(2, -1).join('_');
    const animalId = parts[parts.length - 1];

    console.log('🔍 DEBUG: modal gameId:', gameId);
    console.log('🔍 DEBUG: modal animalId:', animalId);

    // Nếu game không được truyền vào, tìm game từ activeGames
    if (!game) {
      const foundGame = activeGames.get(gameId);
      if (!foundGame) {
        console.log('🔍 DEBUG: Game not found in activeGames, returning');
        return interaction.reply({ content: '❌ Game không tồn tại hoặc đã kết thúc!', flags: 64 });
      }
      game = foundGame;
    }

    if (gameId !== game.id) {
      console.log('🔍 DEBUG: Game ID mismatch in modal, returning');
      return;
    }

    const animal = ANIMALS.find(a => a.id === animalId);
    if (!animal) {
      console.log('🔍 DEBUG: Invalid animal in modal, replying with error');
      return interaction.reply({ content: '❌ Con vật không hợp lệ!', flags: 64 });
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
    const maxBetLimit = 1000000; // Cược tối đa 1 triệu FishCoin
    const currentTotalBets = Array.from(game.bets.values()).reduce((sum, bet) => sum + bet.amount, 0);
    
    // Lấy balance từ database thay vì từ interaction.user
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
      
      // Nếu giới hạn là do maxBetLimit, thông báo rõ ràng hơn
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

    // Kiểm tra xem user có đủ FishCoin không (user đã được lookup ở trên)
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
      animal: animalId,
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
    await interaction.reply({ 
      content: `✅ **${interaction.user.username}** đã cược **${animal.emoji} ${animal.name}** với số tiền **${formatNumber(betAmount)} FishCoin**!`, 
      ephemeral: false 
    });
    
    // Cập nhật embed ngay lập tức khi có cược mới
    try {
      const updatedEmbed = createGameEmbed(game);
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
    console.error('Error in handleModalSubmission:', error);
    return interaction.reply({ content: '❌ Có lỗi xảy ra khi xử lý cược!', flags: 64 });
  }
}

// Modal submissions sẽ được handle trong collector chính