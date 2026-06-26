import { EmbedBuilder, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Bot } from "@/classes";
import { AchievementService } from "@/utils/achievement";

export default Bot.createCommand({
    structure: {
        name: "achievements",
        aliases: ["achievement", "danhhieu", "badge"],
    },
    options: {
        cooldown: 3000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;

        try {
            // Lấy tất cả achievements của user
            const userAchievements = await AchievementService.getUserAchievements(userId);

            if (userAchievements.length === 0) {
                const noAchievementEmbed = new EmbedBuilder()
                    .setTitle("🏅 Danh Hiệu Của Bạn")
                    .setDescription(
                        `**${message.author.username}** chưa có danh hiệu nào!\n\n` +
                        `🎯 **Cách nhận danh hiệu:**\n` +
                        `🏆 **Top câu cá**: Câu cá nhiều nhất server\n` +
                        `💰 **Top FishCoin**: Có nhiều FishCoin nhất\n` +
                        `⚔️ **Top FishBattle**: Thắng nhiều trận đấu cá nhất\n` +
                        `🎖️ **Top Custom**: Danh hiệu đặc biệt từ Admin\n\n` +
                        `💡 Hãy cố gắng để nhận được danh hiệu đầu tiên!`
                    )
                    .setColor("#ff6b35")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setTimestamp();

                return await message.reply({ embeds: [noAchievementEmbed] });
            }

            // Tạo embed hiển thị achievements
            const achievementEmbed = new EmbedBuilder()
                .setTitle(`🏅 Danh Hiệu Của ${message.author.username}`)
                .setDescription(
                    `**${message.author.username}** đã sở hữu **${userAchievements.length}** danh hiệu!\n\n` +
                    `🎯 **Danh hiệu hiện tại:**`
                )
                .setColor("#ff6b35")
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            // Thêm từng achievement vào embed
            userAchievements.forEach((achievement, index) => {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                const typeName = AchievementService.getAchievementTypeName(achievement.type);
                const createdAt = achievement.createdAt.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const statusEmoji = achievement.active ? '✅' : '❌';
                const statusText = achievement.active ? 'Đang Active' : 'Chưa Active';

                achievementEmbed.addFields({
                    name: `${index + 1}. ${typeEmoji} ${achievement.name} ${statusEmoji}`,
                    value: `🏅 **Loại:** ${typeName}\n📅 **Nhận ngày:** ${createdAt}\n🔗 **Ảnh:** [Xem ảnh](${achievement.link})\n🎯 **Trạng thái:** ${statusText}`,
                    inline: false
                });
            });

            // Thêm thông tin về achievement có priority cao nhất
            const highestPriority = await AchievementService.getHighestPriorityAchievement(userId);
            if (highestPriority) {
                const typeEmoji = AchievementService.getAchievementTypeEmoji(highestPriority.type);
                const typeName = AchievementService.getAchievementTypeName(highestPriority.type);
                
                achievementEmbed.addFields({
                    name: "🎯 Danh Hiệu Ưu Tiên Cao Nhất",
                    value: `${typeEmoji} **${highestPriority.name}**\n🏅 **Loại:** ${typeName}\n💡 **Sẽ hiển thị khi câu cá**`,
                    inline: false
                });
            }

            // Thêm footer với thống kê
            achievementEmbed.setFooter({
                text: `Tổng cộng: ${userAchievements.length} danh hiệu • Danh hiệu ưu tiên sẽ hiển thị khi câu cá`
            });

            // Tạo buttons để chọn active achievement (hiện cả khi chỉ có 1 achievement,
            // để user có thể tự active lại nếu đang ở trạng thái chưa active)
            let components: ActionRowBuilder<ButtonBuilder>[] = [];

            if (userAchievements.length >= 1) {
                const activeButtons = userAchievements.map((achievement, index) => {
                    const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
                    const statusEmoji = achievement.active ? '✅' : '❌';
                    
                    return new ButtonBuilder()
                        .setCustomId(`activate_achievement_${achievement.id}`)
                        .setLabel(`${index + 1}. ${achievement.name} ${statusEmoji}`)
                        .setStyle(achievement.active ? ButtonStyle.Success : ButtonStyle.Secondary)
                        .setEmoji(typeEmoji);
                });

                // Chia buttons thành các hàng (tối đa 3 buttons mỗi hàng)
                for (let i = 0; i < activeButtons.length; i += 3) {
                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(activeButtons.slice(i, i + 3));
                    components.push(row);
                }

                // Thêm button để deactivate tất cả
                const deactivateRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('deactivate_all_achievements')
                            .setLabel('Deactivate Tất Cả')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🚫')
                    );
                components.push(deactivateRow);
            }

            return await message.reply({ 
                embeds: [achievementEmbed],
                components: components
            });

        } catch (error) {
            console.error('Error fetching user achievements:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Khi Tải Danh Hiệu")
                .setDescription("Có lỗi xảy ra khi tải danh hiệu của bạn. Vui lòng thử lại sau!")
                .setColor("#ff0000")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }
    },
}); 