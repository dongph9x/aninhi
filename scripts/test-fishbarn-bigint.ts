import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFishbarnBigInt() {
    console.log('🧪 Testing FishBarn BigInt issues...\n');

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
            console.log(`   Level: ${fish.level}`);
            console.log(`   Experience: ${fish.experience} (type: ${typeof fish.experience})`);
            console.log(`   Value: ${fish.value} (type: ${typeof fish.value})`);

            // Test createLevelBar logic
            const level = fish.level;
            const exp = fish.experience;
            // Calculate experience needed for next level
            const expNeeded = level * 100; // Giả sử cần 100 exp mỗi level

            console.log(`   Testing createLevelBar...`);
            
            // Convert BigInt to number if needed
            const expNum = typeof exp === 'bigint' ? Number(exp) : exp;
            const expNeededNum = typeof expNeeded === 'bigint' ? Number(expNeeded) : expNeeded;

            console.log(`   Converted exp: ${expNum} (type: ${typeof expNum})`);
            console.log(`   Converted expNeeded: ${expNeededNum} (type: ${typeof expNeededNum})`);

            if (level >= 10) {
                console.log(`   Result: 🟢 MAX`);
            } else if (expNeededNum <= 0) {
                console.log(`   Result: 🟢 MAX`);
            } else {
                const progress = Math.floor((expNum / expNeededNum) * 10);
                const safeProgress = Math.max(0, Math.min(10, progress));
                const bar = '🟦'.repeat(safeProgress) + '⬜'.repeat(10 - safeProgress);
                console.log(`   Result: ${bar} ${expNum}/${expNeededNum}`);
            }

            // Test finalValue calculation
            const levelBonus = level > 1 ? (level - 1) * 0.02 : 0;
            const finalValue = Math.floor(Number(fish.value) * (1 + levelBonus));
            console.log(`   Final value: ${finalValue} (type: ${typeof finalValue})`);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishbarnBigInt().catch(console.error); 