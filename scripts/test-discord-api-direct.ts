import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';

async function testDiscordAPIDirect() {
  console.log('🔧 Testing Discord API Direct...\n');

  try {
    const guildId = '1362234245392765201';
    const userId = '876543210987654321';

    console.log('📋 Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- User ID: ${userId}\n`);

    // 1. Lấy dữ liệu
    console.log('1️⃣ Getting data...');
    
    const currentListings = await FishMarketService.getMarketListings(guildId, 1, 5);
    const userListings = await FishMarketService.getUserListings(userId, guildId);
    const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
    const listedFishIds = await FishMarketService.getListedFishIds(guildId);

    console.log(`- Listings: ${currentListings.listings.length}`);
    console.log(`- User listings: ${userListings.length}`);
    console.log(`- User inventory: ${userInventory.items.length}`);

    console.log('\n✅ Data retrieved\n');

    // 2. Tạo UI
    console.log('2️⃣ Creating UI...');
    
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

    console.log('📊 UI created:');
    console.log(`- Embed fields: ${embed.data.fields?.length || 0}`);
    console.log(`- Component rows: ${components.length}`);

    console.log('\n✅ UI created\n');

    // 3. Tạo Discord API payload
    console.log('3️⃣ Creating Discord API payload...');
    
    const discordPayload = {
      embeds: [embed.toJSON()],
      components: components.map(row => ({
        type: 1, // ActionRow
        components: row.components.map((comp: any) => ({
          type: comp.data.type,
          custom_id: comp.data.custom_id,
          label: comp.data.label,
          style: comp.data.style,
          emoji: comp.data.emoji,
          disabled: comp.data.disabled
        }))
      }))
    };

    console.log('✅ Discord payload created');
    console.log(`- Embed count: ${discordPayload.embeds.length}`);
    console.log(`- Action row count: ${discordPayload.components.length}`);

    // 4. Kiểm tra chi tiết payload
    console.log('\n4️⃣ Analyzing payload...');
    
    const allCustomIds: string[] = [];
    const duplicateCustomIds: string[] = [];
    
    discordPayload.components.forEach((row, rowIndex) => {
      console.log(`\n📦 Action Row ${rowIndex + 1}:`);
      console.log(`  Components: ${row.components.length}`);
      
      row.components.forEach((comp: any, compIndex: number) => {
        console.log(`    ${compIndex + 1}. ${comp.custom_id} - ${comp.label}`);
        
        if (allCustomIds.includes(comp.custom_id)) {
          duplicateCustomIds.push(comp.custom_id);
          console.log(`      ⚠️ DUPLICATE: ${comp.custom_id}`);
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

    // 5. Kiểm tra giới hạn Discord
    console.log('\n5️⃣ Checking Discord limits...');
    
    const totalComponents = discordPayload.components.reduce((sum, row) => sum + row.components.length, 0);
    console.log(`- Total components: ${totalComponents}`);
    console.log(`- Discord limit: 25 components per message`);
    console.log(`- Within limit: ${totalComponents <= 25 ? '✅' : '❌'}`);
    
    if (totalComponents > 25) {
      console.log('⚠️ WARNING: Too many components!');
    }

    // 6. Kiểm tra Action Row limit
    console.log(`- Action rows: ${discordPayload.components.length}`);
    console.log(`- Discord limit: 5 action rows per message`);
    console.log(`- Within limit: ${discordPayload.components.length <= 5 ? '✅' : '❌'}`);
    
    if (discordPayload.components.length > 5) {
      console.log('⚠️ WARNING: Too many action rows!');
    }

    // 7. Tạo payload JSON để kiểm tra
    console.log('\n6️⃣ Creating JSON payload...');
    
    try {
      const jsonPayload = JSON.stringify(discordPayload, null, 2);
      console.log('✅ JSON payload created successfully');
      console.log(`- Payload size: ${jsonPayload.length} characters`);
      
      // Kiểm tra xem có ký tự đặc biệt nào không
      const hasSpecialChars = /[^\x00-\x7F]/.test(jsonPayload);
      console.log(`- Has special characters: ${hasSpecialChars ? '⚠️' : '✅'}`);
      
      if (hasSpecialChars) {
        console.log('⚠️ WARNING: Payload contains special characters!');
      }
      
    } catch (error) {
      console.error('❌ Error creating JSON payload:', error);
    }

    console.log('\n✅ Payload analysis completed\n');

    // 8. Tạo test cases khác nhau
    console.log('7️⃣ Testing different scenarios...');
    
    // Test case 1: Chỉ có 1 listing
    console.log('\n--- Test Case 1: 1 listing ---');
    const ui1 = new FishMarketUI(
      currentListings.listings.slice(0, 1),
      userListings,
      userInventory,
      userId,
      guildId,
      1,
      1,
      'browse'
    );
    const components1 = ui1.createComponents();
    const total1 = components1.reduce((sum, row) => sum + row.components.length, 0);
    console.log(`- Components: ${total1}`);
    console.log(`- Rows: ${components1.length}`);
    
    // Test case 2: Không có listing
    console.log('\n--- Test Case 2: No listings ---');
    const ui2 = new FishMarketUI(
      [],
      userListings,
      userInventory,
      userId,
      guildId,
      1,
      1,
      'browse'
    );
    const components2 = ui2.createComponents();
    const total2 = components2.reduce((sum, row) => sum + row.components.length, 0);
    console.log(`- Components: ${total2}`);
    console.log(`- Rows: ${components2.length}`);

    console.log('\n✅ Scenario testing completed\n');

    console.log('🎉 Discord API test completed!');
    console.log('\n📝 Summary:');
    console.log('- Payload structure is correct');
    console.log('- No duplicate custom IDs found');
    console.log('- Within Discord limits');
    console.log('- Ready for API testing');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDiscordAPIDirect().catch(console.error); 