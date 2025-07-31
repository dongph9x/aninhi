import { FISH_LIST, FISHING_RODS, BAITS, FishDataService } from '../src/config/fish-data';

console.log('🐟 Testing Fish Data Management System\n');

// Test 1: Hiển thị tổng quan
console.log('📊 Tổng quan dữ liệu:');
console.log(`- Tổng số loại cá: ${FISH_LIST.length}`);
console.log(`- Tổng số loại cần câu: ${Object.keys(FISHING_RODS).length}`);
console.log(`- Tổng số loại mồi: ${Object.keys(BAITS).length}\n`);

// Test 2: Phân loại theo rarity
console.log('🏷️ Phân loại theo Rarity:');
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
    console.log(`- ${rarity}: ${count} loại`);
});
console.log('');

// Test 3: Test các hàm tiện ích
console.log('🔍 Test các hàm tiện ích:');

// Test lấy cá theo rarity
const legendaryFish = FishDataService.getFishByRarity('legendary');
console.log(`- Cá huyền thoại: ${legendaryFish.length} loại`);
legendaryFish.forEach(fish => {
    console.log(`  • ${fish.name} (${fish.emoji}) - ${fish.description}`);
});

// Test lấy cá theo habitat
const freshwaterFish = FishDataService.getFishByHabitat('freshwater');
const saltwaterFish = FishDataService.getFishByHabitat('saltwater');
console.log(`\n- Cá nước ngọt: ${freshwaterFish.length} loại`);
console.log(`- Cá nước mặn: ${saltwaterFish.length} loại`);

// Test lấy cá theo mùa
const springFish = FishDataService.getFishBySeason('spring');
console.log(`\n- Cá mùa xuân: ${springFish.length} loại`);

// Test lấy cá có khả năng đặc biệt
const specialFish = FishDataService.getFishWithSpecialAbilities();
console.log(`\n- Cá có khả năng đặc biệt: ${specialFish.length} loại`);
specialFish.forEach(fish => {
    console.log(`  • ${fish.name}: ${fish.specialAbilities?.join(', ')}`);
});

// Test lấy cá có thống kê chiến đấu
const battleFish = FishDataService.getFishWithBattleStats();
console.log(`\n- Cá có thống kê chiến đấu: ${battleFish.length} loại`);

// Test 4: Hiển thị thông tin cần câu
console.log('\n🎣 Thông tin cần câu:');
Object.entries(FISHING_RODS).forEach(([type, rod]) => {
    console.log(`- ${rod.name} (${type}): ${rod.emoji}`);
    console.log(`  Giá: ${rod.price.toLocaleString()} | Bonus: +${rod.rarityBonus}% | Độ bền: ${rod.durability}`);
    if (rod.specialEffects) {
        console.log(`  Hiệu ứng đặc biệt: ${rod.specialEffects.join(', ')}`);
    }
});

// Test 5: Hiển thị thông tin mồi
console.log('\n🪱 Thông tin mồi:');
Object.entries(BAITS).forEach(([type, bait]) => {
    console.log(`- ${bait.name} (${type}): ${bait.emoji}`);
    console.log(`  Giá: ${bait.price.toLocaleString()} | Bonus: +${bait.rarityBonus}%`);
    if (bait.specialEffects) {
        console.log(`  Hiệu ứng đặc biệt: ${bait.specialEffects.join(', ')}`);
    }
});

// Test 6: Test tìm kiếm cá theo tên
console.log('\n🔎 Test tìm kiếm:');
const testFishNames = ['Cá rô phi', 'Cá voi xanh', 'Cá không tồn tại'];
testFishNames.forEach(name => {
    const fish = FishDataService.getFishByName(name);
    if (fish) {
        console.log(`✓ Tìm thấy: ${fish.name} (${fish.rarity})`);
    } else {
        console.log(`✗ Không tìm thấy: ${name}`);
    }
});

// Test 7: Test lấy cần câu và mồi
console.log('\n🎣 Test lấy cần câu và mồi:');
const testRodTypes = ['basic', 'diamond', 'không tồn tại'];
testRodTypes.forEach(type => {
    const rod = FishDataService.getRodByType(type);
    if (rod) {
        console.log(`✓ Cần câu ${type}: ${rod.name}`);
    } else {
        console.log(`✗ Không tìm thấy cần câu: ${type}`);
    }
});

const testBaitTypes = ['basic', 'divine', 'không tồn tại'];
testBaitTypes.forEach(type => {
    const bait = FishDataService.getBaitByType(type);
    if (bait) {
        console.log(`✓ Mồi ${type}: ${bait.name}`);
    } else {
        console.log(`✗ Không tìm thấy mồi: ${type}`);
    }
});

console.log('\n✅ Test hoàn thành!'); 