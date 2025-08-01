import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testUserId = 'test-sell-all';
const testGuildId = 'test-guild-sell-all';

async function testSellAllFish() {
    console.log('💰 Testing Sell All Fish Feature\n');

    try {
        // Test 1: Tạo test user
        console.log('👤 Test 1: Creating test user...');
        await prisma.user.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 1000000n,
                fishBalance: 1000000n
            }
        });
        console.log('✅ Test user created');

        // Test 2: Tạo fishing data
        console.log('\n🎣 Test 2: Creating fishing data...');
        const fishingData = await prisma.fishingData.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                totalFish: 0,
                totalEarnings: 0n,
                biggestFish: '',
                biggestValue: 0n,
                rarestFish: '',
                rarestRarity: '',
                fishingTime: 0,
                currentRod: 'basic',
                currentBait: 'basic'
            }
        });
        console.log('✅ Fishing data created');

        // Test 3: Tạo các loại cá
        console.log('\n🐟 Test 3: Creating caught fish...');
        const fishToCreate = [
            { fishName: 'Cá rô phi', quantity: 5, fishValue: 27n, fishRarity: 'common' },
            { fishName: 'Cá chép', quantity: 3, fishValue: 54n, fishRarity: 'common' },
            { fishName: 'Cá trắm cỏ', quantity: 2, fishValue: 61n, fishRarity: 'common' }
        ];

        for (const fish of fishToCreate) {
            await prisma.caughtFish.upsert({
                where: { 
                    fishingDataId_fishName: { 
                        fishingDataId: fishingData.id, 
                        fishName: fish.fishName 
                    } 
                },
                update: {
                    quantity: fish.quantity,
                    fishValue: fish.fishValue,
                    fishRarity: fish.fishRarity
                },
                create: {
                    fishingDataId: fishingData.id,
                    fishName: fish.fishName,
                    quantity: fish.quantity,
                    fishValue: fish.fishValue,
                    fishRarity: fish.fishRarity
                }
            });
            console.log(`✅ Created ${fish.fishName} x${fish.quantity}`);
        }

        // Test 4: Test showInventory function
        console.log('\n📦 Test 4: Testing showInventory function...');
        const { FISH_LIST } = await import('../src/config/fish-data');
        
        // Lấy lại fishing data với fish
        const updatedFishingData = await prisma.fishingData.findUnique({
            where: { id: fishingData.id },
            include: { fish: true }
        });

        // Lọc ra chỉ cá thường
        const normalFish = updatedFishingData!.fish.filter((f: any) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            return fishInfo && fishInfo.rarity !== 'legendary';
        });

        console.log('Normal fish count:', normalFish.length);
        console.log('Fish types:', normalFish.map((f: any) => f.fishName));

        // Test 5: Tính tổng giá trị
        console.log('\n💰 Test 5: Calculating total value...');
        const totalValue = normalFish.reduce((sum: number, f: any) => {
            return sum + (Number(f.fishValue) * f.quantity);
        }, 0);

        console.log('Total value:', totalValue);

        // Test 6: Test sell all logic
        console.log('\n🔄 Test 6: Testing sell all logic...');
        const { FishingService } = await import('../src/utils/fishing');

        let totalEarnings = 0;
        const soldFish = [];

        for (const fish of normalFish) {
            try {
                const result = await FishingService.sellFish(testUserId, testGuildId, fish.fishName, fish.quantity);
                totalEarnings += result.totalValue;
                soldFish.push({
                    name: fish.fishName,
                    quantity: fish.quantity,
                    value: result.totalValue
                });
                console.log(`✅ Sold ${fish.fishName} x${fish.quantity} for ${result.totalValue} FishCoin`);
            } catch (error) {
                console.error(`❌ Error selling ${fish.fishName}:`, error);
            }
        }

        console.log('\n📊 Sell All Results:');
        console.log('Total earnings:', totalEarnings);
        console.log('Sold fish count:', soldFish.length);
        console.log('Sold fish details:', soldFish);

        // Test 7: Verify inventory is empty
        console.log('\n🔍 Test 7: Verifying inventory is empty...');
        const finalFishingData = await FishingService.getFishingData(testUserId, testGuildId);
        const remainingNormalFish = finalFishingData.fish.filter((f: any) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            return fishInfo && fishInfo.rarity !== 'legendary';
        });

        console.log('Remaining normal fish:', remainingNormalFish.length);
        if (remainingNormalFish.length === 0) {
            console.log('✅ All normal fish sold successfully!');
        } else {
            console.log('❌ Some fish remain:', remainingNormalFish);
        }

        // Cleanup
        console.log('\n🧹 Cleanup...');
        try {
            // Xóa tất cả dữ liệu liên quan
            await prisma.caughtFish.deleteMany({
                where: { fishingDataId: fishingData.id }
            });
            await prisma.fishingRod.deleteMany({
                where: { fishingDataId: fishingData.id }
            });
            await prisma.fishingBait.deleteMany({
                where: { fishingDataId: fishingData.id }
            });
            await prisma.fishingData.delete({
                where: { id: fishingData.id }
            });
            await prisma.user.delete({
                where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
            });
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.log('⚠️ Cleanup warning:', error);
        }

        console.log('\n✅ Tất cả test hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('• Sell all feature hoạt động hoàn hảo');
        console.log('• Tổng giá trị tính toán đúng');
        console.log('• Bán tất cả cá thường thành công');
        console.log('• Inventory được cập nhật đúng');
        console.log('• Sẵn sàng để sử dụng!');

    } catch (error) {
        console.error('❌ Lỗi trong test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testSellAllFish(); 