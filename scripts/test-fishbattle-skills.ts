import { showAllSkillsSystem } from '../src/commands/text/ecommerce/fishbattle';

async function testFishbattleSkills() {
    try {
        console.log('🔍 Testing n.fishbattle skills command...\n');

        // Tạo message giả
        const fakeMessage = {
            reply: async (options: any) => {
                console.log('📋 Message Reply:');
                console.log('- Embeds:', options.embeds?.length || 0);
                console.log('- Components:', options.components?.length || 0);
                
                if (options.embeds && options.embeds.length > 0) {
                    const embed = options.embeds[0];
                    console.log('\n📄 Embed Content:');
                    console.log('- Title:', embed.title);
                    console.log('- Description:', embed.description);
                    console.log('- Fields:', embed.fields?.length || 0);
                    
                    if (embed.fields) {
                        embed.fields.forEach((field: any, index: number) => {
                            console.log(`\n--- Field ${index + 1}: ${field.name} ---`);
                            console.log(field.value);
                        });
                    }
                }
                
                if (options.components && options.components.length > 0) {
                    console.log('\n🎮 Components:');
                    options.components.forEach((component: any, index: number) => {
                        console.log(`- Component ${index + 1}:`, component.components?.length || 0, 'items');
                        if (component.components) {
                            component.components.forEach((item: any) => {
                                console.log(`  - ${item.data?.custom_id || 'unknown'}: ${item.data?.label || 'no label'}`);
                            });
                        }
                    });
                }
                
                return { id: 'test-message-id' };
            }
        };

        const userId = 'test-user';
        const guildId = 'test-guild';

        // Gọi function
        await showAllSkillsSystem(fakeMessage, userId, guildId);

        console.log('\n🎉 Test Complete!');
        console.log('✅ Check if only FIRST skill of each element is shown');
        console.log('✅ Check if other skills are mentioned as "+ X skills khác"');

    } catch (error) {
        console.error('❌ Error testing fishbattle skills:', error);
    }
}

testFishbattleSkills();
