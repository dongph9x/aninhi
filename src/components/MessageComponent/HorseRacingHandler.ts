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
                if (parts.length >= 4 && parts[0] === 'bet') {
                    const gameId = parts.slice(1, -1).join('_');
                    const game = activeHorseRacingGames.get(gameId);
                    
                    if (game && game.isActive) {
                        // Kiểm tra xem interaction còn hợp lệ không
                        if (interaction.replied || interaction.deferred) {
                            console.log('🔍 DEBUG: Interaction already replied/deferred, skipping');
                            return;
                        }
                        
                        // Import và gọi handleBetInteraction từ horseracing.ts
                        const horseracingModule = await import("@/commands/text/games/horseracing");
                        if (horseracingModule.handleBetInteraction) {
                            await horseracingModule.handleBetInteraction(interaction, game);
                        } else {
                            console.error('handleBetInteraction function not found in horseracing module');
                        }
                        return;
                    }
                }
            }
            
            // Nếu không phải bet interaction, trả lời lỗi
            await interaction.reply({ 
                content: '❌ Hành động không hợp lệ cho game đua ngựa!', 
                ephemeral: true 
            });
            
        } catch (error) {
            console.error('Error handling horse racing interaction:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ Có lỗi xảy ra khi xử lý tương tác đua ngựa!', 
                    ephemeral: true 
                });
            }
        }
    }
}
