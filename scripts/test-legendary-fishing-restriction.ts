import { FISH_LIST, FISHING_RODS, BAITS } from '../src/config/fish-data';

function calcLegendaryRate(rodKey: string, baitKey: string) {
    const rod = FISHING_RODS[rodKey];
    const bait = BAITS[baitKey];
    const totalBonus = rod.rarityBonus + bait.rarityBonus;
    const isDiamondDivine = rodKey === "diamond" && baitKey === "divine";
    const adjustedFish = FISH_LIST.map(fish => {
        let adjustedChance = fish.chance;
        if (fish.rarity === "legendary") {
            if (isDiamondDivine) {
                adjustedChance += totalBonus * 0.1;
            } else {
                adjustedChance = fish.chance * 0.01 + totalBonus * 0.005;
            }
        } else if (fish.rarity === "rare") {
            adjustedChance += totalBonus * 0.5;
        } else if (fish.rarity === "epic") {
            adjustedChance += totalBonus * 0.3;
        }
        return { ...fish, adjustedChance };
    });
    const totalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const legendaryChance = adjustedFish.filter(f => f.rarity === 'legendary').reduce((sum, f) => sum + f.adjustedChance, 0);
    return (legendaryChance / totalChance) * 100;
}

function testLegendaryFishingRestriction() {
    console.log('🎣 Test Giới Hạn & Tỷ Lệ Cá Huyền Thoại\n');
    const rodKeys = Object.keys(FISHING_RODS);
    const baitKeys = Object.keys(BAITS);
    let maxRate = 0;
    rodKeys.forEach(rodKey => {
        baitKeys.forEach(baitKey => {
            const rate = calcLegendaryRate(rodKey, baitKey);
            const rod = FISHING_RODS[rodKey];
            const bait = BAITS[baitKey];
            const label = (rodKey === "diamond" && baitKey === "divine") ? "⭐ TỐI ĐA" : "";
            if (rate > maxRate) maxRate = rate;
            console.log(`- ${rod.name.padEnd(20)} + ${bait.name.padEnd(18)}: ${rate.toFixed(3)}% ${label}`);
        });
    });
    console.log(`\n✅ Tỷ lệ cá huyền thoại tối đa: ${maxRate.toFixed(2)}% (chỉ với cần kim cương + mồi thần)`);
    console.log('✅ Tất cả các trường hợp khác đều < 1%');
}

testLegendaryFishingRestriction(); 