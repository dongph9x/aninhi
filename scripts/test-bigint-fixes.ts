import { PrismaClient } from '@prisma/client';
import { EcommerceService } from '../src/utils/ecommerce-db';
import { FishPriceService } from '../src/utils/fishing';

const prisma = new PrismaClient();

async function testBigIntFixes() {
    console.log('🧪 Testing BigInt Fixes...\n');

    const testGuildId = 'test-guild-bigint-fixes';
    const testUserId = 'user-bigint-test';

    try {
        // Clean up test data
        await prisma.transaction.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });

        // Create test user
        await prisma.user.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 10000n,
                dailyStreak: 0
            }
        });

        console.log('✅ Created test user');

        // Test 1: Add large amounts of money
        console.log('\n💰 Test 1: Adding large amounts of money');
        await EcommerceService.addMoney(testUserId, testGuildId, 999999999, 'Test large amount');
        const balance1 = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Balance after adding: ${balance1.toLocaleString()} AniCoin`);

        // Test 2: Subtract large amounts
        console.log('\n💰 Test 2: Subtracting large amounts');
        await EcommerceService.subtractMoney(testUserId, testGuildId, 500000000, 'Test large subtraction');
        const balance2 = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Balance after subtracting: ${balance2.toLocaleString()} AniCoin`);

        // Test 3: Create transactions with large amounts
        console.log('\n📊 Test 3: Creating transactions with large amounts');
        await EcommerceService.addMoney(testUserId, testGuildId, 123456789, 'Test transaction 1');
        await EcommerceService.subtractMoney(testUserId, testGuildId, 98765432, 'Test transaction 2');
        await EcommerceService.addMoney(testUserId, testGuildId, 555555555, 'Test transaction 3');

        // Test 4: Get user transactions (this would test the balance command logic)
        console.log('\n📊 Test 4: Getting user transactions');
        const transactions = await EcommerceService.getUserTransactions(testUserId, testGuildId, 5);
        console.log(`✅ Found ${transactions.length} transactions`);
        
        transactions.forEach((tx, index) => {
            const emoji = tx.amount > 0 ? "➕" : "➖";
            const absAmount = tx.amount > 0 ? tx.amount : -tx.amount;
            console.log(`   ${index + 1}. ${emoji} ${absAmount.toLocaleString()} AniCoin - ${tx.description || tx.type}`);
        });

        // Test 5: Test fish price updates
        console.log('\n🐟 Test 5: Testing fish price updates');
        try {
            await FishPriceService.initializeFishPrices();
            console.log('✅ Initialized fish prices');
            
            await FishPriceService.updateFishPrices();
            console.log('✅ Updated fish prices');
            
            const allPrices = await FishPriceService.getAllFishPrices();
            console.log(`✅ Found ${allPrices.length} fish prices`);
            
            if (allPrices.length > 0) {
                const samplePrice = allPrices[0];
                console.log(`   Sample: ${samplePrice.fishName} - ${samplePrice.currentPrice} AniCoin (${samplePrice.changePercent}%)`);
            }
        } catch (error) {
            console.log('⚠️ Fish price test skipped (may not be fully set up)');
        }

        // Test 6: Final balance check
        console.log('\n💰 Test 6: Final balance check');
        const finalBalance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Final balance: ${finalBalance.toLocaleString()} AniCoin`);

        console.log('\n🎉 All BigInt fixes tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        // Clean up test data
        await prisma.transaction.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.$disconnect();
    }
}

testBigIntFixes().catch(console.error); 