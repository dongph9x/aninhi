import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

async function testFishMarket() {
  console.log('🏪 Testing Fish Market System...\n');
  
  try {
    const userId = '389957152153796608';
    const guildId = '1005280612845891615';
    
    // 1. Kiểm tra market hiện tại
    console.log('1. Checking current market...');
    const marketListings = await FishMarketService.getMarketListings(guildId, 1, 10);
    console.log(`📊 Market has ${marketListings.total} listings`);
    
    // 2. Kiểm tra user inventory
    console.log('\n2. Checking user inventory...');
    const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
    console.log(`📦 User has ${userInventory.items.length} fish in inventory`);
    
    // 3. Tìm cá có thể bán (thế hệ 2+, trưởng thành)
    console.log('\n3. Finding eligible fish for sale...');
    const eligibleFish = userInventory.items.filter((item: any) => {
      const fish = item.fish;
      return fish.generation >= 2 && fish.status === 'adult';
    });
    
    console.log(`✅ Found ${eligibleFish.length} eligible fish for sale`);
    
    for (const item of eligibleFish) {
      const fish = item.fish;
      const stats = fish.stats || {};
      const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
      
      console.log(`  - ${fish.name} (Lv.${fish.level}, Gen.${fish.generation}): ${totalPower} power`);
    }
    
    // 4. Test treo bán cá (nếu có cá đủ điều kiện)
    if (eligibleFish.length > 0) {
      console.log('\n4. Testing fish listing...');
      const testFish = eligibleFish[0];
      const fishId = testFish.fish.id;
      const price = 50000; // 50k coins
      
      console.log(`💰 Listing ${testFish.fish.name} for ${price.toLocaleString()} coins...`);
      
      const listResult = await FishMarketService.listFish(userId, guildId, fishId, price, 24);
      
      if (listResult.success && listResult.listing) {
        console.log('✅ Fish listed successfully!');
        console.log(`  Listing ID: ${listResult.listing.id}`);
        console.log(`  Price: ${listResult.listing.price.toLocaleString()} coins`);
        console.log(`  Expires: ${listResult.listing.expiresAt}`);
      } else {
        console.log('❌ Failed to list fish:', listResult.error);
      }
    }
    
    // 5. Kiểm tra user listings
    console.log('\n5. Checking user listings...');
    const userListings = await FishMarketService.getUserListings(userId, guildId);
    console.log(`📊 User has ${userListings.length} active listings`);
    
    for (const listing of userListings) {
      const fish = listing.fish;
      const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
      console.log(`  - ${fish.name}: ${listing.price.toLocaleString()} coins (${timeLeft}h left)`);
    }
    
    // 6. Test market stats
    console.log('\n6. Checking market stats...');
    const marketStats = await FishMarketService.getMarketStats(guildId);
    console.log(`📈 Market Stats:`);
    console.log(`  Total listings: ${marketStats.totalListings}`);
    console.log(`  Total value: ${marketStats.totalValue.toLocaleString()} coins`);
    console.log(`  Average price: ${marketStats.averagePrice.toLocaleString()} coins`);
    
    // 7. Test search functionality
    console.log('\n7. Testing search functionality...');
    const searchResult = await FishMarketService.searchFish(guildId, 'Little', 1, 5);
    console.log(`🔍 Search for "Little" found ${searchResult.total} results`);
    
    // 8. Test filter functionality
    console.log('\n8. Testing filter functionality...');
    const filterResult = await FishMarketService.filterFish(guildId, 2, 10000, 100000, 1, 5);
    console.log(`🎯 Filter (Gen 2, 10k-100k) found ${filterResult.total} results`);
    
    console.log('\n✅ Fish Market System Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFishMarket().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 