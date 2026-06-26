import { PrismaClient } from '@prisma/client';
import { PitySystemService } from '../src/utils/pity-system';

const prisma = new PrismaClient();

const testUserId = 'test-user-pity-simple';
const testGuildId = 'test-guild-pity-simple';

async function testPitySystemSimple() {
    console.log('🎣 Testing Pity System (Simple)\n');

    try {
        // Tạo test user và fishing data
        console.log('📝 Tạo test data...');
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

        await prisma.fishingData.upsert({
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
                currentBait: 'basic',
                legendaryPityCount: 0,
                lastLegendaryCaught: null
            }
        });
        console.log('✅ Test data đã được tạo');

        // Test 1: Kiểm tra pity info ban đầu
        console.log('\n📊 Test 1: Pity info ban đầu');
        const initialPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log('Pity info:', initialPityInfo);

        // Test 2: Kiểm tra pity multiplier ban đầu
        console.log('\n📈 Test 2: Pity multiplier ban đầu');
        const initialMultiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
        console.log('Pity multiplier:', initialMultiplier);

        // Test 3: Cập nhật pity count lên 400
        console.log('\n🎣 Test 3: Cập nhật pity count lên 400');
        await prisma.fishingData.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: {
                legendaryPityCount: 400,
                totalFish: 400
            }
        });

        const pityInfo400 = await PitySystemService.getPityInfo(testUserId, testGuildId);
        const multiplier400 = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
        console.log('Pity info (400):', pityInfo400);
        console.log('Multiplier (400):', multiplier400);

        // Test 4: Kiểm tra kích hoạt pity system
        console.log('\n🎯 Test 4: Kiểm tra kích hoạt pity system');
        const shouldActivate = await PitySystemService.shouldActivatePity(testUserId, testGuildId);
        console.log('Should activate pity:', shouldActivate);

        // Test 5: Test getRandomLegendaryFish
        console.log('\n🎲 Test 5: Test getRandomLegendaryFish');
        const randomLegendary = PitySystemService.getRandomLegendaryFish();
        console.log('Random legendary fish:', randomLegendary);

        // Test 6: Mô phỏng câu cá huyền thoại và reset pity
        console.log('\n🐋 Test 6: Mô phỏng câu cá huyền thoại và reset pity');
        
        const legendaryFish = {
            name: 'Cá voi xanh',
            emoji: '🐳',
            rarity: 'legendary',
            minValue: 10000,
            maxValue: 20000,
            chance: 1,
            description: 'Cá voi xanh, sinh vật lớn nhất đại dương'
        };

        await PitySystemService.updatePityCount(testUserId, testGuildId, legendaryFish);
        
        const afterLegendaryPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log('Pity info sau khi câu cá huyền thoại:', afterLegendaryPityInfo);

        console.log('\n✅ Tất cả test hoàn thành!');

    } catch (error) {
        console.error('❌ Lỗi trong test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testPitySystemSimple(); 