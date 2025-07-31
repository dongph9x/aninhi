import { EmbedBuilder } from 'discord.js';

export interface SeasonConfig {
  name: string;
  emoji: string;
  cooldownMultiplier: number; // Hệ số nhân cooldown (1.0 = bình thường)
  fishValueMultiplier: number; // Hệ số nhân giá trị cá (1.0 = bình thường)
  luckMultiplier: number; // Hệ số nhân tỷ lệ may mắn (1.0 = bình thường)
  description: string;
}

export class SeasonalFishingService {
  private static readonly BASE_COOLDOWN = 30; // 30 giây cooldown cơ bản
  private static readonly BASE_FISH_VALUE_MULTIPLIER = 1.0;
  private static readonly BASE_LUCK_MULTIPLIER = 1.0;
  private static readonly SEASON_DURATION = 30 * 60 * 1000; // 30 phút = 30 * 60 * 1000 ms

  // Cấu hình các mùa
  private static readonly SEASONS: Record<string, SeasonConfig> = {
    'summer': {
      name: 'Mùa Hè',
      emoji: '☀️',
      cooldownMultiplier: 0.67, // 20s thay vì 30s
      fishValueMultiplier: 0.8, // Giảm 20% giá trị cá
      luckMultiplier: 1.0,
      description: 'Thời gian câu cá nhanh hơn nhưng giá trị cá thấp hơn'
    },
    'autumn': {
      name: 'Mùa Thu',
      emoji: '🍂',
      cooldownMultiplier: 1.0, // 30s như bình thường
      fishValueMultiplier: 1.1, // Tăng 10% giá trị cá
      luckMultiplier: 1.0,
      description: 'Thời gian câu cá bình thường và giá trị cá cao hơn'
    },
    'winter': {
      name: 'Mùa Đông',
      emoji: '❄️',
      cooldownMultiplier: 1.33, // 40s thay vì 30s
      fishValueMultiplier: 1.4, // Tăng 40% giá trị cá
      luckMultiplier: 1.0,
      description: 'Thời gian câu cá chậm hơn nhưng giá trị cá cao hơn'
    },
    'spring': {
      name: 'Mùa Xuân',
      emoji: '🌸',
      cooldownMultiplier: 1.17, // 35s thay vì 30s
      fishValueMultiplier: 1.1, // Tăng 10% giá trị cá
      luckMultiplier: 1.2, // Tăng 20% tỷ lệ may mắn
      description: 'Thời gian câu cá chậm hơn một chút, giá trị cá cao hơn và tỷ lệ may mắn tăng'
    }
  };

  // Thứ tự các mùa
  private static readonly SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

  /**
   * Lấy mùa hiện tại dựa trên thời gian (thay đổi sau mỗi 30 phút)
   */
  static getCurrentSeason(): string {
    const now = Date.now();
    const seasonIndex = Math.floor((now / this.SEASON_DURATION) % this.SEASON_ORDER.length);
    return this.SEASON_ORDER[seasonIndex];
  }

  /**
   * Lấy thời gian còn lại của mùa hiện tại (tính bằng giây)
   */
  static getRemainingSeasonTime(): number {
    const now = Date.now();
    const timeInCurrentCycle = now % this.SEASON_DURATION;
    const remainingTime = this.SEASON_DURATION - timeInCurrentCycle;
    return Math.ceil(remainingTime / 1000); // Chuyển về giây
  }

  /**
   * Lấy thời gian đã trôi qua của mùa hiện tại (tính bằng giây)
   */
  static getElapsedSeasonTime(): number {
    const now = Date.now();
    const timeInCurrentCycle = now % this.SEASON_DURATION;
    return Math.ceil(timeInCurrentCycle / 1000); // Chuyển về giây
  }

  /**
   * Lấy mùa tiếp theo
   */
  static getNextSeason(): string {
    const currentSeason = this.getCurrentSeason();
    const currentIndex = this.SEASON_ORDER.indexOf(currentSeason);
    const nextIndex = (currentIndex + 1) % this.SEASON_ORDER.length;
    return this.SEASON_ORDER[nextIndex];
  }

  /**
   * Lấy cấu hình mùa hiện tại
   */
  static getCurrentSeasonConfig(): SeasonConfig {
    const currentSeason = this.getCurrentSeason();
    return this.SEASONS[currentSeason];
  }

  /**
   * Tính cooldown theo mùa
   */
  static getSeasonalCooldown(): number {
    const seasonConfig = this.getCurrentSeasonConfig();
    return Math.round(this.BASE_COOLDOWN * seasonConfig.cooldownMultiplier);
  }

  /**
   * Tính giá trị cá theo mùa
   */
  static getSeasonalFishValue(baseValue: number): number {
    const seasonConfig = this.getCurrentSeasonConfig();
    return Math.round(baseValue * seasonConfig.fishValueMultiplier);
  }

  /**
   * Tính tỷ lệ may mắn theo mùa
   */
  static getSeasonalLuckMultiplier(): number {
    const seasonConfig = this.getCurrentSeasonConfig();
    return seasonConfig.luckMultiplier;
  }

  /**
   * Tạo embed thông tin mùa hiện tại
   */
  static createSeasonInfoEmbed(): EmbedBuilder {
    const seasonConfig = this.getCurrentSeasonConfig();
    const currentSeason = this.getCurrentSeason();
    const nextSeason = this.getNextSeason();
    const nextSeasonConfig = this.SEASONS[nextSeason];
    
    const cooldownSeconds = this.getSeasonalCooldown();
    const fishValuePercent = Math.round((seasonConfig.fishValueMultiplier - 1) * 100);
    const luckPercent = Math.round((seasonConfig.luckMultiplier - 1) * 100);
    const remainingTime = this.getRemainingSeasonTime();
    const elapsedTime = this.getElapsedSeasonTime();

    const embed = new EmbedBuilder()
      .setTitle(`${seasonConfig.emoji} ${seasonConfig.name} - Hệ Thống Câu Cá Theo Mùa`)
      .setDescription(seasonConfig.description)
      .addFields(
        {
          name: '⏰ Cooldown Câu Cá',
          value: `${cooldownSeconds} giây`,
          inline: true
        },
        {
          name: '💰 Giá Trị Cá',
          value: fishValuePercent >= 0 ? `+${fishValuePercent}%` : `${fishValuePercent}%`,
          inline: true
        },
        {
          name: '🍀 Tỷ Lệ May Mắn',
          value: luckPercent >= 0 ? `+${luckPercent}%` : `${luckPercent}%`,
          inline: true
        },
        {
          name: '⏱️ Thời Gian Mùa',
          value: `Đã trôi qua: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}\nCòn lại: ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}`,
          inline: false
        },
        {
          name: '🔄 Mùa Tiếp Theo',
          value: `${nextSeasonConfig.emoji} ${nextSeasonConfig.name} - ${nextSeasonConfig.description}`,
          inline: false
        }
      )
      .setColor(this.getSeasonColor(currentSeason))
      .setTimestamp();

    return embed;
  }

  /**
   * Lấy màu sắc theo mùa
   */
  private static getSeasonColor(season: string): string {
    switch (season) {
      case 'spring': return '#ff69b4'; // Hồng
      case 'summer': return '#ffa500'; // Cam
      case 'autumn': return '#8b4513'; // Nâu
      case 'winter': return '#87ceeb'; // Xanh nhạt
      default: return '#ffffff';
    }
  }

  /**
   * Lấy tất cả thông tin mùa
   */
  static getAllSeasonsInfo(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🌍 Thông Tin Tất Cả Các Mùa')
      .setDescription('Hệ thống câu cá thay đổi theo mùa mỗi 30 phút để tạo sự đa dạng và thú vị!')
      .setColor('#00ff00');

    for (const [seasonKey, seasonConfig] of Object.entries(this.SEASONS)) {
      const cooldownSeconds = Math.round(this.BASE_COOLDOWN * seasonConfig.cooldownMultiplier);
      const fishValuePercent = Math.round((seasonConfig.fishValueMultiplier - 1) * 100);
      const luckPercent = Math.round((seasonConfig.luckMultiplier - 1) * 100);

      embed.addFields({
        name: `${seasonConfig.emoji} ${seasonConfig.name}`,
        value: 
          `**Cooldown:** ${cooldownSeconds}s\n` +
          `**Giá trị cá:** ${fishValuePercent >= 0 ? '+' : ''}${fishValuePercent}%\n` +
          `**May mắn:** ${luckPercent >= 0 ? '+' : ''}${luckPercent}%\n` +
          `**Mô tả:** ${seasonConfig.description}`,
        inline: true
      });
    }

    embed.setTimestamp();
    return embed;
  }

  /**
   * Kiểm tra xem có phải mùa xuân không (để tăng tỷ lệ may mắn)
   */
  static isSpringSeason(): boolean {
    return this.getCurrentSeason() === 'spring';
  }

  /**
   * Lấy thông tin mùa dưới dạng text
   */
  static getSeasonInfoText(): string {
    const seasonConfig = this.getCurrentSeasonConfig();
    const cooldownSeconds = this.getSeasonalCooldown();
    const fishValuePercent = Math.round((seasonConfig.fishValueMultiplier - 1) * 100);
    const luckPercent = Math.round((seasonConfig.luckMultiplier - 1) * 100);
    const remainingTime = this.getRemainingSeasonTime();

    return `${seasonConfig.emoji} **${seasonConfig.name}** - Cooldown: ${cooldownSeconds}s, Giá cá: ${fishValuePercent >= 0 ? '+' : ''}${fishValuePercent}%, May mắn: ${luckPercent >= 0 ? '+' : ''}${luckPercent}% (Còn ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')})`;
  }

  /**
   * Lấy thông tin mùa tiếp theo
   */
  static getNextSeasonInfo(): string {
    const nextSeason = this.getNextSeason();
    const nextSeasonConfig = this.SEASONS[nextSeason];
    const remainingTime = this.getRemainingSeasonTime();
    
    return `${nextSeasonConfig.emoji} **${nextSeasonConfig.name}** sẽ bắt đầu sau ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}`;
  }
}