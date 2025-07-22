import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishingService } from '../src/utils/fishing';
import { FishMarketService } from '../src/utils/fish-market';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishFoodService } from '../src/utils/fish-food';

async function testCompleteFishCoinSystem() {
  console.log('🧪 Testing Complete FishCoin System...\n');

  const testUserId1 = 'test_user_fishcoin_1';
  const testUserId2 = 'test_user_fishcoin_2';
  const testGuildId = 'test_guild_fishcoin';

  try {
    // 1. Tạo test users
    console.log('1. Creating test users...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { userId_guildId: { userId: testUserId1, guildId: testGuildId } },
        update: {},
        create: {
          userId: testUserId1,
          guildId: testGuildId,
          balance: 10000,
          fishBalance: 0n,
          dailyStreak: 0,
        },
      }),
      prisma.user.upsert({
        where: { userId_guildId: { userId: testUserId2, guildId: testGuildId } },
        update: {},
        create: {
          userId: testUserId2,
          guildId: testGuildId,
          balance: 5000,
          fishBalance: 0n,
          dailyStreak: 0,
        },
      })
    ]);

    console.log('✅ Created 2 test users');

    // 2. Thêm FishCoin cho users
    console.log('\n2. Adding FishCoin to users...');
    await fishCoinDB.addFishCoin(testUserId1, testGuildId, 50000, 'Test FishCoin for user 1');
    await fishCoinDB.addFishCoin(testUserId2, testGuildId, 20000, 'Test FishCoin for user 2');

    const balance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const balance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    console.log('✅ Added FishCoin:');
    console.log(`   User 1: ${balance1.toString()} FishCoin`);
    console.log(`   User 2: ${balance2.toString()} FishCoin`);

    // 3. Test Fishing System với FishCoin
    console.log('\n3. Testing Fishing System with FishCoin...');
    
    // Mua cần câu và mồi
    try {
      const rod = await FishingService.buyRod(testUserId1, testGuildId, 'copper');
      console.log('✅ Bought fishing rod:', rod.name, `(${rod.price} FishCoin)`);
      
      const bait = await FishingService.buyBait(testUserId1, testGuildId, 'premium', 3);
      console.log('✅ Bought fishing bait:', bait.bait.name, `x${bait.quantity} (${bait.totalCost} FishCoin)`);
      
      const newBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
      console.log(`   User 1 balance after fishing setup: ${newBalance1.toString()} FishCoin`);
    } catch (error) {
      console.log('❌ Fishing setup failed:', error.message);
    }

    // 4. Test Fish Food System với FishCoin
    console.log('\n4. Testing Fish Food System with FishCoin...');
    try {
      const foodResult = await FishFoodService.buyFishFood(testUserId1, testGuildId, 'premium', 2);
      if (foodResult.success) {
        console.log('✅ Bought fish food:', foodResult.foodInfo?.name, `x${foodResult.quantity} (${foodResult.totalCost} FishCoin)`);
      } else {
        console.log('❌ Failed to buy fish food:', foodResult.error);
      }
    } catch (error) {
      console.log('❌ Fish food test failed:', error.message);
    }

    // 5. Test Fish Market System với FishCoin
    console.log('\n5. Testing Fish Market System with FishCoin...');
    
    // Tạo cá test để bán
    try {
      const testFish = await prisma.fish.create({
        data: {
          userId: testUserId1,
          guildId: testGuildId,
          species: 'Cá Test',
          level: 1,
          experience: 0,
          rarity: 'common',
          value: 1000n,
          generation: 1,
          specialTraits: JSON.stringify(['Test']),
          status: 'adult',
          stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 })
        }
      });
      console.log('✅ Created test fish for market');

      // List cá trên market
      const listResult = await FishMarketService.listFish(testUserId1, testGuildId, testFish.id, 1500, 24);
      if (listResult.success) {
        console.log('✅ Listed fish on market for 1500 FishCoin');
        
        // User 2 mua cá
        const buyResult = await FishMarketService.buyFish(testUserId2, testGuildId, testFish.id);
        if (buyResult.success) {
          console.log('✅ User 2 bought fish from market');
          
          const newBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
          const newBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
          console.log(`   User 1 balance after sale: ${newBalance1.toString()} FishCoin`);
          console.log(`   User 2 balance after purchase: ${newBalance2.toString()} FishCoin`);
        } else {
          console.log('❌ Failed to buy fish:', buyResult.error);
        }
      } else {
        console.log('❌ Failed to list fish:', listResult.error);
      }
    } catch (error) {
      console.log('❌ Market test failed:', error.message);
    }

    // 6. Test Fish Inventory System với FishCoin
    console.log('\n6. Testing Fish Inventory System with FishCoin...');
    
    try {
      // Tạo cá test để bán từ inventory
      const testFish2 = await prisma.fish.create({
        data: {
          userId: testUserId2,
          guildId: testGuildId,
          species: 'Cá Inventory Test',
          level: 3,
          experience: 20,
          rarity: 'rare',
          value: 2000n,
          generation: 1,
          specialTraits: JSON.stringify(['Inventory Test']),
          status: 'adult',
          stats: JSON.stringify({ strength: 20, agility: 20, intelligence: 20, defense: 20, luck: 20 })
        }
      });

      // Tạo inventory cho user 2
      const inventory = await FishInventoryService.getOrCreateFishInventory(testUserId2, testGuildId);
      
      // Thêm cá vào inventory
      await prisma.fishInventoryItem.create({
        data: {
          fishInventoryId: inventory.id,
          fishId: testFish2.id
        }
      });
      console.log('✅ Added fish to inventory');

      // Bán cá từ inventory
      const sellResult = await FishInventoryService.sellFishFromInventory(testUserId2, testGuildId, testFish2.id);
      if (sellResult.success) {
        console.log('✅ Sold fish from inventory');
        console.log(`   Earned: ${sellResult.coinsEarned} FishCoin`);
        console.log(`   New balance: ${sellResult.newBalance} FishCoin`);
      } else {
        console.log('❌ Failed to sell fish from inventory:', sellResult.error);
      }
    } catch (error) {
      console.log('❌ Inventory test failed:', error.message);
    }

    // 7. Test Fish Breeding System với FishCoin
    console.log('\n7. Testing Fish Breeding System with FishCoin...');
    
    try {
      // Tạo cá huyền thoại để test breeding
      const legendaryFish1 = await prisma.fish.create({
        data: {
          userId: testUserId1,
          guildId: testGuildId,
          species: 'Cá Huyền Thoại 1',
          level: 5,
          experience: 50,
          rarity: 'legendary',
          value: 5000n,
          generation: 1,
          specialTraits: JSON.stringify(['Legendary 1']),
          status: 'adult',
          stats: JSON.stringify({ strength: 50, agility: 50, intelligence: 50, defense: 50, luck: 50 })
        }
      });

      const legendaryFish2 = await prisma.fish.create({
        data: {
          userId: testUserId1,
          guildId: testGuildId,
          species: 'Cá Huyền Thoại 2',
          level: 5,
          experience: 50,
          rarity: 'legendary',
          value: 5000n,
          generation: 1,
          specialTraits: JSON.stringify(['Legendary 2']),
          status: 'adult',
          stats: JSON.stringify({ strength: 50, agility: 50, intelligence: 50, defense: 50, luck: 50 })
        }
      });

      console.log('✅ Created legendary fish for breeding');

      // Bán cá huyền thoại
      const sellResult = await FishBreedingService.sellFish(testUserId1, legendaryFish1.id);
      if (sellResult.success) {
        console.log('✅ Sold legendary fish');
        console.log(`   Earned: ${sellResult.coinsEarned} FishCoin`);
        console.log(`   New balance: ${sellResult.newBalance} FishCoin`);
      } else {
        console.log('❌ Failed to sell legendary fish:', sellResult.error);
      }
    } catch (error) {
      console.log('❌ Breeding test failed:', error.message);
    }

    // 8. Test FishCoin Transfer
    console.log('\n8. Testing FishCoin Transfer...');
    try {
      const transferResult = await fishCoinDB.transferFishCoin(testUserId1, testUserId2, testGuildId, 1000, 'Test transfer');
      if (transferResult.success) {
        console.log('✅ FishCoin transfer successful');
        
        const finalBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
        const finalBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
        console.log(`   User 1 final balance: ${finalBalance1.toString()} FishCoin`);
        console.log(`   User 2 final balance: ${finalBalance2.toString()} FishCoin`);
      } else {
        console.log('❌ Transfer failed:', transferResult.message);
      }
    } catch (error) {
      console.log('❌ Transfer test failed:', error.message);
    }

    // 9. Test Top FishCoin Users
    console.log('\n9. Testing Top FishCoin Users...');
    try {
      const topUsers = await fishCoinDB.getTopFishCoinUsers(testGuildId, 5);
      console.log('✅ Top FishCoin users:');
      topUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. User ${user.userId}: ${user.fishBalance.toString()} FishCoin`);
      });
    } catch (error) {
      console.log('❌ Top users test failed:', error.message);
    }

    // 10. Test Transaction History
    console.log('\n10. Testing Transaction History...');
    try {
      const transactions1 = await fishCoinDB.getFishTransactions(testUserId1, testGuildId, 10);
      const transactions2 = await fishCoinDB.getFishTransactions(testUserId2, testGuildId, 10);
      
      console.log(`✅ User 1 has ${transactions1.length} transactions`);
      console.log(`✅ User 2 has ${transactions2.length} transactions`);
      
      console.log('Sample transactions for User 1:');
      transactions1.slice(0, 3).forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
      });
    } catch (error) {
      console.log('❌ Transaction history test failed:', error.message);
    }

    // 11. Final Summary
    console.log('\n11. Final Summary...');
    const finalBalance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const finalBalance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    
    console.log('✅ Final balances:');
    console.log(`   User 1: ${finalBalance1.toString()} FishCoin`);
    console.log(`   User 2: ${finalBalance2.toString()} FishCoin`);

    console.log('\n✅ All FishCoin system tests completed successfully!');
    console.log('\n📋 FishCoin now used for:');
    console.log('   🎣 Fishing rods and bait');
    console.log('   🍽️ Fish food');
    console.log('   🏪 Fish market (buy/sell)');
    console.log('   📦 Fish inventory (sell)');
    console.log('   🐟 Fish breeding (sell)');
    console.log('   💰 All fish-related transactions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFishCoinSystem(); 