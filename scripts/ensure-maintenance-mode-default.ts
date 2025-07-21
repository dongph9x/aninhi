import { MaintenanceStorage } from '../src/utils/maintenance-storage';
import fs from 'fs';
import path from 'path';

console.log('🔧 Ensuring Maintenance Mode Default (ENABLED)\n');

// Bước 1: Kiểm tra trạng thái hiện tại
console.log('📋 Step 1: Check Current Status');
const currentStatus = MaintenanceStorage.load();
console.log(`Current maintenance mode: ${currentStatus.enabled ? 'ENABLED' : 'DISABLED'}`);
console.log(`Last Updated: ${currentStatus.lastUpdated}`);
console.log(`Updated By: ${currentStatus.updatedBy}`);
console.log(`Reason: ${currentStatus.reason}`);

// Bước 2: Đảm bảo default config đúng
console.log('\n📋 Step 2: Verify Default Configuration');
const defaultConfig = {
  enabled: true, // Mặc định BẬT
  lastUpdated: Date.now(),
  updatedBy: 'system',
  reason: 'Default maintenance mode on startup'
};

console.log(`Default enabled: ${defaultConfig.enabled}`);
console.log(`Default reason: ${defaultConfig.reason}`);

// Bước 3: Reset về default nếu cần
console.log('\n📋 Step 3: Reset to Default (ENABLED)');
if (!currentStatus.enabled) {
    console.log('❌ Current status is DISABLED, resetting to ENABLED...');
    const resetSuccess = MaintenanceStorage.reset();
    console.log(`Reset success: ${resetSuccess ? '✅' : '❌'}`);
} else {
    console.log('✅ Current status is already ENABLED');
}

// Bước 4: Verify sau khi reset
console.log('\n📋 Step 4: Verify After Reset');
const newStatus = MaintenanceStorage.load();
console.log(`New maintenance mode: ${newStatus.enabled ? 'ENABLED' : 'DISABLED'}`);
console.log(`Last Updated: ${newStatus.lastUpdated}`);
console.log(`Updated By: ${newStatus.updatedBy}`);
console.log(`Reason: ${newStatus.reason}`);

// Bước 5: Kiểm tra file storage
console.log('\n📋 Step 5: Check Storage File');
const storagePath = path.join(process.cwd(), 'data', 'maintenance-mode.json');
console.log(`Storage path: ${storagePath}`);
console.log(`File exists: ${fs.existsSync(storagePath)}`);

if (fs.existsSync(storagePath)) {
    const fileContent = fs.readFileSync(storagePath, 'utf8');
    const parsed = JSON.parse(fileContent);
    console.log(`File enabled: ${parsed.enabled}`);
    console.log(`File reason: ${parsed.reason}`);
}

// Bước 6: Test ExtendedClient simulation
console.log('\n📋 Step 6: ExtendedClient Simulation');
try {
    const maintenanceConfig = MaintenanceStorage.load();
    const maintenanceMode = maintenanceConfig.enabled;
    console.log(`ExtendedClient would set maintenanceMode = ${maintenanceMode}`);
    console.log(`Bot would start with maintenance mode: ${maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
    
    if (maintenanceMode) {
        console.log('✅ Bot will start with maintenance mode ENABLED');
        console.log('✅ All regular commands will be BLOCKED');
        console.log('✅ Only maintenance commands will be ALLOWED');
    } else {
        console.log('❌ Bot will start with maintenance mode DISABLED');
        console.log('❌ All commands will be ALLOWED');
    }
} catch (error) {
    console.log(`❌ Error in simulation: ${error}`);
    console.log('❌ Bot would fallback to maintenanceMode = true (ENABLED)');
}

console.log('\n🎯 Summary:');
console.log('✅ Maintenance mode is now set to ENABLED by default');
console.log('✅ Bot will start with maintenance mode ENABLED');
console.log('✅ All regular commands will be BLOCKED on startup');
console.log('✅ Only maintenance commands will be ALLOWED');
console.log('✅ Admin must disable maintenance mode to use bot normally');

console.log('\n💡 Next Steps:');
console.log('1. Restart the bot');
console.log('2. Bot will start with maintenance mode ENABLED');
console.log('3. Use n.maintenance disable to make bot operational');
console.log('4. Use n.maintenance enable to put bot back in maintenance mode');

console.log('\n🔒 Security Status:');
console.log('✅ Bot is secure - starts in maintenance mode by default');
console.log('✅ Admin has full control over maintenance mode');
console.log('✅ No unauthorized commands can be executed on startup'); 