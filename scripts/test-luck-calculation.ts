import { SeasonalFishingService } from '../src/utils/seasonal-fishing';

function testLuckCalculation() {
    console.log('🍀 Testing Luck Calculation...\n');

    // Test 1: Kiểm tra hệ số may mắn theo mùa
    console.log('1. Seasonal Luck Multiplier Test:');
    const luckMultiplier = SeasonalFishingService.getSeasonalLuckMultiplier();
    const luckBonus = (luckMultiplier - 1) * 100;
    console.log(`   Luck multiplier: ${luckMultiplier}`);
    console.log(`   Luck bonus: ${luckBonus}%`);

    // Test 2: Tính toán tỷ lệ cá với may mắn
    console.log('\n2. Fish Chance Calculation Test:');
    
    // Giả lập dữ liệu cá
    const testFish = [
        { name: "Cá rô phi", chance: 25, rarity: "common" },
        { name: "Cá lóc", chance: 8, rarity: "rare" },
        { name: "Cá tầm", chance: 3, rarity: "epic" },
        { name: "Cá voi", chance: 0.8, rarity: "legendary" }
    ];

    testFish.forEach(fish => {
        const baseChance = fish.chance;
        const bonusChance = (baseChance * luckBonus / 100);
        const finalChance = baseChance + bonusChance;
        
        console.log(`   ${fish.name} (${fish.rarity}):`);
        console.log(`     Base chance: ${baseChance}%`);
        console.log(`     Luck bonus: +${bonusChance.toFixed(2)}%`);
        console.log(`     Final chance: ${finalChance.toFixed(2)}%`);
        console.log(`     Increase: +${((finalChance - baseChance) / baseChance * 100).toFixed(1)}%`);
    });

    // Test 3: So sánh logic cũ vs mới
    console.log('\n3. Old vs New Logic Comparison:');
    const testChance = 1; // 1% cơ bản
    
    // Logic cũ: nhân trực tiếp
    const oldLogic = testChance * luckMultiplier;
    
    // Logic mới: tăng % của tỷ lệ cơ bản
    const newLogic = testChance + (testChance * luckBonus / 100);
    
    console.log(`   Base chance: ${testChance}%`);
    console.log(`   Old logic (multiply): ${testChance}% × ${luckMultiplier} = ${oldLogic.toFixed(2)}%`);
    console.log(`   New logic (add bonus): ${testChance}% + (${testChance}% × ${luckBonus}%) = ${newLogic.toFixed(2)}%`);
    console.log(`   Difference: ${Math.abs(oldLogic - newLogic).toFixed(2)}%`);

    // Test 4: Test các mùa khác nhau
    console.log('\n4. Different Seasons Luck Test:');
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    seasons.forEach(season => {
        // Simulate different seasons
        const originalGetCurrentSeason = SeasonalFishingService.getCurrentSeason;
        (SeasonalFishingService as any).getCurrentSeason = () => season;
        
        const seasonLuckMultiplier = SeasonalFishingService.getSeasonalLuckMultiplier();
        const seasonLuckBonus = (seasonLuckMultiplier - 1) * 100;
        const testChance = 1;
        const finalChance = testChance + (testChance * seasonLuckBonus / 100);
        
        console.log(`   ${season}: Luck ${seasonLuckBonus >= 0 ? '+' : ''}${seasonLuckBonus}% → ${testChance}% → ${finalChance.toFixed(2)}%`);
        
        // Restore original function
        (SeasonalFishingService as any).getCurrentSeason = originalGetCurrentSeason;
    });

    // Test 5: Ví dụ thực tế
    console.log('\n5. Real Example Test:');
    const currentSeason = SeasonalFishingService.getCurrentSeason();
    const currentLuckBonus = (SeasonalFishingService.getSeasonalLuckMultiplier() - 1) * 100;
    
    console.log(`   Current season: ${currentSeason}`);
    console.log(`   Current luck bonus: ${currentLuckBonus >= 0 ? '+' : ''}${currentLuckBonus}%`);
    
    // Ví dụ với cá hiếm
    const rareFishChance = 8;
    const rareFishBonus = (rareFishChance * currentLuckBonus / 100);
    const rareFishFinal = rareFishChance + rareFishBonus;
    
    console.log(`   Rare fish example:`);
    console.log(`     Base: ${rareFishChance}%`);
    console.log(`     Bonus: +${rareFishBonus.toFixed(2)}%`);
    console.log(`     Final: ${rareFishFinal.toFixed(2)}%`);

    console.log('\n✅ Luck Calculation Test Completed!');
    console.log('🍀 New logic: Adds percentage bonus to base chance instead of multiplying');
}

// Run the test
testLuckCalculation();