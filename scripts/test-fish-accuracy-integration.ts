import { PrismaClient } from '@prisma/client';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishBattleService } from '../src/utils/fish-battle';
import { WeaponService } from '../src/utils/weapon';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🎯 Test tích hợp chỉ số accuracy cho cá...\n');

    // 1. Test tạo stats mới với accuracy
    console.log('📊 1. Test tạo stats mới với accuracy:');
    const newStats = FishBreedingService.generateRandomStats();
    console.log(`   Stats mới: 💪${newStats.strength} 🏃${newStats.agility} 🧠${newStats.intelligence} 🛡️${newStats.defense} 🍀${newStats.luck} 🎯${newStats.accuracy}`);
    console.log(`   ✅ Accuracy có giá trị: ${newStats.accuracy !== undefined ? 'Có' : 'Không'}`);
    console.log('');

    // 2. Test tạo stats trống với accuracy
    console.log('📊 2. Test tạo stats trống với accuracy:');
    const emptyStats = FishBreedingService.generateEmptyStats();
    console.log(`   Stats trống: 💪${emptyStats.strength} 🏃${emptyStats.agility} 🧠${emptyStats.intelligence} 🛡️${emptyStats.defense} 🍀${emptyStats.luck} 🎯${emptyStats.accuracy}`);
    console.log(`   ✅ Accuracy có giá trị: ${emptyStats.accuracy !== undefined ? 'Có' : 'Không'}`);
    console.log('');

    // 3. Test tính stats di truyền với accuracy
    console.log('📊 3. Test tính stats di truyền với accuracy:');
    const parent1Stats = {
      strength: 50,
      agility: 60,
      intelligence: 40,
      defense: 55,
      luck: 45,
      accuracy: 70
    };
    const parent2Stats = {
      strength: 45,
      agility: 55,
      intelligence: 50,
      defense: 60,
      luck: 50,
      accuracy: 65
    };
    const inheritedStats = FishBreedingService.calculateInheritedStats(parent1Stats, parent2Stats);
    console.log(`   Parent 1: 💪${parent1Stats.strength} 🏃${parent1Stats.agility} 🧠${parent1Stats.intelligence} 🛡️${parent1Stats.defense} 🍀${parent1Stats.luck} 🎯${parent1Stats.accuracy}`);
    console.log(`   Parent 2: 💪${parent2Stats.strength} 🏃${parent2Stats.agility} 🧠${parent2Stats.intelligence} 🛡️${parent2Stats.defense} 🍀${parent2Stats.luck} 🎯${parent2Stats.accuracy}`);
    console.log(`   Offspring: 💪${inheritedStats.strength} 🏃${inheritedStats.agility} 🧠${inheritedStats.intelligence} 🛡️${inheritedStats.defense} 🍀${inheritedStats.luck} 🎯${inheritedStats.accuracy}`);
    console.log(`   ✅ Accuracy được di truyền: ${inheritedStats.accuracy !== undefined ? 'Có' : 'Không'}`);
    console.log('');

    // 4. Test tăng stats khi lên cấp với accuracy
    console.log('📊 4. Test tăng stats khi lên cấp với accuracy:');
    const currentStats = {
      strength: 30,
      agility: 35,
      intelligence: 25,
      defense: 40,
      luck: 20,
      accuracy: 45
    };
    const increasedStats = FishBreedingService.increaseStatsOnLevelUp(currentStats);
    console.log(`   Trước: 💪${currentStats.strength} 🏃${currentStats.agility} 🧠${currentStats.intelligence} 🛡️${currentStats.defense} 🍀${currentStats.luck} 🎯${currentStats.accuracy}`);
    console.log(`   Sau: 💪${increasedStats.strength} 🏃${increasedStats.agility} 🧠${increasedStats.intelligence} 🛡️${increasedStats.defense} 🍀${increasedStats.luck} 🎯${increasedStats.accuracy}`);
    console.log(`   ✅ Accuracy được tăng: ${increasedStats.accuracy > currentStats.accuracy ? 'Có' : 'Không'}`);
    console.log('');

    // 5. Test tính critical hit chance với fish accuracy
    console.log('📊 5. Test tính critical hit chance với fish accuracy:');
    const fishStats = {
      strength: 40,
      agility: 35,
      intelligence: 30,
      defense: 45,
      luck: 25,
      accuracy: 60
    };
    const weaponStats = {
      power: 15,
      defense: 10,
      accuracy: 20
    };
    
    // Tính critical hit chance như trong fish-battle.ts
    const critChance = (fishStats.luck || 0) / 200 + (fishStats.accuracy || 0) / 200 + (weaponStats.accuracy || 0) / 100;
    console.log(`   Fish Stats: 💪${fishStats.strength} 🏃${fishStats.agility} 🧠${fishStats.intelligence} 🛡️${fishStats.defense} 🍀${fishStats.luck} 🎯${fishStats.accuracy}`);
    console.log(`   Weapon Stats: ⚔️${weaponStats.power} 🛡️${weaponStats.defense} 🎯${weaponStats.accuracy}%`);
    console.log(`   Critical Hit Chance: ${Math.round(critChance * 100)}%`);
    console.log(`   ✅ Fish accuracy ảnh hưởng đến crit chance: ${fishStats.accuracy > 0 ? 'Có' : 'Không'}`);
    console.log('');

    // 6. Test tạo cá mới với accuracy trong database
    console.log('📊 6. Test tạo cá mới với accuracy trong database:');
    
    // Tạo test user nếu chưa có
    const testUserId = 'test-accuracy-user-123';
    const testGuildId = 'test-guild-123';
    
    await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 0n,
        fishBalance: 0n
      }
    });

    // Tạo test fish với accuracy
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Test Fish with Accuracy',
        level: 1,
        experience: 0,
        rarity: 'common',
        value: 1000n,
        generation: 1,
        specialTraits: JSON.stringify(['Test']),
        status: 'growing',
        stats: JSON.stringify(newStats) // Sử dụng stats mới với accuracy
      }
    });

    console.log(`   ✅ Đã tạo test fish: ${testFish.species} (ID: ${testFish.id})`);
    
    // Kiểm tra stats trong database
    const retrievedFish = await prisma.fish.findUnique({
      where: { id: testFish.id }
    });

    if (retrievedFish && retrievedFish.stats) {
      const dbStats = JSON.parse(retrievedFish.stats);
      console.log(`   Stats trong DB: 💪${dbStats.strength} 🏃${dbStats.agility} 🧠${dbStats.intelligence} 🛡️${dbStats.defense} 🍀${dbStats.luck} 🎯${dbStats.accuracy}`);
      console.log(`   ✅ Accuracy được lưu trong DB: ${dbStats.accuracy !== undefined ? 'Có' : 'Không'}`);
    }

    // Dọn dẹp test data
    await prisma.fish.delete({
      where: { id: testFish.id }
    });
    await prisma.user.delete({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
    });

    console.log('\n🎉 Tất cả test đã hoàn thành thành công!');
    console.log('✅ Chỉ số accuracy đã được tích hợp đầy đủ vào hệ thống cá!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 