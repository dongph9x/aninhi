import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFishbarnReal() {
    console.log('🧪 Testing FishBarn real command...\n');

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

        // Test với từng fish
        for (const item of fishInventory.items) {
            const fish = item.fish;
            console.log(`\n🐟 Testing fish: ${fish.species}`);
            console.log(`   ID: ${fish.id}`);

            // Test logic tương tự như trong fishbarn command
            console.log(`   Looking for fish with ID: ${fish.id}`);
            
            const selected = fishInventory.items.find((item: any) => item.fish.id === fish.id);
            if (selected) {
                console.log(`   ✅ Found selected fish: ${selected.fish.species}`);
                
                // Test logic tương tự như trong FishBarnUI.createEmbed
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
                
            } else {
                console.log(`   ❌ Selected fish not found`);
            }
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishbarnReal().catch(console.error); 