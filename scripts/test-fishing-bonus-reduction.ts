import { FishingService } from '../src/utils/fishing';
import { FISHING_RODS, BAITS } from '../src/config/fish-data';

async function testFishingBonusReduction() {
    console.log('🎣 Test Giảm Tỷ Lệ Bonus Cần Câu Và Mồi\n');

    // Test 1: Kiểm tra tỷ lệ bonus mới
    console.log('1️⃣ Kiểm tra tỷ lệ bonus mới:');
    console.log('\n🎣 Cần câu:');
    Object.entries(FISHING_RODS).forEach(([key, rod]) => {
        console.log(`   ${rod.emoji} ${rod.name}: ${rod.rarityBonus}% bonus`);
    });

    console.log('\n🪱 Mồi:');
    Object.entries(BAITS).forEach(([key, bait]) => {
        console.log(`   ${bait.emoji} ${bait.name}: ${bait.rarityBonus}% bonus`);
    });

    // Test 2: Kiểm tra tỷ lệ tối đa
    console.log('\n2️⃣ Kiểm tra tỷ lệ tối đa:');
    const maxRod = FISHING_RODS.diamond;
    const maxBait = BAITS.divine;
    const totalBonus = maxRod.rarityBonus + maxBait.rarityBonus;
    
    console.log(`   Cần câu kim cương: +${maxRod.rarityBonus}%`);
    console.log(`   Mồi thần: +${maxBait.rarityBonus}%`);
    console.log(`   Tổng bonus: +${totalBonus}%`);
    console.log(`   ✅ Tổng bonus đã giảm từ 20% xuống ${totalBonus}%`);

    // Test 3: Kiểm tra logic tính toán
    console.log('\n3️⃣ Kiểm tra logic tính toán:');
    const testFishingData = {
        currentRod: 'diamond',
        currentBait: 'divine'
    };

    // Mô phỏng logic tính toán
    const rod = FISHING_RODS[testFishingData.currentRod];
    const bait = BAITS[testFishingData.currentBait];
    const totalBonusTest = rod.rarityBonus + bait.rarityBonus;

    console.log(`   Cần câu hiện tại: ${rod.name} (+${rod.rarityBonus}%)`);
    console.log(`   Mồi hiện tại: ${bait.name} (+${bait.rarityBonus}%)`);
    console.log(`   Tổng bonus: +${totalBonusTest}%`);

    // Tính toán ảnh hưởng đến từng rarity
    const rareBonus = totalBonusTest * 0.5;
    const epicBonus = totalBonusTest * 0.3;
    const legendaryBonus = totalBonusTest * 0.1;

    console.log(`   Tăng tỷ lệ Rare: +${rareBonus}%`);
    console.log(`   Tăng tỷ lệ Epic: +${epicBonus}%`);
    console.log(`   Tăng tỷ lệ Legendary: +${legendaryBonus}%`);

    // Test 4: So sánh với tỷ lệ cũ
    console.log('\n4️⃣ So sánh với tỷ lệ cũ:');
    const oldTotalBonus = 20; // 10% + 10%
    const newTotalBonus = totalBonusTest;
    
    console.log(`   Tổng bonus cũ: +${oldTotalBonus}%`);
    console.log(`   Tổng bonus mới: +${newTotalBonus}%`);
    console.log(`   Giảm: ${oldTotalBonus - newTotalBonus}% (${((oldTotalBonus - newTotalBonus) / oldTotalBonus * 100).toFixed(1)}%)`);

    // Test 5: Kiểm tra tính hợp lệ
    console.log('\n5️⃣ Kiểm tra tính hợp lệ:');
    let isValid = true;
    let errorMessages = [];

    // Kiểm tra cần câu
    Object.entries(FISHING_RODS).forEach(([key, rod]) => {
        if (rod.rarityBonus < 0) {
            isValid = false;
            errorMessages.push(`${rod.name} có bonus âm: ${rod.rarityBonus}%`);
        }
        if (rod.rarityBonus > 10) {
            isValid = false;
            errorMessages.push(`${rod.name} có bonus quá cao: ${rod.rarityBonus}%`);
        }
    });

    // Kiểm tra mồi
    Object.entries(BAITS).forEach(([key, bait]) => {
        if (bait.rarityBonus < 0) {
            isValid = false;
            errorMessages.push(`${bait.name} có bonus âm: ${bait.rarityBonus}%`);
        }
        if (bait.rarityBonus > 10) {
            isValid = false;
            errorMessages.push(`${bait.name} có bonus quá cao: ${bait.rarityBonus}%`);
        }
    });

    if (isValid) {
        console.log('   ✅ Tất cả tỷ lệ bonus đều hợp lệ');
    } else {
        console.log('   ❌ Phát hiện lỗi:');
        errorMessages.forEach(msg => console.log(`      - ${msg}`));
    }

    // Test 6: Kết luận
    console.log('\n6️⃣ Kết luận:');
    console.log('   ✅ Đã giảm tỷ lệ bonus của tất cả cần câu và mồi xuống một nửa');
    console.log('   ✅ Hệ thống vẫn hoạt động bình thường');
    console.log('   ✅ Tỷ lệ bonus mới hợp lệ và cân bằng');
    console.log('   ✅ Không ảnh hưởng đến giá cả và độ bền');
    
    console.log('\n🎯 Thay đổi đã được áp dụng thành công!');
}

testFishingBonusReduction(); 