import { defaultChannelRestrictions, isChannelAllowed } from '../src/config/channel-restrictions';

console.log('🔍 Debug Channel Restrictions Command\n');

// Test 1: Check exempt commands
console.log('📋 Test 1: Exempt Commands Check');
console.log('Exempt commands:', defaultChannelRestrictions.exemptCommands);
console.log('Admin exempt commands:', defaultChannelRestrictions.exemptAdminCommands);

const testCommandNames = [
    'channelrestrictions',
    'chrestrict', 
    'chrest',
    'restrictch',
    'add',
    'remove',
    'show',
    'mode',
    'backup',
    'restore'
];

console.log('\n📋 Test 2: Command Name Testing');
testCommandNames.forEach(cmd => {
    const result = isChannelAllowed('ANY_CHANNEL', null, defaultChannelRestrictions, cmd, false);
    console.log(`${cmd}: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});

console.log('\n📋 Test 3: Admin Command Testing');
testCommandNames.forEach(cmd => {
    const result = isChannelAllowed('ANY_CHANNEL', null, defaultChannelRestrictions, cmd, true);
    console.log(`${cmd} (admin): ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
});

console.log('\n📋 Test 4: Whitelist Mode Status');
console.log('Whitelist mode:', defaultChannelRestrictions.useWhitelistMode);
console.log('Blacklist mode:', defaultChannelRestrictions.useBlacklistMode);
console.log('Allowed channels:', defaultChannelRestrictions.allowedChannels.length);

console.log('\n🔍 Analysis:');
console.log('- If channelrestrictions is blocked, it means the command name is not matching');
console.log('- The command name might be different from what we expect');
console.log('- We need to check what command name is actually being passed to the filter'); 