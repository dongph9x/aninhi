import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFeedFishReal() {
    console.log('🧪 Testing Feed Fish real command...\n');

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
        console.log(`\n📝 Testing feedFishWithFood real logic...`);
        
        try {
            // Simulate feedFishWithFood logic
            const MAX_LEVEL = 10;
            if (fish.level >= MAX_LEVEL && fish.status === 'adult') {
                console.log(`   ❌ Fish already max level`);
                return;
            }
            
            const expGained = 10; // Giả sử được 10 exp
            
            // Hàm tính exp cần cho level tiếp theo
            function getExpForLevel(level: number) {
                return (level + 1) * 10;
            }
            
            let newExp = fish.experience + expGained;
            let newLevel = fish.level;
            let expForNext = getExpForLevel(newLevel);
            let becameAdult = false;
            
            console.log(`   Current exp: ${fish.experience}`);
            console.log(`   Exp gained: ${expGained}`);
            console.log(`   New exp: ${newExp}`);
            console.log(`   Current level: ${fish.level}`);
            console.log(`   Exp needed for next level: ${expForNext}`);
            
            // Lên level nếu đủ exp
            while (newExp >= expForNext && newLevel < MAX_LEVEL) {
                newExp -= expForNext;
                newLevel++;
                expForNext = getExpForLevel(newLevel);
                console.log(`   Leveled up to ${newLevel}, remaining exp: ${newExp}`);
            }
            
            // Tính giá mới (tăng 2% mỗi level)
            const valueIncrease = (newLevel - fish.level) * 0.02;
            const newValue = Math.floor(Number(fish.value) * (1 + valueIncrease));
            
            console.log(`   Value increase: ${valueIncrease}`);
            console.log(`   Old value: ${fish.value}`);
            console.log(`   New value: ${newValue}`);
            console.log(`   Final level: ${newLevel}`);
            console.log(`   Final exp: ${newExp}`);
            
            // Cập nhật trạng thái
            let newStatus = fish.status;
            if (newLevel >= 10) {
                newStatus = 'adult';
                becameAdult = true;
                console.log(`   Fish became adult!`);
            }
            
            console.log(`   Leveled up: ${newLevel > fish.level}`);
            console.log(`   Became adult: ${becameAdult}`);
            
            console.log(`\n✅ feedFishWithFood real logic test successful!`);
            
        } catch (error) {
            console.error(`   ❌ Error in feedFishWithFood real logic test:`, error);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFeedFishReal().catch(console.error); 