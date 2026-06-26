import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSellFishBigInt() {
    console.log('🧪 Testing Sell Fish BigInt issues...\n');

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
        console.log(`   Balance: ${user.balance} (type: ${typeof user.balance})`);

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
        console.log(`   Level: ${fish.level}`);
        console.log(`   Value: ${fish.value} (type: ${typeof fish.value})`);

        // Test logic tương tự như trong sellFish
        console.log(`\n📝 Testing sellFish logic...`);
        
        try {
            // Simulate sellFish logic
            const userBalance = user.balance;
            const fishValue = fish.value;
            
            console.log(`   User balance: ${userBalance} (type: ${typeof userBalance})`);
            console.log(`   Fish value: ${fishValue} (type: ${typeof fishValue})`);
            
            // Test phép cộng BigInt
            const newBalance = userBalance + fishValue;
            console.log(`   New balance: ${newBalance} (type: ${typeof newBalance})`);
            
            // Test logic trong fish-inventory.ts
            console.log(`\n📝 Testing fish-inventory sellFishFromInventory logic...`);
            
            const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
            console.log(`   Level bonus: ${levelBonus}`);
            
            const finalValue = Math.floor(Number(fish.value) * (1 + levelBonus));
            console.log(`   Final value: ${finalValue} (type: ${typeof finalValue})`);
            
            const newBalance2 = userBalance + BigInt(finalValue);
            console.log(`   New balance 2: ${newBalance2} (type: ${typeof newBalance2})`);
            
            console.log(`\n✅ sellFish logic test successful!`);
            
        } catch (error) {
            console.error(`   ❌ Error in sellFish logic test:`, error);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSellFishBigInt().catch(console.error); 