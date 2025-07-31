import { FISH_LIST, FISHING_RODS, BAITS } from '../src/config/fish-data';

console.log('🐟 Testing Fish Data Import\n');

try {
    // Test 1: Kiểm tra FISH_LIST
    console.log('📊 Test 1: FISH_LIST');
    console.log('Type:', typeof FISH_LIST);
    console.log('Is Array:', Array.isArray(FISH_LIST));
    console.log('Length:', FISH_LIST.length);
    console.log('Sample:', FISH_LIST[0]);

    // Test 2: Kiểm tra FISHING_RODS
    console.log('\n🎣 Test 2: FISHING_RODS');
    console.log('Type:', typeof FISHING_RODS);
    console.log('Is Object:', typeof FISHING_RODS === 'object');
    console.log('Keys:', Object.keys(FISHING_RODS));
    console.log('Basic rod:', FISHING_RODS.basic);
    console.log('Good rod:', FISHING_RODS.good);

    // Test 3: Kiểm tra BAITS
    console.log('\n🪱 Test 3: BAITS');
    console.log('Type:', typeof BAITS);
    console.log('Is Object:', typeof BAITS === 'object');
    console.log('Keys:', Object.keys(BAITS));
    console.log('Basic bait:', BAITS.basic);
    console.log('Good bait:', BAITS.good);

    // Test 4: Test truy cập trực tiếp
    console.log('\n🔍 Test 4: Direct Access');
    console.log('FISHING_RODS.basic:', FISHING_RODS.basic);
    console.log('FISHING_RODS.good:', FISHING_RODS.good);
    console.log('BAITS.basic:', BAITS.basic);
    console.log('BAITS.good:', BAITS.good);

    // Test 5: Test Object.entries
    console.log('\n📋 Test 5: Object.entries');
    console.log('FISHING_RODS entries:', Object.entries(FISHING_RODS).length);
    console.log('BAITS entries:', Object.entries(BAITS).length);

    console.log('\n✅ Tất cả test hoàn thành!');

} catch (error) {
    console.error('❌ Lỗi trong test:', error);
} 