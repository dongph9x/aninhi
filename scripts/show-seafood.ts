import { FISH_LIST, FishDataService } from '../src/config/fish-data';

console.log('🦐 Danh sách Thủy sản mới đã thêm\n');

// Lọc các loại thủy sản mới
const seafoodKeywords = ['tôm', 'cua', 'ghẹ', 'mực', 'ốc'];
const seafoodList = FISH_LIST.filter(fish => 
    seafoodKeywords.some(keyword => fish.name.toLowerCase().includes(keyword))
);

console.log(`📊 Tổng số loại thủy sản: ${seafoodList.length}\n`);

// Phân loại theo rarity
const rarityNames = {
    common: "🐟 THỦY SẢN THƯỜNG",
    rare: "🐠 THỦY SẢN HIẾM"
};

Object.entries(rarityNames).forEach(([rarity, title]) => {
    const seafoodByRarity = seafoodList.filter(fish => fish.rarity === rarity);
    if (seafoodByRarity.length > 0) {
        console.log(`${title} (${seafoodByRarity.length} loại):`);
        
        seafoodByRarity.forEach((seafood, index) => {
            console.log(`  ${index + 1}. ${seafood.name} (${seafood.emoji})`);
            console.log(`     Mô tả: ${seafood.description}`);
            console.log(`     Giá trị: ${seafood.minValue.toLocaleString()} - ${seafood.maxValue.toLocaleString()}`);
            console.log(`     Tỷ lệ: ${seafood.chance}%`);
            console.log(`     Môi trường: ${seafood.habitat}`);
            
            if (seafood.season) {
                console.log(`     Mùa: ${seafood.season.join(', ')}`);
            }
            if (seafood.weather) {
                console.log(`     Thời tiết: ${seafood.weather.join(', ')}`);
            }
            if (seafood.timeOfDay) {
                console.log(`     Thời gian: ${seafood.timeOfDay.join(', ')}`);
            }
            if (seafood.battleStats) {
                console.log(`     Thống kê chiến đấu: ATK ${seafood.battleStats.attack}, DEF ${seafood.battleStats.defense}, SPD ${seafood.battleStats.speed}, HP ${seafood.battleStats.health}`);
            }
            console.log('');
        });
    }
});

// Thống kê theo loại
console.log('📈 THỐNG KÊ THEO LOẠI:');
const seafoodTypes = {
    'Tôm': seafoodList.filter(fish => fish.name.toLowerCase().includes('tôm')),
    'Cua': seafoodList.filter(fish => fish.name.toLowerCase().includes('cua')),
    'Ghẹ': seafoodList.filter(fish => fish.name.toLowerCase().includes('ghẹ')),
    'Mực': seafoodList.filter(fish => fish.name.toLowerCase().includes('mực')),
    'Ốc': seafoodList.filter(fish => fish.name.toLowerCase().includes('ốc'))
};

Object.entries(seafoodTypes).forEach(([type, list]) => {
    if (list.length > 0) {
        console.log(`  ${type}: ${list.length} loại`);
        list.forEach(seafood => {
            console.log(`    • ${seafood.name} (${seafood.emoji}) - ${seafood.rarity}`);
        });
        console.log('');
    }
});

// Thống kê theo môi trường
console.log('🌊 THỐNG KÊ THEO MÔI TRƯỜNG:');
const saltwaterSeafood = seafoodList.filter(fish => fish.habitat === 'saltwater');
const freshwaterSeafood = seafoodList.filter(fish => fish.habitat === 'freshwater');

console.log(`  🌊 Nước mặn: ${saltwaterSeafood.length} loại`);
saltwaterSeafood.forEach(seafood => {
    console.log(`    • ${seafood.name} (${seafood.emoji})`);
});
console.log(`  🐟 Nước ngọt: ${freshwaterSeafood.length} loại`);
freshwaterSeafood.forEach(seafood => {
    console.log(`    • ${seafood.name} (${seafood.emoji})`);
});
console.log('');

// Thống kê theo giá trị
console.log('💰 THỐNG KÊ THEO GIÁ TRỊ:');
const sortedByValue = [...seafoodList].sort((a, b) => b.maxValue - a.maxValue);
console.log('  TOP 5 thủy sản có giá trị cao nhất:');
sortedByValue.slice(0, 5).forEach((seafood, index) => {
    console.log(`    ${index + 1}. ${seafood.name} (${seafood.emoji}) - ${seafood.maxValue.toLocaleString()}`);
});
console.log('');

// Thống kê theo tỷ lệ xuất hiện
console.log('📊 THỐNG KÊ THEO TỶ LỆ:');
const sortedByChance = [...seafoodList].sort((a, b) => b.chance - a.chance);
console.log('  TOP 5 thủy sản dễ câu nhất:');
sortedByChance.slice(0, 5).forEach((seafood, index) => {
    console.log(`    ${index + 1}. ${seafood.name} (${seafood.emoji}) - ${seafood.chance}%`);
});
console.log('');

// Thống kê chiến đấu
console.log('⚔️ THỐNG KÊ CHIẾN ĐẤU:');
const battleSeafood = seafoodList.filter(fish => fish.battleStats);
if (battleSeafood.length > 0) {
    console.log(`  Có ${battleSeafood.length} loại thủy sản có thống kê chiến đấu:`);
    battleSeafood.forEach(seafood => {
        if (seafood.battleStats) {
            const total = seafood.battleStats.attack + seafood.battleStats.defense + seafood.battleStats.speed + seafood.battleStats.health;
            console.log(`    • ${seafood.name} (${seafood.emoji}) - Tổng: ${total}`);
        }
    });
} else {
    console.log('  Không có thủy sản nào có thống kê chiến đấu');
}
console.log('');

console.log('✅ Danh sách thủy sản hoàn thành!');
console.log(`📊 Tổng cộng: ${seafoodList.length} loại thủy sản mới`); 