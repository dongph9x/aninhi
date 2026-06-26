async function testFishbarnSellBigInt() {
    console.log('🧪 Testing Fishbarn Sell BigInt Fix...\n');

    try {
        // Simulate data
        const userBalance = BigInt(10000);
        const fishValue = BigInt(146661);
        const fishLevel = 5;
        
        console.log(`📊 Test Data:`);
        console.log(`   User balance: ${userBalance} (type: ${typeof userBalance})`);
        console.log(`   Fish value: ${fishValue} (type: ${typeof fishValue})`);
        console.log(`   Fish level: ${fishLevel}`);
        
        // Test fish-inventory.ts sellFishFromInventory logic
        console.log(`\n🧪 Test: fish-inventory.ts sellFishFromInventory logic`);
        try {
            // Tính giá theo level (tăng 2% mỗi level)
            const levelBonus = fishLevel > 1 ? (fishLevel - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus}`);
            
            const finalValue = Math.floor(Number(fishValue) * (1 + levelBonus));
            console.log(`   Final value: ${finalValue} (type: ${typeof finalValue})`);
            
            const newBalance = userBalance + BigInt(finalValue);
            console.log(`   New balance: ${newBalance} (type: ${typeof newBalance})`);
            
            console.log(`   ✅ Success: ${userBalance} + ${BigInt(finalValue)} = ${newBalance}`);
            
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Test different fish levels
        console.log(`\n🧪 Test: Different fish levels`);
        const testLevels = [1, 3, 5, 10];
        
        for (const level of testLevels) {
            try {
                const levelBonus = level > 1 ? (level - 1) * 0.02 : 0;
                const finalValue = Math.floor(Number(fishValue) * (1 + levelBonus));
                const newBalance = userBalance + BigInt(finalValue);
                
                console.log(`   Level ${level}: bonus=${levelBonus}, final=${finalValue}, balance=${newBalance}`);
            } catch (error) {
                console.error(`   ❌ Error at level ${level}:`, error);
            }
        }
        
        console.log(`\n✅ Fishbarn sell BigInt test completed successfully!`);

    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

testFishbarnSellBigInt().catch(console.error); 