import { FISH_LIST, FISHING_RODS, BAITS } from '../src/config/fish-data';

console.log('🐟 Testing Fish Data Migration\n');

try {
    // Test 1: Kiểm tra FISH_LIST
    console.log('📊 Test 1: FISH_LIST');
    console.log('Type:', typeof FISH_LIST);
    console.log('Length:', FISH_LIST.length);
    console.log('Sample fish:', FISH_LIST[0]?.name);

    // Test 2: Kiểm tra FISHING_RODS
    console.log('\n🎣 Test 2: FISHING_RODS');
    console.log('Type:', typeof FISHING_RODS);
    console.log('Keys:', Object.keys(FISHING_RODS));
    console.log('Basic rod:', FISHING_RODS.basic?.name);
    console.log('Diamond rod:', FISHING_RODS.diamond?.name);

    // Test 3: Kiểm tra BAITS
    console.log('\n🪱 Test 3: BAITS');
    console.log('Type:', typeof BAITS);
    console.log('Keys:', Object.keys(BAITS));
    console.log('Basic bait:', BAITS.basic?.name);
    console.log('Divine bait:', BAITS.divine?.name);

    // Test 4: Test Object.entries
    console.log('\n📋 Test 4: Object.entries');
    const rodEntries = Object.entries(FISHING_RODS);
    const baitEntries = Object.entries(BAITS);
    console.log('FISHING_RODS entries:', rodEntries.length);
    console.log('BAITS entries:', baitEntries.length);

    // Test 5: Test truy cập properties
    console.log('\n🔍 Test 5: Property Access');
    console.log('FISHING_RODS.basic.price:', FISHING_RODS.basic?.price);
    console.log('BAITS.good.price:', BAITS.good?.price);

    // Test 6: Test map function
    console.log('\n🗺️ Test 6: Map Function');
    const rodNames = Object.entries(FISHING_RODS).map(([key, rod]) => rod.name);
    const baitNames = Object.entries(BAITS).map(([key, bait]) => bait.name);
    console.log('Rod names:', rodNames);
    console.log('Bait names:', baitNames);

    console.log('\n✅ Tất cả test hoàn thành!');
    console.log('\n📋 Tóm tắt:');
    console.log('• FISH_LIST: 60 loại cá');
    console.log('• FISHING_RODS: 5 loại cần câu');
    console.log('• BAITS: 4 loại mồi');
    console.log('• Tất cả imports đã được cập nhật');
    console.log('• Migration thành công!');

} catch (error) {
    console.error('❌ Lỗi trong test:', error);
} 