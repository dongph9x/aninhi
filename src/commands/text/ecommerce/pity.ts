import { Message, EmbedBuilder } from 'discord.js';
import { Bot } from '@/classes';
import { PitySystemService } from '../../../utils/pity-system';

export default Bot.createCommand({
    structure: {
        name: 'pity',
        aliases: ['pitysystem', 'pityinfo']
    },
    options: {
        cooldown: 1000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        try {
            const userId = message.author.id;
            const guildId = message.guild?.id;

            if (!guildId) {
                return await message.reply('❌ Không thể xác định server!');
            }

            if (!message.guild) {
                return await message.reply('❌ Lệnh này chỉ có thể sử dụng trong server!');
            }

            // Lấy thông tin pity
            const pityInfo = await PitySystemService.getPityInfo(userId, guildId);

            if (!pityInfo) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Không thể lấy thông tin pity system!")
                    .setColor("#ff0000")
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            // Tạo embed thông tin pity
            const pityEmbed = PitySystemService.createPityEmbed(pityInfo);

            // Thêm thông tin người dùng
            pityEmbed.setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL()
            });

            await message.reply({ embeds: [pityEmbed] });

        } catch (error) {
            console.error('Error in pity command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi lấy thông tin pity system!")
                .setColor("#ff0000")
                .setTimestamp();

            await message.reply({ embeds: [errorEmbed] });
        }
    }
}); 