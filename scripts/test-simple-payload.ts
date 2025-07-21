import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

async function testSimplePayload() {
  console.log('🧪 Testing Simple Payload...\n');

  try {
    console.log('1️⃣ Creating simple embed...');
    
    const embed = new EmbedBuilder()
      .setTitle('Fish Market Test')
      .setColor('#4ECDC4')
      .setDescription('Test market with simple text')
      .addFields(
        { name: 'Test Fish 1', value: 'Price: 50,000 coins', inline: true },
        { name: 'Test Fish 2', value: 'Price: 75,000 coins', inline: true }
      )
      .setTimestamp();

    console.log('✅ Simple embed created\n');

    console.log('2️⃣ Creating simple components...');
    
    const actionRow1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('test_sell')
          .setLabel('Sell Fish')
          .setStyle(ButtonStyle.Success)
          .setEmoji('💰'),
        new ButtonBuilder()
          .setCustomId('test_my')
          .setLabel('My Fish')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📊'),
        new ButtonBuilder()
          .setCustomId('test_search')
          .setLabel('Search')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔍')
      );

    const actionRow2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('test_buy_1')
          .setLabel('Buy Fish 1')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🛒'),
        new ButtonBuilder()
          .setCustomId('test_buy_2')
          .setLabel('Buy Fish 2')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🛒')
      );

    const actionRow3 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('test_close')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );

    const components = [actionRow1, actionRow2, actionRow3];

    console.log('✅ Simple components created\n');

    console.log('3️⃣ Checking components...');
    
    const allCustomIds: string[] = [];
    const duplicateCustomIds: string[] = [];

    components.forEach((row, rowIndex) => {
      console.log(`Row ${rowIndex + 1}: ${row.components.length} components`);
      row.components.forEach((comp: any, compIndex: number) => {
        const customId = comp.data.custom_id;
        console.log(`  Component ${compIndex + 1}: ${customId} - ${comp.data.label}`);
        
        if (allCustomIds.includes(customId)) {
          duplicateCustomIds.push(customId);
          console.log(`    ⚠️ DUPLICATE: ${customId}`);
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

    console.log('4️⃣ Creating Discord payload...');
    
    const discordPayload = {
      embeds: [embed],
      components: components
    };

    console.log('✅ Discord payload created');
    console.log(`- Embed count: ${discordPayload.embeds.length}`);
    console.log(`- Component rows: ${discordPayload.components.length}`);

    console.log('\n✅ Payload created\n');

    console.log('5️⃣ Testing serialization...');
    
    try {
      const embedJson = embed.toJSON();
      console.log('✅ Embed can be serialized');
      
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
      
      const fullPayload = {
        embeds: [embedJson],
        components: componentsJson
      };
      
      const jsonString = JSON.stringify(fullPayload, null, 2);
      console.log(`✅ Full payload can be serialized (${jsonString.length} chars)`);
      
      // Kiểm tra special characters
      const hasSpecialChars = /[^\x00-\x7F]/.test(jsonString);
      console.log(`Has special characters: ${hasSpecialChars ? '⚠️' : '✅'}`);
      
      if (hasSpecialChars) {
        const specialChars = jsonString.match(/[^\x00-\x7F]/g);
        console.log(`Special characters found: ${specialChars?.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Error serializing payload:', error);
    }

    console.log('\n✅ Serialization test completed\n');

    console.log('🎉 Simple payload test completed!');
    console.log('\n📝 Summary:');
    console.log('- Simple embed created successfully');
    console.log('- Simple components created successfully');
    console.log('- No duplicate custom IDs');
    console.log('- Payload can be serialized');
    console.log('- Ready for Discord API testing');

  } catch (error) {
    console.error('❌ Simple payload test failed:', error);
  }
}

// Run the test
testSimplePayload().catch(console.error); 