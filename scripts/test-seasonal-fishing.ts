import { SeasonalFishingService } from '../src/utils/seasonal-fishing';

async function testSeasonalFishing() {
    console.log('🌍 Testing Seasonal Fishing System (30-minute cycles)...\n');

    // Test 1: Lấy mùa hiện tại
    console.log('1. Current Season Test:');
    const currentSeason = SeasonalFishingService.getCurrentSeason();
    const seasonConfig = SeasonalFishingService.getCurrentSeasonConfig();
    console.log(`   Current season: ${currentSeason}`);
    console.log(`   Season name: ${seasonConfig.name}`);
    console.log(`   Season emoji: ${seasonConfig.emoji}`);
    console.log(`   Description: ${seasonConfig.description}`);

    // Test 2: Tính cooldown theo mùa
    console.log('\n2. Seasonal Cooldown Test:');
    const seasonalCooldown = SeasonalFishingService.getSeasonalCooldown();
    console.log(`   Base cooldown: 30 seconds`);
    console.log(`   Seasonal cooldown: ${seasonalCooldown} seconds`);
    console.log(`   Cooldown multiplier: ${seasonConfig.cooldownMultiplier}`);

    // Test 3: Tính giá trị cá theo mùa
    console.log('\n3. Seasonal Fish Value Test:');
    const testValues = [100, 500, 1000, 5000];
    testValues.forEach(baseValue => {
        const seasonalValue = SeasonalFishingService.getSeasonalFishValue(baseValue);
        const percentChange = Math.round(((seasonalValue - baseValue) / baseValue) * 100);
        console.log(`   Base value: ${baseValue} → Seasonal value: ${seasonalValue} (${percentChange >= 0 ? '+' : ''}${percentChange}%)`);
    });

    // Test 4: Tính tỷ lệ may mắn theo mùa
    console.log('\n4. Seasonal Luck Test:');
    const luckMultiplier = SeasonalFishingService.getSeasonalLuckMultiplier();
    const luckPercent = Math.round((luckMultiplier - 1) * 100);
    console.log(`   Luck multiplier: ${luckMultiplier}`);
    console.log(`   Luck change: ${luckPercent >= 0 ? '+' : ''}${luckPercent}%`);

    // Test 5: Thời gian mùa
    console.log('\n5. Season Time Test:');
    const remainingTime = SeasonalFishingService.getRemainingSeasonTime();
    const elapsedTime = SeasonalFishingService.getElapsedSeasonTime();
    console.log(`   Elapsed time: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`);
    console.log(`   Remaining time: ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}`);
    console.log(`   Total season duration: 30 minutes`);

    // Test 6: Mùa tiếp theo
    console.log('\n6. Next Season Test:');
    const nextSeason = SeasonalFishingService.getNextSeason();
    const nextSeasonConfig = SeasonalFishingService.getCurrentSeasonConfig();
    console.log(`   Current season: ${currentSeason}`);
    console.log(`   Next season: ${nextSeason}`);
    console.log(`   Next season name: ${nextSeasonConfig.name}`);

    // Test 7: Tạo embed thông tin mùa
    console.log('\n7. Season Info Embed Test:');
    const seasonEmbed = SeasonalFishingService.createSeasonInfoEmbed();
    console.log(`   Embed title: ${seasonEmbed.data.title}`);
    console.log(`   Embed description: ${seasonEmbed.data.description}`);
    console.log(`   Embed fields count: ${seasonEmbed.data.fields?.length || 0}`);

    // Test 8: Lấy tất cả thông tin mùa
    console.log('\n8. All Seasons Info Test:');
    const allSeasonsEmbed = SeasonalFishingService.getAllSeasonsInfo();
    console.log(`   All seasons embed title: ${allSeasonsEmbed.data.title}`);
    console.log(`   All seasons fields count: ${allSeasonsEmbed.data.fields?.length || 0}`);

    // Test 9: Kiểm tra mùa xuân
    console.log('\n9. Spring Season Test:');
    const isSpring = SeasonalFishingService.isSpringSeason();
    console.log(`   Is spring season: ${isSpring}`);

    // Test 10: Thông tin mùa dưới dạng text
    console.log('\n10. Season Info Text Test:');
    const seasonInfoText = SeasonalFishingService.getSeasonInfoText();
    console.log(`   Season info text: ${seasonInfoText}`);

    // Test 11: Thông tin mùa tiếp theo
    console.log('\n11. Next Season Info Test:');
    const nextSeasonInfo = SeasonalFishingService.getNextSeasonInfo();
    console.log(`   Next season info: ${nextSeasonInfo}`);

    // Test 12: Test các mùa khác nhau (simulate)
    console.log('\n12. Different Seasons Simulation:');
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    seasons.forEach(season => {
        // Simulate different seasons by temporarily overriding getCurrentSeason
        const originalGetCurrentSeason = SeasonalFishingService.getCurrentSeason;
        (SeasonalFishingService as any).getCurrentSeason = () => season;
        
        const simulatedCooldown = SeasonalFishingService.getSeasonalCooldown();
        const simulatedValue = SeasonalFishingService.getSeasonalFishValue(1000);
        const simulatedLuck = SeasonalFishingService.getSeasonalLuckMultiplier();
        
        console.log(`   ${season}: Cooldown ${simulatedCooldown}s, Value ${simulatedValue}, Luck ${simulatedLuck}`);
        
        // Restore original function
        (SeasonalFishingService as any).getCurrentSeason = originalGetCurrentSeason;
    });

    // Test 13: Test chu kỳ thời gian
    console.log('\n13. Time Cycle Test:');
    const now = Date.now();
    const seasonDuration = 30 * 60 * 1000; // 30 phút
    const timeInCycle = now % seasonDuration;
    const minutesInCycle = Math.floor(timeInCycle / (60 * 1000));
    const secondsInCycle = Math.floor((timeInCycle % (60 * 1000)) / 1000);
    
    console.log(`   Current time: ${new Date().toLocaleTimeString()}`);
    console.log(`   Time in current cycle: ${minutesInCycle}:${secondsInCycle.toString().padStart(2, '0')}`);
    console.log(`   Season changes every: 30 minutes`);

    console.log('\n✅ Seasonal Fishing System Test Completed!');
    console.log('🌍 Seasons now change every 30 minutes instead of monthly!');
}

// Run the test
testSeasonalFishing().catch(console.error);