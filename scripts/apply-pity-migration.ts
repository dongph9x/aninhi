import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyPityMigration() {
    console.log('🔧 Applying Pity System Migration\n');

    try {
        // Test 1: Kiểm tra database hiện tại
        console.log('📊 Test 1: Kiểm tra database hiện tại');
        const fishingDataCount = await prisma.fishingData.count();
        console.log('Số lượng FishingData records:', fishingDataCount);

        // Test 2: Kiểm tra schema
        console.log('\n🔍 Test 2: Kiểm tra schema');
        try {
            const sampleData = await prisma.fishingData.findFirst();
            console.log('✅ FishingData table tồn tại');
            if (sampleData) {
                console.log('Sample data:', {
                    id: sampleData.id,
                    userId: sampleData.userId,
                    guildId: sampleData.guildId,
                    totalFish: sampleData.totalFish,
                    legendaryPityCount: sampleData.legendaryPityCount,
                    lastLegendaryCaught: sampleData.lastLegendaryCaught
                });
            }
        } catch (error) {
            console.error('❌ Lỗi khi truy cập FishingData:', error);
        }

        // Test 3: Tạo test record với pity fields
        console.log('\n🎣 Test 3: Tạo test record với pity fields');
        const testUserId = 'test-pity-migration';
        const testGuildId = 'test-guild-pity-migration';

        // Tạo User trước
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

        const testRecord = await prisma.fishingData.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {
                legendaryPityCount: 100,
                lastLegendaryCaught: new Date()
            },
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
                currentBait: 'basic',
                legendaryPityCount: 100,
                lastLegendaryCaught: new Date()
            }
        });

        console.log('✅ Test record created:', {
            legendaryPityCount: testRecord.legendaryPityCount,
            lastLegendaryCaught: testRecord.lastLegendaryCaught
        });

        // Test 4: Xóa test record
        console.log('\n🧹 Test 4: Xóa test record');
        await prisma.fishingData.delete({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        console.log('✅ Test record deleted');

        console.log('\n✅ Migration test hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('• Pity system fields đã có trong database');
        console.log('• Có thể tạo và cập nhật pity fields');
        console.log('• Database sẵn sàng cho pity system');

    } catch (error) {
        console.error('❌ Lỗi trong migration test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy migration test
applyPityMigration(); 