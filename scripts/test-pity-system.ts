import { PrismaClient } from '@prisma/client';
import { PitySystemService } from '../src/utils/pity-system';
import { FishingService } from '../src/utils/fishing';

const prisma = new PrismaClient();

const testUserId = 'test-user-pity';
const testGuildId = 'test-guild-pity';

async function testPitySystem() {
    console.log('🎣 Testing Pity System\n');

    try {
        // Tạo test user và fishing data
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

        // Test 1: Kiểm tra pity info ban đầu
        console.log('📊 Test 1: Pity info ban đầu');
        const initialPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log('Pity info:', initialPityInfo);
        console.log('');

        // Test 2: Kiểm tra pity multiplier ban đầu
        console.log('📈 Test 2: Pity multiplier ban đầu');
        const initialMultiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
        console.log('Pity multiplier:', initialMultiplier);
        console.log('');

        // Test 3: Mô phỏng câu cá nhiều lần không ra cá huyền thoại
        console.log('🎣 Test 3: Mô phỏng câu cá 400 lần không ra cá huyền thoại');
        
        for (let i = 1; i <= 400; i++) {
            // Cập nhật pity count thủ công
            await prisma.fishingData.update({
                where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
                data: {
                    legendaryPityCount: i,
                    totalFish: { increment: 1 }
                }
            });

            if (i % 100 === 0) {
                const pityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
                const multiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
                console.log(`Lần ${i}: Pity count = ${pityInfo.legendaryPityCount}, Multiplier = ${multiplier.toFixed(2)}`);
            }
        }
        console.log('');

        // Test 4: Kiểm tra pity multiplier khi gần ngưỡng
        console.log('📈 Test 4: Pity multiplier khi gần ngưỡng');
        const nearThresholdPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        const nearThresholdMultiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
        console.log('Pity info khi gần ngưỡng:', nearThresholdPityInfo);
        console.log('Multiplier khi gần ngưỡng:', nearThresholdMultiplier);
        console.log('');

        // Test 5: Kiểm tra kích hoạt pity system
        console.log('🎯 Test 5: Kiểm tra kích hoạt pity system');
        const shouldActivate = await PitySystemService.shouldActivatePity(testUserId, testGuildId);
        console.log('Should activate pity:', shouldActivate);
        console.log('');

        // Test 6: Mô phỏng câu cá huyền thoại và reset pity
        console.log('🐋 Test 6: Mô phỏng câu cá huyền thoại và reset pity');
        
        // Tạo một con cá huyền thoại giả
        const legendaryFish = {
            name: 'Cá voi xanh',
            emoji: '🐳',
            rarity: 'legendary',
            minValue: 10000,
            maxValue: 20000,
            chance: 1,
            description: 'Cá voi xanh, sinh vật lớn nhất đại dương'
        };

        // Cập nhật pity count (reset về 0)
        await PitySystemService.updatePityCount(testUserId, testGuildId, legendaryFish);
        
        const afterLegendaryPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log('Pity info sau khi câu cá huyền thoại:', afterLegendaryPityInfo);
        console.log('');

        // Test 7: Kiểm tra pity multiplier sau khi reset
        console.log('📈 Test 7: Pity multiplier sau khi reset');
        const resetMultiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
        console.log('Multiplier sau khi reset:', resetMultiplier);
        console.log('');

        // Test 8: Test getRandomLegendaryFish
        console.log('🎲 Test 8: Test getRandomLegendaryFish');
        const randomLegendary = PitySystemService.getRandomLegendaryFish();
        console.log('Random legendary fish:', randomLegendary);
        console.log('');

        console.log('✅ Tất cả test hoàn thành!');

    } catch (error) {
        console.error('❌ Lỗi trong test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testPitySystem(); 