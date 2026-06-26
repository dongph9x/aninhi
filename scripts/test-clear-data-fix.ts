/**
 * 🧪 Test Clear Data Fix
 * 
 * Script này test script clear data đã sửa để tránh lỗi foreign key constraint
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testClearDataFix() {
    console.log('🧪 Testing Clear Data Fix...\n');

    try {
        // 1. Tạo một số dữ liệu test để xóa
        console.log('1️⃣ Creating test data...');
        
        const testUserId = 'test-clear-user';
        const testGuildId = 'test-clear-guild';
        
        // Tạo user
        const user = await prisma.user.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 1000n,
                fishBalance: 500n
            }
        });
        console.log('   ✅ Test user created');

        // Tạo transaction
        await prisma.transaction.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                amount: 100n,
                type: 'test',
                description: 'Test transaction'
            }
        });
        console.log('   ✅ Test transaction created');

        // Tạo fish transaction
        await prisma.fishTransaction.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                amount: 50n,
                type: 'test',
                description: 'Test fish transaction'
            }
        });
        console.log('   ✅ Test fish transaction created');

        // Tạo daily claim
        await prisma.dailyClaim.create({
            data: {
                userId: testUserId,
                guildId: testGuildId
            }
        });
        console.log('   ✅ Test daily claim created');

        // Tạo fish food
        await prisma.fishFood.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                foodType: 'basic',
                quantity: 10
            }
        });
        console.log('   ✅ Test fish food created');

        console.log('');

        // 2. Kiểm tra dữ liệu đã tạo
        console.log('2️⃣ Checking created data...');
        
        const userCount = await prisma.user.count();
        const transactionCount = await prisma.transaction.count();
        const fishTransactionCount = await prisma.fishTransaction.count();
        const dailyClaimCount = await prisma.dailyClaim.count();
        const fishFoodCount = await prisma.fishFood.count();
        
        console.log(`   Users: ${userCount}`);
        console.log(`   Transactions: ${transactionCount}`);
        console.log(`   Fish Transactions: ${fishTransactionCount}`);
        console.log(`   Daily Claims: ${dailyClaimCount}`);
        console.log(`   Fish Food: ${fishFoodCount}`);
        console.log('');

        // 3. Import và chạy script clear data
        console.log('3️⃣ Running clear data script...');
        
        // Import script clear data
        const { execSync } = require('child_process');
        
        try {
            execSync('npx tsx scripts/clear-all-data.ts', { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            console.log('   ✅ Clear data script completed successfully');
        } catch (error) {
            console.error('   ❌ Clear data script failed:', error);
            return;
        }
        console.log('');

        // 4. Kiểm tra dữ liệu đã được xóa
        console.log('4️⃣ Checking if data was cleared...');
        
        const finalUserCount = await prisma.user.count();
        const finalTransactionCount = await prisma.transaction.count();
        const finalFishTransactionCount = await prisma.fishTransaction.count();
        const finalDailyClaimCount = await prisma.dailyClaim.count();
        const finalFishFoodCount = await prisma.fishFood.count();
        
        console.log(`   Users: ${finalUserCount} (was ${userCount})`);
        console.log(`   Transactions: ${finalTransactionCount} (was ${transactionCount})`);
        console.log(`   Fish Transactions: ${finalFishTransactionCount} (was ${fishTransactionCount})`);
        console.log(`   Daily Claims: ${finalDailyClaimCount} (was ${dailyClaimCount})`);
        console.log(`   Fish Food: ${finalFishFoodCount} (was ${fishFoodCount})`);
        console.log('');

        // 5. Kiểm tra kết quả
        const allCleared = finalUserCount === 0 && 
                          finalTransactionCount === 0 && 
                          finalFishTransactionCount === 0 && 
                          finalDailyClaimCount === 0 && 
                          finalFishFoodCount === 0;

        if (allCleared) {
            console.log('🎉 SUCCESS: All data cleared successfully!');
            console.log('✅ Foreign key constraint issue has been fixed!');
        } else {
            console.log('❌ FAILED: Some data still remains');
            console.log('❌ Clear data script may still have issues');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testClearDataFix().catch(console.error); 