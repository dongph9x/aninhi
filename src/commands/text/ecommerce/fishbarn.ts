import { Message } from 'discord.js';
import { ExtendedClient } from '@/classes/ExtendedClient';
import { FishInventoryService } from '@/utils/fish-inventory';
import { FishBarnUI } from '@/components/MessageComponent/FishBarnUI';
import { FishFeedService } from '@/utils/fish-feed';

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
      
      // Tự động chọn cá đầu tiên có thể cho ăn (không phải level 10)
      const feedableFish = inventory.items.filter((item: any) => item.fish.level < 10);
      const selectedFishId = feedableFish.length > 0 ? feedableFish[0].fish.id : undefined;
      
      // Lấy thông tin daily feed limit
      const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
      
      // Tạo UI
      // Kiểm tra quyền admin
    const { FishBattleService } = await import('@/utils/fish-battle');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId, message.client);
    
    const ui = new FishBarnUI(inventory, userId, guildId, selectedFishId, undefined, false, undefined, undefined, dailyFeedInfo, isAdmin);
      await ui.loadUserFishFood(); // Load user fish food
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
      
      // Lưu selectedFishId vào FishBarnHandler để xử lý interaction
      const { FishBarnHandler } = await import('@/components/MessageComponent/FishBarnHandler');
      if (selectedFishId) {
        FishBarnHandler['selectedFishMap'].set(userId, selectedFishId);
      }
      
    } catch (error) {
      console.error('Error in fishbarn command:', error);
      message.reply('❌ Có lỗi xảy ra khi mở rương nuôi cá!');
    }
  },
}; 