import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';

async function testFishMarketFishCoin() {
  console.log('🧪 Testing Fish Market with FishCoin...\n');

  const testUserId1 = 'test_user_fishmarket_1';
  const testUserId2 = 'test_user_fishmarket_2';
  const testGuildId = 'test_guild_fishmarket';

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
    await fishCoinDB.addFishCoin(testUserId1, testGuildId, 10000, 'Test FishCoin for seller');
    await fishCoinDB.addFishCoin(testUserId2, testGuildId, 5000, 'Test FishCoin for buyer');

    const balance1 = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const balance2 = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    console.log('✅ Added FishCoin:');
    console.log(`   Seller (User 1): ${balance1.toString()} FishCoin`);
    console.log(`   Buyer (User 2): ${balance2.toString()} FishCoin`);

    // 3. Tạo cá test để bán
    console.log('\n3. Creating test fish for market...');
    const testFish = await prisma.fish.create({
      data: {
        userId: testUserId1,
        guildId: testGuildId,
        species: 'Cá Market Test',
        level: 5,
        experience: 50,
        rarity: 'rare',
        value: 2000n,
        generation: 2,
        specialTraits: JSON.stringify(['Market Test']),
        status: 'adult',
        stats: JSON.stringify({ strength: 30, agility: 30, intelligence: 30, defense: 30, luck: 30 })
      }
    });

    // Tạo inventory cho seller
    const inventory = await FishInventoryService.getOrCreateFishInventory(testUserId1, testGuildId);
    await prisma.fishInventoryItem.create({
      data: {
        fishInventoryId: inventory.id,
        fishId: testFish.id
      }
    });

    console.log('✅ Created test fish and added to inventory');

    // 4. Test list fish trên market
    console.log('\n4. Testing list fish on market...');
    const listResult = await FishMarketService.listFish(testUserId1, testGuildId, testFish.id, 2500, 24);
    
    if (listResult.success) {
      console.log('✅ Listed fish on market successfully');
      console.log(`   Fish: ${listResult.listing.fish.name}`);
      console.log(`   Price: ${listResult.listing.price} FishCoin`);
      console.log(`   Duration: 24 hours`);
      
      // Kiểm tra balance sau khi list
      const sellerBalanceAfterList = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
      console.log(`   Seller balance after listing: ${sellerBalanceAfterList.toString()} FishCoin`);
    } else {
      console.log('❌ Failed to list fish:', listResult.error);
      return;
    }

    // 5. Test buy fish từ market
    console.log('\n5. Testing buy fish from market...');
    const buyResult = await FishMarketService.buyFish(testUserId2, testGuildId, testFish.id);
    
    if (buyResult.success) {
      console.log('✅ Bought fish from market successfully');
      console.log(`   Fish: ${buyResult.fish.name}`);
      console.log(`   Price paid: ${buyResult.price} FishCoin`);
      
      // Kiểm tra balance sau khi mua
      const sellerBalanceAfterSale = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
      const buyerBalanceAfterPurchase = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
      
      console.log(`   Seller balance after sale: ${sellerBalanceAfterSale.toString()} FishCoin`);
      console.log(`   Buyer balance after purchase: ${buyerBalanceAfterPurchase.toString()} FishCoin`);
      
      // Kiểm tra cá đã chuyển cho buyer
      const buyerInventory = await FishInventoryService.getFishInventory(testUserId2, testGuildId);
      const boughtFish = buyerInventory.items.find((item: any) => item.fish.id === testFish.id);
      
      if (boughtFish) {
        console.log('✅ Fish successfully transferred to buyer inventory');
      } else {
        console.log('❌ Fish not found in buyer inventory');
      }
    } else {
      console.log('❌ Failed to buy fish:', buyResult.error);
    }

    // 6. Test không đủ FishCoin
    console.log('\n6. Testing insufficient FishCoin...');
    
    // Tạo cá thứ 2
    const testFish2 = await prisma.fish.create({
      data: {
        userId: testUserId1,
        guildId: testGuildId,
        species: 'Cá Market Test 2',
        level: 3,
        experience: 30,
        rarity: 'common',
        value: 1000n,
        generation: 2,
        specialTraits: JSON.stringify(['Market Test 2']),
        status: 'adult',
        stats: JSON.stringify({ strength: 20, agility: 20, intelligence: 20, defense: 20, luck: 20 })
      }
    });

    // Thêm vào inventory
    await prisma.fishInventoryItem.create({
      data: {
        fishInventoryId: inventory.id,
        fishId: testFish2.id
      }
    });

    // List với giá cao hơn balance của buyer
    const listResult2 = await FishMarketService.listFish(testUserId1, testGuildId, testFish2.id, 10000, 24);
    
    if (listResult2.success) {
      console.log('✅ Listed second fish on market');
      
      // Thử mua với buyer không đủ FishCoin
      const buyResult2 = await FishMarketService.buyFish(testUserId2, testGuildId, testFish2.id);
      
      if (!buyResult2.success) {
        console.log('✅ Correctly failed to buy fish due to insufficient FishCoin');
        console.log(`   Error: ${buyResult2.error}`);
      } else {
        console.log('❌ Should have failed due to insufficient FishCoin');
      }
    }

    // 7. Test transaction history
    console.log('\n7. Testing transaction history...');
    const sellerTransactions = await fishCoinDB.getFishTransactions(testUserId1, testGuildId, 10);
    const buyerTransactions = await fishCoinDB.getFishTransactions(testUserId2, testGuildId, 10);
    
    console.log(`✅ Seller has ${sellerTransactions.length} transactions`);
    console.log(`✅ Buyer has ${buyerTransactions.length} transactions`);
    
    console.log('Sample seller transactions:');
    sellerTransactions.slice(0, 3).forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });
    
    console.log('Sample buyer transactions:');
    buyerTransactions.slice(0, 3).forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount.toString()} FishCoin - ${tx.description}`);
    });

    // 8. Test market listings
    console.log('\n8. Testing market listings...');
    const marketListings = await FishMarketService.getMarketListings(testGuildId, 1, 10);
    console.log(`✅ Market has ${marketListings.total} listings`);
    
    if (marketListings.listings.length > 0) {
      console.log('Current market listings:');
      marketListings.listings.forEach((listing, index) => {
        console.log(`   ${index + 1}. ${listing.fish.name} - ${listing.price} FishCoin - Seller: ${listing.sellerId}`);
      });
    }

    // 9. Final summary
    console.log('\n9. Final summary...');
    const finalSellerBalance = await fishCoinDB.getFishBalance(testUserId1, testGuildId);
    const finalBuyerBalance = await fishCoinDB.getFishBalance(testUserId2, testGuildId);
    
    console.log('✅ Final balances:');
    console.log(`   Seller: ${finalSellerBalance.toString()} FishCoin`);
    console.log(`   Buyer: ${finalBuyerBalance.toString()} FishCoin`);

    console.log('\n✅ All Fish Market FishCoin tests completed successfully!');
    console.log('\n📋 Fish Market now uses FishCoin for:');
    console.log('   🏪 Listing fish (sell)');
    console.log('   🛒 Buying fish');
    console.log('   💰 All transactions');
    console.log('   📊 Price displays');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFishMarketFishCoin(); 