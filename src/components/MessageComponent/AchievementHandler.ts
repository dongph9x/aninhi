import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AchievementService } from "@/utils/achievement";

export class AchievementHandler {
    static async handleInteraction(interaction: ButtonInteraction) {
        const customId = interaction.customId;
        const userId = interaction.user.id;

        try {
            // Xử lý activate achievement
            if (customId.startsWith('activate_achievement_')) {
                const achievementId = customId.replace('activate_achievement_', '');
                
                const success = await AchievementService.activateAchievement(achievementId, userId);
                
                if (success) {
                    // Lấy achievement đã active
                    const achievement = await AchievementService.getUserAchievements(userId);
                    const activeAchievement = achievement.find(a => a.id === achievementId);
                    
                    if (activeAchievement) {
                        const typeEmoji = AchievementService.getAchievementTypeEmoji(activeAchievement.type);
                        const typeName = AchievementService.getAchievementTypeName(activeAchievement.type);
                        
                        const successEmbed = new EmbedBuilder()
                            .setTitle('✅ Đã Active Danh Hiệu!')
                            .setDescription(
                                `**${interaction.user.username}** đã active danh hiệu:\n\n` +
                                `${typeEmoji} **${activeAchievement.name}**\n` +
                                `🏅 **Loại:** ${typeName}\n` +
                                `💡 **Danh hiệu này sẽ hiển thị khi câu cá!**`
                            )
                            .setColor('#00ff00')
                            .setThumbnail(activeAchievement.link)
                            .setTimestamp();

                        await interaction.reply({ 
                            embeds: [successEmbed],
                            ephemeral: true 
                        });
                    }
                } else {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Lỗi Active Danh Hiệu')
                        .setDescription('Không thể active danh hiệu này. Vui lòng thử lại!')
                        .setColor('#ff0000')
                        .setTimestamp();

                    await interaction.reply({ 
                        embeds: [errorEmbed],
                        ephemeral: true 
                    });
                }
            }
            
            // Xử lý deactivate tất cả achievements
            else if (customId === 'deactivate_all_achievements') {
                const success = await AchievementService.deactivateAllAchievements(userId);
                
                if (success) {
                    const successEmbed = new EmbedBuilder()
                        .setTitle('🚫 Đã Deactivate Tất Cả Danh Hiệu!')
                        .setDescription(
                            `**${interaction.user.username}** đã deactivate tất cả danh hiệu.\n\n` +
                            `💡 **Khi câu cá sẽ hiển thị theo thứ tự ưu tiên:**\n` +
                            `👑 Admin > 🏆 Top Fisher > 💰 Top FishCoin > 💸 Top Lose`
                        )
                        .setColor('#ff6b35')
                        .setTimestamp();

                    await interaction.reply({ 
                        embeds: [successEmbed],
                        ephemeral: true 
                    });
                } else {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Lỗi Deactivate Danh Hiệu')
                        .setDescription('Không thể deactivate danh hiệu. Vui lòng thử lại!')
                        .setColor('#ff0000')
                        .setTimestamp();

                    await interaction.reply({ 
                        embeds: [errorEmbed],
                        ephemeral: true 
                    });
                }
            }

        } catch (error) {
            console.error('Error handling achievement interaction:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Xử Lý')
                .setDescription('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại!')
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed],
                ephemeral: true 
            });
        }
    }
} 