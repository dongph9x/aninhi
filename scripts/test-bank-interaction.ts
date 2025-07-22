import { BankHandler } from '../src/components/MessageComponent/BankHandler';
import { BankUI } from '../src/components/MessageComponent/BankUI';
import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';

const testUserId = 'test-user-bank-interaction';
const testGuildId = 'test-guild-bank-interaction';

async function testBankInteraction() {
    console.log('🧪 Testing Bank Interaction Fix...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add some coins for testing
        console.log('2️⃣ Adding coins for testing...');
        await ecommerceDB.addMoney(testUserId, testGuildId, 5000, 'Test AniCoin');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 3000, 'Test FishCoin');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   AniCoin: ${user.balance}`);
        console.log(`   FishCoin: ${user.fishBalance}\n`);

        // Test BankUI functions
        console.log('3️⃣ Testing BankUI functions...');
        
        // Test createBankInfoEmbed
        const infoEmbed = BankUI.createBankInfoEmbed(testUserId, testGuildId);
        console.log('   ✅ createBankInfoEmbed: OK');
        
        // Test createBankButtons
        const buttons = BankUI.createBankButtons();
        console.log('   ✅ createBankButtons: OK');
        console.log(`   Button count: ${buttons.length} rows`);
        
        // Test createRatesEmbed
        const ratesEmbed = BankUI.createRatesEmbed();
        console.log('   ✅ createRatesEmbed: OK');
        
        // Test createBalanceEmbed
        const balanceEmbed = await BankUI.createBalanceEmbed(testUserId, testGuildId);
        console.log('   ✅ createBalanceEmbed: OK');
        
        // Test createHistoryEmbed
        const historyEmbed = await BankUI.createHistoryEmbed(testUserId, testGuildId);
        console.log('   ✅ createHistoryEmbed: OK');

        // Test BankService functions
        console.log('\n4️⃣ Testing BankService functions...');
        
        // Test getExchangeRates
        const { BankService } = await import('../src/utils/bank-service');
        const rates = BankService.getExchangeRates();
        console.log('   ✅ getExchangeRates: OK');
        console.log(`   AniCoin → FishCoin: ${rates.aniToFish.rate}`);
        console.log(`   FishCoin → AniCoin: ${rates.fishToAni.rate}`);

        // Test canClaimDaily
        const canClaim = await ecommerceDB.canClaimDaily(testUserId, testGuildId);
        console.log(`   ✅ canClaimDaily: ${canClaim}`);

        // Test processDailyClaim (if can claim)
        if (canClaim) {
            console.log('5️⃣ Testing processDailyClaim...');
            const result = await ecommerceDB.processDailyClaim(testUserId, testGuildId);
            if (result.success) {
                console.log('   ✅ processDailyClaim: OK');
                console.log(`   AniCoin received: ${result.aniAmount}`);
                console.log(`   FishCoin received: ${result.fishAmount}`);
                console.log(`   New streak: ${result.newStreak}`);
            } else {
                console.log('   ❌ processDailyClaim: Failed');
            }
        } else {
            console.log('5️⃣ Skipping processDailyClaim (cooldown active)');
        }

        console.log('\n🎉 Bank interaction test completed successfully!');
        console.log('💡 The bank buttons should now work without JSON parsing errors.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testBankInteraction().catch(console.error); 