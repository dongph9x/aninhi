import { PrismaClient } from '@prisma/client';
import { FishBarnUI } from '../src/components/MessageComponent/FishBarnUI.js';

const prisma = new PrismaClient();

async function testFishbarnCommand() {
    console.log('🧪 Testing FishBarn command...\n');

    try {
        // Tìm user test
        const user = await prisma.user.findFirst({
            where: {
                guildId: '1005280612845891615'
            }
        });

        if (!user) {
            console.log('❌ No test user found');
            return;
        }

        console.log(`✅ Found user: ${user.userId}`);

        // Tìm fish inventory
        const fishInventory = await prisma.fishInventory.findFirst({
            where: {
                userId: user.userId,
                guildId: user.guildId
            },
            include: {
                items: {
                    include: {
                        fish: true
                    }
                }
            }
        });

        if (!fishInventory) {
            console.log('❌ No fish inventory found');
            return;
        }

        console.log(`✅ Found fish inventory with ${fishInventory.items.length} items`);

        // Test FishBarnUI với fish đầu tiên
        const firstItem = fishInventory.items[0];
        if (!firstItem) {
            console.log('❌ No fish items found');
            return;
        }

        console.log(`\n🐟 Testing with fish: ${firstItem.fish.species}`);
        console.log(`   ID: ${firstItem.fish.id}`);

        // Tạo FishBarnUI instance
        const fishBarnUI = new FishBarnUI(
            fishInventory,
            user.userId,
            user.guildId,
            firstItem.fish.id // selectedFishId
        );

        // Load user fish food
        await fishBarnUI.loadUserFishFood();

        // Test createEmbed
        console.log('\n📝 Testing createEmbed...');
        try {
            const embed = await fishBarnUI.createEmbed();
            console.log('✅ createEmbed successful');
            console.log(`   Embed title: ${embed.data.title}`);
            console.log(`   Embed fields: ${embed.data.fields?.length || 0}`);
        } catch (error) {
            console.error('❌ Error in createEmbed:', error);
        }

        // Test createComponents
        console.log('\n🔧 Testing createComponents...');
        try {
            const components = fishBarnUI.createComponents();
            console.log('✅ createComponents successful');
            console.log(`   Components count: ${components.length}`);
        } catch (error) {
            console.error('❌ Error in createComponents:', error);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishbarnCommand().catch(console.error); 