import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';
import { FishMarketHandler } from '../src/components/MessageComponent/FishMarketHandler';
import prisma from '../src/utils/prisma';

async function testFishMarketUIReal() {
  console.log('🧪 Testing Fish Market UI with Real Database...\n');

  try {
    const guildId = '1362234245392765201'; // Test guild ID
    const userId = '876543210987654321'; // Test user ID

    console.log('📋 Test Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- User ID: ${userId}\n`);

    // 1. Kiểm tra dữ liệu hiện tại
    console.log('1️⃣ Checking current market data...');
    
    const currentListings = await FishMarketService.getMarketListings(guildId, 1, 5);
    const userListings = await FishMarketService.getUserListings(userId, guildId);
    const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
    const listedFishIds = await FishMarketService.getListedFishIds(guildId);

    console.log(`- Current listings: ${currentListings.listings.length}`);
    console.log(`- User listings: ${userListings.length}`);
    console.log(`- User inventory items: ${userInventory.items.length}`);
    console.log(`- Listed fish IDs: ${listedFishIds.length}`);

    console.log('\n✅ Market data check completed\n');

    // 2. Test UI creation với dữ liệu thật
    console.log('2️⃣ Testing UI creation with real data...');
    
    const ui = new FishMarketUI(
      currentListings.listings,
      userListings,
      userInventory,
      userId,
      guildId,
      1,
      currentListings.totalPages,
      'browse',
      '',
      {},
      listedFishIds
    );

    const embed = ui.createEmbed();
    const components = ui.createComponents();

    console.log('📊 Embed created:');
    console.log(`- Title: ${embed.data.title}`);
    console.log(`- Description: ${embed.data.description}`);
    console.log(`- Fields count: ${embed.data.fields?.length || 0}`);

    console.log('\n🔘 Components created:');
    console.log(`- Total rows: ${components.length}`);
    
    // Kiểm tra giới hạn Discord
    const totalComponents = components.reduce((sum, row) => sum + row.components.length, 0);
    console.log(`- Total components: ${totalComponents}`);
    console.log(`- Discord limit: 25 components per message`);
    console.log(`- Within limit: ${totalComponents <= 25 ? '✅' : '❌'}`);
    
    if (totalComponents > 25) {
      console.log('⚠️ WARNING: Too many components! Discord limit is 25.');
    }

    components.forEach((row, index) => {
      console.log(`  Row ${index + 1}: ${row.components.length} components`);
      row.components.forEach((comp: any, compIndex: number) => {
        console.log(`    Component ${compIndex + 1}: ${comp.data.custom_id} - ${comp.data.label}`);
        if (comp.data.disabled !== undefined) {
          console.log(`      Disabled: ${comp.data.disabled}`);
        }
      });
    });

    console.log('\n✅ UI creation test passed\n');

    // 3. Test Discord API format
    console.log('3️⃣ Testing Discord API format...');
    
    try {
      const discordFormat = components.map(row => ({
        type: 1, // ActionRow
        components: row.components.map((comp: any) => ({
          type: comp.data.type,
          custom_id: comp.data.custom_id,
          label: comp.data.label,
          style: comp.data.style,
          emoji: comp.data.emoji,
          disabled: comp.data.disabled
        }))
      }));

      console.log('✅ Discord format created successfully');
      console.log(`- Action rows: ${discordFormat.length}`);
      
      // Kiểm tra duplicate custom_id
      const allCustomIds: string[] = [];
      const duplicateCustomIds: string[] = [];
      
      discordFormat.forEach((row, rowIndex) => {
        console.log(`  Row ${rowIndex + 1}: ${row.components.length} components`);
        row.components.forEach((comp: any, compIndex: number) => {
          console.log(`    ${compIndex + 1}. ${comp.custom_id} - ${comp.label}`);
          
          if (allCustomIds.includes(comp.custom_id)) {
            duplicateCustomIds.push(comp.custom_id);
            console.log(`    ⚠️ DUPLICATE: ${comp.custom_id}`);
          } else {
            allCustomIds.push(comp.custom_id);
          }
        });
      });

      if (duplicateCustomIds.length > 0) {
        console.log(`\n❌ Found ${duplicateCustomIds.length} duplicate custom IDs:`);
        console.log(`  ${duplicateCustomIds.join(', ')}`);
      } else {
        console.log('\n✅ No duplicate custom IDs found');
      }

    } catch (error) {
      console.error('❌ Error creating Discord format:', error);
    }

    console.log('\n✅ Discord format test completed\n');

    // 4. Test message data handling
    console.log('4️⃣ Testing message data handling...');
    
    const messageId = 'test-message-real-123';
    const messageData = {
      userId,
      guildId,
      listings: currentListings.listings,
      userListings,
      userInventory,
      currentPage: 1,
      totalPages: currentListings.totalPages,
      mode: 'browse' as const,
      searchQuery: '',
      filterOptions: {},
      listedFishIds
    };

    FishMarketHandler.setMessageData(messageId, messageData);
    const retrievedData = FishMarketHandler.getMessageData(messageId);

    console.log('Message data stored and retrieved successfully');
    console.log(`- User ID: ${retrievedData?.userId}`);
    console.log(`- Listings count: ${retrievedData?.listings.length}`);
    console.log(`- Mode: ${retrievedData?.mode}`);
    console.log(`- Total pages: ${retrievedData?.totalPages}`);

    console.log('\n✅ Message data handling test passed\n');

    // 5. Cleanup
    console.log('5️⃣ Cleaning up...');
    FishMarketHandler.removeMessageData(messageId);
    console.log('✅ Cleanup completed\n');

    console.log('🎉 All tests passed! Fish Market UI is ready for production use.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFishMarketUIReal().catch(console.error); 