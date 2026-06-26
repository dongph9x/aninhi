import { EmbedBuilder } from "discord.js";
import { spamProtectionConfig, spamCommands, spamMessages, SpamRecord } from "@/config/spam-protection";

export class SpamProtectionService {
  private static instance: SpamProtectionService;
  private spamRecords: Map<string, SpamRecord> = new Map();

  private constructor() {}

  public static getInstance(): SpamProtectionService {
    if (!SpamProtectionService.instance) {
      SpamProtectionService.instance = new SpamProtectionService();
    }
    return SpamProtectionService.instance;
  }

  /**
   * Kiểm tra spam cho một lệnh
   */
  checkSpam(userId: string, guildId: string, command: string): {
    allowed: boolean;
    reason?: string;
    cooldown?: number;
    embed?: EmbedBuilder;
    toolSpamDetected?: boolean;
    pattern?: string;
    extendedSpamDetected?: boolean;
  } {
    if (!spamProtectionConfig.enabled) {
      return { allowed: true };
    }

    const commandConfig = this.getCommandConfig(command);
    if (!commandConfig) {
      return { allowed: true };
    }

    const recordKey = `${userId}-${guildId}-${command}`;
    const now = Date.now();
    const record = this.spamRecords.get(recordKey);

    // Nếu chưa có record, tạo mới
    if (!record) {
      this.spamRecords.set(recordKey, {
        userId,
        guildId,
        command,
        timestamp: now,
        attempts: 1,
        warnings: 0,
        isBanned: false,
        timeIntervals: [],
        toolSpamWarnings: 0,
        isToolSpamBanned: false,
        extendedAttempts: 1,
        extendedWarnings: 0,
        isExtendedSpamBanned: false,
        extendedAttemptsHistory: [now],
        extendedTimeIntervals: [],
        frequencySpamWarnings: 0,
        isFrequencySpamBanned: false,
      });
      return { allowed: true };
    }

    // Kiểm tra extended spam ban
    if (record.isExtendedSpamBanned && record.extendedSpamBanExpiresAt && now < record.extendedSpamBanExpiresAt) {
      const remainingBan = Math.ceil((record.extendedSpamBanExpiresAt - now) / 60000);
      const embed = new EmbedBuilder()
        .setTitle("📊 Bị Tạm Khóa Extended Spam")
        .setDescription(
          `Bạn đã bị tạm khóa do spam lệnh \`${command}\` quá nhiều lần trong 5 phút!\n\n` +
          `⏰ **Thời gian còn lại:** ${remainingBan} phút\n` +
          `📊 **Số lần vi phạm:** ${record.extendedAttempts}/20\n` +
          `⚠️ **Extended spam cảnh cáo:** ${record.extendedWarnings} lần\n` +
          `🔍 **Lý do:** Vượt quá 20 lần trong 5 phút`
        )
        .setColor("#ff0000")
        .setTimestamp();

      return {
        allowed: false,
        reason: "extended_spam_banned",
        embed,
      };
    }

    // Kiểm tra frequency spam ban
    if (record.isFrequencySpamBanned && record.frequencySpamBanExpiresAt && now < record.frequencySpamBanExpiresAt) {
      const remainingBan = Math.ceil((record.frequencySpamBanExpiresAt - now) / 60000);
      const embed = new EmbedBuilder()
        .setTitle("⏱️ Bị Tạm Khóa Frequency Spam")
        .setDescription(
          `Bạn đã bị tạm khóa do tần suất spam lệnh \`${command}\` tự động trong 5 phút!\n\n` +
          `⏰ **Thời gian còn lại:** ${remainingBan} phút\n` +
          `📊 **Số lần vi phạm:** ${record.extendedAttempts}/20\n` +
          `⏱️ **Frequency spam cảnh cáo:** ${record.frequencySpamWarnings} lần\n` +
          `🔍 **Lý do:** Tần suất spam tự động trong 5 phút`
        )
        .setColor("#ff0000")
        .setTimestamp();

      return {
        allowed: false,
        reason: "frequency_spam_banned",
        embed,
      };
    }

    // Kiểm tra tool spam ban
    if (record.isToolSpamBanned && record.toolSpamBanExpiresAt && now < record.toolSpamBanExpiresAt) {
      const remainingBan = Math.ceil((record.toolSpamBanExpiresAt - now) / 60000);
      const embed = new EmbedBuilder()
        .setTitle("🤖 Bị Tạm Khóa Tool Spam")
        .setDescription(
          `Bạn đã bị tạm khóa do sử dụng tool spam lệnh \`${command}\`!\n\n` +
          `⏰ **Thời gian còn lại:** ${remainingBan} phút\n` +
          `📊 **Số lần vi phạm:** ${record.attempts}\n` +
          `🤖 **Tool spam cảnh cáo:** ${record.toolSpamWarnings} lần\n` +
          `🔍 **Pattern phát hiện:** Tool spam tự động`
        )
        .setColor("#ff0000")
        .setTimestamp();

      return {
        allowed: false,
        reason: "tool_spam_banned",
        embed,
      };
    }

    // Kiểm tra ban thường
    if (record.isBanned && record.banExpiresAt && now < record.banExpiresAt) {
      const remainingBan = Math.ceil((record.banExpiresAt - now) / 60000);
      const embed = new EmbedBuilder()
        .setTitle("🔨 Bị Tạm Khóa")
        .setDescription(
          `Bạn đã bị tạm khóa do spam lệnh \`${command}\`!\n\n` +
          `⏰ **Thời gian còn lại:** ${remainingBan} phút\n` +
          `📊 **Số lần vi phạm:** ${record.attempts}\n` +
          `⚠️ **Cảnh cáo:** ${record.warnings} lần`
        )
        .setColor("#ff0000")
        .setTimestamp();

      return {
        allowed: false,
        reason: "banned",
        embed,
      };
    }

    // Cập nhật extended attempts history
    record.extendedAttemptsHistory.push(now);

    // Tính thời gian giữa các lần thử trong extended window
    if (record.extendedAttemptsHistory.length > 1) {
      const lastAttempt = record.extendedAttemptsHistory[record.extendedAttemptsHistory.length - 2];
      const timeSinceLastExtendedAttempt = (now - lastAttempt) / 1000;
      record.extendedTimeIntervals.push(timeSinceLastExtendedAttempt);
    }

    // Kiểm tra extended spam monitoring
    const extendedSpamResult = this.checkExtendedSpam(record, now);
    if (extendedSpamResult.detected) {
      record.extendedWarnings++;
      
      // Kiểm tra có nên ban extended spam không
      if (record.extendedWarnings >= spamProtectionConfig.extendedSpamMonitoring.banThreshold) {
        record.isExtendedSpamBanned = true;
        record.extendedSpamBanExpiresAt = now + (spamProtectionConfig.extendedSpamMonitoring.banDuration * 60 * 1000);

        const embed = new EmbedBuilder()
          .setTitle("📊 Bị Tạm Khóa Extended Spam")
          .setDescription(
            spamMessages.extendedSpamBan
              .replace("{command}", command)
              .replace("{duration}", spamProtectionConfig.extendedSpamMonitoring.banDuration.toString())
          )
          .addFields({
            name: "📊 Thống Kê Extended Spam",
            value: `${record.extendedAttempts} lần trong 5 phút`,
            inline: false
          })
          .setColor("#ff0000")
          .setTimestamp();

        this.spamRecords.set(recordKey, record);
        return {
          allowed: false,
          reason: "extended_spam_banned",
          embed,
          extendedSpamDetected: true,
        };
      }

      // Cảnh cáo extended spam
      const embed = new EmbedBuilder()
        .setTitle("📊 Cảnh Cáo Extended Spam")
        .setDescription(
          spamMessages.extendedSpamWarning
            .replace("{attempts}", record.extendedAttempts.toString())
            .replace("{command}", command)
        )
        .addFields({
          name: "📊 Thống Kê Extended Spam",
          value: `${record.extendedAttempts} lần trong 5 phút`,
          inline: false
        })
        .setColor("#ffa500")
        .setTimestamp();

      this.spamRecords.set(recordKey, record);
      return {
        allowed: false,
        reason: "extended_spam_warning",
        embed,
        extendedSpamDetected: true,
      };
    }

    // Kiểm tra frequency spam trong extended window
    const frequencySpamResult = this.detectFrequencySpam(record);
    if (frequencySpamResult.detected) {
      record.frequencySpamWarnings++;
      
      // Kiểm tra có nên ban frequency spam không
      if (record.frequencySpamWarnings >= spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.patternThreshold) {
        record.isFrequencySpamBanned = true;
        record.frequencySpamBanExpiresAt = now + (spamProtectionConfig.extendedSpamMonitoring.banDuration * 60 * 1000);

        const embed = new EmbedBuilder()
          .setTitle("⏱️ Bị Tạm Khóa Frequency Spam")
          .setDescription(
            spamMessages.frequencySpamBan
              .replace("{command}", command)
              .replace("{duration}", spamProtectionConfig.extendedSpamMonitoring.banDuration.toString())
          )
          .addFields({
            name: "⏱️ Thống Kê Frequency Spam",
            value: `Pattern: ${frequencySpamResult.pattern} giây ± ${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.timeTolerance} giây trong 5 phút`,
            inline: false
          })
          .setColor("#ff0000")
          .setTimestamp();

        this.spamRecords.set(recordKey, record);
        return {
          allowed: false,
          reason: "frequency_spam_banned",
          embed,
          frequencySpamDetected: true,
          pattern: frequencySpamResult.pattern.toString(),
        };
      }

      // Cảnh cáo frequency spam
      const embed = new EmbedBuilder()
        .setTitle("⏱️ Cảnh Cáo Frequency Spam")
        .setDescription(
          spamMessages.frequencySpamWarning
        )
        .addFields({
          name: "⏱️ Thống Kê Frequency Spam",
          value: `Pattern: ${frequencySpamResult.pattern} giây ± ${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.timeTolerance} giây trong 5 phút`,
          inline: false
        })
        .setColor("#ffa500")
        .setTimestamp();

      this.spamRecords.set(recordKey, record);
      return {
        allowed: false,
        reason: "frequency_spam_warning",
        embed,
        frequencySpamDetected: true,
        pattern: frequencySpamResult.pattern.toString(),
      };
    }

    // Kiểm tra tool spam pattern
    const toolSpamResult = this.detectToolSpam(record);
    if (toolSpamResult.detected) {
      record.toolSpamWarnings++;
      
      // Kiểm tra có nên ban tool spam không
      if (record.toolSpamWarnings >= spamProtectionConfig.toolSpamDetection.patternThreshold) {
        record.isToolSpamBanned = true;
        record.toolSpamBanExpiresAt = now + (spamProtectionConfig.toolSpamDetection.banDuration * 60 * 1000);

        const embed = new EmbedBuilder()
          .setTitle("🤖 Bị Tạm Khóa Tool Spam")
          .setDescription(
            spamMessages.toolSpamBan
              .replace("{command}", command)
              .replace("{duration}", spamProtectionConfig.toolSpamDetection.banDuration.toString())
          )
          .addFields({
            name: "🔍 Pattern Phát Hiện",
            value: `Pattern: ${toolSpamResult.pattern} giây ± ${spamProtectionConfig.toolSpamDetection.timeTolerance} giây`,
            inline: false
          })
          .setColor("#ff0000")
          .setTimestamp();

        this.spamRecords.set(recordKey, record);
        return {
          allowed: false,
          reason: "tool_spam_banned",
          embed,
          toolSpamDetected: true,
          pattern: toolSpamResult.pattern.toString(),
        };
      }

      // Cảnh cáo tool spam
      const embed = new EmbedBuilder()
        .setTitle("🤖 Cảnh Cáo Tool Spam")
        .setDescription(
          spamMessages.toolSpamWarning
        )
        .addFields({
          name: "🔍 Pattern Phát Hiện",
          value: `Pattern: ${toolSpamResult.pattern} giây ± ${spamProtectionConfig.toolSpamDetection.timeTolerance} giây`,
          inline: false
        })
        .setColor("#ffa500")
        .setTimestamp();

      this.spamRecords.set(recordKey, record);
      return {
        allowed: false,
        reason: "tool_spam_warning",
        embed,
        toolSpamDetected: true,
        pattern: toolSpamResult.pattern.toString(),
      };
    }

    // Kiểm tra cooldown
    const timeSinceLastAttempt = (now - record.timestamp) / 1000;
    if (timeSinceLastAttempt < commandConfig.cooldown) {
      const remainingCooldown = Math.ceil(commandConfig.cooldown - timeSinceLastAttempt);
      const embed = new EmbedBuilder()
        .setTitle("⏰ Cooldown")
        .setDescription(
          spamMessages.cooldown
            .replace("{time}", remainingCooldown.toString())
            .replace("{command}", command)
        )
        .setColor("#ffa500")
        .setTimestamp();

      return {
        allowed: false,
        reason: "cooldown",
        cooldown: remainingCooldown,
        embed,
      };
    }

    // Kiểm tra số lần thử trong timeWindow
    const timeWindowStart = now - (commandConfig.timeWindow * 1000);
    if (record.timestamp < timeWindowStart) {
      // Reset record nếu đã qua timeWindow
      record.attempts = 1;
      record.timestamp = now;
      record.timeIntervals = [];
      this.spamRecords.set(recordKey, record);
      return { allowed: true };
    }

    // Tăng số lần thử
    record.attempts++;
    record.timestamp = now;

    // Kiểm tra vượt quá giới hạn
    if (record.attempts > commandConfig.maxAttempts) {
      record.warnings++;
      
      // Kiểm tra có nên ban không
      if (record.warnings >= spamProtectionConfig.banThreshold) {
        record.isBanned = true;
        record.banExpiresAt = now + (30 * 60 * 1000); // Ban 30 phút

        const embed = new EmbedBuilder()
          .setTitle("🔨 Bị Tạm Khóa")
          .setDescription(
            spamMessages.ban
              .replace("{command}", command)
              .replace("{duration}", "30")
          )
          .setColor("#ff0000")
          .setTimestamp();

        this.spamRecords.set(recordKey, record);
        return {
          allowed: false,
          reason: "banned",
          embed,
        };
      }

      // Cảnh cáo
      const embed = new EmbedBuilder()
        .setTitle("⚠️ Cảnh Cáo Spam")
        .setDescription(
          spamMessages.warning
            .replace("{attempts}", record.attempts.toString())
            .replace("{command}", command)
        )
        .setColor("#ffa500")
        .setTimestamp();

      this.spamRecords.set(recordKey, record);
      return {
        allowed: false,
        reason: "warning",
        embed,
      };
    }

    this.spamRecords.set(recordKey, record);
    return { allowed: true };
  }

  /**
   * Kiểm tra extended spam monitoring
   */
  private checkExtendedSpam(record: SpamRecord, now: number): {
    detected: boolean;
  } {
    if (!spamProtectionConfig.extendedSpamMonitoring.enabled) {
      return { detected: false };
    }

    const { timeWindow, maxAttempts, warningThreshold } = spamProtectionConfig.extendedSpamMonitoring;

    // Lọc các lần thử trong extended timeWindow
    const extendedWindowStart = now - (timeWindow * 1000);
    const recentAttempts = record.extendedAttemptsHistory.filter(timestamp => timestamp >= extendedWindowStart);
    
    // Cập nhật extended attempts
    record.extendedAttempts = recentAttempts.length;

    // Kiểm tra có vượt quá giới hạn không
    if (record.extendedAttempts > maxAttempts) {
      return { detected: true };
    }

    // Kiểm tra có đủ lần để cảnh cáo không
    if (record.extendedAttempts >= warningThreshold) {
      return { detected: true };
    }

    return { detected: false };
  }

  /**
   * Phát hiện frequency spam dựa trên pattern thời gian
   */
  private detectFrequencySpam(record: SpamRecord): {
    detected: boolean;
    pattern?: number;
  } {
    if (!spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.enabled) {
      return { detected: false };
    }

    const { minAttempts, timeTolerance, patternThreshold } = spamProtectionConfig.extendedSpamMonitoring.frequencyDetection;

    // Cần ít nhất minAttempts lần để phát hiện pattern
    if (record.extendedTimeIntervals.length < minAttempts) {
      return { detected: false };
    }

    // Tìm pattern phổ biến nhất
    const patterns = this.findTimePatterns(record.extendedTimeIntervals, timeTolerance);
    
    if (patterns.length === 0) {
      return { detected: false };
    }

    // Kiểm tra xem có pattern nào xuất hiện đủ số lần không
    for (const pattern of patterns) {
      if (pattern.count >= patternThreshold) {
        return {
          detected: true,
          pattern: pattern.interval,
        };
      }
    }

    return { detected: false };
  }

  /**
   * Phát hiện tool spam dựa trên pattern thời gian
   */
  private detectToolSpam(record: SpamRecord): {
    detected: boolean;
    pattern?: number;
  } {
    if (!spamProtectionConfig.toolSpamDetection.enabled) {
      return { detected: false };
    }

    const { minAttempts, timeTolerance, patternThreshold } = spamProtectionConfig.toolSpamDetection;

    // Cần ít nhất minAttempts lần để phát hiện pattern
    if (record.timeIntervals.length < minAttempts) {
      return { detected: false };
    }

    // Tìm pattern phổ biến nhất
    const patterns = this.findTimePatterns(record.timeIntervals, timeTolerance);
    
    if (patterns.length === 0) {
      return { detected: false };
    }

    // Kiểm tra xem có pattern nào xuất hiện đủ số lần không
    for (const pattern of patterns) {
      if (pattern.count >= patternThreshold) {
        return {
          detected: true,
          pattern: pattern.interval,
        };
      }
    }

    return { detected: false };
  }

  /**
   * Tìm các pattern thời gian trong danh sách intervals
   */
  private findTimePatterns(intervals: number[], tolerance: number): Array<{
    interval: number;
    count: number;
  }> {
    const patterns: Map<number, number> = new Map();

    for (const interval of intervals) {
      // Làm tròn interval theo tolerance
      const roundedInterval = Math.round(interval / tolerance) * tolerance;
      
      if (patterns.has(roundedInterval)) {
        patterns.set(roundedInterval, patterns.get(roundedInterval)! + 1);
      } else {
        patterns.set(roundedInterval, 1);
      }
    }

    // Chuyển thành array và sắp xếp theo count giảm dần
    return Array.from(patterns.entries())
      .map(([interval, count]) => ({ interval, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Lấy cấu hình cho command
   */
  private getCommandConfig(command: string) {
    for (const [key, config] of Object.entries(spamCommands)) {
      if (config.name === command || config.aliases.includes(command)) {
        return config;
      }
    }
    return null;
  }

  /**
   * Reset spam record cho user
   */
  resetSpamRecord(userId: string, guildId: string, command: string): boolean {
    const recordKey = `${userId}-${guildId}-${command}`;
    return this.spamRecords.delete(recordKey);
  }

  /**
   * Unban user
   */
  unbanUser(userId: string, guildId: string, command: string): boolean {
    const recordKey = `${userId}-${guildId}-${command}`;
    const record = this.spamRecords.get(recordKey);
    
    if (record) {
      let changed = false;
      
      if (record.isBanned) {
        record.isBanned = false;
        record.banExpiresAt = undefined;
        record.warnings = Math.max(0, record.warnings - 1);
        changed = true;
      }
      
      if (record.isToolSpamBanned) {
        record.isToolSpamBanned = false;
        record.toolSpamBanExpiresAt = undefined;
        record.toolSpamWarnings = Math.max(0, record.toolSpamWarnings - 1);
        changed = true;
      }
      
      if (record.isExtendedSpamBanned) {
        record.isExtendedSpamBanned = false;
        record.extendedSpamBanExpiresAt = undefined;
        record.extendedWarnings = Math.max(0, record.extendedWarnings - 1);
        changed = true;
      }
      
      if (record.isFrequencySpamBanned) {
        record.isFrequencySpamBanned = false;
        record.frequencySpamBanExpiresAt = undefined;
        record.frequencySpamWarnings = Math.max(0, record.frequencySpamWarnings - 1);
        changed = true;
      }
      
      if (changed) {
        this.spamRecords.set(recordKey, record);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Lấy thống kê spam cho user
   */
  getSpamStats(userId: string, guildId: string, command: string): SpamRecord | null {
    const recordKey = `${userId}-${guildId}-${command}`;
    return this.spamRecords.get(recordKey) || null;
  }

  /**
   * Lấy tất cả spam records
   */
  getAllSpamRecords(): SpamRecord[] {
    return Array.from(this.spamRecords.values());
  }

  /**
   * Lấy spam records theo guild
   */
  getSpamRecordsByGuild(guildId: string): SpamRecord[] {
    return Array.from(this.spamRecords.values()).filter(
      record => record.guildId === guildId
    );
  }

  /**
   * Lấy spam records theo user
   */
  getSpamRecordsByUser(userId: string): SpamRecord[] {
    return Array.from(this.spamRecords.values()).filter(
      record => record.userId === userId
    );
  }

  /**
   * Xóa spam records cũ (older than 24 hours)
   */
  cleanupOldRecords(): number {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [key, record] of this.spamRecords.entries()) {
      if (record.timestamp < oneDayAgo) {
        this.spamRecords.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Tạo embed thống kê spam
   */
  createSpamStatsEmbed(userId: string, guildId: string, command: string): EmbedBuilder {
    const stats = this.getSpamStats(userId, guildId, command);
    const commandConfig = this.getCommandConfig(command);

    if (!stats) {
      return new EmbedBuilder()
        .setTitle("📊 Thống Kê Spam")
        .setDescription(`Không có dữ liệu spam cho lệnh \`${command}\``)
        .setColor("#51cf66")
        .setTimestamp();
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 Thống Kê Spam")
      .setDescription(`Thống kê spam cho lệnh \`${command}\``)
      .addFields(
        {
          name: "📈 Số Lần Thử",
          value: `${stats.attempts}/${commandConfig?.maxAttempts || 'N/A'}`,
          inline: true,
        },
        {
          name: "⚠️ Cảnh Cáo",
          value: `${stats.warnings}/${spamProtectionConfig.warningThreshold}`,
          inline: true,
        },
        {
          name: "🔨 Trạng Thái",
          value: stats.isBanned ? "Bị khóa" : "Bình thường",
          inline: true,
        },
        {
          name: "⏰ Cooldown",
          value: commandConfig ? `${commandConfig.cooldown}s` : "N/A",
          inline: true,
        },
        {
          name: "🕐 Time Window",
          value: commandConfig ? `${commandConfig.timeWindow}s` : "N/A",
          inline: true,
        }
      )
      .setColor(stats.isBanned ? "#ff0000" : stats.warnings > 0 ? "#ffa500" : "#51cf66")
      .setTimestamp();

    // Thêm thông tin tool spam
    if (spamProtectionConfig.toolSpamDetection.enabled) {
      embed.addFields(
        {
          name: "🤖 Tool Spam Cảnh Cáo",
          value: `${stats.toolSpamWarnings}/${spamProtectionConfig.toolSpamDetection.patternThreshold}`,
          inline: true,
        },
        {
          name: "🤖 Tool Spam Trạng Thái",
          value: stats.isToolSpamBanned ? "Bị khóa" : "Bình thường",
          inline: true,
        }
      );

      if (stats.timeIntervals.length > 0) {
        const patterns = this.findTimePatterns(stats.timeIntervals, spamProtectionConfig.toolSpamDetection.timeTolerance);
        if (patterns.length > 0) {
          const topPattern = patterns[0];
          embed.addFields({
            name: "🔍 Pattern Phát Hiện",
            value: `${topPattern.interval}s (${topPattern.count} lần)`,
            inline: false,
          });
        }
      }
    }

    if (stats.isBanned && stats.banExpiresAt) {
      const remainingBan = Math.ceil((stats.banExpiresAt - Date.now()) / 60000);
      embed.addFields({
        name: "🔨 Thời Gian Khóa Còn Lại",
        value: `${remainingBan} phút`,
        inline: false,
      });
    }

    if (stats.isToolSpamBanned && stats.toolSpamBanExpiresAt) {
      const remainingToolSpamBan = Math.ceil((stats.toolSpamBanExpiresAt - Date.now()) / 60000);
      embed.addFields({
        name: "🤖 Thời Gian Khóa Tool Spam Còn Lại",
        value: `${remainingToolSpamBan} phút`,
        inline: false,
      });
    }

    if (stats.isExtendedSpamBanned && stats.extendedSpamBanExpiresAt) {
      const remainingExtendedBan = Math.ceil((stats.extendedSpamBanExpiresAt - Date.now()) / 60000);
      embed.addFields({
        name: "📊 Thời Gian Khóa Extended Spam Còn Lại",
        value: `${remainingExtendedBan} phút`,
        inline: false,
      });
    }

    if (stats.isFrequencySpamBanned && stats.frequencySpamBanExpiresAt) {
      const remainingFrequencyBan = Math.ceil((stats.frequencySpamBanExpiresAt - Date.now()) / 60000);
      embed.addFields({
        name: "⏱️ Thời Gian Khóa Frequency Spam Còn Lại",
        value: `${remainingFrequencyBan} phút`,
        inline: false,
      });
    }

    return embed;
  }
}