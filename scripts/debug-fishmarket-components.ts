import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';

async function debugFishMarketComponents() {
  console.log('🔍 Debugging Fish Market Components...\n');

  try {
    const guildId = '1362234245392765201';
    const userId = '876543210987654321';

    console.log('📋 Setup:');
    console.log(`- Guild ID: ${guildId}`);
    console.log(`- User ID: ${userId}\n`);

    // 1. Lấy dữ liệu
    console.log('1️⃣ Getting data...');
    
    const marketListings = await FishMarketService.getMarketListings(guildId, 1, 5);
    const userListings = await FishMarketService.getUserListings(userId, guildId);
    const userInventory = await FishInventoryService.getFishInventory(userId, guildId);
    const listedFishIds = await FishMarketService.getListedFishIds(guildId);

    console.log(`- Market listings: ${marketListings.listings.length}`);
    console.log(`- User listings: ${userListings.length}`);
    console.log(`- User inventory: ${userInventory.items.length}`);

    console.log('\n✅ Data retrieved\n');

    // 2. Tạo UI
    console.log('2️⃣ Creating UI...');
    
    const ui = new FishMarketUI(
      marketListings.listings,
      userListings,
      userInventory,
      userId,
      guildId,
      1,
      marketListings.totalPages,
      'browse',
      '',
      {},
      listedFishIds
    );

    const components = ui.createComponents();

    console.log(`- Total component rows: ${components.length}`);

    console.log('\n✅ UI created\n');

    // 3. Debug components
    console.log('3️⃣ Debugging components...');
    
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
          console.log(`    ⚠️ DUPLICATE FOUND: ${customId}`);
        } else {
          allCustomIds.push(customId);
        }
      });
    });

    console.log('\n✅ Component debugging completed\n');

    // 4. Tóm tắt
    console.log('4️⃣ Summary:');
    console.log(`- Total custom IDs: ${allCustomIds.length}`);
    console.log(`- Unique custom IDs: ${new Set(allCustomIds).size}`);
    
    if (duplicateCustomIds.length > 0) {
      console.log(`- Duplicate custom IDs: ${duplicateCustomIds.length}`);
      console.log(`  Duplicates: ${duplicateCustomIds.join(', ')}`);
    } else {
      console.log('- No duplicate custom IDs found');
    }

    console.log('\n✅ Summary completed\n');

    // 5. Test với Discord API format
    console.log('5️⃣ Testing Discord API format...');
    
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
      
      discordFormat.forEach((row, index) => {
        console.log(`  Row ${index + 1}: ${row.components.length} components`);
        row.components.forEach((comp: any, compIndex: number) => {
          console.log(`    ${compIndex + 1}. ${comp.custom_id} - ${comp.label}`);
        });
      });

    } catch (error) {
      console.error('❌ Error creating Discord format:', error);
    }

    console.log('\n✅ Discord format test completed\n');

    console.log('🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugFishMarketComponents().catch(console.error); 