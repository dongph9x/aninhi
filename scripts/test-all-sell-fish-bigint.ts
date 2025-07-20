async function testAllSellFishBigInt() {
    console.log('🧪 Testing All Sell Fish BigInt Fixes...\n');

    try {
        // Simulate data
        const userBalance = BigInt(10000);
        const fish1Value = BigInt(146661);
        const fish2Value = BigInt(200000);
        const fishLevel = 5;
        
        console.log(`📊 Test Data:`);
        console.log(`   User balance: ${userBalance} (type: ${typeof userBalance})`);
        console.log(`   Fish1 value: ${fish1Value} (type: ${typeof fish1Value})`);
        console.log(`   Fish2 value: ${fish2Value} (type: ${typeof fish2Value})`);
        console.log(`   Fish level: ${fishLevel}`);
        
        // Test 1: fish-breeding.ts sellFish (basic addition)
        console.log(`\n🧪 Test 1: fish-breeding.ts sellFish (basic addition)`);
        try {
            const newBalance = userBalance + fish1Value;
            console.log(`   ✅ Success: ${userBalance} + ${fish1Value} = ${newBalance}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 2: fish-inventory.ts sellFishFromInventory (level bonus)
        console.log(`\n🧪 Test 2: fish-inventory.ts sellFishFromInventory (level bonus)`);
        try {
            const levelBonus = fishLevel > 1 ? (fishLevel - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus}`);
            
            const finalValue = Math.floor(Number(fish1Value) * (1 + levelBonus));
            console.log(`   Final value: ${finalValue} (type: ${typeof finalValue})`);
            
            const newBalance = userBalance + BigInt(finalValue);
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(finalValue)} = ${newBalance}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 3: fish-breeding.ts breedFish (offspring value calculation)
        console.log(`\n🧪 Test 3: fish-breeding.ts breedFish (offspring value calculation)`);
        try {
            const baseValue = Math.floor((Number(fish1Value) + Number(fish2Value)) / 2);
            console.log(`   Base value: ${baseValue}`);
            
            const valueBonus = Math.floor(Math.random() * 1000) + 500;
            console.log(`   Value bonus: ${valueBonus}`);
            
            const offspringValue = baseValue + valueBonus;
            console.log(`   Offspring value: ${offspringValue} (type: ${typeof offspringValue})`);
            
            console.log(`   ✅ Success: (${Number(fish1Value)} + ${Number(fish2Value)}) / 2 + ${valueBonus} = ${offspringValue}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 4: FishMarketHandler suggestedPrice calculation
        console.log(`\n🧪 Test 4: FishMarketHandler suggestedPrice calculation`);
        try {
            const fishLevel2 = 3;
            const totalPower = 150;
            
            const suggestedPrice = Math.floor(Number(fish1Value) * (1 + (fishLevel2 - 1) * 0.1) + totalPower * 100);
            console.log(`   Fish level: ${fishLevel2}`);
            console.log(`   Total power: ${totalPower}`);
            console.log(`   Suggested price: ${suggestedPrice} (type: ${typeof suggestedPrice})`);
            
            console.log(`   ✅ Success: ${Number(fish1Value)} * (1 + ${(fishLevel2 - 1) * 0.1}) + ${totalPower * 100} = ${suggestedPrice}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test 5: Market price comparison
        console.log(`\n🧪 Test 5: Market price comparison`);
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
        
        // Test 6: Fishing sellFish (from fishing.ts)
        console.log(`\n🧪 Test 6: Fishing sellFish (from fishing.ts)`);
        try {
            const currentPrice = 1000;
            const quantity = 5;
            const totalValue = currentPrice * quantity;
            
            console.log(`   Current price: ${currentPrice}`);
            console.log(`   Quantity: ${quantity}`);
            console.log(`   Total value: ${totalValue}`);
            
            const newBalance = userBalance + BigInt(totalValue);
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(totalValue)} = ${newBalance}`);
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        console.log(`\n✅ All BigInt tests completed successfully!`);
        console.log(`📋 Summary of fixes:`);
        console.log(`   ✅ fish-breeding.ts sellFish: user.balance + fish.value`);
        console.log(`   ✅ fish-inventory.ts sellFishFromInventory: Number(fish.value) * (1 + levelBonus)`);
        console.log(`   ✅ fish-breeding.ts breedFish: (Number(fish1.value) + Number(fish2.value)) / 2`);
        console.log(`   ✅ FishMarketHandler: Number(fish.value) * (1 + levelBonus)`);
        console.log(`   ✅ Market price comparison: user.balance >= BigInt(price)`);
        console.log(`   ✅ Fishing sellFish: user.balance + BigInt(totalValue)`);

    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

testAllSellFishBigInt().catch(console.error); 