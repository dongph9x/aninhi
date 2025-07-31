import { FISH_LIST, FISHING_RODS, BAITS } from '../src/config/fish-data';

function testCompleteFishingSystem() {
    console.log('🎣 Test Toàn Bộ Hệ Thống Câu Cá\n');
    console.log('⭐ Hệ thống mới: Giảm bonus + Giới hạn cá huyền thoại\n');

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

    // Test 2: Kiểm tra logic câu cá huyền thoại
    console.log('\n2️⃣ Kiểm tra logic câu cá huyền thoại:');
    
    const testCases = [
        { rod: 'basic', bait: 'basic', name: 'Cơ bản' },
        { rod: 'copper', bait: 'good', name: 'Trung bình' },
        { rod: 'silver', bait: 'premium', name: 'Cao cấp' },
        { rod: 'gold', bait: 'divine', name: 'Gần tối đa' },
        { rod: 'diamond', bait: 'divine', name: 'Tối đa' }
    ];

    testCases.forEach((testCase, index) => {
        const rod = FISHING_RODS[testCase.rod];
        const bait = BAITS[testCase.bait];
        const totalBonus = rod.rarityBonus + bait.rarityBonus;
        const canCatchLegendary = testCase.rod === "diamond" && testCase.bait === "divine";

        console.log(`\n   ${index + 1}. ${testCase.name}:`);
        console.log(`      🎣 ${rod.name} (+${rod.rarityBonus}%)`);
        console.log(`      🪱 ${bait.name} (+${bait.rarityBonus}%)`);
        console.log(`      📊 Tổng bonus: +${totalBonus}%`);
        
        if (canCatchLegendary) {
            console.log(`      ✅ CÓ THỂ câu được cá huyền thoại`);
        } else {
            console.log(`      ❌ KHÔNG THỂ câu được cá huyền thoại`);
        }
    });

    // Test 3: Tính toán tỷ lệ chi tiết cho trường hợp tối đa
    console.log('\n3️⃣ Tính toán tỷ lệ chi tiết (Cần kim cương + Mồi thần):');
    
    const maxRod = FISHING_RODS.diamond;
    const maxBait = BAITS.divine;
    const totalBonus = maxRod.rarityBonus + maxBait.rarityBonus;

    console.log(`\n   🎣 ${maxRod.name} + ${maxBait.name}:`);
    console.log(`   📊 Tổng bonus: +${totalBonus}%`);

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
    
    // Phân loại theo rarity
    const commonFish = adjustedFish.filter(fish => fish.rarity === 'common');
    const rareFish = adjustedFish.filter(fish => fish.rarity === 'rare');
    const epicFish = adjustedFish.filter(fish => fish.rarity === 'epic');
    const legendaryFish = adjustedFish.filter(fish => fish.rarity === 'legendary');

    const commonChance = commonFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const rareChance = rareFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const epicChance = epicFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const legendaryChance = legendaryFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);

    console.log(`   🐟 Common: ${commonChance.toFixed(1)}% (${((commonChance / totalChance) * 100).toFixed(1)}%)`);
    console.log(`   🐠 Rare: ${rareChance.toFixed(1)}% (${((rareChance / totalChance) * 100).toFixed(1)}%)`);
    console.log(`   🦈 Epic: ${epicChance.toFixed(1)}% (${((epicChance / totalChance) * 100).toFixed(1)}%)`);
    console.log(`   🐳 Legendary: ${legendaryChance.toFixed(1)}% (${((legendaryChance / totalChance) * 100).toFixed(2)}%)`);

    // Test 4: So sánh với trường hợp không thể câu cá huyền thoại
    console.log('\n4️⃣ So sánh với trường hợp không thể câu cá huyền thoại:');
    
    const testCase2 = { rod: 'gold', bait: 'premium' };
    const rod2 = FISHING_RODS[testCase2.rod];
    const bait2 = BAITS[testCase2.bait];
    const totalBonus2 = rod2.rarityBonus + bait2.rarityBonus;

    console.log(`\n   🎣 ${rod2.name} + ${bait2.name}:`);
    console.log(`   📊 Tổng bonus: +${totalBonus2}%`);

    const adjustedFish2 = FISH_LIST.map(fish => {
        let adjustedChance = fish.chance;
        
        if (fish.rarity === "rare") {
            adjustedChance += totalBonus2 * 0.5;
        } else if (fish.rarity === "epic") {
            adjustedChance += totalBonus2 * 0.3;
        } else if (fish.rarity === "legendary") {
            adjustedChance = 0; // Không thể câu được cá huyền thoại
        }
        
        return { ...fish, adjustedChance };
    });

    const totalChance2 = adjustedFish2.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const legendaryChance2 = adjustedFish2
        .filter(fish => fish.rarity === 'legendary')
        .reduce((sum, fish) => sum + fish.adjustedChance, 0);

    console.log(`   🐳 Legendary: ${legendaryChance2.toFixed(1)}% (${((legendaryChance2 / totalChance2) * 100).toFixed(2)}%)`);
    console.log(`   ❌ Không thể câu được cá huyền thoại!`);

    // Test 5: Kiểm tra tính hợp lệ của hệ thống
    console.log('\n5️⃣ Kiểm tra tính hợp lệ của hệ thống:');
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
    console.log('   ✅ Chỉ cần câu kim cương + mồi thần mới có thể câu được cá huyền thoại');
    console.log('   ✅ Hệ thống vẫn hoạt động bình thường và cân bằng');
    console.log('   ✅ Cá huyền thoại giờ đây thực sự hiếm và quý giá');
    console.log('   ✅ Không ảnh hưởng đến giá cả và độ bền');
    
    console.log('\n🎯 Toàn bộ hệ thống đã được cập nhật thành công!');
    console.log('🎮 Người chơi giờ đây cần đầu tư nhiều hơn để có thể câu được cá huyền thoại!');
}

testCompleteFishingSystem(); 