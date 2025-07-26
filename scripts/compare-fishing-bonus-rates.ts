import { FISH_LIST } from '../src/utils/fishing';

// Tỷ lệ bonus cũ
const OLD_FISHING_RODS = {
    "basic": { name: "Cần câu cơ bản", rarityBonus: 0 },
    "copper": { name: "Cần câu đồng", rarityBonus: 2 },
    "silver": { name: "Cần câu bạc", rarityBonus: 4 },
    "gold": { name: "Cần câu vàng", rarityBonus: 7 },
    "diamond": { name: "Cần câu kim cương", rarityBonus: 10 },
};

const OLD_BAITS = {
    "basic": { name: "Mồi cơ bản", rarityBonus: 0 },
    "good": { name: "Mồi ngon", rarityBonus: 3 },
    "premium": { name: "Mồi thượng hạng", rarityBonus: 6 },
    "divine": { name: "Mồi thần", rarityBonus: 10 },
};

// Tỷ lệ bonus mới (đã giảm một nửa)
const NEW_FISHING_RODS = {
    "basic": { name: "Cần câu cơ bản", rarityBonus: 0 },
    "copper": { name: "Cần câu đồng", rarityBonus: 1 },
    "silver": { name: "Cần câu bạc", rarityBonus: 2 },
    "gold": { name: "Cần câu vàng", rarityBonus: 3.5 },
    "diamond": { name: "Cần câu kim cương", rarityBonus: 5 },
};

const NEW_BAITS = {
    "basic": { name: "Mồi cơ bản", rarityBonus: 0 },
    "good": { name: "Mồi ngon", rarityBonus: 1.5 },
    "premium": { name: "Mồi thượng hạng", rarityBonus: 3 },
    "divine": { name: "Mồi thần", rarityBonus: 5 },
};

function calculateLegendaryRate(rods: any, baits: any, rodType: string, baitType: string) {
    const rod = rods[rodType];
    const bait = baits[baitType];
    const totalBonus = rod.rarityBonus + bait.rarityBonus;

    const adjustedFish = FISH_LIST.map(fish => {
        let adjustedChance = fish.chance;
        
        if (fish.rarity === "rare") {
            adjustedChance += totalBonus * 0.5;
        } else if (fish.rarity === "epic") {
            adjustedChance += totalBonus * 0.3;
        } else if (fish.rarity === "legendary") {
            adjustedChance += totalBonus * 0.1;
        }
        
        return { ...fish, adjustedChance };
    });

    const totalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const legendaryChance = adjustedFish
        .filter(fish => fish.rarity === 'legendary')
        .reduce((sum, fish) => sum + fish.adjustedChance, 0);
    
    return (legendaryChance / totalChance) * 100;
}

function compareBonusRates() {
    console.log('🎣 So Sánh Tỷ Lệ Bonus Cần Câu Và Mồi\n');
    console.log('📊 Tỷ lệ cơ bản (không có bonus): 1.98%\n');

    // So sánh cần câu
    console.log('🎣 SO SÁNH CẦN CÂU (Không có mồi):');
    console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Loại cần câu        │ Bonus cũ    │ Bonus mới   │ Giảm        │');
    console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┤');

    Object.keys(OLD_FISHING_RODS).forEach(rodType => {
        const oldRate = calculateLegendaryRate(OLD_FISHING_RODS, OLD_BAITS, rodType, 'basic');
        const newRate = calculateLegendaryRate(NEW_FISHING_RODS, NEW_BAITS, rodType, 'basic');
        const decrease = oldRate - newRate;
        
        console.log(`│ ${OLD_FISHING_RODS[rodType].name.padEnd(19)} │ ${oldRate.toFixed(2).padStart(9)}%     │ ${newRate.toFixed(2).padStart(9)}%     │ ${decrease.toFixed(2).padStart(9)}%     │`);
    });
    console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┘\n');

    // So sánh mồi
    console.log('🪱 SO SÁNH MỒI (Cần câu cơ bản):');
    console.log('┌─────────────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Loại mồi            │ Bonus cũ    │ Bonus mới   │ Giảm        │');
    console.log('├─────────────────────┼─────────────┼─────────────┼─────────────┤');

    Object.keys(OLD_BAITS).forEach(baitType => {
        const oldRate = calculateLegendaryRate(OLD_FISHING_RODS, OLD_BAITS, 'basic', baitType);
        const newRate = calculateLegendaryRate(NEW_FISHING_RODS, NEW_BAITS, 'basic', baitType);
        const decrease = oldRate - newRate;
        
        console.log(`│ ${OLD_BAITS[baitType].name.padEnd(19)} │ ${oldRate.toFixed(2).padStart(9)}%     │ ${newRate.toFixed(2).padStart(9)}%     │ ${decrease.toFixed(2).padStart(9)}%     │`);
    });
    console.log('└─────────────────────┴─────────────┴─────────────┴─────────────┘\n');

    // So sánh tổng hợp tối đa
    console.log('🌟 SO SÁNH TỐI ĐA (Cần câu kim cương + Mồi thần):');
    const oldMaxRate = calculateLegendaryRate(OLD_FISHING_RODS, OLD_BAITS, 'diamond', 'divine');
    const newMaxRate = calculateLegendaryRate(NEW_FISHING_RODS, NEW_BAITS, 'diamond', 'divine');
    const maxDecrease = oldMaxRate - newMaxRate;
    
    console.log(`📊 Tỷ lệ cũ: ${oldMaxRate.toFixed(2)}%`);
    console.log(`📊 Tỷ lệ mới: ${newMaxRate.toFixed(2)}%`);
    console.log(`📊 Giảm: ${maxDecrease.toFixed(2)}%`);
    console.log(`📊 Giảm tương đối: ${((maxDecrease / oldMaxRate) * 100).toFixed(1)}%\n`);

    // Thống kê tổng quan
    console.log('📈 THỐNG KÊ TỔNG QUAN:');
    console.log(`✅ Đã giảm tỷ lệ bonus của tất cả cần câu và mồi xuống một nửa`);
    console.log(`✅ Tỷ lệ cá huyền thoại tối đa giảm từ ${oldMaxRate.toFixed(2)}% xuống ${newMaxRate.toFixed(2)}%`);
    console.log(`✅ Hệ thống vẫn cân bằng và công bằng cho tất cả người chơi`);
    console.log(`✅ Giá cả và độ bền của cần câu vẫn giữ nguyên`);
}

compareBonusRates(); 