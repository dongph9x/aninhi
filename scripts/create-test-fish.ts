import prisma from '../src/utils/prisma';

async function createTestFish() {
    try {
        console.log('🚀 Creating test fish...\n');

        // Tìm hoặc tạo user test
        const user = await prisma.user.upsert({
            where: { userId_guildId: { userId: 'test-skill-user', guildId: 'test-guild' } },
            update: {},
            create: {
                userId: 'test-skill-user',
                guildId: 'test-guild',
                balance: BigInt(0),
                fishBalance: BigInt(1000000) // 1M FishCoin
            }
        });

        console.log('👤 User created/found:', user.userId, '| FishCoin:', Number(user.fishBalance));

        // Tạo fish test với stats cao
        const fish = await prisma.fish.create({
            data: {
                userId: user.userId,
                guildId: user.guildId,
                species: 'Test Dragon Fish',
                level: 30,
                experience: 0,
                rarity: 'legendary',
                value: BigInt(50000),
                generation: 3,
                status: 'adult',
                stats: JSON.stringify({
                    strength: 100,
                    agility: 80,
                    intelligence: 120,
                    defense: 90,
                    luck: 150,
                    accuracy: 70
                })
            }
        });

        console.log('🐟 Fish created:', fish.species);
        console.log('📊 Level:', fish.level, '| Rarity:', fish.rarity);
        console.log('📊 Stats:', fish.stats);

        // Tạo fish inventory
        const inventory = await prisma.fishInventory.upsert({
            where: { userId_guildId: { userId: user.userId, guildId: user.guildId } },
            update: {},
            create: {
                userId: user.userId,
                guildId: user.guildId,
                capacity: 10
            }
        });

        // Thêm fish vào inventory
        await prisma.fishInventoryItem.create({
            data: {
                fishInventoryId: inventory.id,
                fishId: fish.id
            }
        });

        // Tạo battle fish inventory
        const battleInventory = await prisma.battleFishInventory.upsert({
            where: { userId_guildId: { userId: user.userId, guildId: user.guildId } },
            update: {},
            create: {
                userId: user.userId,
                guildId: user.guildId,
                capacity: 5
            }
        });

        // Thêm fish vào battle inventory
        await prisma.battleFishInventoryItem.create({
            data: {
                battleFishInventoryId: battleInventory.id,
                fishId: fish.id
            }
        });

        console.log('✅ Fish added to inventories');

        // Tạo thêm một fish level thấp để test
        const lowLevelFish = await prisma.fish.create({
            data: {
                userId: user.userId,
                guildId: user.guildId,
                species: 'Test Common Fish',
                level: 5,
                experience: 0,
                rarity: 'common',
                value: BigInt(1000),
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({
                    strength: 20,
                    agility: 15,
                    intelligence: 25,
                    defense: 18,
                    luck: 10,
                    accuracy: 12
                })
            }
        });

        console.log('🐟 Low level fish created:', lowLevelFish.species);
        console.log('📊 Level:', lowLevelFish.level, '| Rarity:', lowLevelFish.rarity);

        console.log('\n🎉 Test fish created successfully!');
        console.log('You can now test the skill shop with:');
        console.log('- High level fish (level 30, legendary)');
        console.log('- Low level fish (level 5, common)');

    } catch (error) {
        console.error('❌ Error creating test fish:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestFish();
