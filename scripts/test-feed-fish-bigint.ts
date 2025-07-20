import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFeedFishBigInt() {
    console.log('🧪 Testing Feed Fish BigInt issues...\n');

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
        console.log(`   Level: ${fish.level}`);
        console.log(`   Experience: ${fish.experience} (type: ${typeof fish.experience})`);
        console.log(`   Value: ${fish.value} (type: ${typeof fish.value})`);

        // Test logic tương tự như trong feedFishWithFood
        console.log(`\n📝 Testing feedFishWithFood logic...`);
        
        try {
            const level = fish.level;
            const exp = fish.experience;
            const expGained = 10; // Giả sử được 10 exp
            
            // Hàm tính exp cần cho level tiếp theo
            function getExpForLevel(level: number) {
                return (level + 1) * 10;
            }
            
            let newExp = exp + expGained;
            let newLevel = level;
            let expForNext = getExpForLevel(newLevel);
            
            console.log(`   Current exp: ${exp}`);
            console.log(`   Exp gained: ${expGained}`);
            console.log(`   New exp: ${newExp}`);
            console.log(`   Current level: ${level}`);
            console.log(`   Exp needed for next level: ${expForNext}`);
            
            // Lên level nếu đủ exp
            while (newExp >= expForNext && newLevel < 10) {
                newExp -= expForNext;
                newLevel++;
                expForNext = getExpForLevel(newLevel);
                console.log(`   Leveled up to ${newLevel}, remaining exp: ${newExp}`);
            }
            
            // Tính giá mới (tăng 2% mỗi level)
            const valueIncrease = (newLevel - level) * 0.02;
            const newValue = Math.floor(Number(fish.value) * (1 + valueIncrease));
            
            console.log(`   Value increase: ${valueIncrease}`);
            console.log(`   Old value: ${fish.value}`);
            console.log(`   New value: ${newValue}`);
            console.log(`   Final level: ${newLevel}`);
            console.log(`   Final exp: ${newExp}`);
            
            console.log(`\n✅ feedFishWithFood logic test successful!`);
            
        } catch (error) {
            console.error(`   ❌ Error in feedFishWithFood logic test:`, error);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFeedFishBigInt().catch(console.error); 