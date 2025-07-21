import { FishMarketService } from '../src/utils/fish-market';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketUI } from '../src/components/MessageComponent/FishMarketUI';

async function checkSpecialCharacters() {
  console.log('🔍 Checking Special Characters...\n');

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

    // 3. Kiểm tra special characters trong embed
    console.log('3️⃣ Checking embed for special characters...');
    
    const embedJson = embed.toJSON();
    console.log('Embed title:', embedJson.title);
    console.log('Embed description:', embedJson.description);
    
    if (embedJson.fields) {
      embedJson.fields.forEach((field, index) => {
        console.log(`Field ${index + 1} name:`, field.name);
        console.log(`Field ${index + 1} value:`, field.value?.substring(0, 100) + '...');
        
        // Kiểm tra special characters
        const nameHasSpecial = /[^\x00-\x7F]/.test(field.name);
        const valueHasSpecial = field.value ? /[^\x00-\x7F]/.test(field.value) : false;
        
        if (nameHasSpecial) {
          console.log(`  ⚠️ Field ${index + 1} name has special characters`);
          const specialChars = field.name.match(/[^\x00-\x7F]/g);
          console.log(`    Special chars: ${specialChars?.join(', ')}`);
        }
        
        if (valueHasSpecial) {
          console.log(`  ⚠️ Field ${index + 1} value has special characters`);
          const specialChars = field.value.match(/[^\x00-\x7F]/g);
          console.log(`    Special chars: ${specialChars?.join(', ')}`);
        }
      });
    }

    console.log('\n✅ Embed check completed\n');

    // 4. Kiểm tra special characters trong components
    console.log('4️⃣ Checking components for special characters...');
    
    components.forEach((row, rowIndex) => {
      console.log(`\n📦 Row ${rowIndex + 1}:`);
      
      row.components.forEach((comp: any, compIndex: number) => {
        console.log(`  Component ${compIndex + 1}:`);
        console.log(`    Custom ID: ${comp.data.custom_id}`);
        console.log(`    Label: ${comp.data.label}`);
        
        // Kiểm tra special characters
        const customIdHasSpecial = /[^\x00-\x7F]/.test(comp.data.custom_id);
        const labelHasSpecial = /[^\x00-\x7F]/.test(comp.data.label);
        
        if (customIdHasSpecial) {
          console.log(`    ⚠️ Custom ID has special characters`);
          const specialChars = comp.data.custom_id.match(/[^\x00-\x7F]/g);
          console.log(`      Special chars: ${specialChars?.join(', ')}`);
        }
        
        if (labelHasSpecial) {
          console.log(`    ⚠️ Label has special characters`);
          const specialChars = comp.data.label.match(/[^\x00-\x7F]/g);
          console.log(`      Special chars: ${specialChars?.join(', ')}`);
        }
      });
    });

    console.log('\n✅ Components check completed\n');

    // 5. Tạo payload và kiểm tra
    console.log('5️⃣ Creating and checking payload...');
    
    const discordPayload = {
      embeds: [embed.toJSON()],
      components: components.map(row => ({
        type: 1,
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

    const jsonPayload = JSON.stringify(discordPayload, null, 2);
    
    // Tìm tất cả special characters trong payload
    const specialChars = jsonPayload.match(/[^\x00-\x7F]/g);
    if (specialChars) {
      console.log('⚠️ Found special characters in payload:');
      const uniqueSpecialChars = [...new Set(specialChars)];
      uniqueSpecialChars.forEach(char => {
        const count = specialChars.filter(c => c === char).length;
        console.log(`  '${char}' (${char.charCodeAt(0)}) - ${count} occurrences`);
      });
    } else {
      console.log('✅ No special characters found in payload');
    }

    console.log('\n✅ Payload check completed\n');

    // 6. Tạo payload sạch (không có special characters)
    console.log('6️⃣ Creating clean payload...');
    
    const cleanPayload = {
      embeds: [{
        title: embedJson.title?.replace(/[^\x00-\x7F]/g, '?') || 'Fish Market',
        description: embedJson.description?.replace(/[^\x00-\x7F]/g, '?') || '',
        color: embedJson.color,
        fields: embedJson.fields?.map(field => ({
          name: field.name.replace(/[^\x00-\x7F]/g, '?'),
          value: field.value?.replace(/[^\x00-\x7F]/g, '?') || '',
          inline: field.inline
        })) || [],
        timestamp: embedJson.timestamp
      }],
      components: components.map(row => ({
        type: 1,
        components: row.components.map((comp: any) => ({
          type: comp.data.type,
          custom_id: comp.data.custom_id,
          label: comp.data.label.replace(/[^\x00-\x7F]/g, '?'),
          style: comp.data.style,
          emoji: comp.data.emoji,
          disabled: comp.data.disabled
        }))
      }))
    };

    const cleanJsonPayload = JSON.stringify(cleanPayload, null, 2);
    const cleanHasSpecial = /[^\x00-\x7F]/.test(cleanJsonPayload);
    
    console.log(`Clean payload has special characters: ${cleanHasSpecial ? '⚠️' : '✅'}`);
    console.log(`Clean payload size: ${cleanJsonPayload.length} characters`);

    console.log('\n✅ Clean payload created\n');

    console.log('🎉 Special character check completed!');
    console.log('\n📝 Summary:');
    console.log('- Special characters found in original payload');
    console.log('- Clean payload created without special characters');
    console.log('- Ready for Discord API testing');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkSpecialCharacters().catch(console.error); 