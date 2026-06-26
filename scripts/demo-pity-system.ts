import { PrismaClient } from '@prisma/client';
import { PitySystemService } from '../src/utils/pity-system';

const prisma = new PrismaClient();

const testUserId = 'demo-user-pity';
const testGuildId = 'demo-guild-pity';

async function demoPitySystem() {
    console.log('🎣 Demo Pity System\n');

    try {
        // Tạo demo user và fishing data
        console.log('📝 Tạo demo data...');
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
        console.log('✅ Demo data đã được tạo\n');

        // Demo 1: Pity info ban đầu
        console.log('📊 Demo 1: Pity info ban đầu');
        const initialPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log(`🎣 Số lần câu không ra cá huyền thoại: ${initialPityInfo.legendaryPityCount}/${initialPityInfo.legendaryThreshold}`);
        console.log(`🎯 Còn lại đến đảm bảo: ${initialPityInfo.remainingToGuaranteed} lần`);
        console.log(`📈 Tỷ lệ pity: ${initialPityInfo.pityPercentage.toFixed(1)}%`);
        console.log('');

        // Demo 2: Mô phỏng câu cá 100 lần
        console.log('🎣 Demo 2: Mô phỏng câu cá 100 lần không ra cá huyền thoại');
        for (let i = 1; i <= 100; i++) {
            await prisma.fishingData.update({
                where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
                data: {
                    legendaryPityCount: i,
                    totalFish: { increment: 1 }
                }
            });

            if (i % 25 === 0) {
                const pityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
                const multiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
                console.log(`Lần ${i}: Pity = ${pityInfo.legendaryPityCount}, Multiplier = ${multiplier.toFixed(2)}x`);
            }
        }
        console.log('');

        // Demo 3: Mô phỏng câu cá 250 lần
        console.log('🎣 Demo 3: Mô phỏng câu cá 250 lần không ra cá huyền thoại');
        for (let i = 101; i <= 250; i++) {
            await prisma.fishingData.update({
                where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
                data: {
                    legendaryPityCount: i,
                    totalFish: { increment: 1 }
                }
            });

            if (i % 50 === 0) {
                const pityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
                const multiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
                console.log(`Lần ${i}: Pity = ${pityInfo.legendaryPityCount}, Multiplier = ${multiplier.toFixed(2)}x`);
            }
        }
        console.log('');

        // Demo 4: Mô phỏng câu cá 400 lần
        console.log('🎣 Demo 4: Mô phỏng câu cá 400 lần không ra cá huyền thoại');
        for (let i = 251; i <= 400; i++) {
            await prisma.fishingData.update({
                where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
                data: {
                    legendaryPityCount: i,
                    totalFish: { increment: 1 }
                }
            });

            if (i % 50 === 0) {
                const pityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
                const multiplier = await PitySystemService.getPityMultiplier(testUserId, testGuildId);
                console.log(`Lần ${i}: Pity = ${pityInfo.legendaryPityCount}, Multiplier = ${multiplier.toFixed(2)}x`);
            }
        }
        console.log('');

        // Demo 5: Kiểm tra kích hoạt pity
        console.log('🎯 Demo 5: Kiểm tra kích hoạt pity system');
        const shouldActivate = await PitySystemService.shouldActivatePity(testUserId, testGuildId);
        console.log(`Đã đạt ngưỡng pity chưa? ${shouldActivate ? '✅ CÓ' : '❌ CHƯA'}`);
        console.log('');

        // Demo 6: Mô phỏng câu cá huyền thoại và reset
        console.log('🐋 Demo 6: Mô phỏng câu cá huyền thoại và reset pity');
        
        const legendaryFish = {
            name: 'Cá voi xanh',
            emoji: '🐳',
            rarity: 'legendary',
            minValue: 10000,
            maxValue: 20000,
            chance: 1,
            description: 'Cá voi xanh, sinh vật lớn nhất đại dương'
        };

        console.log('🎉 PITY SYSTEM KÍCH HOẠT!');
        console.log(`🐋 Bạn đã câu được: ${legendaryFish.emoji} ${legendaryFish.name}`);
        console.log(`💰 Giá trị: ${legendaryFish.minValue.toLocaleString()} - ${legendaryFish.maxValue.toLocaleString()} FishCoin`);
        console.log(`📝 Mô tả: ${legendaryFish.description}`);
        
        await PitySystemService.updatePityCount(testUserId, testGuildId, legendaryFish);
        
        const afterLegendaryPityInfo = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log(`\n🔄 Pity count đã reset về: ${afterLegendaryPityInfo.legendaryPityCount}`);
        console.log(`📅 Thời gian câu được: ${afterLegendaryPityInfo.lastLegendaryCaught}`);
        console.log('');

        // Demo 7: Hiển thị tất cả cá huyền thoại có thể nhận
        console.log('🎲 Demo 7: Danh sách cá huyền thoại có thể nhận');
        const legendaryFishList = [
            { name: 'Cá voi xanh', emoji: '🐳', value: '10,000-20,000' },
            { name: 'Cá mực khổng lồ', emoji: '🦑', value: '8,000-20,000' },
            { name: 'Cá rồng biển', emoji: '🐉', value: '15,000-50,000' },
            { name: 'Cá thần biển', emoji: '🧜', value: '20,000-60,000' },
            { name: 'Vua biển', emoji: '🔱', value: '25,000-80,000' },
            { name: 'Cá rồng nước ngọt', emoji: '🐉', value: '12,000-40,000' },
            { name: 'Cá thần nước ngọt', emoji: '🧜‍♂️', value: '18,000-55,000' },
            { name: 'Vua nước ngọt', emoji: '👑', value: '22,000-70,000' }
        ];

        legendaryFishList.forEach((fish, index) => {
            console.log(`${index + 1}. ${fish.emoji} ${fish.name} - ${fish.value} FishCoin`);
        });
        console.log('');

        console.log('✅ Demo Pity System hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('• Pity system đảm bảo người chơi có cơ hội nhận cá huyền thoại');
        console.log('• Tỷ lệ ra cá huyền thoại tăng dần khi gần ngưỡng 500 lần');
        console.log('• Khi đạt 500 lần câu không ra cá huyền thoại → đảm bảo ra 1 con');
        console.log('• Pity count reset về 0 khi câu được cá huyền thoại');
        console.log('• Sử dụng lệnh `n.pity` để xem thông tin pity');

    } catch (error) {
        console.error('❌ Lỗi trong demo:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy demo
demoPitySystem(); 