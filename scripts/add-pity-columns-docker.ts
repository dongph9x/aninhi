import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPityColumns() {
    console.log('🔧 Adding Pity System Columns to Database\n');

    try {
        // Thêm cột legendaryPityCount
        console.log('📊 Adding legendaryPityCount column...');
        await prisma.$executeRaw`
            ALTER TABLE FishingData 
            ADD COLUMN legendaryPityCount INTEGER NOT NULL DEFAULT 0
        `;
        console.log('✅ legendaryPityCount column added');

        // Thêm cột lastLegendaryCaught
        console.log('\n📅 Adding lastLegendaryCaught column...');
        await prisma.$executeRaw`
            ALTER TABLE FishingData 
            ADD COLUMN lastLegendaryCaught DATETIME
        `;
        console.log('✅ lastLegendaryCaught column added');

        // Test tạo record với pity fields
        console.log('\n🎣 Testing pity fields...');
        const testUserId = 'test-pity-docker';
        const testGuildId = 'test-guild-pity-docker';

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

        // Tạo FishingData với pity fields
        const testRecord = await prisma.fishingData.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {
                legendaryPityCount: 150,
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
                legendaryPityCount: 150,
                lastLegendaryCaught: new Date()
            }
        });

        console.log('✅ Test record created with pity fields:', {
            legendaryPityCount: testRecord.legendaryPityCount,
            lastLegendaryCaught: testRecord.lastLegendaryCaught
        });

        // Xóa test record
        await prisma.fishingData.delete({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        await prisma.user.delete({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });

        console.log('\n✅ Pity system columns added successfully!');
        console.log('\n📋 Tóm tắt:');
        console.log('• legendaryPityCount column added');
        console.log('• lastLegendaryCaught column added');
        console.log('• Test record created and deleted successfully');
        console.log('• Database ready for pity system');

    } catch (error) {
        console.error('❌ Lỗi khi thêm cột pity system:', error);
        
        // Kiểm tra xem cột đã tồn tại chưa
        try {
            console.log('\n🔍 Checking if columns already exist...');
            const sampleData = await prisma.fishingData.findFirst();
            if (sampleData) {
                console.log('✅ FishingData table exists with columns:', {
                    legendaryPityCount: sampleData.legendaryPityCount,
                    lastLegendaryCaught: sampleData.lastLegendaryCaught
                });
            }
        } catch (checkError) {
            console.error('❌ Error checking existing columns:', checkError);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script
addPityColumns(); 