import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { FishMarketService } from '../../utils/fish-market';
import { FishInventoryService } from '../../utils/fish-inventory';

export class FishMarketUI {
  private listings: any[];
  private userListings: any[];
  private userInventory: any;
  private currentPage: number;
  private totalPages: number;
  private mode: 'browse' | 'sell' | 'my' | 'search';
  private searchQuery: string;
  private filterOptions: any;
  private userId: string;
  private guildId: string;

  constructor(
    listings: any[],
    userListings: any[],
    userInventory: any,
    userId: string,
    guildId: string,
    currentPage: number = 1,
    totalPages: number = 1,
    mode: 'browse' | 'sell' | 'my' | 'search' = 'browse',
    searchQuery: string = '',
    filterOptions: any = {}
  ) {
    this.listings = listings;
    this.userListings = userListings;
    this.userInventory = userInventory;
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.mode = mode;
    this.searchQuery = searchQuery;
    this.filterOptions = filterOptions;
    this.userId = userId;
    this.guildId = guildId;
  }

  createEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("🏪 Fish Market")
      .setColor("#4ECDC4")
      .setTimestamp();

    switch (this.mode) {
      case 'browse':
        return this.createBrowseEmbed(embed);
      case 'sell':
        return this.createSellEmbed(embed);
      case 'my':
        return this.createMyListingsEmbed(embed);
      case 'search':
        return this.createSearchEmbed(embed);
      default:
        return this.createBrowseEmbed(embed);
    }
  }

  private createBrowseEmbed(embed: EmbedBuilder): EmbedBuilder {
    if (this.listings.length === 0) {
      embed.setDescription("Hiện tại không có cá nào đang bán trong market!")
        .addFields({
          name: "💡 Gợi ý",
          value: "Sử dụng `n.fishmarket sell <fish_id> <giá>` để treo bán cá của bạn!"
        });
      return embed;
    }

    embed.setDescription(`**${this.listings.length}** cá đang bán trong market (Trang ${this.currentPage}/${this.totalPages})`);

    for (const listing of this.listings) {
      const fish = listing.fish;
      const stats = fish.stats || {};
      const totalPower = this.calculateTotalPower(fish);
      const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
      
      embed.addFields({
        name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()}`,
        value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity} | **Còn lại:** ${timeLeft}h\n` +
               `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
               `**ID:** \`${fish.id}\` | **Người bán:** <@${listing.sellerId}>`,
        inline: false
      });
    }

    return embed;
  }

  private createSellEmbed(embed: EmbedBuilder): EmbedBuilder {
    const eligibleFish = this.userInventory.items.filter((item: any) => {
      const fish = item.fish;
      return fish.generation >= 2 && fish.status === 'adult';
    });

    if (eligibleFish.length === 0) {
      embed.setDescription("Bạn không có cá nào đủ điều kiện để bán!")
        .addFields({
          name: "📋 Điều kiện bán cá",
          value: "• Thế hệ 2 trở lên\n• Cá trưởng thành (level 10)\n• Không trong túi đấu"
        });
      return embed;
    }

    embed.setDescription(`**${eligibleFish.length}** cá có thể bán`);

    for (const item of eligibleFish.slice(0, 5)) {
      const fish = item.fish;
      const stats = fish.stats || {};
      const totalPower = this.calculateTotalPower(fish);
      
      embed.addFields({
        name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation})`,
        value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity}\n` +
               `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
               `**ID:** \`${fish.id}\``,
        inline: false
      });
    }

    if (eligibleFish.length > 5) {
      embed.addFields({
        name: "📄 Còn lại",
        value: `${eligibleFish.length - 5} cá khác...`,
        inline: false
      });
    }

    return embed;
  }

  private createMyListingsEmbed(embed: EmbedBuilder): EmbedBuilder {
    if (this.userListings.length === 0) {
      embed.setDescription("Bạn chưa có cá nào đang bán trên market!")
        .addFields({
          name: "💡 Gợi ý",
          value: "Sử dụng `n.fishmarket sell <fish_id> <giá>` để treo bán cá!"
        });
      return embed;
    }

    embed.setDescription(`**${this.userListings.length}** cá đang bán`);

    for (const listing of this.userListings) {
      const fish = listing.fish;
      const stats = fish.stats || {};
      const totalPower = this.calculateTotalPower(fish);
      const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
      const isExpired = timeLeft <= 0;
      
      embed.addFields({
        name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()} ${isExpired ? '⏰ HẾT HẠN' : ''}`,
        value: `**Power:** ${totalPower} | **Còn lại:** ${isExpired ? 'Hết hạn' : `${timeLeft}h`}\n` +
               `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
               `**ID:** \`${fish.id}\``,
        inline: false
      });
    }

    return embed;
  }

  private createSearchEmbed(embed: EmbedBuilder): EmbedBuilder {
    if (this.listings.length === 0) {
      embed.setDescription(`Không tìm thấy cá nào có tên chứa "${this.searchQuery}"`);
      return embed;
    }

    embed.setDescription(`Tìm thấy **${this.listings.length}** kết quả cho "${this.searchQuery}"`);

    for (const listing of this.listings) {
      const fish = listing.fish;
      const stats = fish.stats || {};
      const totalPower = this.calculateTotalPower(fish);
      
      embed.addFields({
        name: `🐟 ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}) - 💰${listing.price.toLocaleString()}`,
        value: `**Power:** ${totalPower} | **Rarity:** ${fish.rarity}\n` +
               `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}\n` +
               `**ID:** \`${fish.id}\` | **Người bán:** <@${listing.sellerId}>`,
        inline: false
      });
    }

    return embed;
  }

  createComponents(): any[] {
    const components: any[] = [];

    switch (this.mode) {
      case 'browse':
        components.push(...this.createBrowseComponents());
        break;
      case 'sell':
        components.push(...this.createSellComponents());
        break;
      case 'my':
        components.push(...this.createMyListingsComponents());
        break;
      case 'search':
        components.push(...this.createSearchComponents());
        break;
    }

    // Luôn có button đóng
    const closeRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('market_close')
          .setLabel('Đóng')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❌')
      );
    components.push(closeRow);

    return components;
  }

  private createBrowseComponents(): any[] {
    const components: any[] = [];

    // Row 1: Navigation và Actions
    const actionRow1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('market_sell')
          .setLabel('Bán Cá')
          .setStyle(ButtonStyle.Success)
          .setEmoji('💰'),
        new ButtonBuilder()
          .setCustomId('market_my')
          .setLabel('Cá Của Tôi')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📊'),
        new ButtonBuilder()
          .setCustomId('market_search')
          .setLabel('Tìm Kiếm')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔍'),
        new ButtonBuilder()
          .setCustomId('market_filter')
          .setLabel('Lọc')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎯')
      );

    // Row 2: Navigation buttons
    const navRow = new ActionRowBuilder<ButtonBuilder>();
    
    if (this.currentPage > 1) {
      navRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`market_prev_${this.currentPage - 1}`)
          .setLabel('◀️ Trước')
          .setStyle(ButtonStyle.Secondary)
      );
    }
    
    if (this.currentPage < this.totalPages) {
      navRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`market_next_${this.currentPage + 1}`)
          .setLabel('Tiếp ▶️')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    if (navRow.components.length > 0) {
      components.push(actionRow1, navRow);
    } else {
      components.push(actionRow1);
    }

    return components;
  }

  private createSellComponents(): any[] {
    const components: any[] = [];

    const eligibleFish = this.userInventory.items.filter((item: any) => {
      const fish = item.fish;
      return fish.generation >= 2 && fish.status === 'adult';
    });

    if (eligibleFish.length > 0) {
      // Row 1: Select fish to sell
      const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('market_select_fish_to_sell')
            .setPlaceholder('Chọn cá để bán...')
            .addOptions(
              eligibleFish.slice(0, 25).map((item: any) => {
                const fish = item.fish;
                const stats = fish.stats || {};
                const totalPower = this.calculateTotalPower(fish);
                
                return {
                  label: `${fish.name} (Lv.${fish.level}, Gen.${fish.generation})`,
                  description: `Power: ${totalPower} - ${fish.rarity}`,
                  value: fish.id,
                  emoji: '🐟',
                };
              })
            )
        );

      // Row 2: Actions
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('market_browse')
            .setLabel('Xem Market')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏪'),
          new ButtonBuilder()
            .setCustomId('market_my')
            .setLabel('Cá Của Tôi')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📊')
        );

      components.push(selectRow, actionRow);
    } else {
      // Row 1: No fish available
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('market_browse')
            .setLabel('Xem Market')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏪'),
          new ButtonBuilder()
            .setCustomId('market_my')
            .setLabel('Cá Của Tôi')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📊')
        );

      components.push(actionRow);
    }

    return components;
  }

  private createMyListingsComponents(): any[] {
    const components: any[] = [];

    if (this.userListings.length > 0) {
      // Row 1: Select fish to cancel
      const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('market_select_fish_to_cancel')
            .setPlaceholder('Chọn cá để hủy bán...')
            .addOptions(
              this.userListings.slice(0, 25).map((listing: any) => {
                const fish = listing.fish;
                const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
                const isExpired = timeLeft <= 0;
                
                return {
                  label: `${fish.name} - ${listing.price.toLocaleString()} coins`,
                  description: isExpired ? 'Hết hạn' : `Còn ${timeLeft}h`,
                  value: fish.id,
                  emoji: isExpired ? '⏰' : '💰',
                };
              })
            )
        );

      // Row 2: Actions
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('market_browse')
            .setLabel('Xem Market')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏪'),
          new ButtonBuilder()
            .setCustomId('market_sell')
            .setLabel('Bán Cá')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰')
        );

      components.push(selectRow, actionRow);
    } else {
      // Row 1: No listings
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('market_browse')
            .setLabel('Xem Market')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏪'),
          new ButtonBuilder()
            .setCustomId('market_sell')
            .setLabel('Bán Cá')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💰')
        );

      components.push(actionRow);
    }

    return components;
  }

  private createSearchComponents(): any[] {
    const components: any[] = [];

    // Row 1: Actions
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('market_browse')
          .setLabel('Xem Market')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🏪'),
        new ButtonBuilder()
          .setCustomId('market_sell')
          .setLabel('Bán Cá')
          .setStyle(ButtonStyle.Success)
          .setEmoji('💰'),
        new ButtonBuilder()
          .setCustomId('market_my')
          .setLabel('Cá Của Tôi')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📊')
      );

    components.push(actionRow);

    return components;
  }

  private calculateTotalPower(fish: any): number {
    const stats = fish.stats || {};
    return (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
  }
} 