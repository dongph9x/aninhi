import { MaintenanceStorage } from '../src/utils/maintenance-storage';

console.log('🤖 Testing Bot Maintenance Mode Loading\n');

// Test 1: Load maintenance mode như bot sẽ làm
console.log('📋 Test 1: Loading Maintenance Mode (Bot Simulation)');
try {
    const maintenanceConfig = MaintenanceStorage.load();
    console.log(`✅ Maintenance mode loaded successfully`);
    console.log(`Enabled: ${maintenanceConfig.enabled}`);
    console.log(`Last Updated: ${maintenanceConfig.lastUpdated}`);
    console.log(`Updated By: ${maintenanceConfig.updatedBy}`);
    console.log(`Reason: ${maintenanceConfig.reason}`);
} catch (error) {
    console.log(`❌ Error loading maintenance mode: ${error}`);
}

// Test 2: Simulate ExtendedClient.loadMaintenanceMode()
console.log('\n📋 Test 2: ExtendedClient.loadMaintenanceMode() Simulation');
try {
    const maintenanceConfig = MaintenanceStorage.load();
    const maintenanceMode = maintenanceConfig.enabled;
    console.log(`✅ ExtendedClient would set maintenanceMode = ${maintenanceMode}`);
    console.log(`✅ Bot would have maintenanceMode: ${maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
} catch (error) {
    console.log(`❌ ExtendedClient would fallback to maintenanceMode = true`);
    console.log(`❌ Bot would have maintenanceMode: ENABLED (fallback)`);
}

// Test 3: Check if bot is running latest code
console.log('\n📋 Test 3: Code Version Check');
console.log('Current maintenance mode check in messageCreate.ts:');
console.log('```typescript');
console.log('// Kiểm tra chế độ bảo trì');
console.log('if (client.maintenanceMode && command.structure.name !== "maintenance") {');
console.log('    return message.reply("🔧 **Bot đang trong chế độ bảo trì**\\nVui lòng chờ cho đến khi bảo trì hoàn tất.");');
console.log('}');
console.log('```');

// Test 4: Simulate command processing
console.log('\n📋 Test 4: Command Processing Simulation');
const testCommands = ['n.help', 'n.fishing', 'n.balance', 'n.maintenance status'];

testCommands.forEach(command => {
    console.log(`\n🔍 Processing: ${command}`);
    
    // Simulate bot processing
    const prefix = 'n.';
    const input = command.slice(prefix.length);
    const args = input.trim().split(/\s+/g);
    const commandName = args[0];
    
    console.log(`Command name: ${commandName}`);
    console.log(`Is maintenance command: ${commandName === 'maintenance'}`);
    
    // Simulate maintenance mode check
    const maintenanceMode = true; // Current status
    if (maintenanceMode && commandName !== 'maintenance') {
        console.log(`❌ Would be BLOCKED by maintenance mode`);
    } else {
        console.log(`✅ Would be ALLOWED`);
    }
});

console.log('\n🔍 Analysis:');
console.log('If you can still use commands despite maintenance mode being enabled:');
console.log('1. ❌ Bot might not have restarted to load new maintenance mode');
console.log('2. ❌ Bot might be running old code without maintenance mode check');
console.log('3. ❌ There might be an issue with ExtendedClient.loadMaintenanceMode()');
console.log('4. ❌ There might be another permission bypass');

console.log('\n💡 Solutions:');
console.log('1. Restart the bot to load new maintenance mode');
console.log('2. Check if bot is running the latest code');
console.log('3. Verify maintenance mode status with: n.maintenance status');
console.log('4. Try enabling maintenance mode again: n.maintenance enable'); 