import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { SpamProtectionService } from "@/utils/spam-protection";
import { spamProtectionConfig } from "@/config/spam-protection";

export default Bot.createCommand({
    structure: {
        name: "toolspam",
        aliases: ["toolspamstats", "spamdetection", "phát hiện spam"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        try {
            const spamService = SpamProtectionService.getInstance();
            const guildId = message.guildId!;

            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null) ||
                message.author; // Mặc định xem thống kê của chính mình

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.\n" +
                        "Hoặc sử dụng `n.toolspam` để xem thống kê của chính mình.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse command (optional)
            const command = args[1]?.toLowerCase() || "fishing";

            // Lấy thống kê spam
            const stats = spamService.getSpamStats(targetUser.id, guildId, command);

            if (!stats) {
                const embed = new EmbedBuilder()
                    .setTitle("📊 Thống Kê Tool Spam")
                    .setDescription(`Không có dữ liệu spam cho lệnh \`${command}\``)
                    .setColor("#51cf66")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle("🤖 Thống Kê Tool Spam")
                .setDescription(`Phân tích tool spam cho lệnh \`${command}\``)
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setColor("#ffa500")
                .setTimestamp();

            // Thông tin cơ bản
            embed.addFields(
                {
                    name: "👤 Người Dùng",
                    value: `<@${targetUser.id}>`,
                    inline: true,
                },
                {
                    name: "🎯 Lệnh",
                    value: `\`${command}\``,
                    inline: true,
                },
                {
                    name: "📊 Tổng Lần Thử",
                    value: `${stats.attempts}`,
                    inline: true,
                }
            );

            // Thông tin tool spam
            if (spamProtectionConfig.toolSpamDetection.enabled) {
              embed.addFields(
                {
                  name: "🤖 Tool Spam Cảnh Cáo",
                  value: `${stats.toolSpamWarnings}/${spamProtectionConfig.toolSpamDetection.patternThreshold}`,
                  inline: true,
                },
                {
                  name: "🤖 Tool Spam Trạng Thái",
                  value: stats.isToolSpamBanned ? "🔴 Bị khóa" : "🟢 Bình thường",
                  inline: true,
                },
                {
                  name: "🔍 Pattern Threshold",
                  value: `${spamProtectionConfig.toolSpamDetection.patternThreshold} lần`,
                  inline: true,
                }
              );

              // Phân tích time intervals
              if (stats.timeIntervals.length > 0) {
                const intervals = stats.timeIntervals;
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const minInterval = Math.min(...intervals);
                const maxInterval = Math.max(...intervals);

                embed.addFields(
                  {
                    name: "⏱️ Thời Gian Giữa Các Lần",
                    value: `${intervals.length} lần đo`,
                    inline: false,
                  },
                  {
                    name: "📊 Thống Kê Thời Gian",
                    value: 
                      `**Trung bình:** ${avgInterval.toFixed(1)}s\n` +
                      `**Min:** ${minInterval.toFixed(1)}s\n` +
                      `**Max:** ${maxInterval.toFixed(1)}s`,
                    inline: true,
                  }
                );

                // Tìm patterns
                const patterns = spamService['findTimePatterns'](intervals, spamProtectionConfig.toolSpamDetection.timeTolerance);
                
                if (patterns.length > 0) {
                  let patternText = "";
                  for (let i = 0; i < Math.min(3, patterns.length); i++) {
                    const pattern = patterns[i];
                    patternText += `**${pattern.interval}s:** ${pattern.count} lần\n`;
                  }
                  
                  embed.addFields({
                    name: "🔍 Patterns Phát Hiện",
                    value: patternText,
                    inline: true,
                  });

                  // Đánh giá mức độ tool spam
                  const topPattern = patterns[0];
                  const isToolSpam = topPattern.count >= spamProtectionConfig.toolSpamDetection.patternThreshold;
                  
                  embed.addFields({
                    name: "🎯 Đánh Giá Tool Spam",
                    value: isToolSpam ? "🔴 **CÓ THỂ LÀ TOOL SPAM**" : "🟡 **CẦN THEO DÕI THÊM**",
                    inline: false,
                  });
                }

                // Hiển thị chi tiết từng interval
                if (intervals.length <= 10) {
                  let intervalText = "";
                  intervals.forEach((interval, index) => {
                    intervalText += `${index + 1}. ${interval.toFixed(1)}s\n`;
                  });
                  
                  embed.addFields({
                    name: "📋 Chi Tiết Thời Gian",
                    value: intervalText,
                    inline: false,
                  });
                }
              }

              // Thông tin ban tool spam
              if (stats.isToolSpamBanned && stats.toolSpamBanExpiresAt) {
                const remainingBan = Math.ceil((stats.toolSpamBanExpiresAt - Date.now()) / 60000);
                embed.addFields({
                  name: "🔨 Thời Gian Khóa Tool Spam Còn Lại",
                  value: `${remainingBan} phút`,
                  inline: false,
                });
              }
            }

            // Thông tin extended spam monitoring
            if (spamProtectionConfig.extendedSpamMonitoring.enabled) {
              embed.addFields(
                {
                  name: "📊 Extended Spam Cảnh Cáo",
                  value: `${stats.extendedWarnings}/${spamProtectionConfig.extendedSpamMonitoring.banThreshold}`,
                  inline: true,
                },
                {
                  name: "📊 Extended Spam Trạng Thái",
                  value: stats.isExtendedSpamBanned ? "🔴 Bị khóa" : "🟢 Bình thường",
                  inline: true,
                },
                {
                  name: "📊 Số Lần Trong 5 Phút",
                  value: `${stats.extendedAttempts}/${spamProtectionConfig.extendedSpamMonitoring.maxAttempts}`,
                  inline: true,
                }
              );

              // Phân tích extended attempts history
              if (stats.extendedAttemptsHistory && stats.extendedAttemptsHistory.length > 0) {
                const recentAttempts = stats.extendedAttemptsHistory.slice(-10); // Lấy 10 lần gần nhất
                const now = Date.now();
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                
                const attemptsInLast5Min = recentAttempts.filter(timestamp => timestamp >= fiveMinutesAgo);
                const avgTimeBetweenAttempts = attemptsInLast5Min.length > 1 
                  ? (attemptsInLast5Min[attemptsInLast5Min.length - 1] - attemptsInLast5Min[0]) / (attemptsInLast5Min.length - 1) / 1000
                  : 0;

                embed.addFields(
                  {
                    name: "📊 Thống Kê Extended Spam",
                    value: 
                      `**Lần thử trong 5 phút:** ${attemptsInLast5Min.length}\n` +
                      `**Thời gian trung bình giữa các lần:** ${avgTimeBetweenAttempts.toFixed(1)}s\n` +
                      `**Tổng lần thử:** ${stats.extendedAttemptsHistory.length}`,
                    inline: true,
                  }
                );

                // Hiển thị timeline gần đây
                if (attemptsInLast5Min.length > 0) {
                  let timelineText = "";
                  attemptsInLast5Min.slice(-5).forEach((timestamp, index) => {
                    const timeAgo = Math.floor((now - timestamp) / 1000);
                    timelineText += `${index + 1}. ${timeAgo}s trước\n`;
                  });
                  
                  embed.addFields({
                    name: "⏰ Timeline Gần Đây",
                    value: timelineText,
                    inline: false,
                  });
                }
              }

              // Thông tin ban extended spam
              if (stats.isExtendedSpamBanned && stats.extendedSpamBanExpiresAt) {
                const remainingBan = Math.ceil((stats.extendedSpamBanExpiresAt - Date.now()) / 60000);
                embed.addFields({
                  name: "🔨 Thời Gian Khóa Extended Spam Còn Lại",
                  value: `${remainingBan} phút`,
                  inline: false,
                });
              }

              // Thông tin frequency spam detection
              if (spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.enabled) {
                embed.addFields(
                  {
                    name: "⏱️ Frequency Spam Cảnh Cáo",
                    value: `${stats.frequencySpamWarnings}/${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.patternThreshold}`,
                    inline: true,
                  },
                  {
                    name: "⏱️ Frequency Spam Trạng Thái",
                    value: stats.isFrequencySpamBanned ? "🔴 Bị khóa" : "🟢 Bình thường",
                    inline: true,
                  },
                  {
                    name: "⏱️ Time Tolerance",
                    value: `±${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.timeTolerance}s`,
                    inline: true,
                  }
                );

                // Phân tích frequency patterns
                if (stats.extendedTimeIntervals && stats.extendedTimeIntervals.length > 0) {
                  const intervals = stats.extendedTimeIntervals;
                  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                  const minInterval = Math.min(...intervals);
                  const maxInterval = Math.max(...intervals);

                  embed.addFields(
                    {
                      name: "⏱️ Thời Gian Giữa Các Lần (5 Phút)",
                      value: `${intervals.length} lần đo`,
                      inline: false,
                    },
                    {
                      name: "📊 Thống Kê Thời Gian (5 Phút)",
                      value: 
                        `**Trung bình:** ${avgInterval.toFixed(1)}s\n` +
                        `**Min:** ${minInterval.toFixed(1)}s\n` +
                        `**Max:** ${maxInterval.toFixed(1)}s`,
                      inline: true,
                    }
                  );

                  // Tìm frequency patterns
                  const patterns = spamService['findTimePatterns'](intervals, spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.timeTolerance);
                  
                  if (patterns.length > 0) {
                    let patternText = "";
                    for (let i = 0; i < Math.min(3, patterns.length); i++) {
                      const pattern = patterns[i];
                      patternText += `**${pattern.interval}s:** ${pattern.count} lần\n`;
                    }
                    
                    embed.addFields({
                      name: "🔍 Frequency Patterns Phát Hiện",
                      value: patternText,
                      inline: true,
                    });

                    // Đánh giá mức độ frequency spam
                    const topPattern = patterns[0];
                    const isFrequencySpam = topPattern.count >= spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.patternThreshold;
                    
                    embed.addFields({
                      name: "🎯 Đánh Giá Frequency Spam",
                      value: isFrequencySpam ? "🔴 **CÓ THỂ LÀ FREQUENCY SPAM**" : "🟡 **CẦN THEO DÕI THÊM**",
                      inline: false,
                    });
                  }

                  // Hiển thị chi tiết từng interval trong 5 phút
                  if (intervals.length <= 10) {
                    let intervalText = "";
                    intervals.forEach((interval, index) => {
                      intervalText += `${index + 1}. ${interval.toFixed(1)}s\n`;
                    });
                    
                    embed.addFields({
                      name: "📋 Chi Tiết Thời Gian (5 Phút)",
                      value: intervalText,
                      inline: false,
                    });
                  }
                }

                // Thông tin ban frequency spam
                if (stats.isFrequencySpamBanned && stats.frequencySpamBanExpiresAt) {
                  const remainingBan = Math.ceil((stats.frequencySpamBanExpiresAt - Date.now()) / 60000);
                  embed.addFields({
                    name: "🔨 Thời Gian Khóa Frequency Spam Còn Lại",
                    value: `${remainingBan} phút`,
                    inline: false,
                  });
                }
              }
            }

            // Thông tin cấu hình tool spam detection
            embed.addFields({
                name: "⚙️ Cấu Hình Tool Spam Detection",
                value: 
                    `**Min Attempts:** ${spamProtectionConfig.toolSpamDetection.minAttempts} lần\n` +
                    `**Time Tolerance:** ±${spamProtectionConfig.toolSpamDetection.timeTolerance}s\n` +
                    `**Pattern Threshold:** ${spamProtectionConfig.toolSpamDetection.patternThreshold} lần\n` +
                    `**Ban Duration:** ${spamProtectionConfig.toolSpamDetection.banDuration} phút`,
                inline: false,
            });

            // Thông tin cấu hình extended spam monitoring
            if (spamProtectionConfig.extendedSpamMonitoring.enabled) {
              embed.addFields({
                name: "⚙️ Cấu Hình Extended Spam Monitoring",
                value: 
                  `**Time Window:** ${spamProtectionConfig.extendedSpamMonitoring.timeWindow}s (5 phút)\n` +
                  `**Max Attempts:** ${spamProtectionConfig.extendedSpamMonitoring.maxAttempts} lần\n` +
                  `**Warning Threshold:** ${spamProtectionConfig.extendedSpamMonitoring.warningThreshold} lần\n` +
                  `**Ban Threshold:** ${spamProtectionConfig.extendedSpamMonitoring.banThreshold} lần\n` +
                  `**Ban Duration:** ${spamProtectionConfig.extendedSpamMonitoring.banDuration} phút`,
                inline: false,
              });

              // Thông tin cấu hình frequency detection
              if (spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.enabled) {
                embed.addFields({
                  name: "⚙️ Cấu Hình Frequency Detection",
                  value: 
                    `**Min Attempts:** ${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.minAttempts} lần\n` +
                    `**Time Tolerance:** ±${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.timeTolerance}s\n` +
                    `**Pattern Threshold:** ${spamProtectionConfig.extendedSpamMonitoring.frequencyDetection.patternThreshold} lần\n` +
                    `**Ban Duration:** ${spamProtectionConfig.extendedSpamMonitoring.banDuration} phút`,
                  inline: false,
                });
              }
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in toolspam command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Thống Kê Tool Spam")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy thống kê tool spam. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});