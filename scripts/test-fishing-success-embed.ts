import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFishingSuccessEmbed() {
    console.log('🎣 Testing Fishing Success Embed with Total Count\n');

    try {
        // Lấy một số user để test
        const users = await prisma.user.findMany({
            take: 5,
            include: {
                fishingData: true
            }
        });

        console.log(`📊 Found ${users.length} users to test\n`);

        for (const user of users) {
            const fishingData = user.fishingData;
            if (!fishingData) {
                console.log(`❌ User ${user.userId} has no fishing data`);
                continue;
            }

            const totalFishingCount = fishingData.totalFish;
            
            // Tạo hiệu ứng cho số lần câu (giống như trong code)
            let fishingCountEffect = '';
            if (totalFishingCount >= 1000) {
                fishingCountEffect = '🔥 **FISHING MASTER!** 🔥';
            } else if (totalFishingCount >= 500) {
                fishingCountEffect = '⚡ **FISHING EXPERT!** ⚡';
            } else if (totalFishingCount >= 100) {
                fishingCountEffect = '🎯 **FISHING PRO!** 🎯';
            } else if (totalFishingCount >= 50) {
                fishingCountEffect = '🌟 **FISHING STAR!** 🌟';
            } else if (totalFishingCount >= 10) {
                fishingCountEffect = '⭐ **FISHING BEGINNER!** ⭐';
            }

            console.log(`👤 User: ${user.userId}`);
            console.log(`🎣 Total fishing count: ${totalFishingCount.toLocaleString()}`);
            console.log(`💰 Total earnings: ${fishingData.totalEarnings.toLocaleString()} FishCoin`);
            console.log(`🏆 Effect: ${fishingCountEffect || 'No effect yet'}`);
            
            // Tạo mock fish data
            const mockFish = {
                name: 'Cá Hồi',
                emoji: '🐟',
                rarity: 'rare',
                value: 1500
            };

            // Tạo mock embed description
            const embedDescription = 
                `**Username** đã câu được:\n\n` +
                `${mockFish.emoji} **${mockFish.name}**\n` +
                `🌟 **Rare**\n` +
                `🐟 **Giá trị:** ${mockFish.value} FishCoin\n\n` +
                `📊 **Thống kê câu cá:**\n` +
                `🎣 **Tổng số lần câu:** ${totalFishingCount.toLocaleString()} lần\n` +
                (fishingCountEffect ? `${fishingCountEffect}\n` : '') +
                `💰 **Tổng thu nhập:** ${fishingData.totalEarnings.toLocaleString()} FishCoin`;

            console.log('\n📋 Mock Embed Description:');
            console.log('='.repeat(50));
            console.log(embedDescription);
            console.log('='.repeat(50));
            console.log('');

            // Test các mức độ khác nhau
            if (totalFishingCount < 10) {
                console.log('💡 Suggestion: User needs to fish more to see effects!');
            } else if (totalFishingCount < 50) {
                console.log('💡 Suggestion: User is close to FISHING STAR!');
            } else if (totalFishingCount < 100) {
                console.log('💡 Suggestion: User is close to FISHING PRO!');
            } else if (totalFishingCount < 500) {
                console.log('💡 Suggestion: User is close to FISHING EXPERT!');
            } else if (totalFishingCount < 1000) {
                console.log('💡 Suggestion: User is close to FISHING MASTER!');
            } else {
                console.log('🏆 User has reached FISHING MASTER level!');
            }
            
            console.log('\n' + '-'.repeat(60) + '\n');
        }

        // Test với các số liệu khác nhau
        console.log('🧪 Testing Different Fishing Counts:\n');
        
        const testCounts = [5, 15, 75, 150, 750, 1200];
        
        for (const count of testCounts) {
            let effect = '';
            if (count >= 1000) {
                effect = '🔥 **FISHING MASTER!** 🔥';
            } else if (count >= 500) {
                effect = '⚡ **FISHING EXPERT!** ⚡';
            } else if (count >= 100) {
                effect = '🎯 **FISHING PRO!** 🎯';
            } else if (count >= 50) {
                effect = '🌟 **FISHING STAR!** 🌟';
            } else if (count >= 10) {
                effect = '⭐ **FISHING BEGINNER!** ⭐';
            }

            console.log(`🎣 Count: ${count.toLocaleString()} → Effect: ${effect || 'None'}`);
        }

        console.log('\n✅ Fishing success embed test completed!');

    } catch (error) {
        console.error('❌ Error testing fishing success embed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testFishingSuccessEmbed().catch(console.error); 