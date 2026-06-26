import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { FishBattleService } from "@/utils/fish-battle";
import { BattleVisualSystem } from "@/utils/battle-visual";

export class BattleLogHandler {
    /**
     * Xử lý button click "Xem chi tiết"
     */
    static async handleViewBattleDetails(interaction: ButtonInteraction): Promise<void> {
        try {
            const customId = interaction.customId;
            
            // Kiểm tra customId có đúng format không
            if (!customId.startsWith('view_battle_details_')) {
                await interaction.reply({
                    content: '❌ Lỗi: Custom ID không hợp lệ!',
                    ephemeral: true
                });
                return;
            }
            
            // Lấy battleId từ customId
            const battleId = customId.replace('view_battle_details_', '');
            
            // Lấy battle log từ service
            const battleLog = FishBattleService.getBattleLog(battleId);
            
            if (!battleLog) {
                await interaction.reply({
                    content: '❌ Không tìm thấy thông tin chi tiết trận đấu. Log có thể đã hết hạn (1 giờ).',
                    ephemeral: true
                });
                return;
            }
            
            // Phân tích battle log để tách các hiệp
            const battleRounds = this.parseBattleLog(battleLog);
            
            // Tạo embed chính với thông tin tổng quan
            const mainEmbed = new EmbedBuilder()
                .setTitle('📜 Chi Tiết Trận Đấu')
                .setColor(0x4ECDC4)
                .setDescription('Chọn hiệp để xem chi tiết từng round')
                .addFields(
                    { name: '📊 Tổng quan', value: `**${battleRounds.length}** hiệp đấu`, inline: true },
                    { name: '⏰ Thời gian', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '🔍 Hướng dẫn', value: 'Sử dụng menu bên dưới để chọn hiệp muốn xem', inline: false }
                )
                .setTimestamp();
            
            // Tạo select menu cho các hiệp
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`battle_round_select_${battleId}`)
                .setPlaceholder('🎯 Chọn hiệp để xem chi tiết...')
                .setMinValues(1)
                .setMaxValues(1);
            
            // Thêm option cho mỗi hiệp
            battleRounds.forEach((round, index) => {
                const roundNumber = index + 1;
                const roundSummary = this.getRoundSummary(round);
                
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Hiệp ${roundNumber}`)
                        .setDescription(roundSummary)
                        .setValue(`round_${roundNumber}`)
                        .setEmoji('🥊')
                );
            });
            
            // Thêm option xem tất cả
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('📋 Xem tất cả hiệp')
                    .setDescription('Hiển thị toàn bộ log trận đấu')
                    .setValue('all_rounds')
                    .setEmoji('📜')
            );
            
            const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);
            
            await interaction.reply({
                embeds: [mainEmbed],
                components: [selectRow],
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Error handling view battle details:', error);
            await interaction.reply({
                content: '❌ Đã xảy ra lỗi khi hiển thị chi tiết trận đấu!',
                ephemeral: true
            });
        }
    }
    
    /**
     * Phân tích battle log để tách các hiệp
     */
    private static parseBattleLog(battleLog: string[]): string[][] {
        const rounds: string[][] = [];
        let currentRound: string[] = [];
        
        for (const line of battleLog) {
            if (line.includes('🥊 **Hiệp')) {
                // Bắt đầu hiệp mới
                if (currentRound.length > 0) {
                    rounds.push([...currentRound]);
                }
                currentRound = [line];
            } else if (line.trim() !== '') {
                // Thêm vào hiệp hiện tại
                currentRound.push(line);
            }
        }
        
        // Thêm hiệp cuối cùng
        if (currentRound.length > 0) {
            rounds.push(currentRound);
        }
        
        return rounds;
    }
    
    /**
     * Tạo tóm tắt cho một hiệp
     */
    private static getRoundSummary(round: string[]): string {
        if (round.length === 0) return 'Không có thông tin';
        
        const firstLine = round[0];
        const roundNumber = firstLine.match(/Hiệp (\d+)/)?.[1] || '?';
        
        // Tìm thông tin damage và HP
        let summary = `Hiệp ${roundNumber}`;
        let specialEffects = [];
        
        for (const line of round) {
            // Tìm thông tin HP
            if (line.includes('damage!') && line.includes('còn')) {
                const hpMatch = line.match(/còn (\d+)\/(\d+) HP/);
                if (hpMatch) {
                    const currentHP = hpMatch[1];
                    const maxHP = hpMatch[2];
                    const percentage = Math.floor((parseInt(currentHP) / parseInt(maxHP)) * 100);
                    summary += ` - HP: ${percentage}%`;
                    break;
                }
            }
            
            // Tìm các hiệu ứng đặc biệt
            if (line.includes('CHÍ MẠNG!')) {
                specialEffects.push('💥 Chí mạng');
            }
            if (line.includes('NÉ!')) {
                specialEffects.push('🛡️ Né');
            }
            if (line.includes('ĐÁNH TRƯỢT!')) {
                specialEffects.push('❌ Trượt');
            }
        }
        
        // Thêm thông tin hiệu ứng đặc biệt
        if (specialEffects.length > 0) {
            summary += ` - ${specialEffects.join(', ')}`;
        }
        
        // Giới hạn độ dài
        return summary.length > 100 ? summary.substring(0, 97) + '...' : summary;
    }
    
    /**
     * Xử lý select menu cho battle rounds
     */
    static async handleRoundSelect(interaction: any): Promise<void> {
        try {
            const customId = interaction.customId;
            const selectedValue = interaction.values[0];
            
            // Lấy battleId từ customId
            const battleId = customId.replace('battle_round_select_', '');
            
            // Lấy battle log
            const battleLog = FishBattleService.getBattleLog(battleId);
            if (!battleLog) {
                await interaction.reply({
                    content: '❌ Không tìm thấy thông tin trận đấu!',
                    ephemeral: true
                });
                return;
            }
            
            if (selectedValue === 'all_rounds') {
                // Hiển thị tất cả rounds (chia nhỏ nếu quá dài)
                const fullLog = battleLog.join('\n');
                const maxLength = 4000; // Để lại chỗ cho ``` và các ký tự khác
                
                if (fullLog.length <= maxLength) {
                    // Log ngắn, hiển thị bình thường
                    const allRoundsEmbed = new EmbedBuilder()
                        .setTitle('📜 Toàn Bộ Trận Đấu')
                        .setColor(0x4ECDC4)
                        .setDescription('```\n' + fullLog + '\n```')
                        .setTimestamp();
                    
                    await interaction.reply({
                        embeds: [allRoundsEmbed],
                        ephemeral: true
                    });
                } else {
                    // Log dài, chia thành nhiều embed
                    const chunks = this.splitLogIntoChunks(fullLog, maxLength);
                    const embeds = chunks.map((chunk, index) => {
                        const embed = new EmbedBuilder()
                            .setColor(0x4ECDC4)
                            .setTimestamp();
                        
                        if (index === 0) {
                            embed.setTitle('📜 Toàn Bộ Trận Đấu (Phần 1)');
                        } else {
                            embed.setTitle(`📜 Toàn Bộ Trận Đấu (Phần ${index + 1})`);
                        }
                        
                        embed.setDescription('```\n' + chunk + '\n```');
                        return embed;
                    });
                    
                    await interaction.reply({
                        embeds: embeds,
                        ephemeral: true
                    });
                }
            } else {
                // Hiển thị hiệp cụ thể
                const roundNumber = parseInt(selectedValue.replace('round_', ''));
                const battleRounds = this.parseBattleLog(battleLog);
                
                if (roundNumber > 0 && roundNumber <= battleRounds.length) {
                    const selectedRound = battleRounds[roundNumber - 1];
                    
                    const roundEmbed = new EmbedBuilder()
                        .setTitle(`🥊 Hiệp ${roundNumber}`)
                        .setColor(0xFF6B6B)
                        .setDescription('```\n' + selectedRound.join('\n') + '\n```')
                        .setFooter({ text: `Hiệp ${roundNumber}/${battleRounds.length}` })
                        .setTimestamp();
                    
                    await interaction.reply({
                        embeds: [roundEmbed],
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Hiệp không hợp lệ!',
                        ephemeral: true
                    });
                }
            }
            
        } catch (error) {
            console.error('Error handling round select:', error);
            await interaction.reply({
                content: '❌ Đã xảy ra lỗi khi hiển thị hiệp!',
                ephemeral: true
            });
        }
    }

    /**
     * Chia log thành các chunk nhỏ hơn để tránh vượt quá giới hạn Discord
     */
    private static splitLogIntoChunks(log: string, maxLength: number): string[] {
        const chunks: string[] = [];
        const lines = log.split('\n');
        let currentChunk = '';
        
        for (const line of lines) {
            // Nếu thêm line này sẽ vượt quá maxLength
            if (currentChunk.length + line.length + 1 > maxLength) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                
                // Nếu line đơn lẻ quá dài, cắt nó
                if (line.length > maxLength) {
                    const subChunks = this.splitLongLine(line, maxLength);
                    chunks.push(...subChunks);
                } else {
                    currentChunk = line;
                }
            } else {
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }
        
        if (currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    /**
     * Cắt một dòng dài thành nhiều chunk
     */
    private static splitLongLine(line: string, maxLength: number): string[] {
        const chunks: string[] = [];
        let remaining = line;
        
        while (remaining.length > maxLength) {
            chunks.push(remaining.substring(0, maxLength));
            remaining = remaining.substring(maxLength);
        }
        
        if (remaining.length > 0) {
            chunks.push(remaining);
        }
        
        return chunks;
    }
    
}
