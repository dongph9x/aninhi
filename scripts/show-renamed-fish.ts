import { FISH_LIST, FishDataService } from '../src/config/fish-data';

console.log('🐟 Danh sách Cá đã được đổi tên theo tên thực tế\n');

// Hiển thị cá theo rarity
const rarityNames = {
    common: "🐟 CÁ THƯỜNG",
    rare: "🐠 CÁ HIẾM", 
    epic: "🦈 CÁ QUÝ HIẾM",
    legendary: "🐉 CÁ HUYỀN THOẠI"
};

Object.entries(rarityNames).forEach(([rarity, title]) => {
    const fishList = FishDataService.getFishByRarity(rarity);
    console.log(`${title} (${fishList.length} loại):`);
    
    fishList.forEach((fish, index) => {
        console.log(`  ${index + 1}. ${fish.name} (${fish.emoji})`);
        console.log(`     Mô tả: ${fish.description}`);
        console.log(`     Giá trị: ${fish.minValue.toLocaleString()} - ${fish.maxValue.toLocaleString()}`);
        console.log(`     Tỷ lệ: ${fish.chance}%`);
        console.log(`     Môi trường: ${fish.habitat}`);
        
        if (fish.season) {
            console.log(`     Mùa: ${fish.season.join(', ')}`);
        }
        if (fish.weather) {
            console.log(`     Thời tiết: ${fish.weather.join(', ')}`);
        }
        if (fish.timeOfDay) {
            console.log(`     Thời gian: ${fish.timeOfDay.join(', ')}`);
        }
        if (fish.specialAbilities) {
            console.log(`     Khả năng đặc biệt: ${fish.specialAbilities.join(', ')}`);
        }
        if (fish.battleStats) {
            console.log(`     Thống kê chiến đấu: ATK ${fish.battleStats.attack}, DEF ${fish.battleStats.defense}, SPD ${fish.battleStats.speed}, HP ${fish.battleStats.health}`);
        }
        console.log('');
    });
});

// Hiển thị thống kê theo habitat
console.log('🌊 THỐNG KÊ THEO MÔI TRƯỜNG:');
const freshwaterFish = FishDataService.getFishByHabitat('freshwater');
const saltwaterFish = FishDataService.getFishByHabitat('saltwater');

console.log(`🐟 Cá nước ngọt: ${freshwaterFish.length} loại`);
console.log(`🌊 Cá nước mặn: ${saltwaterFish.length} loại`);
console.log('');

// Hiển thị cá có khả năng đặc biệt
console.log('✨ CÁ CÓ KHẢ NĂNG ĐẶC BIỆT:');
const specialFish = FishDataService.getFishWithSpecialAbilities();
specialFish.forEach((fish, index) => {
    console.log(`  ${index + 1}. ${fish.name} (${fish.emoji})`);
    console.log(`     Khả năng: ${fish.specialAbilities?.join(', ')}`);
    console.log(`     Mô tả: ${fish.description}`);
    console.log('');
});

// Hiển thị cá có thống kê chiến đấu mạnh nhất
console.log('⚔️ TOP 10 CÁ CHIẾN ĐẤU MẠNH NHẤT:');
const battleFish = FishDataService.getFishWithBattleStats();
const sortedBattleFish = battleFish
    .filter(fish => fish.battleStats)
    .sort((a, b) => {
        const aTotal = (a.battleStats?.attack || 0) + (a.battleStats?.defense || 0) + (a.battleStats?.speed || 0) + (a.battleStats?.health || 0);
        const bTotal = (b.battleStats?.attack || 0) + (b.battleStats?.defense || 0) + (b.battleStats?.speed || 0) + (b.battleStats?.health || 0);
        return bTotal - aTotal;
    })
    .slice(0, 10);

sortedBattleFish.forEach((fish, index) => {
    if (fish.battleStats) {
        const total = fish.battleStats.attack + fish.battleStats.defense + fish.battleStats.speed + fish.battleStats.health;
        console.log(`  ${index + 1}. ${fish.name} (${fish.emoji}) - Tổng: ${total}`);
        console.log(`     ATK: ${fish.battleStats.attack}, DEF: ${fish.battleStats.defense}, SPD: ${fish.battleStats.speed}, HP: ${fish.battleStats.health}`);
        console.log('');
    }
});

console.log('✅ Danh sách hoàn thành!');
console.log(`📊 Tổng cộng: ${FISH_LIST.length} loại cá với tên thực tế`); 