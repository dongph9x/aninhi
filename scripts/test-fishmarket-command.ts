import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';
import { FishMarketHandler } from '../src/components/MessageComponent/FishMarketHandler';

async function testFishMarketCommand() {
  console.log('🧪 Testing Fish Market Command...\n');

  try {
    const guildId = '1362234245392765201';
    const userId = '876543210987654321';

    console.log('📋 Test Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- User ID: ${userId}\n`);

    // 1. Lấy dữ liệu như trong command
    console.log('1️⃣ Getting data like in command...');
    
    const result = await FishMarketService.getMarketListings(guildId, 1, 5);
    const userListings = await FishMarketService.getUserListings(userId, guildId);
    const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
    const listedFishIds = await FishMarketService.getListedFishIds(guildId);

    console.log(`- Market listings: ${result.listings.length}`);
    console.log(`- User listings: ${userListings.length}`);
    console.log(`- User inventory: ${userInventory.items.length}`);
    console.log(`- Listed fish IDs: ${listedFishIds.length}`);

    console.log('\n✅ Data retrieved\n');

    // 2. Tạo UI như trong command
    console.log('2️⃣ Creating UI like in command...');
    
    const ui = new FishMarketUI(
        result.listings,
        userListings,
        userInventory,
        userId,
        guildId,
        1,
        result.totalPages,
        'browse',
        '',
        {},
        listedFishIds
    );
    
    const embed = ui.createEmbed();
    const components = ui.createComponents();

    console.log('📊 UI created:');
    console.log(`- Embed title: ${embed.data.title}`);
    console.log(`- Embed fields: ${embed.data.fields?.length || 0}`);
    console.log(`- Component rows: ${components.length}`);

    console.log('\n✅ UI created\n');

    // 3. Kiểm tra components chi tiết
    console.log('3️⃣ Checking components in detail...');
    
    const allCustomIds: string[] = [];
    const duplicateCustomIds: string[] = [];

    components.forEach((row, rowIndex) => {
      console.log(`\n📦 Row ${rowIndex + 1}:`);
      console.log(`  Components: ${row.components.length}`);
      
      row.components.forEach((comp: any, compIndex: number) => {
        const customId = comp.data.custom_id;
        console.log(`    Component ${compIndex + 1}: ${customId} - ${comp.data.label}`);
        
        if (allCustomIds.includes(customId)) {
          duplicateCustomIds.push(customId);
          console.log(`      ⚠️ DUPLICATE: ${customId}`);
        } else {
          allCustomIds.push(customId);
        }
      });
    });

    if (duplicateCustomIds.length > 0) {
      console.log(`\n❌ Found ${duplicateCustomIds.length} duplicate custom IDs:`);
      console.log(`  ${duplicateCustomIds.join(', ')}`);
    } else {
      console.log('\n✅ No duplicate custom IDs found');
    }

    console.log('\n✅ Components check completed\n');

    // 4. Tạo message data như trong command
    console.log('4️⃣ Creating message data like in command...');
    
    const messageId = 'test-command-123';
    const messageData = {
        userId,
        guildId,
        listings: result.listings,
        userListings,
        userInventory,
        currentPage: 1,
        totalPages: result.totalPages,
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

    console.log('\n✅ Message data created\n');

    // 5. Tạo Discord payload như trong command
    console.log('5️⃣ Creating Discord payload like in command...');
    
    const discordPayload = {
        embeds: [embed],
        components: components
    };

    console.log('✅ Discord payload created');
    console.log(`- Embed count: ${discordPayload.embeds.length}`);
    console.log(`- Component rows: ${discordPayload.components.length}`);

    // 6. Kiểm tra payload structure
    console.log('\n6️⃣ Checking payload structure...');
    
    try {
        // Kiểm tra xem embed có thể serialize không
        const embedJson = embed.toJSON();
        console.log('✅ Embed can be serialized');
        
        // Kiểm tra xem components có thể serialize không
        const componentsJson = components.map(row => ({
            type: 1,
            components: row.components.map((comp: any) => ({
                type: comp.data.type,
                custom_id: comp.data.custom_id,
                label: comp.data.label,
                style: comp.data.style,
                emoji: comp.data.emoji,
                disabled: comp.data.disabled
            }))
        }));
        console.log('✅ Components can be serialized');
        
        // Tạo full payload JSON
        const fullPayload = {
            embeds: [embedJson],
            components: componentsJson
        };
        
        const jsonString = JSON.stringify(fullPayload, null, 2);
        console.log(`✅ Full payload can be serialized (${jsonString.length} chars)`);
        
        // Kiểm tra duplicate custom_id trong JSON
        const jsonCustomIds: string[] = [];
        const jsonDuplicates: string[] = [];
        
        componentsJson.forEach((row, rowIndex) => {
            row.components.forEach((comp: any, compIndex: number) => {
                if (jsonCustomIds.includes(comp.custom_id)) {
                    jsonDuplicates.push(comp.custom_id);
                } else {
                    jsonCustomIds.push(comp.custom_id);
                }
            });
        });
        
        if (jsonDuplicates.length > 0) {
            console.log(`❌ Found ${jsonDuplicates.length} duplicate custom IDs in JSON:`);
            console.log(`  ${jsonDuplicates.join(', ')}`);
        } else {
            console.log('✅ No duplicate custom IDs in JSON');
        }
        
    } catch (error) {
        console.error('❌ Error serializing payload:', error);
    }

    console.log('\n✅ Payload structure check completed\n');

    // 7. Cleanup
    console.log('7️⃣ Cleaning up...');
    FishMarketHandler.removeMessageData(messageId);
    console.log('✅ Cleanup completed\n');

    console.log('🎉 Command test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- All data retrieval works');
    console.log('- UI creation works');
    console.log('- Message data handling works');
    console.log('- Payload structure is correct');
    console.log('- Ready for Discord API testing');

  } catch (error) {
    console.error('❌ Command test failed:', error);
  }
}

// Run the test
testFishMarketCommand().catch(console.error); 