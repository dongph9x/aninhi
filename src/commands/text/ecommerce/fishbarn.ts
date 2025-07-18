import { Message } from 'discord.js';
import { ExtendedClient } from '@/classes/ExtendedClient';
import { FishInventoryService } from '@/utils/fish-inventory';
import { FishBarnUI } from '@/components/MessageComponent/FishBarnUI';

export default {
  structure: {
    name: 'fishbarn',
    aliases: ['fb', 'fishbarn', 'rươngcá'],
  },
  options: {
    cooldown: 5,
  },
  async run({ message, args, client }: { message: Message, args: string[], client: ExtendedClient }) {
    try {
      const userId = message.author.id;
      const guildId = message.guild?.id;
      
      if (!guildId) {
        return message.reply('❌ Lệnh này chỉ có thể sử dụng trong server!');
      }

      // Lấy fish inventory
      const inventory = await FishInventoryService.getFishInventory(userId, guildId);
      
      // Tự động chọn cá đầu tiên nếu có
      const selectedFishId = inventory.items.length > 0 ? inventory.items[0].fish.id : undefined;
      
      // Tạo UI
      const ui = new FishBarnUI(inventory, userId, guildId, selectedFishId);
      const embed = await ui.createEmbed();
      const components = ui.createComponents();
      
      const sentMessage = await message.reply({
        embeds: [embed],
        components: components,
      });
      
      // Lưu message ID để xử lý interaction
      client.fishBarnMessages.set(sentMessage.id, {
        userId,
        guildId,
        inventory,
        selectedFishId, // Lưu selectedFishId
      });
      
    } catch (error) {
      console.error('Error in fishbarn command:', error);
      message.reply('❌ Có lỗi xảy ra khi mở rương nuôi cá!');
    }
  },
}; 