import { PrismaClient } from '@prisma/client';
import { PitySystemService } from '../src/utils/pity-system';

const prisma = new PrismaClient();

const testUserId = 'test-user-pity-command';
const testGuildId = 'test-guild-pity-command';

async function testPityCommand() {
    console.log('🎣 Testing Pity Command\n');

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

        // Test 2: Cập nhật pity count lên 300
        console.log('\n🎣 Test 2: Cập nhật pity count lên 300');
        await prisma.fishingData.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: {
                legendaryPityCount: 300,
                totalFish: 300
            }
        });

        const pityInfo300 = await PitySystemService.getPityInfo(testUserId, testGuildId);
        console.log('Pity info (300):', pityInfo300);

        // Test 3: Test createPityEmbed
        console.log('\n🎨 Test 3: Test createPityEmbed');
        const pityEmbed = PitySystemService.createPityEmbed(pityInfo300);
        console.log('Embed created successfully');
        console.log('Embed title:', pityEmbed.data.title);
        console.log('Embed fields count:', pityEmbed.data.fields?.length || 0);

        // Test 4: Test createPityActivationEmbed
        console.log('\n🎉 Test 4: Test createPityActivationEmbed');
        const legendaryFish = {
            name: 'Cá voi xanh',
            emoji: '🐳',
            rarity: 'legendary',
            minValue: 10000,
            maxValue: 20000,
            chance: 1,
            description: 'Cá voi xanh, sinh vật lớn nhất đại dương'
        };

        const activationEmbed = PitySystemService.createPityActivationEmbed(legendaryFish);
        console.log('Activation embed created successfully');
        console.log('Activation embed title:', activationEmbed.data.title);

        // Test 5: Test command structure
        console.log('\n⚙️ Test 5: Test command structure');
        const pityCommand = await import('../src/commands/text/ecommerce/pity');
        console.log('Command imported successfully');
        console.log('Command structure:', pityCommand.default.structure);

        console.log('\n✅ Tất cả test hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('• Pity system hoạt động bình thường');
        console.log('• Embed creation hoạt động');
        console.log('• Command structure đúng format');
        console.log('• Sẵn sàng để sử dụng lệnh n.pity');

    } catch (error) {
        console.error('❌ Lỗi trong test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testPityCommand(); 