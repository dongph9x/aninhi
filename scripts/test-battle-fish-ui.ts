import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { BattleFishUI } from '../src/components/MessageComponent/BattleFishUI';

async function testBattleFishUI() {
  console.log('🧪 Testing Battle Fish UI...\n');

  const testUserId = 'test_user_battle_ui';
  const testGuildId = 'test_guild_battle_ui';

  try {
    // 1. Tạo test user
    console.log('1. Creating test user...');
    const user = await prisma.user.upsert({
      where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
      update: {},
      create: {
        userId: testUserId,
        guildId: testGuildId,
        balance: 10000,
      },
    });
    console.log('✅ User created:', user.userId);

    // 2. Tạo cá thế hệ 1 (không thể đấu)
    console.log('\n2. Creating generation 1 fish...');
    const gen1Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 1 Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 1000,
        generation: 1,
        specialTraits: JSON.stringify(['Gen1']),
        stats: JSON.stringify({
          strength: 50,
          agility: 50,
          intelligence: 50,
          defense: 50,
          luck: 50
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 1 fish created:', gen1Fish.species);

    // 3. Tạo cá thế hệ 2 (có thể đấu)
    console.log('\n3. Creating generation 2 fish...');
    const gen2Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 2 Battle Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 2000,
        generation: 2,
        specialTraits: JSON.stringify(['Gen2', 'Battle']),
        stats: JSON.stringify({
          strength: 70,
          agility: 60,
          intelligence: 65,
          defense: 55,
          luck: 60
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 2 fish created:', gen2Fish.species);

    // 4. Tạo cá thế hệ 3 (có thể đấu)
    console.log('\n4. Creating generation 3 fish...');
    const gen3Fish = await prisma.fish.create({
      data: {
        userId: testUserId,
        guildId: testGuildId,
        species: 'Gen 3 Elite Fish',
        level: 10,
        experience: 0,
        rarity: 'legendary',
        value: 3000,
        generation: 3,
        specialTraits: JSON.stringify(['Gen3', 'Elite']),
        stats: JSON.stringify({
          strength: 80,
          agility: 75,
          intelligence: 70,
          defense: 65,
          luck: 70
        }),
        status: 'adult',
      },
    });
    console.log('✅ Gen 3 fish created:', gen3Fish.species);

    // 5. Test UI khi chưa có cá trong túi đấu
    console.log('\n5. Testing UI without battle fish...');
    const inventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    const eligibleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
    
    const ui1 = new BattleFishUI(inventory, eligibleFish, testUserId, testGuildId);
    const embed1 = ui1.createEmbed();
    const components1 = ui1.createComponents();
    
    console.log('✅ UI without battle fish:');
    console.log('   - Title:', embed1.data.title);
    console.log('   - Description:', embed1.data.description);
    console.log('   - Fields count:', embed1.data.fields?.length || 0);
    console.log('   - Components count:', components1.length);
    console.log('   - Eligible fish count:', eligibleFish.length);

    // 6. Thêm cá vào túi đấu
    console.log('\n6. Adding fish to battle inventory...');
    const addResult1 = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen2Fish.id);
    const addResult2 = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, gen3Fish.id);
    
    console.log('✅ Gen 2 fish added:', addResult1.success);
    console.log('✅ Gen 3 fish added:', addResult2.success);

    // 7. Test UI sau khi có cá trong túi đấu
    console.log('\n7. Testing UI with battle fish...');
    const updatedInventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
    const updatedEligibleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
    
    const ui2 = new BattleFishUI(updatedInventory, updatedEligibleFish, testUserId, testGuildId);
    const embed2 = ui2.createEmbed();
    const components2 = ui2.createComponents();
    
    console.log('✅ UI with battle fish:');
    console.log('   - Title:', embed2.data.title);
    console.log('   - Description:', embed2.data.description);
    console.log('   - Fields count:', embed2.data.fields?.length || 0);
    console.log('   - Components count:', components2.length);
    console.log('   - Battle fish count:', updatedInventory.items.length);
    console.log('   - Eligible fish count:', updatedEligibleFish.length);

    // 8. Test chọn cá
    console.log('\n8. Testing fish selection...');
    ui2.updateSelectedFish(`battle_${gen2Fish.id}`);
    console.log('✅ Selected fish ID:', ui2.getSelectedFishId());
    console.log('✅ Can add selected fish:', ui2.canAddSelectedFish());
    console.log('✅ Can remove selected fish:', ui2.canRemoveSelectedFish());
    console.log('✅ Actual fish ID:', ui2.getActualFishId());

    // 9. Test chọn cá có thể thêm
    console.log('\n9. Testing eligible fish selection...');
    if (updatedEligibleFish.length > 0) {
        ui2.updateSelectedFish(`eligible_${updatedEligibleFish[0].id}`);
        console.log('✅ Selected eligible fish ID:', ui2.getSelectedFishId());
        console.log('✅ Can add selected fish:', ui2.canAddSelectedFish());
        console.log('✅ Can remove selected fish:', ui2.canRemoveSelectedFish());
        console.log('✅ Actual fish ID:', ui2.getActualFishId());
    }

    // 10. Test tính toán sức mạnh
    console.log('\n10. Testing power calculation...');
    const power1 = ui2['calculatePower'](gen2Fish);
    const power2 = ui2['calculatePower'](gen3Fish);
    console.log('✅ Gen 2 fish power:', power1);
    console.log('✅ Gen 3 fish power:', power2);

    console.log('\n🎉 Battle Fish UI tests completed!');

  } catch (error) {
    console.error('❌ Error testing battle fish UI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBattleFishUI(); 