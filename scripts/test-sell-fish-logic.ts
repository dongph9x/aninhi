async function testSellFishLogic() {
    console.log('🧪 Testing Sell Fish Logic BigInt issues...\n');

    try {
        // Simulate data
        const userBalance = BigInt(10000);
        const fishValue = BigInt(146661);
        const fishLevel = 1;
        
        console.log(`📊 Test Data:`);
        console.log(`   User balance: ${userBalance} (type: ${typeof userBalance})`);
        console.log(`   Fish value: ${fishValue} (type: ${typeof fishValue})`);
        console.log(`   Fish level: ${fishLevel}`);
        
        // Test 1: Basic BigInt addition (fish-breeding.ts sellFish)
        console.log(`\n🧪 Test 1: Basic BigInt addition (fish-breeding.ts sellFish)`);
        try {
            const newBalance = userBalance + fishValue;
            console.log(`   ✅ Success: ${userBalance} + ${fishValue} = ${newBalance}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 2: Level bonus calculation (fish-inventory.ts sellFishFromInventory)
        console.log(`\n🧪 Test 2: Level bonus calculation (fish-inventory.ts sellFishFromInventory)`);
        try {
            const levelBonus = fishLevel > 1 ? (fishLevel - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus}`);
            
            const finalValue = Math.floor(Number(fishValue) * (1 + levelBonus));
            console.log(`   Final value: ${finalValue} (type: ${typeof finalValue})`);
            
            const newBalance = userBalance + BigInt(finalValue);
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(finalValue)} = ${newBalance}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 3: Level 5 fish
        console.log(`\n🧪 Test 3: Level 5 fish`);
        try {
            const fishLevel5 = 5;
            const levelBonus5 = fishLevel5 > 1 ? (fishLevel5 - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus5}`);
            
            const finalValue5 = Math.floor(Number(fishValue) * (1 + levelBonus5));
            console.log(`   Final value: ${finalValue5} (type: ${typeof finalValue5})`);
            
            const newBalance5 = userBalance + BigInt(finalValue5);
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(finalValue5)} = ${newBalance5}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 4: Level 10 fish
        console.log(`\n🧪 Test 4: Level 10 fish`);
        try {
            const fishLevel10 = 10;
            const levelBonus10 = fishLevel10 > 1 ? (fishLevel10 - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus10}`);
            
            const finalValue10 = Math.floor(Number(fishValue) * (1 + levelBonus10));
            console.log(`   Final value: ${finalValue10} (type: ${typeof finalValue10})`);
            
            const newBalance10 = userBalance + BigInt(finalValue10);
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(finalValue10)} = ${newBalance10}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 5: Market price calculation
        console.log(`\n🧪 Test 5: Market price calculation`);
        try {
            const marketPrice = 50000;
            const userBalance2 = BigInt(100000);
            
            console.log(`   Market price: ${marketPrice} (type: ${typeof marketPrice})`);
            console.log(`   User balance: ${userBalance2} (type: ${typeof userBalance2})`);
            
            // Check if user has enough money
            const hasEnoughMoney = userBalance2 >= BigInt(marketPrice);
            console.log(`   Has enough money: ${hasEnoughMoney}`);
            
            if (hasEnoughMoney) {
                const newBalance = userBalance2 - BigInt(marketPrice);
                console.log(`   ✅ Success: ${userBalance2} - ${BigInt(marketPrice)} = ${newBalance}`);
            }
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        console.log(`\n✅ All tests completed successfully!`);

    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

testSellFishLogic().catch(console.error); 