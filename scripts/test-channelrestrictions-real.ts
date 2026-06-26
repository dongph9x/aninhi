import { ChannelRestrictionsStorage } from '../src/utils/channel-restrictions-storage';
import { isChannelAllowed } from '../src/config/channel-restrictions';

console.log('🧪 Real Channel Restrictions Test\n');

// Load current configuration
const currentConfig = ChannelRestrictionsStorage.load();
console.log('Current config loaded');

// Test các lệnh thực tế mà user có thể sử dụng
const testCommands = [
    'n.chrestrict show',
    'n.chrestrict add channel 1362234245392765201',
    'n.chrestrict add category 123456789',
    'n.chrestrict remove channel 1362234245392765201',
    'n.chrestrict mode whitelist off',
    'n.chrestrict backup',
    'n.chrestrict restore',
    'n.channelrestrictions show',
    'n.chrest show',
    'n.restrictch add channel 1362234245392765201'
];

console.log('📋 Testing Real Commands:');
testCommands.forEach(fullCommand => {
    // Parse command như bot sẽ làm
    const parts = fullCommand.split(' ');
    const commandName = parts[1]; // n.chrestrict -> chrestrict
    
    console.log(`\n🔍 Testing: ${fullCommand}`);
    console.log(`Command name extracted: ${commandName}`);
    
    const result = isChannelAllowed('ANY_CHANNEL', null, currentConfig, commandName, false);
    console.log(`Result: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
    
    const resultAdmin = isChannelAllowed('ANY_CHANNEL', null, currentConfig, commandName, true);
    console.log(`Admin result: ${resultAdmin.allowed ? '✅ Allowed' : '❌ Blocked'} - ${resultAdmin.reason || 'No reason'}`);
});

console.log('\n📋 Summary:');
console.log('- All channelrestrictions commands should be allowed');
console.log('- The issue might be in how the command is being processed');
console.log('- Check if the command name is being extracted correctly'); 