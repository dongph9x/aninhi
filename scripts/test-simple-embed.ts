import { EmbedBuilder } from 'discord.js';

async function testSimpleEmbed() {
    try {
        console.log('🔍 Testing Simple Embed...\n');

        // Tạo embed đơn giản
        const embed = new EmbedBuilder()
            .setTitle('🎯 Test Embed')
            .setColor('#FF6B6B')
            .setDescription('Test description')
            .setTimestamp();

        embed.addFields({
            name: '📊 Test Field',
            value: 'Test value content',
            inline: false
        });

        console.log('✅ Embed created');

        // Kiểm tra embed data
        const embedData = embed.toJSON();
        console.log('\n📋 Embed Data (toJSON):');
        console.log('- Title:', embedData.title);
        console.log('- Description:', embedData.description);
        console.log('- Fields:', embedData.fields?.length || 0);

        // Kiểm tra embed data khác
        console.log('\n📋 Embed Data (data):');
        console.log('- Title:', embed.data.title);
        console.log('- Description:', embed.data.description);
        console.log('- Fields:', embed.data.fields?.length || 0);

        // Test với message giả
        const fakeMessage = {
            reply: async (options: any) => {
                console.log('\n📋 Message Reply Options:');
                console.log('- Embeds:', options.embeds?.length || 0);
                
                if (options.embeds && options.embeds.length > 0) {
                    const embed = options.embeds[0];
                    console.log('- Embed Title:', embed.title);
                    console.log('- Embed Description:', embed.description);
                    console.log('- Embed Fields:', embed.fields?.length || 0);
                    
                    // Kiểm tra embed data chi tiết
                    console.log('\n📋 Embed Data Detail:');
                    console.log('- Full embed:', JSON.stringify(embed, null, 2));
                }
                
                return { id: 'test-message-id' };
            }
        };

        await fakeMessage.reply({
            embeds: [embed]
        });

        console.log('\n🎉 Simple Embed Test Complete!');

    } catch (error) {
        console.error('❌ Error testing simple embed:', error);
    }
}

testSimpleEmbed();
