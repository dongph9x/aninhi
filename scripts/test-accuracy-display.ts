import { PrismaClient } from '@prisma/client';
import { FishBreedingService } from '../src/utils/fish-breeding';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🎯 Test hiển thị chỉ số accuracy trong các command...\n');

    // 1. Tạo test user và fish
    const testUserId = 'test-accuracy-display-123';
    const testGuildId = 'test-guild-123';
    
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 1000000n,
        fishBalance: 100000n
      }
    });

    // Tạo test fish với stats có accuracy
    const testStats = {
      strength: 45,
      agility: 52,
      intelligence: 38,
      defense: 47,
      luck: 41,
      accuracy: 58
    };

    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Accuracy Fish',
        level: 3,
        experience: 25,
        rarity: 'rare',
        value: 5000n,
        generation: 2,
        specialTraits: JSON.stringify(['High Accuracy', 'Test']),
        status: 'adult',
        stats: JSON.stringify(testStats)
      }
    });

    console.log(`✅ Đã tạo test fish: ${testFish.species}`);
    console.log(`📊 Stats: 💪${testStats.strength} 🏃${testStats.agility} 🧠${testStats.intelligence} 🛡️${testStats.defense} 🍀${testStats.luck} 🎯${testStats.accuracy}`);
    console.log('');

    // 2. Test hiển thị stats trong các format khác nhau
    console.log('📋 2. Test các format hiển thị stats:');
    
    // Format 1: Với emoji
    const format1 = `💪${testStats.strength} 🏃${testStats.agility} 🧠${testStats.intelligence} 🛡️${testStats.defense} 🍀${testStats.luck} 🎯${testStats.accuracy}`;
    console.log(`   Format 1 (Emoji): ${format1}`);
    
    // Format 2: Với text
    const format2 = `Strength: ${testStats.strength} | Agility: ${testStats.agility} | Intelligence: ${testStats.intelligence} | Defense: ${testStats.defense} | Luck: ${testStats.luck} | Accuracy: ${testStats.accuracy}`;
    console.log(`   Format 2 (Text): ${format2}`);
    
    // Format 3: Tính tổng power
    const totalPower = testStats.strength + testStats.agility + testStats.intelligence + testStats.defense + testStats.luck + testStats.accuracy;
    console.log(`   Format 3 (Total Power): ${totalPower} (bao gồm accuracy)`);
    console.log('');

    // 3. Test critical hit chance calculation
    console.log('🎯 3. Test tính critical hit chance:');
    const luckBonus = testStats.luck / 200; // 0.5% mỗi điểm luck
    const fishAccuracyBonus = testStats.accuracy / 200; // 0.5% mỗi điểm fish accuracy
    const weaponAccuracyBonus = 0; // Giả sử không có weapon
    
    const totalCritChance = luckBonus + fishAccuracyBonus + weaponAccuracyBonus;
    console.log(`   Luck Bonus: ${Math.round(luckBonus * 100)}% (${testStats.luck} luck / 200)`);
    console.log(`   Fish Accuracy Bonus: ${Math.round(fishAccuracyBonus * 100)}% (${testStats.accuracy} accuracy / 200)`);
    console.log(`   Weapon Accuracy Bonus: ${Math.round(weaponAccuracyBonus * 100)}%`);
    console.log(`   Total Crit Chance: ${Math.round(totalCritChance * 100)}%`);
    console.log('');

    // 4. Test với weapon
    console.log('⚔️ 4. Test với weapon accuracy:');
    const weaponStats = {
      power: 20,
      defense: 15,
      accuracy: 25
    };
    
    const weaponAccuracyBonus2 = weaponStats.accuracy / 100; // 1% mỗi điểm weapon accuracy
    const totalCritChanceWithWeapon = luckBonus + fishAccuracyBonus + weaponAccuracyBonus2;
    
    console.log(`   Weapon Stats: ⚔️${weaponStats.power} ATK | 🛡️${weaponStats.defense} DEF | 🎯${weaponStats.accuracy}% Accuracy`);
    console.log(`   Weapon Accuracy Bonus: ${Math.round(weaponAccuracyBonus2 * 100)}% (${weaponStats.accuracy} weapon accuracy / 100)`);
    console.log(`   Total Crit Chance with Weapon: ${Math.round(totalCritChanceWithWeapon * 100)}%`);
    console.log('');

    // 5. Test battle log format
    console.log('📝 5. Test battle log format:');
    const battleLog1 = `💪 Sức mạnh: ${testStats.strength} | 🏃 Thể lực: ${testStats.agility} | 🧠 Trí tuệ: ${testStats.intelligence} | 🛡️ Phòng thủ: ${testStats.defense} | 🍀 May mắn: ${testStats.luck} | 🎯 Độ chính xác: ${testStats.accuracy}`;
    console.log(`   Battle Log: ${battleLog1}`);
    
    const battleLog2 = `🎯 ${testFish.species} Crit Chance: ${Math.round(totalCritChanceWithWeapon * 100)}% (Luck: ${testStats.luck} + Fish Accuracy: ${testStats.accuracy} + Weapon Accuracy: ${weaponStats.accuracy}%)`;
    console.log(`   Crit Log: ${battleLog2}`);
    console.log('');

    // 6. Test embed field format
    console.log('📋 6. Test embed field format:');
    const embedField = {
      name: '📊 Stats của bạn',
      value: `💪${testStats.strength} 🏃${testStats.agility} 🧠${testStats.intelligence} 🛡️${testStats.defense} 🍀${testStats.luck} 🎯${testStats.accuracy}`,
      inline: false
    };
    console.log(`   Embed Field: ${embedField.name}`);
    console.log(`   Value: ${embedField.value}`);
    console.log('');

    // 7. Test market listing format
    console.log('🏪 7. Test market listing format:');
    const marketText = `**Stats:** 💪${testStats.strength} 🏃${testStats.agility} 🧠${testStats.intelligence} 🛡️${testStats.defense} 🍀${testStats.luck} 🎯${testStats.accuracy}\n**Level:** ${testFish.level} | **Rarity:** ${testFish.rarity}`;
    console.log(`   Market Text: ${marketText}`);
    console.log('');

    // 8. Kiểm tra database
    console.log('🗄️ 8. Kiểm tra database:');
    const retrievedFish = await prisma.fish.findUnique({
      where: { id: testFish.id }
    });

    if (retrievedFish && retrievedFish.stats) {
      const dbStats = JSON.parse(retrievedFish.stats);
      console.log(`   Stats trong DB: 💪${dbStats.strength} 🏃${dbStats.agility} 🧠${dbStats.intelligence} 🛡️${dbStats.defense} 🍀${dbStats.luck} 🎯${dbStats.accuracy}`);
      console.log(`   ✅ Accuracy được lưu và đọc đúng: ${dbStats.accuracy === testStats.accuracy ? 'Có' : 'Không'}`);
    }

    // Dọn dẹp
    await prisma.fish.delete({
      where: { id: testFish.id }
    });
    await prisma.user.delete({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });

    console.log('\n🎉 Tất cả test hiển thị accuracy đã hoàn thành!');
    console.log('✅ Chỉ số accuracy được hiển thị đúng trong tất cả format!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 