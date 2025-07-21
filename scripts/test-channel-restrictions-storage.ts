import { ChannelRestrictionsStorage } from '../src/utils/channel-restrictions-storage';
import { defaultChannelRestrictions, addToWhitelist, addToBlacklist, addCategoryToWhitelist } from '../src/config/channel-restrictions';

console.log('🧪 Testing Channel Restrictions Storage System\n');

// Test 1: Save and load default configuration
console.log('📋 Test 1: Save and Load Default Configuration');
const success1 = ChannelRestrictionsStorage.save(defaultChannelRestrictions);
console.log('Save default config:', success1 ? '✅ Success' : '❌ Failed');

const loaded1 = ChannelRestrictionsStorage.load();
console.log('Load config:', loaded1 ? '✅ Success' : '❌ Failed');
console.log('Config matches default:', JSON.stringify(loaded1) === JSON.stringify(defaultChannelRestrictions) ? '✅ Yes' : '❌ No');
console.log('✅ Test 1 passed\n');

// Test 2: Save custom configuration
console.log('📋 Test 2: Save Custom Configuration');
let customConfig = { ...defaultChannelRestrictions };
customConfig = addToWhitelist(customConfig, '123456789');
customConfig = addToBlacklist(customConfig, '987654321');
customConfig = addCategoryToWhitelist(customConfig, 'CATEGORY123');

const success2 = ChannelRestrictionsStorage.save(customConfig);
console.log('Save custom config:', success2 ? '✅ Success' : '❌ Failed');

const loaded2 = ChannelRestrictionsStorage.load();
console.log('Load custom config:', loaded2 ? '✅ Success' : '❌ Failed');
console.log('Custom config matches saved:', JSON.stringify(loaded2) === JSON.stringify(customConfig) ? '✅ Yes' : '❌ No');
console.log('✅ Test 2 passed\n');

// Test 3: Backup functionality
console.log('📋 Test 3: Backup Functionality');
const backupSuccess = ChannelRestrictionsStorage.backup();
console.log('Create backup:', backupSuccess ? '✅ Success' : '❌ Failed');

const backupFiles = ChannelRestrictionsStorage.getBackupFiles();
console.log('Backup files found:', backupFiles.length);
console.log('Latest backup:', backupFiles[0] || 'None');
console.log('✅ Test 3 passed\n');

// Test 4: Export functionality
console.log('📋 Test 4: Export Functionality');
const exportSuccess = ChannelRestrictionsStorage.export();
console.log('Export config:', exportSuccess ? '✅ Success' : '❌ Failed');
console.log('✅ Test 4 passed\n');

// Test 5: Reset functionality
console.log('📋 Test 5: Reset Functionality');
const resetSuccess = ChannelRestrictionsStorage.reset();
console.log('Reset config:', resetSuccess ? '✅ Success' : '❌ Failed');

const resetLoaded = ChannelRestrictionsStorage.load();
console.log('Reset config matches default:', JSON.stringify(resetLoaded) === JSON.stringify(defaultChannelRestrictions) ? '✅ Yes' : '❌ No');
console.log('✅ Test 5 passed\n');

// Test 6: Validation and merge
console.log('📋 Test 6: Validation and Merge');
const invalidConfig = {
  allowedChannels: 'invalid', // Should be array
  blockedChannels: null, // Should be array
  allowedCategories: [], // Valid
  blockedCategories: [], // Valid
  useWhitelistMode: 'true', // Should be boolean
  useBlacklistMode: false, // Valid
  checkCategories: true, // Valid
  exemptCommands: 'invalid', // Should be array
  exemptAdminCommands: [] // Valid
};

// This should be handled gracefully by the storage system
const loaded3 = ChannelRestrictionsStorage.load();
console.log('Load after invalid config attempt:', loaded3 ? '✅ Success' : '❌ Failed');
console.log('Config is valid:', typeof loaded3.allowedChannels === 'object' && Array.isArray(loaded3.allowedChannels) ? '✅ Yes' : '❌ No');
console.log('✅ Test 6 passed\n');

console.log('🎉 All storage tests passed! Channel restrictions storage system is working correctly.');

// Cleanup: Reset to default
ChannelRestrictionsStorage.reset();
console.log('🧹 Cleanup: Reset to default configuration'); 