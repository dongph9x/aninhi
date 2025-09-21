import { ButtonInteraction } from "discord.js";
import { activeHorseRacingGames } from "@/commands/text/games/horseracing";

export class HorseRacingHandler {
    static async handleInteraction(interaction: ButtonInteraction) {
        const customId = interaction.customId;
        
        if (!interaction.guildId || !interaction.user) {
            return interaction.reply({ content: '❌ Lỗi: Không tìm thấy thông tin server hoặc user!', ephemeral: true });
        }

        try {
            // Kiểm tra xem có phải bet interaction không
            if (customId.startsWith('bet_')) {
                const parts = customId.split('_');
                console.log('🔍 DEBUG: Custom ID parts:', parts);
                
                if (parts.length >= 4 && parts[0] === 'bet') {
                    // Tìm gameId và horseId
                    // Format: bet_horseracing_timestamp_userId_X
                    // gameId = horseracing_timestamp_userId
                    // horseId = X (số thứ tự: 1, 2, 3, 4, 5, 6)
                    const gameId = parts.slice(1, -1).join('_'); // Tất cả phần trừ phần cuối
                    const horseId = parts[parts.length - 1]; // Phần cuối cùng là horseId
                    
                    console.log('🔍 DEBUG: Parsed gameId:', gameId);
                    console.log('🔍 DEBUG: Parsed horseId:', horseId);
                    
                    const game = activeHorseRacingGames.get(gameId);
                    console.log('🔍 DEBUG: Found game:', !!game);
                    
                    if (game && game.isActive) {
                        // Import và gọi handleBetInteraction từ horseracing.ts
                        const horseracingModule = await import("@/commands/text/games/horseracing");
                        if (horseracingModule.handleBetInteraction) {
                            await horseracingModule.handleBetInteraction(interaction, game);
                        } else {
                            console.error('handleBetInteraction function not found in horseracing module');
                        }
                        return;
                    } else {
                        console.log('🔍 DEBUG: Game not found or not active');
                    }
                }
            }
            
            // Nếu không phải bet interaction, trả lời lỗi
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ 
                        content: '❌ Hành động không hợp lệ cho game đua Cá!', 
                        ephemeral: true 
                    });
                } catch (replyError) {
                    console.error('Error replying to invalid action:', replyError);
                }
            }
            
        } catch (error) {
            console.error('Error handling horse racing interaction:', error);
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ 
                        content: '❌ Có lỗi xảy ra khi xử lý tương tác đua Cá!', 
                        ephemeral: true 
                    });
                } catch (replyError) {
                    console.error('Error replying to interaction:', replyError);
                }
            }
        }
    }
}
