import { MaintenanceStorage } from '../src/utils/maintenance-storage';

console.log('🔧 Checking Maintenance Mode Status\n');

// Load current maintenance mode status
const currentStatus = MaintenanceStorage.load();
console.log('📋 Current Maintenance Mode Status:');
console.log(`Enabled: ${currentStatus.enabled}`);
console.log(`Last Updated: ${currentStatus.lastUpdated}`);
console.log(`Updated By: ${currentStatus.updatedBy}`);
console.log(`Reason: ${currentStatus.reason}`);

console.log('\n🔍 Analysis:');
if (currentStatus.enabled) {
    console.log('✅ Maintenance mode is ENABLED');
    console.log('✅ All regular commands should be BLOCKED');
    console.log('✅ Only maintenance command should work');
} else {
    console.log('❌ Maintenance mode is DISABLED');
    console.log('❌ All commands should work normally');
    console.log('❌ This explains why you can use other commands');
}

console.log('\n💡 To enable maintenance mode:');
console.log('n.maintenance enable [reason]');

console.log('\n💡 To disable maintenance mode:');
console.log('n.maintenance disable [reason]');

console.log('\n💡 To check maintenance status:');
console.log('n.maintenance status'); 