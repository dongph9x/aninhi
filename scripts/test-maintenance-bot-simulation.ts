import { MaintenanceStorage } from '../src/utils/maintenance-storage';

console.log('🤖 Maintenance Mode Bot Simulation\n');

// Load current maintenance mode status
const maintenanceConfig = MaintenanceStorage.load();
console.log('📋 Current Maintenance Mode Status:');
console.log(`Enabled: ${maintenanceConfig.enabled}`);
console.log(`Last Updated: ${maintenanceConfig.lastUpdated}`);
console.log(`Updated By: ${maintenanceConfig.updatedBy}`);
console.log(`Reason: ${maintenanceConfig.reason}`);

// Mô phỏng cách bot xử lý commands
const simulateBotProcessing = (fullCommand: string) => {
    console.log(`\n🔍 Processing: ${fullCommand}`);
    
    // Bước 1: Bot sẽ loại bỏ prefix và lấy input
    const prefix = 'n.';
    const input = fullCommand.slice(prefix.length);
    console.log(`Input after removing prefix: "${input}"`);
    
    // Bước 2: Bot sẽ split input thành args
    const args = input.trim().split(/\s+/g);
    console.log(`Args: [${args.join(', ')}]`);
    
    // Bước 3: Bot sẽ lấy command name
    const commandName = args[0];
    console.log(`Command name extracted: "${commandName}"`);
    
    // Bước 4: Bot sẽ kiểm tra maintenance mode
    console.log(`\n🔧 Maintenance Mode Check:`);
    console.log(`Maintenance mode enabled: ${maintenanceConfig.enabled}`);
    console.log(`Command name: ${commandName}`);
    console.log(`Is maintenance command: ${commandName === 'maintenance'}`);
    
    if (maintenanceConfig.enabled && commandName !== 'maintenance') {
        console.log(`❌ Command would be BLOCKED by maintenance mode`);
        console.log(`❌ Bot would reply: "🔧 **Bot đang trong chế độ bảo trì**\nVui lòng chờ cho đến khi bảo trì hoàn tất."`);
        return false;
    } else {
        console.log(`✅ Command would be ALLOWED`);
        return true;
    }
};

// Test các lệnh khác nhau
const testCommands = [
    'n.maintenance status',
    'n.maintenance disable',
    'n.help',
    'n.ping',
    'n.fishing',
    'n.balance',
    'n.inventory',
    'n.fishbarn',
    'n.chrestrict show',
    'n.chrestrict add channel 1362234245392765201'
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
if (maintenanceConfig.enabled) {
    console.log('✅ Maintenance mode is ENABLED');
    console.log('✅ Only maintenance command should be allowed');
    console.log('✅ All other commands should be blocked');
    
    if (blockedCount === testCommands.length - 1) {
        console.log('✅ System is working correctly');
    } else {
        console.log('❌ System is NOT working correctly');
        console.log('❌ Some commands are being allowed when they should be blocked');
    }
} else {
    console.log('❌ Maintenance mode is DISABLED');
    console.log('❌ All commands should be allowed');
    console.log('❌ This explains why you can use other commands');
}

console.log('\n💡 To enable maintenance mode:');
console.log('n.maintenance enable [reason]');

console.log('\n💡 To disable maintenance mode:');
console.log('n.maintenance disable [reason]');

console.log('\n💡 To check maintenance status:');
console.log('n.maintenance status'); 