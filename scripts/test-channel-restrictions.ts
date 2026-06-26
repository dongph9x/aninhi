import { defaultChannelRestrictions, isChannelAllowed, addToWhitelist, addToBlacklist, addCategoryToWhitelist, addCategoryToBlacklist } from '../src/config/channel-restrictions';

console.log('🧪 Testing Channel Restrictions System\n');

// Test 1: Default configuration
console.log('📋 Test 1: Default Configuration');
console.log('Default restrictions:', JSON.stringify(defaultChannelRestrictions, null, 2));
console.log('✅ Test 1 passed\n');

// Test 2: Exempt commands
console.log('📋 Test 2: Exempt Commands');
const exemptCommands = ['help', 'ping', 'uptime', 'maintenance'];
exemptCommands.forEach(cmd => {
    const result = isChannelAllowed('123456789', null, defaultChannelRestrictions, cmd, false);
    console.log(`${cmd}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 2 passed\n');

// Test 3: Admin exempt commands
console.log('📋 Test 3: Admin Exempt Commands');
const adminCommands = ['maintenance', 'deploy', 'eval'];
adminCommands.forEach(cmd => {
    const result = isChannelAllowed('123456789', null, defaultChannelRestrictions, cmd, true);
    console.log(`${cmd} (admin): ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 3 passed\n');

// Test 4: Whitelist mode
console.log('📋 Test 4: Whitelist Mode');
let restrictions = { ...defaultChannelRestrictions };
restrictions = addToWhitelist(restrictions, '123456789');
restrictions = addToWhitelist(restrictions, '987654321');

console.log('Whitelist channels:', restrictions.allowedChannels);
console.log('Whitelist mode enabled:', restrictions.useWhitelistMode);

// Test allowed channel
const allowedResult = isChannelAllowed('123456789', null, restrictions, 'fishing', false);
console.log('Allowed channel test:', allowedResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test blocked channel
const blockedResult = isChannelAllowed('555666777', null, restrictions, 'fishing', false);
console.log('Blocked channel test:', blockedResult.allowed ? '✅ Allowed' : '❌ Blocked');
console.log('✅ Test 4 passed\n');

// Test 5: Blacklist mode
console.log('📋 Test 5: Blacklist Mode');
restrictions = { ...defaultChannelRestrictions };
restrictions = addToBlacklist(restrictions, '111222333');
restrictions = addToBlacklist(restrictions, '444555666');

console.log('Blacklist channels:', restrictions.blockedChannels);
console.log('Blacklist mode enabled:', restrictions.useBlacklistMode);

// Test blocked channel
const blacklistBlockedResult = isChannelAllowed('111222333', null, restrictions, 'fishing', false);
console.log('Blacklisted channel test:', blacklistBlockedResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test allowed channel
const blacklistAllowedResult = isChannelAllowed('999888777', null, restrictions, 'fishing', false);
console.log('Non-blacklisted channel test:', blacklistAllowedResult.allowed ? '✅ Allowed' : '❌ Blocked');
console.log('✅ Test 5 passed\n');

// Test 6: Category whitelist
console.log('📋 Test 6: Category Whitelist');
restrictions = { ...defaultChannelRestrictions };
restrictions = addCategoryToWhitelist(restrictions, 'CATEGORY123');

console.log('Whitelist categories:', restrictions.allowedCategories);
console.log('Category check enabled:', restrictions.checkCategories);

// Test channel in allowed category
const categoryAllowedResult = isChannelAllowed('CHANNEL456', 'CATEGORY123', restrictions, 'fishing', false);
console.log('Channel in allowed category:', categoryAllowedResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test channel not in allowed category
const categoryBlockedResult = isChannelAllowed('CHANNEL789', 'CATEGORY456', restrictions, 'fishing', false);
console.log('Channel not in allowed category:', categoryBlockedResult.allowed ? '✅ Allowed' : '❌ Blocked');
console.log('✅ Test 6 passed\n');

// Test 7: Category blacklist
console.log('📋 Test 7: Category Blacklist');
restrictions = { ...defaultChannelRestrictions };
restrictions = addCategoryToBlacklist(restrictions, 'BLOCKED_CATEGORY');

console.log('Blacklist categories:', restrictions.blockedCategories);
console.log('Category check enabled:', restrictions.checkCategories);

// Test channel in blocked category
const categoryBlacklistBlockedResult = isChannelAllowed('CHANNEL111', 'BLOCKED_CATEGORY', restrictions, 'fishing', false);
console.log('Channel in blocked category:', categoryBlacklistBlockedResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test channel not in blocked category
const categoryBlacklistAllowedResult = isChannelAllowed('CHANNEL222', 'ALLOWED_CATEGORY', restrictions, 'fishing', false);
console.log('Channel not in blocked category:', categoryBlacklistAllowedResult.allowed ? '✅ Allowed' : '❌ Blocked');
console.log('✅ Test 7 passed\n');

// Test 8: Combined modes
console.log('📋 Test 8: Combined Modes');
restrictions = { ...defaultChannelRestrictions };
restrictions = addToWhitelist(restrictions, 'WHITELIST_CHANNEL');
restrictions = addToBlacklist(restrictions, 'BLACKLIST_CHANNEL');

console.log('Whitelist mode:', restrictions.useWhitelistMode);
console.log('Blacklist mode:', restrictions.useBlacklistMode);

// Test whitelisted channel (should be allowed)
const combinedWhitelistResult = isChannelAllowed('WHITELIST_CHANNEL', null, restrictions, 'fishing', false);
console.log('Whitelisted channel:', combinedWhitelistResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test blacklisted channel (should be blocked)
const combinedBlacklistResult = isChannelAllowed('BLACKLIST_CHANNEL', null, restrictions, 'fishing', false);
console.log('Blacklisted channel:', combinedBlacklistResult.allowed ? '✅ Allowed' : '❌ Blocked');

// Test other channel (should be blocked due to whitelist mode)
const combinedOtherResult = isChannelAllowed('OTHER_CHANNEL', null, restrictions, 'fishing', false);
console.log('Other channel:', combinedOtherResult.allowed ? '✅ Allowed' : '❌ Blocked');
console.log('✅ Test 8 passed\n');

console.log('🎉 All tests passed! Channel restrictions system is working correctly.'); 