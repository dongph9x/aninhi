import prisma from '../src/utils/prisma';
import { FishMarketService } from '../src/utils/fish-market';

async function createTestFishMarketData() {
  console.log('🐟 Creating Test Fish Market Data...\n');

  try {
    const guildId = '1362234245392765201';
    const sellerId = '123456789012345678';
    const buyerId = '876543210987654321';

    console.log('📋 Test Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- Seller ID: ${sellerId}`);
    console.log(`- Buyer ID: ${buyerId}\n`);

    // 1. Tạo hoặc cập nhật users
    console.log('1️⃣ Creating/updating users...');
    
    await prisma.user.upsert({
      where: { userId_guildId: { userId: sellerId, guildId } },
      update: { balance: 1000000 }, // 1M coins
      create: { userId: sellerId, guildId, balance: 1000000 }
    });

    await prisma.user.upsert({
      where: { userId_guildId: { userId: buyerId, guildId } },
      update: { balance: 500000 }, // 500K coins
      create: { userId: buyerId, guildId, balance: 500000 }
    });

    console.log('✅ Users created/updated\n');

    // 2. Tạo test fish cho seller
    console.log('2️⃣ Creating test fish...');
    
    const testFish = [
      {
        id: 'test-fish-1',
        species: 'Little Fish',
        level: 10,
        generation: 2,
        rarity: 'Common',
        value: 30000,
        experience: 100,
        status: 'adult',
        userId: sellerId,
        guildId,
        stats: JSON.stringify({
          strength: 30,
          agility: 25,
          intelligence: 20,
          defense: 35,
          luck: 40
        }),
        specialTraits: JSON.stringify([])
      },
      {
        id: 'test-fish-2',
        species: 'Big Fish',
        level: 10,
        generation: 3,
        rarity: 'Rare',
        value: 50000,
        experience: 100,
        status: 'adult',
        userId: sellerId,
        guildId,
        stats: JSON.stringify({
          strength: 45,
          agility: 40,
          intelligence: 35,
          defense: 50,
          luck: 55
        }),
        specialTraits: JSON.stringify([])
      },
      {
        id: 'test-fish-3',
        species: 'Rare Fish',
        level: 10,
        generation: 4,
        rarity: 'Epic',
        value: 80000,
        experience: 100,
        status: 'adult',
        userId: sellerId,
        guildId,
        stats: JSON.stringify({
          strength: 60,
          agility: 55,
          intelligence: 50,
          defense: 65,
          luck: 70
        }),
        specialTraits: JSON.stringify([])
      }
    ];

    for (const fish of testFish) {
      await prisma.fish.upsert({
        where: { id: fish.id },
        update: fish,
        create: fish
      });
    }

    console.log(`✅ Created ${testFish.length} test fish\n`);

    // 3. Tạo market listings
    console.log('3️⃣ Creating market listings...');
    
    const listings = [
      { fishId: 'test-fish-1', price: 50000, duration: 24 },
      { fishId: 'test-fish-2', price: 75000, duration: 48 },
      { fishId: 'test-fish-3', price: 120000, duration: 72 }
    ];

    for (const listing of listings) {
      const result = await FishMarketService.listFish(
        sellerId,
        guildId,
        listing.fishId,
        listing.price,
        listing.duration
      );
      
      if (result.success) {
        console.log(`✅ Listed ${result.listing?.fish.species} for ${listing.price.toLocaleString()} coins`);
      } else {
        console.log(`❌ Failed to list ${listing.fishId}: ${result.error}`);
      }
    }

    console.log('\n✅ Market listings created\n');

    // 4. Kiểm tra kết quả
    console.log('4️⃣ Checking results...');
    
    const marketListings = await FishMarketService.getMarketListings(guildId, 1, 10);
    const sellerListings = await FishMarketService.getUserListings(sellerId, guildId);
    
    console.log(`- Total market listings: ${marketListings.listings.length}`);
    console.log(`- Seller listings: ${sellerListings.length}`);
    
    marketListings.listings.forEach((listing, index) => {
      console.log(`  Listing ${index + 1}: ${listing.fish.name} - ${listing.price.toLocaleString()} coins`);
    });

    console.log('\n✅ Results check completed\n');

    // 5. Test UI với dữ liệu mới
    console.log('5️⃣ Testing UI with new data...');
    
    const { FishMarketUI } = await import('../src/components/MessageComponent/FishMarketUI');
    
    const ui = new FishMarketUI(
      marketListings.listings,
      sellerListings,
      { items: [], capacity: 10 },
      buyerId,
      guildId,
      1,
      marketListings.totalPages,
      'browse'
    );

    const embed = ui.createEmbed();
    const components = ui.createComponents();

    console.log('📊 UI created successfully:');
    console.log(`- Embed fields: ${embed.data.fields?.length || 0}`);
    console.log(`- Component rows: ${components.length}`);
    
    const buyButtons = components.flatMap(row => 
      row.components.filter((comp: any) => comp.data.custom_id?.startsWith('market_buy_quick_'))
    );
    
    console.log(`- Buy buttons: ${buyButtons.length}`);
    buyButtons.forEach((button: any, index: number) => {
      const fishId = button.data.custom_id.replace('market_buy_quick_', '');
      const listing = marketListings.listings.find(l => l.fish.id === fishId);
      console.log(`  Button ${index + 1}: ${button.data.label} - ${listing?.price.toLocaleString()} coins`);
    });

    console.log('\n✅ UI test completed\n');

    console.log('🎉 Test data creation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Use `n.fishmarket ui` to open the market interface');
    console.log('2. Test the buy buttons with the buyer account');
    console.log('3. Verify that transactions work correctly');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestFishMarketData().catch(console.error); 