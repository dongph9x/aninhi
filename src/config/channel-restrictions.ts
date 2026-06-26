export interface ChannelRestrictions {
  // Danh sách channel IDs được phép sử dụng bot (whitelist)
  allowedChannels: string[];
  
  // Danh sách channel IDs bị cấm sử dụng bot (blacklist)
  blockedChannels: string[];
  
  // Danh sách category IDs được phép sử dụng bot
  allowedCategories: string[];
  
  // Danh sách category IDs bị cấm sử dụng bot
  blockedCategories: string[];
  
  // Có sử dụng whitelist mode không (true = chỉ cho phép channels trong allowedChannels)
  useWhitelistMode: boolean;
  
  // Có sử dụng blacklist mode không (true = cấm channels trong blockedChannels)
  useBlacklistMode: boolean;
  
  // Có kiểm tra category không
  checkCategories: boolean;
  
  // Các lệnh được miễn kiểm tra channel (luôn hoạt động)
  exemptCommands: string[];
  
  // Các lệnh admin được miễn kiểm tra channel
  exemptAdminCommands: string[];
}

// Danh sách các lệnh liên quan đến channel restrictions
const CHANNEL_RESTRICTION_COMMANDS = [
  'channelrestrictions',
  'chrestrict', 
  'chrest',
  'restrictch'
];

export const defaultChannelRestrictions: ChannelRestrictions = {
  allowedChannels: [],
  blockedChannels: [],
  allowedCategories: [],
  blockedCategories: [],
  useWhitelistMode: true, // Bật whitelist mode mặc định - chỉ cho phép channels được chỉ định
  useBlacklistMode: false,
  checkCategories: false,
  exemptCommands: [
    'help',
    'ping',
    'uptime',
    'maintenance',
    ...CHANNEL_RESTRICTION_COMMANDS // Thêm tất cả lệnh channel restrictions vào exempt
  ],
  exemptAdminCommands: [
    'maintenance',
    'deploy',
    'undeploy',
    'eval',
    'backupdb',
    'restoredb',
    'syncdb',
    'dbstatus',
    'refreshdb',
    'listbackups',
    ...CHANNEL_RESTRICTION_COMMANDS // Thêm tất cả lệnh channel restrictions vào admin exempt
  ]
};

// Hàm kiểm tra xem channel có được phép sử dụng bot không
export function isChannelAllowed(
  channelId: string,
  categoryId: string | null,
  restrictions: ChannelRestrictions,
  commandName: string,
  isAdmin: boolean = false
): { allowed: boolean; reason?: string } {
  // Kiểm tra lệnh được miễn
  if (restrictions.exemptCommands.includes(commandName)) {
    return { allowed: true };
  }
  
  // Kiểm tra lệnh admin được miễn
  if (isAdmin && restrictions.exemptAdminCommands.includes(commandName)) {
    return { allowed: true };
  }
  
  // Kiểm tra whitelist mode
  if (restrictions.useWhitelistMode) {
    const isInAllowedChannels = restrictions.allowedChannels.includes(channelId);
    const isInAllowedCategories = restrictions.checkCategories && categoryId && restrictions.allowedCategories.includes(categoryId);
    
    if (!isInAllowedChannels && !isInAllowedCategories) {
      return { 
        allowed: false, 
        reason: `Lệnh này chỉ có thể sử dụng trong các kênh được phép.` 
      };
    }
  }
  
  // Kiểm tra blacklist mode
  if (restrictions.useBlacklistMode) {
    const isInBlockedChannels = restrictions.blockedChannels.includes(channelId);
    const isInBlockedCategories = restrictions.checkCategories && categoryId && restrictions.blockedCategories.includes(categoryId);
    
    if (isInBlockedChannels || isInBlockedCategories) {
      return { 
        allowed: false, 
        reason: `Lệnh này không thể sử dụng trong kênh này.` 
      };
    }
  }
  
  return { allowed: true };
}

// Hàm thêm channel vào whitelist
export function addToWhitelist(
  restrictions: ChannelRestrictions,
  channelId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    allowedChannels: [...new Set([...restrictions.allowedChannels, channelId])],
    useWhitelistMode: true
  };
}

// Hàm xóa channel khỏi whitelist
export function removeFromWhitelist(
  restrictions: ChannelRestrictions,
  channelId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    allowedChannels: restrictions.allowedChannels.filter(id => id !== channelId)
  };
}

// Hàm thêm channel vào blacklist
export function addToBlacklist(
  restrictions: ChannelRestrictions,
  channelId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    blockedChannels: [...new Set([...restrictions.blockedChannels, channelId])],
    useBlacklistMode: true
  };
}

// Hàm xóa channel khỏi blacklist
export function removeFromBlacklist(
  restrictions: ChannelRestrictions,
  channelId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    blockedChannels: restrictions.blockedChannels.filter(id => id !== channelId)
  };
}

// Hàm thêm category vào whitelist
export function addCategoryToWhitelist(
  restrictions: ChannelRestrictions,
  categoryId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    allowedCategories: [...new Set([...restrictions.allowedCategories, categoryId])],
    checkCategories: true,
    useWhitelistMode: true
  };
}

// Hàm xóa category khỏi whitelist
export function removeCategoryFromWhitelist(
  restrictions: ChannelRestrictions,
  categoryId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    allowedCategories: restrictions.allowedCategories.filter(id => id !== categoryId)
  };
}

// Hàm thêm category vào blacklist
export function addCategoryToBlacklist(
  restrictions: ChannelRestrictions,
  categoryId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    blockedCategories: [...new Set([...restrictions.blockedCategories, categoryId])],
    checkCategories: true,
    useBlacklistMode: true
  };
}

// Hàm xóa category khỏi blacklist
export function removeCategoryFromBlacklist(
  restrictions: ChannelRestrictions,
  categoryId: string
): ChannelRestrictions {
  return {
    ...restrictions,
    blockedCategories: restrictions.blockedCategories.filter(id => id !== categoryId)
  };
} 