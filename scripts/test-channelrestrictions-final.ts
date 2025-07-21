import { ChannelRestrictionsStorage } from '../src/utils/channel-restrictions-storage';
import { isChannelAllowed } from '../src/config/channel-restrictions';

console.log('🎯 Final Channel Restrictions Test\n');

// Load current configuration
const currentConfig = ChannelRestrictionsStorage.load();
console.log('Current config loaded');

// Test các lệnh mà user đã báo bị chặn
const testUserCommand = 'n.chrestrict add channel 1362234245392765201';

console.log(`🔍 Testing user's command: ${testUserCommand}`);

// Mô phỏng cách bot xử lý
const prefix = 'n.';
const input = testUserCommand.slice(prefix.length);
const args = input.trim().split(/\s+/g);
const commandName = args[0];

console.log(`Input after removing prefix: "${input}"`);
console.log(`Args: [${args.join(', ')}]`);
console.log(`Command name: "${commandName}"`);

// Kiểm tra channel restrictions
const result = isChannelAllowed('ANY_CHANNEL', null, currentConfig, commandName, true);
console.log(`\n📋 Channel Restrictions Check:`);
console.log(`Command: ${commandName}`);
console.log(`Result: ${result.allowed ? '✅ Allowed' : '❌ Blocked'}`);
console.log(`Reason: ${result.reason || 'No reason'}`);

// Kiểm tra exempt commands
console.log(`\n📋 Exempt Commands Check:`);
console.log(`Exempt commands: [${currentConfig.exemptCommands.join(', ')}]`);
console.log(`Is in exempt: ${currentConfig.exemptCommands.includes(commandName)}`);

// Kiểm tra admin exempt commands
console.log(`\n📋 Admin Exempt Commands Check:`);
console.log(`Admin exempt commands: [${currentConfig.exemptAdminCommands.join(', ')}]`);
console.log(`Is in admin exempt: ${currentConfig.exemptAdminCommands.includes(commandName)}`);

// Kiểm tra whitelist mode
console.log(`\n📋 Whitelist Mode Check:`);
console.log(`Whitelist mode: ${currentConfig.useWhitelistMode}`);
console.log(`Allowed channels: ${currentConfig.allowedChannels.length}`);
console.log(`Current channel in whitelist: ${currentConfig.allowedChannels.includes('ANY_CHANNEL')}`);

console.log(`\n🎯 Conclusion:`);
if (result.allowed) {
    console.log(`✅ The command should be ALLOWED`);
    console.log(`✅ The system is working correctly`);
    console.log(`✅ If user still sees it blocked, there might be another issue`);
} else {
    console.log(`❌ The command is being BLOCKED`);
    console.log(`❌ This explains why user cannot use the command`);
    console.log(`❌ Need to fix the exempt commands configuration`);
}

console.log(`\n💡 Next Steps:`);
console.log(`1. If command is allowed but user still sees it blocked:`);
console.log(`   - Check if bot is running the latest code`);
console.log(`   - Check if channel restrictions are loaded correctly`);
console.log(`   - Check if there are any other permission checks`);
console.log(`2. If command is blocked:`);
console.log(`   - Add the command to exempt commands`);
console.log(`   - Or add the channel to whitelist`); 