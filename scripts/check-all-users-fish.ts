import prisma from '../src/utils/prisma';

async function checkAllUsersFish() {
    try {
        console.log('🔍 Checking All Users and Fish...\n');

        // Lấy tất cả users
        const users = await prisma.user.findMany({
            take: 10 // Chỉ lấy 10 users đầu tiên
        });

        console.log('👥 Users in database:');
        for (const user of users) {
            console.log(`- ${user.userId} (${user.guildId}) | FishCoin: ${Number(user.fishBalance).toLocaleString()}`);
        }

        // Lấy tất cả fish
        const allFish = await prisma.fish.findMany({
            take: 20 // Chỉ lấy 20 fish đầu tiên
        });

        console.log('\n🐟 Fish in database:');
        for (const fish of allFish) {
            console.log(`- ${fish.id} | ${fish.species} (Lv.${fish.level}, ${fish.rarity}) | User: ${fish.userId}`);
        }

        // Tìm fish cụ thể
        const specificFishId = 'cmf7lg6i6001ksx772z19svek';
        const specificFish = await prisma.fish.findUnique({
            where: { id: specificFishId }
        });

        if (specificFish) {
            console.log(`\n🎯 Found specific fish: ${specificFish.species} (Lv.${specificFish.level}, ${specificFish.rarity})`);
            console.log(`- User: ${specificFish.userId} (${specificFish.guildId})`);
            console.log(`- Stats: ${specificFish.stats}`);
            
            // Kiểm tra battle inventory
            const battleInventory = await prisma.battleFishInventory.findUnique({
                where: { userId_guildId: { userId: specificFish.userId, guildId: specificFish.guildId } },
                include: {
                    items: {
                        include: {
                            fish: true
                        }
                    }
                }
            });

            if (battleInventory) {
                console.log(`- Battle inventory items: ${battleInventory.items.length}`);
                const fishInBattle = battleInventory.items.find(item => item.fish.id === specificFishId);
                if (fishInBattle) {
                    console.log('✅ Fish is in battle inventory');
                } else {
                    console.log('❌ Fish is NOT in battle inventory');
                    console.log('Available fish in battle inventory:', battleInventory.items.map(item => item.fish.id));
                }
            } else {
                console.log('❌ No battle inventory found for this user');
            }
        } else {
            console.log(`\n❌ Specific fish ${specificFishId} not found in database`);
        }

        // Kiểm tra battle inventories
        console.log('\n🎒 Battle Inventories:');
        const battleInventories = await prisma.battleFishInventory.findMany({
            include: {
                items: {
                    include: {
                        fish: true
                    }
                }
            }
        });

        for (const inventory of battleInventories) {
            console.log(`- User: ${inventory.userId} (${inventory.guildId}) | Items: ${inventory.items.length}`);
            for (const item of inventory.items) {
                console.log(`  - ${item.fish.id} | ${item.fish.species} (Lv.${item.fish.level})`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking users and fish:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUsersFish();
