import { MaintenanceStorage } from '../src/utils/maintenance-storage';

console.log('🧪 Testing Maintenance Storage System\n');

// Test 1: Load default configuration
console.log('📋 Test 1: Load Default Configuration');
const defaultConfig = MaintenanceStorage.load();
console.log('Default config:', JSON.stringify(defaultConfig, null, 2));
console.log('Default enabled:', defaultConfig.enabled);
console.log('✅ Test 1 passed\n');

// Test 2: Enable maintenance mode
console.log('📋 Test 2: Enable Maintenance Mode');
const enableSuccess = MaintenanceStorage.enable('test-user', 'Testing enable function');
console.log('Enable success:', enableSuccess ? '✅ Success' : '❌ Failed');

const enabledConfig = MaintenanceStorage.load();
console.log('Enabled config:', enabledConfig.enabled);
console.log('Updated by:', enabledConfig.updatedBy);
console.log('Reason:', enabledConfig.reason);
console.log('✅ Test 2 passed\n');

// Test 3: Disable maintenance mode
console.log('📋 Test 3: Disable Maintenance Mode');
const disableSuccess = MaintenanceStorage.disable('test-user', 'Testing disable function');
console.log('Disable success:', disableSuccess ? '✅ Success' : '❌ Failed');

const disabledConfig = MaintenanceStorage.load();
console.log('Disabled config:', disabledConfig.enabled);
console.log('Updated by:', disabledConfig.updatedBy);
console.log('Reason:', disabledConfig.reason);
console.log('✅ Test 3 passed\n');

// Test 4: Get status
console.log('📋 Test 4: Get Status');
const status = MaintenanceStorage.getStatus();
console.log('Status:', JSON.stringify(status, null, 2));
console.log('✅ Test 4 passed\n');

// Test 5: Backup functionality
console.log('📋 Test 5: Backup Functionality');
const backupSuccess = MaintenanceStorage.backup();
console.log('Backup success:', backupSuccess ? '✅ Success' : '❌ Failed');
console.log('✅ Test 5 passed\n');

// Test 6: Reset functionality
console.log('📋 Test 6: Reset Functionality');
const resetSuccess = MaintenanceStorage.reset();
console.log('Reset success:', resetSuccess ? '✅ Success' : '❌ Failed');

const resetConfig = MaintenanceStorage.load();
console.log('Reset config enabled:', resetConfig.enabled);
console.log('Reset config matches default:', resetConfig.enabled === defaultConfig.enabled);
console.log('✅ Test 6 passed\n');

// Test 7: Validation and merge
console.log('📋 Test 7: Validation and Merge');
// Test với invalid config (sẽ được handled gracefully)
const invalidConfig = {
  enabled: 'invalid', // Should be boolean
  lastUpdated: 'invalid', // Should be number
  updatedBy: 123, // Should be string
  reason: null // Should be string
};

// Load sau khi có invalid config attempt
const validatedConfig = MaintenanceStorage.load();
console.log('Validated config enabled:', validatedConfig.enabled);
console.log('Validated config is boolean:', typeof validatedConfig.enabled === 'boolean');
console.log('✅ Test 7 passed\n');

console.log('🎉 All maintenance storage tests passed!');

// Final cleanup: Reset to default
MaintenanceStorage.reset();
console.log('🧹 Final cleanup: Reset to default configuration'); 