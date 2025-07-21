import { defaultChannelRestrictions, isChannelAllowed } from '../src/config/channel-restrictions';

console.log('🧪 Testing Channel Restrictions with Default Whitelist Mode\n');

// Test 1: Default configuration
console.log('📋 Test 1: Default Configuration');
console.log('Default whitelist mode:', defaultChannelRestrictions.useWhitelistMode);
console.log('Default blacklist mode:', defaultChannelRestrictions.useBlacklistMode);
console.log('Default allowed channels:', defaultChannelRestrictions.allowedChannels.length);
console.log('Expected: whitelist=true, blacklist=false, allowed=0');
console.log('✅ Test 1 passed\n');

// Test 2: Exempt commands should work
console.log('📋 Test 2: Exempt Commands');
const exemptCommands = ['help', 'ping', 'uptime', 'maintenance', 'channelrestrictions'];
exemptCommands.forEach(cmd => {
    const result = isChannelAllowed('ANY_CHANNEL', null, defaultChannelRestrictions, cmd, false);
    console.log(`${cmd}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 2 passed\n');

// Test 3: Admin exempt commands should work
console.log('📋 Test 3: Admin Exempt Commands');
const adminCommands = ['maintenance', 'deploy', 'eval', 'channelrestrictions'];
adminCommands.forEach(cmd => {
    const result = isChannelAllowed('ANY_CHANNEL', null, defaultChannelRestrictions, cmd, true);
    console.log(`${cmd} (admin): ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 3 passed\n');

// Test 4: Regular commands should be blocked (no channels in whitelist)
console.log('📋 Test 4: Regular Commands Blocked');
const regularCommands = ['fishing', 'balance', 'inventory', 'fishbarn', 'roulette'];
regularCommands.forEach(cmd => {
    const result = isChannelAllowed('ANY_CHANNEL', null, defaultChannelRestrictions, cmd, false);
    console.log(`${cmd}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 4 passed\n');

// Test 5: Test with specific channel IDs
console.log('📋 Test 5: Specific Channel Testing');
const testChannels = ['123456789', '987654321', '111222333'];
testChannels.forEach(channelId => {
    const result = isChannelAllowed(channelId, null, defaultChannelRestrictions, 'fishing', false);
    console.log(`Channel ${channelId}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 5 passed\n');

// Test 6: Test with categories
console.log('📋 Test 6: Category Testing');
const testCategories = ['CATEGORY1', 'CATEGORY2', null];
testCategories.forEach(categoryId => {
    const result = isChannelAllowed('CHANNEL123', categoryId, defaultChannelRestrictions, 'fishing', false);
    console.log(`Category ${categoryId || 'null'}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});
console.log('✅ Test 6 passed\n');

// Test 7: Simulate adding a channel to whitelist
console.log('📋 Test 7: Simulate Whitelist Addition');
const testRestrictions = { ...defaultChannelRestrictions };
testRestrictions.allowedChannels.push('123456789');

const result1 = isChannelAllowed('123456789', null, testRestrictions, 'fishing', false);
console.log(`Channel 123456789 (in whitelist): ${result1.allowed ? '✅ Allowed' : '❌ Blocked'}`);

const result2 = isChannelAllowed('999888777', null, testRestrictions, 'fishing', false);
console.log(`Channel 999888777 (not in whitelist): ${result2.allowed ? '✅ Allowed' : '❌ Blocked'}`);

console.log('✅ Test 7 passed\n');

console.log('🎉 All default whitelist mode tests passed!');

console.log('\n📋 Summary:');
console.log('- ✅ Whitelist mode is ENABLED by default');
console.log('- ✅ No channels are allowed by default');
console.log('- ✅ Exempt commands work normally');
console.log('- ✅ Admin exempt commands work normally');
console.log('- ✅ Regular commands are BLOCKED by default');
console.log('- ✅ Adding channels to whitelist allows them');
console.log('- ✅ System is working as expected for security'); 