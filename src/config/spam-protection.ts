import { SeasonalFishingService } from '@/utils/seasonal-fishing';

export interface SpamProtectionConfig {
  enabled: boolean;
  cooldown: number; // Thời gian chờ giữa các lần câu cá (giây)
  maxAttempts: number; // Số lần tối đa trong khoảng thời gian
  timeWindow: number; // Khoảng thời gian tính spam (giây)
  warningThreshold: number; // Số lần vi phạm trước khi cảnh cáo
  banThreshold: number; // Số lần vi phạm trước khi ban
  // Tool spam detection
  toolSpamDetection: {
    enabled: boolean;
    minAttempts: number; // Số lần tối thiểu để phát hiện tool spam
    timeTolerance: number; // Độ sai số cho phép (giây)
    patternThreshold: number; // Số lần pattern giống nhau để coi là tool spam
    banDuration: number; // Thời gian ban cho tool spam (phút)
  };
  // Extended spam monitoring
  extendedSpamMonitoring: {
    enabled: boolean;
    timeWindow: number; // Khoảng thời gian theo dõi (giây) - 5 phút = 300s
    maxAttempts: number; // Số lần tối đa trong timeWindow - 20 lần
    warningThreshold: number; // Số lần vi phạm trước khi cảnh cáo
    banThreshold: number; // Số lần vi phạm trước khi ban
    banDuration: number; // Thời gian ban (phút)
    // Kết hợp tool spam detection
    frequencyDetection: {
      enabled: boolean;
      minAttempts: number; // Số lần tối thiểu để phát hiện frequency spam
      timeTolerance: number; // Độ sai số cho phép (giây) - 2s
      patternThreshold: number; // Số lần pattern giống nhau để coi là frequency spam
    };
  };
}

export interface SpamRecord {
  userId: string;
  guildId: string;
  command: string;
  timestamp: number;
  attempts: number;
  warnings: number;
  isBanned: boolean;
  banExpiresAt?: number;
  // Tool spam detection
  timeIntervals: number[]; // Thời gian giữa các lần thử
  toolSpamWarnings: number; // Số lần cảnh cáo tool spam
  isToolSpamBanned: boolean; // Bị ban do tool spam
  toolSpamBanExpiresAt?: number; // Thời gian hết hạn ban tool spam
  // Extended spam monitoring
  extendedAttempts: number; // Số lần thử trong extended timeWindow
  extendedWarnings: number; // Số lần cảnh cáo extended spam
  isExtendedSpamBanned: boolean; // Bị ban do extended spam
  extendedSpamBanExpiresAt?: number; // Thời gian hết hạn ban extended spam
  extendedAttemptsHistory: number[]; // Lịch sử các lần thử trong extended window
  // Frequency detection trong extended spam
  extendedTimeIntervals: number[]; // Thời gian giữa các lần thử trong extended window
  frequencySpamWarnings: number; // Số lần cảnh cáo frequency spam
  isFrequencySpamBanned: boolean; // Bị ban do frequency spam
  frequencySpamBanExpiresAt?: number; // Thời gian hết hạn ban frequency spam
}

export const spamProtectionConfig: SpamProtectionConfig = {
  enabled: true,
  cooldown: 10, // 30 giây giữa các lần câu cá
  maxAttempts: 5, // Tối đa 5 lần trong timeWindow
  timeWindow: 180, // 5 phút
  warningThreshold: 4, // Cảnh cáo sau 3 lần vi phạm
  banThreshold: 5, // Ban sau 5 lần vi phạm
  toolSpamDetection: {
    enabled: true,
    minAttempts: 5, // Cần ít nhất 5 lần để phát hiện
    timeTolerance: 2, // Độ sai số 2 giây
    patternThreshold: 2, // 2 lần pattern giống nhau = tool spam
    banDuration: 1, // Ban 1 phút cho tool spam
  },
  extendedSpamMonitoring: {
    enabled: true,
    timeWindow: 180, // 5 phút = 300 giây
    maxAttempts: 20, // Tối đa 20 lần trong 5 phút
    warningThreshold: 15, // Cảnh cáo sau 15 lần vi phạm
    banThreshold: 20, // Ban sau 20 lần vi phạm
    banDuration: 1, // Ban 1 phút cho extended spam
    frequencyDetection: {
      enabled: true,
      minAttempts: 5, // Cần ít nhất 5 lần để phát hiện
      timeTolerance: 2, // Độ sai số 2 giây
      patternThreshold: 2, // 2 lần pattern giống nhau = frequency spam
    },
  },
};

export const spamCommands = {
  fishing: {
    name: 'fishing',
    aliases: ['fish', 'câu', 'cá'],
    get cooldown() {
      return SeasonalFishingService.getSeasonalCooldown();
    },
    maxAttempts: 5,
    timeWindow: 300,
  }
};

export const spamMessages = {
  cooldown: "⏰ **Cooldown!** Bạn cần chờ {time} giây nữa mới có thể {command}.",
  warning: "⚠️ **Cảnh cáo spam!** Bạn đã {attempts} lần {command} quá nhanh. Lần vi phạm tiếp theo sẽ bị tạm khóa.",
  ban: "🔨 **Bị tạm khóa!** Bạn đã spam {command} quá nhiều lần. Tài khoản bị tạm khóa trong {duration} phút.",
  unbanned: "✅ **Đã mở khóa!** Bạn có thể sử dụng {command} bình thường.",
  stats: "📊 **Thống kê spam:** {attempts} lần trong {timeWindow} giây",
  // Tool spam messages
  toolSpamWarning: "🤖 **Cảnh cáo Tool Spam!** Phát hiện pattern spam tự động. Lần vi phạm tiếp theo sẽ bị tạm khóa.",
  toolSpamBan: "🔨 **Bị tạm khóa Tool Spam!** Phát hiện sử dụng tool spam tự động. Tài khoản bị tạm khóa trong {duration} phút.",
  toolSpamDetected: "🤖 **Tool Spam Detected!** Pattern: {pattern} giây ± {tolerance} giây",
  // Extended spam messages
  extendedSpamWarning: "📊 **Cảnh cáo Extended Spam!** Bạn đã {attempts} lần {command} trong 1 phút. Lần vi phạm tiếp theo sẽ bị tạm khóa.",
  extendedSpamBan: "🔨 **Bị tạm khóa Extended Spam!** Bạn đã spam {command} quá nhiều lần trong 1 phút. Tài khoản bị tạm khóa trong {duration} phút.",
  extendedSpamDetected: "📊 **Extended Spam Detected!** {attempts} lần trong 5 phút",
  // Frequency spam messages
  frequencySpamWarning: "⏱️ **Cảnh cáo Frequency Spam!** Phát hiện tần suất spam tự động trong 1 phút. Lần vi phạm tiếp theo sẽ bị tạm khóa.",
  frequencySpamBan: "🔨 **Bị tạm khóa Frequency Spam!** Phát hiện tần suất spam tự động trong 1 phút. Tài khoản bị tạm khóa trong {duration} phút.",
  frequencySpamDetected: "⏱️ **Frequency Spam Detected!** Pattern: {pattern} giây ± {tolerance} giây trong 5 phút",
};