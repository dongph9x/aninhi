import { FISH_LIST, FishDataService } from '../src/config/fish-data';

console.log('🐟 Thống kê chi tiết Dữ liệu Cá Mới\n');

// Thống kê tổng quan
console.log('📊 THỐNG KÊ TỔNG QUAN:');
console.log(`- Tổng số loại cá: ${FISH_LIST.length}`);
console.log(`- Cá nước ngọt: ${FishDataService.getFishByHabitat('freshwater').length} loại`);
console.log(`- Cá nước mặn: ${FishDataService.getFishByHabitat('saltwater').length} loại\n`);

// Thống kê theo rarity
console.log('🏷️ PHÂN LOẠI THEO RARITY:');
const rarityCounts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
};

FISH_LIST.forEach(fish => {
    rarityCounts[fish.rarity]++;
});

Object.entries(rarityCounts).forEach(([rarity, count]) => {
    const percentage = ((count / FISH_LIST.length) * 100).toFixed(1);
    console.log(`- ${rarity.toUpperCase()}: ${count} loại (${percentage}%)`);
});
console.log('');

// Thống kê theo habitat
console.log('🌊 PHÂN LOẠI THEO HABITAT:');
const habitatCounts = {
    freshwater: 0,
    saltwater: 0
};

FISH_LIST.forEach(fish => {
    if (fish.habitat) {
        habitatCounts[fish.habitat]++;
    }
});

Object.entries(habitatCounts).forEach(([habitat, count]) => {
    const percentage = ((count / FISH_LIST.length) * 100).toFixed(1);
    console.log(`- ${habitat}: ${count} loại (${percentage}%)`);
});
console.log('');

// Thống kê theo mùa
console.log('🌸 PHÂN LOẠI THEO MÙA:');
const seasonCounts = {
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0,
    all: 0
};

FISH_LIST.forEach(fish => {
    if (fish.season) {
        if (fish.season.includes('all')) {
            seasonCounts.all++;
        } else {
            fish.season.forEach(season => {
                seasonCounts[season]++;
            });
        }
    }
});

Object.entries(seasonCounts).forEach(([season, count]) => {
    if (count > 0) {
        const percentage = ((count / FISH_LIST.length) * 100).toFixed(1);
        console.log(`- ${season}: ${count} loại (${percentage}%)`);
    }
});
console.log('');

// Thống kê theo thời tiết
console.log('🌤️ PHÂN LOẠI THEO THỜI TIẾT:');
const weatherCounts = {
    sunny: 0,
    cloudy: 0,
    rainy: 0,
    stormy: 0,
    all: 0
};

FISH_LIST.forEach(fish => {
    if (fish.weather) {
        if (fish.weather.includes('all')) {
            weatherCounts.all++;
        } else {
            fish.weather.forEach(weather => {
                weatherCounts[weather]++;
            });
        }
    }
});

Object.entries(weatherCounts).forEach(([weather, count]) => {
    if (count > 0) {
        const percentage = ((count / FISH_LIST.length) * 100).toFixed(1);
        console.log(`- ${weather}: ${count} loại (${percentage}%)`);
    }
});
console.log('');

// Thống kê theo thời gian
console.log('⏰ PHÂN LOẠI THEO THỜI GIAN:');
const timeCounts = {
    day: 0,
    night: 0,
    all: 0
};

FISH_LIST.forEach(fish => {
    if (fish.timeOfDay) {
        if (fish.timeOfDay.includes('all')) {
            timeCounts.all++;
        } else {
            fish.timeOfDay.forEach(time => {
                timeCounts[time]++;
            });
        }
    }
});

Object.entries(timeCounts).forEach(([time, count]) => {
    if (count > 0) {
        const percentage = ((count / FISH_LIST.length) * 100).toFixed(1);
        console.log(`- ${time}: ${count} loại (${percentage}%)`);
    }
});
console.log('');

// Thống kê khả năng đặc biệt
console.log('✨ KHẢ NĂNG ĐẶC BIỆT:');
const specialFish = FishDataService.getFishWithSpecialAbilities();
console.log(`- Cá có khả năng đặc biệt: ${specialFish.length} loại`);

const abilityCounts: Record<string, number> = {};
specialFish.forEach(fish => {
    fish.specialAbilities?.forEach(ability => {
        abilityCounts[ability] = (abilityCounts[ability] || 0) + 1;
    });
});

Object.entries(abilityCounts).forEach(([ability, count]) => {
    console.log(`  • ${ability}: ${count} loại cá`);
});
console.log('');

// Thống kê thống kê chiến đấu
console.log('⚔️ THỐNG KÊ CHIẾN ĐẤU:');
const battleFish = FishDataService.getFishWithBattleStats();
console.log(`- Cá có thống kê chiến đấu: ${battleFish.length} loại`);

// Tính trung bình các chỉ số
let totalAttack = 0, totalDefense = 0, totalSpeed = 0, totalHealth = 0;
battleFish.forEach(fish => {
    if (fish.battleStats) {
        totalAttack += fish.battleStats.attack;
        totalDefense += fish.battleStats.defense;
        totalSpeed += fish.battleStats.speed;
        totalHealth += fish.battleStats.health;
    }
});

const avgAttack = (totalAttack / battleFish.length).toFixed(1);
const avgDefense = (totalDefense / battleFish.length).toFixed(1);
const avgSpeed = (totalSpeed / battleFish.length).toFixed(1);
const avgHealth = (totalHealth / battleFish.length).toFixed(1);

console.log(`- Trung bình Attack: ${avgAttack}`);
console.log(`- Trung bình Defense: ${avgDefense}`);
console.log(`- Trung bình Speed: ${avgSpeed}`);
console.log(`- Trung bình Health: ${avgHealth}`);
console.log('');

// Hiển thị cá mới được thêm
console.log('🆕 CÁ MỚI ĐƯỢC THÊM:');

// Cá thường mới
const newCommonFish = [
    "Cá diếc", "Cá trôi", "Cá mè vinh", "Cá rô đồng", "Cá chạch",
    "Cá trê phi", "Cá rô phi đen", "Cá mè trắng", "Cá chép koi", "Cá vàng"
];

console.log('🐟 Cá thường mới (10 loại):');
newCommonFish.forEach(fish => {
    const fishData = FishDataService.getFishByName(fish);
    if (fishData) {
        console.log(`  • ${fishData.name} (${fishData.emoji}) - ${fishData.description}`);
    }
});

// Cá hiếm mới
const newRareFish = [
    "Cá rô phi sọc", "Cá chép trắng", "Cá trắm đen", "Cá mè hoa", "Cá rô đồng lớn",
    "Cá chạch bùn", "Cá trê phi đen", "Cá rô phi đỏ", "Cá mè trắng lớn"
];

console.log('\n🐠 Cá hiếm mới (9 loại):');
newRareFish.forEach(fish => {
    const fishData = FishDataService.getFishByName(fish);
    if (fishData) {
        console.log(`  • ${fishData.name} (${fishData.emoji}) - ${fishData.description}`);
    }
});

// Cá quý hiếm mới
const newEpicFish = [
    "Cá lóc khổng lồ", "Cá trê khổng lồ", "Cá quả khổng lồ", "Cá chình khổng lồ",
    "Cá rô phi khổng lồ", "Cá chép khổng lồ", "Cá trắm khổng lồ", "Cá mè khổng lồ",
    "Cá rô đồng khổng lồ", "Cá chạch khổng lồ"
];

console.log('\n🦈 Cá quý hiếm mới (10 loại):');
newEpicFish.forEach(fish => {
    const fishData = FishDataService.getFishByName(fish);
    if (fishData) {
        console.log(`  • ${fishData.name} (${fishData.emoji}) - ${fishData.description}`);
    }
});

// Cá huyền thoại mới
const newLegendaryFish = [
    "Cá rồng nước ngọt", "Cá thần nước ngọt", "Vua nước ngọt"
];

console.log('\n🐉 Cá huyền thoại mới (3 loại):');
newLegendaryFish.forEach(fish => {
    const fishData = FishDataService.getFishByName(fish);
    if (fishData) {
        console.log(`  • ${fishData.name} (${fishData.emoji}) - ${fishData.description}`);
        if (fishData.specialAbilities) {
            console.log(`    Khả năng: ${fishData.specialAbilities.join(', ')}`);
        }
    }
});

console.log('\n✅ Thống kê hoàn thành!');
console.log(`📈 Tổng cộng đã thêm: ${newCommonFish.length + newRareFish.length + newEpicFish.length + newLegendaryFish.length} loại cá mới`); 