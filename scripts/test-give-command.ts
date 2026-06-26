import { PrismaClient } from '@prisma/client';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testGiveCommand() {
    console.log('🧪 Testing Give Command with BigInt...\n');

    const testGuildId = 'test-guild-give-bigint';
    const senderId = 'sender-test';
    const receiverId = 'receiver-test';

    try {
        // Clean up test data
        await prisma.transaction.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });

        // Create test users
        await prisma.user.create({
            data: {
                userId: senderId,
                guildId: testGuildId,
                balance: 1000000n, // 1 million AniCoin
                dailyStreak: 0
            }
        });

        await prisma.user.create({
            data: {
                userId: receiverId,
                guildId: testGuildId,
                balance: 1000n, // 1 thousand AniCoin
                dailyStreak: 0
            }
        });

        console.log('✅ Created test users');

        // Test 1: Check initial balances
        console.log('\n💰 Test 1: Check initial balances');
        const senderBalance = await EcommerceService.getBalance(senderId, testGuildId);
        const receiverBalance = await EcommerceService.getBalance(receiverId, testGuildId);
        console.log(`✅ Sender balance: ${senderBalance.toLocaleString()} AniCoin`);
        console.log(`✅ Receiver balance: ${receiverBalance.toLocaleString()} AniCoin`);

        // Test 2: Transfer large amount
        console.log('\n💸 Test 2: Transfer large amount');
        const transferAmount = 50000; // 50k AniCoin
        const transferResult = await EcommerceService.transferMoney(senderId, receiverId, testGuildId, transferAmount, "Test transfer");
        console.log(`✅ Transfer result: Success`);
        console.log(`   Amount: ${transferAmount.toLocaleString()} AniCoin`);

        // Test 3: Check balances after give
        console.log('\n💰 Test 3: Check balances after give');
        const newSenderBalance = await EcommerceService.getBalance(senderId, testGuildId);
        const newReceiverBalance = await EcommerceService.getBalance(receiverId, testGuildId);
        console.log(`✅ New sender balance: ${newSenderBalance.toLocaleString()} AniCoin`);
        console.log(`✅ New receiver balance: ${newReceiverBalance.toLocaleString()} AniCoin`);

        // Test 4: Transfer back small amount
        console.log('\n💸 Test 4: Transfer back small amount');
        const transferBackAmount = 1000; // 1k AniCoin
        await EcommerceService.transferMoney(receiverId, senderId, testGuildId, transferBackAmount, "Test transfer back");
        console.log(`✅ Transfer back result: Success`);
        console.log(`   Amount: ${transferBackAmount.toLocaleString()} AniCoin`);

        // Test 5: Final balance check
        console.log('\n💰 Test 5: Final balance check');
        const finalSenderBalance = await EcommerceService.getBalance(senderId, testGuildId);
        const finalReceiverBalance = await EcommerceService.getBalance(receiverId, testGuildId);
        console.log(`✅ Final sender balance: ${finalSenderBalance.toLocaleString()} AniCoin`);
        console.log(`✅ Final receiver balance: ${finalReceiverBalance.toLocaleString()} AniCoin`);

        // Test 6: Check transaction history
        console.log('\n📊 Test 6: Check transaction history');
        const senderTransactions = await EcommerceService.getUserTransactions(senderId, testGuildId, 10);
        const receiverTransactions = await EcommerceService.getUserTransactions(receiverId, testGuildId, 10);
        console.log(`✅ Sender transactions: ${senderTransactions.length} records`);
        console.log(`✅ Receiver transactions: ${receiverTransactions.length} records`);

        console.log('\n🎉 All Give Command tests passed!');

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

testGiveCommand().catch(console.error); 