#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { databaseService } from '../src/utils/database';
import { ecommerceDB } from '../src/utils/ecommerce-db';
import { banDB } from '../src/utils/ban-db';

// Load environment variables
const envFolder = path.join(process.cwd(), 'env');
config({ path: path.resolve(envFolder, '.env') });
config({ path: path.resolve(envFolder, '.env.local') });

async function testDatabase() {
    console.log('🧪 Testing Database Functions...\n');

    try {
        // Initialize database
        await databaseService.initialize();

        // Test data
        const testUserId = '123456789';
        const testGuildId = '987654321';
        const testModeratorId = '111111111';

        console.log('📊 Testing Ecommerce Functions...');

        // Test user creation
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log('✅ User created/retrieved:', user);

        // Test balance update
        const updatedUser = await ecommerceDB.updateBalance(testUserId, testGuildId, 1000);
        console.log('✅ Balance updated:', updatedUser.balance);

        // Test daily claim
        const dailyResult = await ecommerceDB.processDailyClaim(testUserId, testGuildId);
        console.log('✅ Daily claim result:', dailyResult);

        // Test settings
        const settings = await ecommerceDB.getSettings();
        console.log('✅ Settings retrieved:', settings);

        // Test transactions
        const transactions = await ecommerceDB.getUserTransactions(testUserId, testGuildId, 5);
        console.log('✅ Recent transactions:', transactions.length);

        console.log('\n🚫 Testing Ban Functions...');

        // Test ban creation
        const banRecord = await banDB.createBan(
            testUserId,
            testGuildId,
            testModeratorId,
            'Test ban',
            'temporary',
            24 * 60 * 60 * 1000 // 24 hours
        );
        console.log('✅ Ban created:', banRecord);

        // Test ban check
        const isBanned = await banDB.isUserBanned(testUserId, testGuildId);
        console.log('✅ User banned check:', isBanned);

        // Test ban list
        const banList = await banDB.getBanList(testGuildId);
        console.log('✅ Ban list:', banList.length);

        // Test ban stats
        const banStats = await banDB.getBanStats(testGuildId);
        console.log('✅ Ban stats:', banStats);

        // Test unban
        const unbanResult = await banDB.unbanUser(testUserId, testGuildId);
        console.log('✅ Unban result:', unbanResult);

        console.log('\n🔍 Testing Database Health...');

        // Test health check
        const isHealthy = await databaseService.healthCheck();
        console.log('✅ Database health:', isHealthy);

        console.log('\n🎉 All tests passed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    } finally {
        await databaseService.disconnect();
    }
}

testDatabase(); 