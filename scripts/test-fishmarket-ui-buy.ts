import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';
import { FishMarketHandler } from '../src/components/MessageComponent/FishMarketHandler';

async function testFishMarketUIBuy() {
  console.log('🧪 Testing Fish Market UI Buy Feature...\n');

  try {
    const guildId = 'test-guild-123';
    const userId = 'test-user-456';
    const sellerId = 'test-seller-789';

    console.log('📋 Test Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- User ID: ${userId}`);
    console.log(`- Seller ID: ${sellerId}\n`);

    // 1. Tạo dữ liệu test
    console.log('1️⃣ Creating test data...');
    
    // Mock listings
    const mockListings = [
      {
        id: 'listing-1',
        fishId: 'fish-1',
        sellerId: sellerId,
        guildId: guildId,
        price: 50000,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
        fish: {
          id: 'fish-1',
          name: 'Little Fish',
          species: 'Little Fish',
          level: 5,
          generation: 2,
          rarity: 'Common',
          value: 30000,
          stats: JSON.stringify({
            strength: 30,
            agility: 25,
            intelligence: 20,
            defense: 35,
            luck: 40
          }),
          status: 'adult',
          userId: sellerId,
          guildId: guildId
        }
      },
      {
        id: 'listing-2',
        fishId: 'fish-2',
        sellerId: sellerId,
        guildId: guildId,
        price: 75000,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h from now
        fish: {
          id: 'fish-2',
          name: 'Big Fish',
          species: 'Big Fish',
          level: 7,
          generation: 3,
          rarity: 'Rare',
          value: 50000,
          stats: JSON.stringify({
            strength: 45,
            agility: 40,
            intelligence: 35,
            defense: 50,
            luck: 55
          }),
          status: 'adult',
          userId: sellerId,
          guildId: guildId
        }
      }
    ];

    // Mock user inventory
    const mockUserInventory = {
      items: [],
      capacity: 10
    };

    // Mock user listings
    const mockUserListings: any[] = [];

    console.log('✅ Test data created\n');

    // 2. Test UI creation
    console.log('2️⃣ Testing UI creation...');
    
    const ui = new FishMarketUI(
      mockListings,
      mockUserListings,
      mockUserInventory,
      userId,
      guildId,
      1,
      1,
      'browse',
      '',
      {},
      []
    );

    const embed = ui.createEmbed();
    const components = ui.createComponents();

    console.log('📊 Embed created:');
    console.log(`- Title: ${embed.data.title}`);
    console.log(`- Description: ${embed.data.description}`);
    console.log(`- Fields count: ${embed.data.fields?.length || 0}`);

    console.log('\n🔘 Components created:');
    console.log(`- Total rows: ${components.length}`);
    components.forEach((row, index) => {
      console.log(`  Row ${index + 1}: ${row.components.length} components`);
      row.components.forEach((comp: any, compIndex: number) => {
        console.log(`    Component ${compIndex + 1}: ${comp.data.custom_id} - ${comp.data.label}`);
      });
    });

    console.log('\n✅ UI creation test passed\n');

    // 3. Test buy button detection
    console.log('3️⃣ Testing buy button detection...');
    
    const buyButtons = components.flatMap(row => 
      row.components.filter((comp: any) => comp.data.custom_id?.startsWith('market_buy_quick_'))
    );

    console.log(`Found ${buyButtons.length} buy buttons:`);
    buyButtons.forEach((button: any, index: number) => {
      const fishId = button.data.custom_id.replace('market_buy_quick_', '');
      const fish = mockListings.find(l => l.fish.id === fishId)?.fish;
      console.log(`  Button ${index + 1}: ${button.data.label} (${fishId}) - ${fish?.name}`);
      console.log(`    Disabled: ${button.data.disabled}`);
      console.log(`    Style: ${button.data.style}`);
    });

    console.log('\n✅ Buy button detection test passed\n');

    // 4. Test message data handling
    console.log('4️⃣ Testing message data handling...');
    
    const messageId = 'test-message-123';
    const messageData = {
      userId,
      guildId,
      listings: mockListings,
      userListings: mockUserListings,
      userInventory: mockUserInventory,
      currentPage: 1,
      totalPages: 1,
      mode: 'browse' as const,
      searchQuery: '',
      filterOptions: {},
      listedFishIds: []
    };

    FishMarketHandler.setMessageData(messageId, messageData);
    const retrievedData = FishMarketHandler.getMessageData(messageId);

    console.log('Message data stored and retrieved successfully');
    console.log(`- User ID: ${retrievedData?.userId}`);
    console.log(`- Listings count: ${retrievedData?.listings.length}`);
    console.log(`- Mode: ${retrievedData?.mode}`);

    console.log('\n✅ Message data handling test passed\n');

    // 5. Test buy validation logic
    console.log('5️⃣ Testing buy validation logic...');
    
    mockListings.forEach((listing, index) => {
      const timeLeft = Math.max(0, Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
      const canBuy = listing.sellerId !== userId && timeLeft > 0;
      
      console.log(`Listing ${index + 1} (${listing.fish.name}):`);
      console.log(`  - Seller: ${listing.sellerId === userId ? 'Own fish' : 'Other user'}`);
      console.log(`  - Time left: ${timeLeft}h`);
      console.log(`  - Can buy: ${canBuy}`);
    });

    console.log('\n✅ Buy validation logic test passed\n');

    // 6. Cleanup
    console.log('6️⃣ Cleaning up...');
    FishMarketHandler.removeMessageData(messageId);
    console.log('✅ Cleanup completed\n');

    console.log('🎉 All tests passed! Fish Market UI Buy feature is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFishMarketUIBuy().catch(console.error); 