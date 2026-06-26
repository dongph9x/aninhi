import { ChannelRestrictionsStorage } from '../src/utils/channel-restrictions-storage';
import { isChannelAllowed } from '../src/config/channel-restrictions';

console.log('🤖 Bot Simulation Test\n');

// Load current configuration
const currentConfig = ChannelRestrictionsStorage.load();
console.log('Current config loaded');

// Mô phỏng cách bot xử lý lệnh
const simulateBotProcessing = (fullCommand: string) => {
    console.log(`\n🔍 Processing: ${fullCommand}`);
    
    // Bước 1: Bot sẽ loại bỏ prefix và lấy input
    const prefix = 'n.';
    const input = fullCommand.slice(prefix.length);
    console.log(`Input after removing prefix: "${input}"`);
    
    // Bước 2: Bot sẽ split input thành args
    const args = input.trim().split(/\s+/g);
    console.log(`Args: [${args.join(', ')}]`);
    
    // Bước 3: Bot sẽ lấy command name (phần đầu tiên)
    const commandName = args[0];
    console.log(`Command name extracted: "${commandName}"`);
    
    // Debug: Hiển thị thông tin
    console.log(`First arg (command): ${args[0]}`);
    console.log(`Second arg (action): ${args[1] || 'none'}`);
    
    // Kiểm tra xem command name có phải là một trong các lệnh channel restrictions không
    const isChannelRestrictionCommand = ['channelrestrictions', 'chrestrict', 'chrest', 'restrictch'].includes(commandName);
    console.log(`Is channel restriction command: ${isChannelRestrictionCommand}`);
    
    // Nếu đây là channel restriction command, nó sẽ được allow
    if (isChannelRestrictionCommand) {
        console.log(`✅ Channel restriction command detected - will be allowed`);
        return true;
    }
    
    // Bước 3: Bot sẽ kiểm tra channel restrictions
    const channelId = 'ANY_CHANNEL';
    const categoryId = null;
    const isAdmin = true; // Giả sử user là admin
    
    console.log(`Checking channel restrictions for command: "${commandName}"`);
    console.log(`Channel: ${channelId}, Category: ${categoryId}, Admin: ${isAdmin}`);
    
    const result = isChannelAllowed(channelId, categoryId, currentConfig, commandName, isAdmin);
    console.log(`Result: ${result.allowed ? '✅ Allowed' : '❌ Blocked'} - ${result.reason || 'No reason'}`);
    
    // Bước 4: Nếu bị chặn, bot sẽ không thực thi command
    if (!result.allowed) {
        console.log(`❌ Command would be blocked: ${result.reason}`);
        return false;
    } else {
        console.log(`✅ Command would be allowed to proceed`);
        return true;
    }
};

// Test các lệnh thực tế
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

console.log('📋 Testing Bot Command Processing:');
let allowedCount = 0;
let blockedCount = 0;

testCommands.forEach(command => {
    const allowed = simulateBotProcessing(command);
    if (allowed) allowedCount++;
    else blockedCount++;
});

console.log('\n📊 Summary:');
console.log(`✅ Allowed: ${allowedCount}`);
console.log(`❌ Blocked: ${blockedCount}`);
console.log(`Total: ${testCommands.length}`);

console.log('\n🔍 Analysis:');
console.log('- If all commands are blocked, there might be an issue with the command name extraction');
console.log('- If some commands are allowed, the system is working correctly');
console.log('- The issue might be in how the bot processes the command vs how we simulate it'); 