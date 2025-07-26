import { FISH_LIST, FISHING_RODS, BAITS } from '../src/utils/fishing';

function calculateLegendaryFishRate() {
  console.log('🎣 Tính Toán Tỷ Lệ Cá Huyền Thoại (Chỉ Cần Kim Cương + Mồi Thần)\n');

  // 1. Tỷ lệ cơ bản (không có cần câu và mồi)
  console.log('1️⃣ Tỷ Lệ Cơ Bản (Không Có Cần Câu Và Mồi):');
  
  const legendaryFish = FISH_LIST.filter(fish => fish.rarity === 'legendary');
  const totalChance = FISH_LIST.reduce((sum, fish) => sum + fish.chance, 0);
  const legendaryChance = legendaryFish.reduce((sum, fish) => sum + fish.chance, 0);
  const legendaryRate = (legendaryChance / totalChance) * 100;
  
  console.log(`   Tổng tỷ lệ tất cả cá: ${totalChance}%`);
  console.log(`   Tổng tỷ lệ cá huyền thoại: ${legendaryChance}%`);
  console.log(`   Tỷ lệ ra cá huyền thoại: ${legendaryRate.toFixed(2)}%`);
  console.log(`   ⚠️  Lưu ý: Chỉ có thể câu được cá huyền thoại với cần câu kim cương + mồi thần!`);
  console.log();
  
  // 2. Chi tiết từng loại cá huyền thoại
  console.log('2️⃣ Chi Tiết Từng Loại Cá Huyền Thoại:');
  legendaryFish.forEach(fish => {
    const individualRate = (fish.chance / totalChance) * 100;
    console.log(`   ${fish.emoji} ${fish.name}: ${fish.chance}% (${individualRate.toFixed(3)}%)`);
  });
  console.log();

  // 3. Tỷ lệ với các loại cần câu khác nhau
  console.log('3️⃣ Tỷ Lệ Với Các Loại Cần Câu (Không Có Mồi):');
  
  Object.entries(FISHING_RODS).forEach(([rodType, rod]) => {
    console.log(`\n   🎣 ${rod.name} (${rod.rarityBonus}% bonus):`);
    
    // Kiểm tra có thể câu được cá huyền thoại không
    const canCatchLegendary = rodType === "diamond";
    
    // Tính tỷ lệ mới với bonus từ cần câu
    const adjustedFish = FISH_LIST.map(fish => {
      let adjustedChance = fish.chance;
      
      if (fish.rarity === "rare") {
        adjustedChance += rod.rarityBonus * 0.5;
      } else if (fish.rarity === "epic") {
        adjustedChance += rod.rarityBonus * 0.3;
      } else if (fish.rarity === "legendary" && canCatchLegendary) {
        adjustedChance += rod.rarityBonus * 0.1;
      } else if (fish.rarity === "legendary" && !canCatchLegendary) {
        adjustedChance = 0; // Không thể câu được cá huyền thoại
      }
      
      return { ...fish, adjustedChance };
    });
    
    const newTotalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const newLegendaryChance = adjustedFish
      .filter(fish => fish.rarity === 'legendary')
      .reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const newLegendaryRate = (newLegendaryChance / newTotalChance) * 100;
    
    console.log(`     Tổng tỷ lệ: ${newTotalChance.toFixed(1)}%`);
    console.log(`     Tỷ lệ cá huyền thoại: ${newLegendaryRate.toFixed(2)}%`);
    if (canCatchLegendary) {
      console.log(`     Tăng: +${(newLegendaryRate - legendaryRate).toFixed(2)}%`);
    } else {
      console.log(`     ❌ Không thể câu được cá huyền thoại`);
    }
  });

  // 4. Tỷ lệ với các loại mồi khác nhau
  console.log('\n4️⃣ Tỷ Lệ Với Các Loại Mồi (Cần Câu Cơ Bản):');
  
  Object.entries(BAITS).forEach(([baitType, bait]) => {
    console.log(`\n   ${bait.emoji} ${bait.name} (${bait.rarityBonus}% bonus):`);
    
    // Kiểm tra có thể câu được cá huyền thoại không
    const canCatchLegendary = baitType === "divine";
    
    // Tính tỷ lệ mới với bonus từ mồi
    const adjustedFish = FISH_LIST.map(fish => {
      let adjustedChance = fish.chance;
      
      if (fish.rarity === "rare") {
        adjustedChance += bait.rarityBonus * 0.5;
      } else if (fish.rarity === "epic") {
        adjustedChance += bait.rarityBonus * 0.3;
      } else if (fish.rarity === "legendary" && canCatchLegendary) {
        adjustedChance += bait.rarityBonus * 0.1;
      } else if (fish.rarity === "legendary" && !canCatchLegendary) {
        adjustedChance = 0; // Không thể câu được cá huyền thoại
      }
      
      return { ...fish, adjustedChance };
    });
    
    const newTotalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const newLegendaryChance = adjustedFish
      .filter(fish => fish.rarity === 'legendary')
      .reduce((sum, fish) => sum + fish.adjustedChance, 0);
    const newLegendaryRate = (newLegendaryChance / newTotalChance) * 100;
    
    console.log(`     Tổng tỷ lệ: ${newTotalChance.toFixed(1)}%`);
    console.log(`     Tỷ lệ cá huyền thoại: ${newLegendaryRate.toFixed(2)}%`);
    if (canCatchLegendary) {
      console.log(`     Tăng: +${(newLegendaryRate - legendaryRate).toFixed(2)}%`);
    } else {
      console.log(`     ❌ Không thể câu được cá huyền thoại`);
    }
  });

  // 5. Tỷ lệ tối đa (cần câu kim cương + mồi thần)
  console.log('\n5️⃣ Tỷ Lệ Tối Đa (Cần Câu Kim Cương + Mồi Thần):');
  console.log('   ⭐ Đây là cách DUY NHẤT để câu được cá huyền thoại!');
  
  const maxRodBonus = FISHING_RODS.diamond.rarityBonus; // 5%
  const maxBaitBonus = BAITS.divine.rarityBonus; // 5%
  const totalBonus = maxRodBonus + maxBaitBonus; // 10%
  
  const maxAdjustedFish = FISH_LIST.map(fish => {
    let adjustedChance = fish.chance;
    
    if (fish.rarity === "rare") {
      adjustedChance += totalBonus * 0.5; // +5%
    } else if (fish.rarity === "epic") {
      adjustedChance += totalBonus * 0.3; // +3%
    } else if (fish.rarity === "legendary") {
      adjustedChance += totalBonus * 0.1; // +1%
    }
    
    return { ...fish, adjustedChance };
  });
  
  const maxTotalChance = maxAdjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
  const maxLegendaryChance = maxAdjustedFish
    .filter(fish => fish.rarity === 'legendary')
    .reduce((sum, fish) => sum + fish.adjustedChance, 0);
  const maxLegendaryRate = (maxLegendaryChance / maxTotalChance) * 100;
  
  console.log(`   Cần câu kim cương: +${maxRodBonus}% bonus`);
  console.log(`   Mồi thần: +${maxBaitBonus}% bonus`);
  console.log(`   Tổng bonus: +${totalBonus}%`);
  console.log(`   Tổng tỷ lệ: ${maxTotalChance.toFixed(1)}%`);
  console.log(`   Tỷ lệ cá huyền thoại: ${maxLegendaryRate.toFixed(2)}%`);
  console.log(`   Tăng so với cơ bản: +${(maxLegendaryRate - legendaryRate).toFixed(2)}%`);

  // 6. Thống kê tổng quan
  console.log('\n6️⃣ Thống Kê Tổng Quan:');
  console.log(`   📊 Tỷ lệ cơ bản: ${legendaryRate.toFixed(2)}%`);
  console.log(`   📊 Tỷ lệ tối đa: ${maxLegendaryRate.toFixed(2)}%`);
  console.log(`   📊 Tăng tối đa: +${(maxLegendaryRate - legendaryRate).toFixed(2)}%`);
  console.log(`   📊 Số lần câu trung bình để ra cá huyền thoại:`);
  console.log(`      - Cơ bản: ${Math.ceil(100 / legendaryRate)} lần`);
  console.log(`      - Tối đa: ${Math.ceil(100 / maxLegendaryRate)} lần`);
  
  // 7. So sánh với các rarity khác
  console.log('\n7️⃣ So Sánh Với Các Rarity Khác:');
  
  const commonFish = FISH_LIST.filter(fish => fish.rarity === 'common');
  const rareFish = FISH_LIST.filter(fish => fish.rarity === 'rare');
  const epicFish = FISH_LIST.filter(fish => fish.rarity === 'epic');
  
  const commonChance = commonFish.reduce((sum, fish) => sum + fish.chance, 0);
  const rareChance = rareFish.reduce((sum, fish) => sum + fish.chance, 0);
  const epicChance = epicFish.reduce((sum, fish) => sum + fish.chance, 0);
  
  const commonRate = (commonChance / totalChance) * 100;
  const rareRate = (rareChance / totalChance) * 100;
  const epicRate = (epicChance / totalChance) * 100;
  
  console.log(`   🐟 Common (Thường): ${commonRate.toFixed(1)}%`);
  console.log(`   🐠 Rare (Hiếm): ${rareRate.toFixed(1)}%`);
  console.log(`   🦈 Epic (Quý hiếm): ${epicRate.toFixed(1)}%`);
  console.log(`   🐳 Legendary (Huyền thoại): ${legendaryRate.toFixed(2)}%`);
}

calculateLegendaryFishRate(); 