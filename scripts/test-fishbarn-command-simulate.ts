import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFishbarnCommandSimulate() {
    console.log('🧪 Testing FishBarn command simulation...\n');

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

        // Test với fish đầu tiên
        const firstItem = fishInventory.items[0];
        if (!firstItem) {
            console.log('❌ No fish items found');
            return;
        }

        const fish = firstItem.fish;
        console.log(`\n🐟 Testing with fish: ${fish.species}`);
        console.log(`   ID: ${fish.id}`);

        // Simulate logic từ fishbarn command
        console.log(`🔍 Looking for fish with ID: ${fish.id}`);
        
        const selected = fishInventory.items.find((item: any) => item.fish.id === fish.id);
        if (selected) {
            console.log(`📦 Inventory items: [ { id: '${selected.fish.id}', name: '${selected.fish.species}' } ]`);
            console.log(`🎯 Found selected fish: ${selected.fish.species}`);
            
            // Simulate FishBarnUI.createEmbed logic
            console.log(`\n📝 Simulating FishBarnUI.createEmbed...`);
            
            try {
                const fishData = selected.fish;
                const stats = fishData.stats || {};
                const totalPower = ((stats as any).strength || 0) + ((stats as any).agility || 0) + ((stats as any).intelligence || 0) + ((stats as any).defense || 0) + ((stats as any).luck || 0);
                const statusEmoji = fishData.status === 'adult' ? '🐟' : '🐠';
                
                // Test createLevelBar
                const level = fishData.level;
                const exp = fishData.experience;
                const expNeeded = level * 100;
                
                const expNum = typeof exp === 'bigint' ? Number(exp) : Number(exp);
                const expNeededNum = typeof expNeeded === 'bigint' ? Number(expNeeded) : Number(expNeeded);
                
                let levelBar: string;
                if (level >= 10) {
                    levelBar = '🟢 MAX';
                } else if (expNeededNum <= 0) {
                    levelBar = '🟢 MAX';
                } else {
                    const progress = Math.floor((expNum / expNeededNum) * 10);
                    const safeProgress = Math.max(0, Math.min(10, progress));
                    levelBar = '🟦'.repeat(safeProgress) + '⬜'.repeat(10 - safeProgress);
                    levelBar = `${levelBar} ${expNum}/${expNeededNum}`;
                }
                
                const levelBonus = level > 1 ? (level - 1) * 0.02 : 0;
                const finalValue = Math.floor(Number(fishData.value) * (1 + levelBonus));
                
                console.log(`   ✅ Level bar: ${levelBar}`);
                console.log(`   ✅ Final value: ${finalValue}`);
                console.log(`   ✅ Total power: ${totalPower}`);
                console.log(`   ✅ Status emoji: ${statusEmoji}`);
                console.log(`   ✅ Fish value (BigInt): ${fishData.value}`);
                console.log(`   ✅ Fish value (Number): ${Number(fishData.value)}`);
                
                // Test toLocaleString
                const valueString = Number(fishData.value).toLocaleString();
                console.log(`   ✅ Value string: ${valueString}`);
                
                console.log(`\n✅ FishBarnUI.createEmbed simulation successful!`);
                
            } catch (error) {
                console.error(`   ❌ Error in FishBarnUI.createEmbed simulation:`, error);
            }
            
        } else {
            console.log(`   ❌ Selected fish not found`);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishbarnCommandSimulate().catch(console.error); 