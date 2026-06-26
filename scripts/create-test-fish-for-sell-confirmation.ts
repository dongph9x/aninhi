/**
 * 🐟 Create Test Fish for Sell Confirmation
 *
 * Script này tạo cá test để test tính năng popup xác nhận khi bán cá
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestFishForSellConfirmation() {
    console.log('🐟 Create Test Fish for Sell Confirmation\n');

    try {
        const testGuildId = '1005280612845891615';
        const testUserId = '1234567890123456789';

        // 1. Kiểm tra user
        console.log('1️⃣ Checking user...');
        let user = await prisma.user.findFirst({
            where: {
                userId: testUserId,
                guildId: testGuildId
            }
        });

        if (!user) {
            console.log('➕ Creating user...');
            user = await prisma.user.create({
                data: {
                    userId: testUserId,
                    guildId: testGuildId,
                    balance: BigInt(10000),
                    fishBalance: BigInt(5000)
                }
            });
            console.log('✅ User created');
        } else {
            console.log('✅ User exists');
        }

        // 2. Tạo fish inventory nếu chưa có
        console.log('\n2️⃣ Checking fish inventory...');
        let inventory = await prisma.fishInventory.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });

        if (!inventory) {
            console.log('➕ Creating fish inventory...');
            inventory = await prisma.fishInventory.create({
                data: {
                    userId: testUserId,
                    guildId: testGuildId
                }
            });
            console.log('✅ Fish inventory created');
        } else {
            console.log('✅ Fish inventory exists');
        }

        // 3. Tạo con cá test
        console.log('\n3️⃣ Creating test fish...');
        const testFish = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Cá Test Bán',
                level: 5,
                experience: 250,
                generation: 2,
                rarity: 'rare',
                status: 'adult',
                value: BigInt(5000),
                specialTraits: JSON.stringify(['Fast Growth', 'High Value']),
                stats: JSON.stringify({
                    strength: 15,
                    agility: 12,
                    intelligence: 18,
                    defense: 10,
                    luck: 8
                })
            }
        });

        console.log('✅ Test fish created');
        console.log(`   🐟 Species: ${testFish.species}`);
        console.log(`   📊 Level: ${testFish.level}`);
        console.log(`   🏷️ Generation: Gen.${testFish.generation}`);
        console.log(`   ⭐ Rarity: ${testFish.rarity}`);
        console.log(`   📈 Status: ${testFish.status}`);
        console.log(`   💰 Value: ${testFish.value.toLocaleString()} FishCoin`);

        // 4. Thêm cá vào inventory
        console.log('\n4️⃣ Adding fish to inventory...');
        await prisma.fishInventoryItem.create({
            data: {
                fishInventoryId: inventory.id,
                fishId: testFish.id
            }
        });

        console.log('✅ Fish added to inventory');

        // 5. Kiểm tra kết quả
        console.log('\n5️⃣ Verifying result...');
        const finalInventory = await prisma.fishInventory.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            include: {
                items: {
                    include: {
                        fish: true
                    }
                }
            }
        });

        console.log(`📊 Inventory now has ${finalInventory?.items.length || 0} fish`);

        // 6. Tính giá bán dự kiến
        console.log('\n6️⃣ Calculating expected sell price...');
        const levelBonus = testFish.level > 1 ? (testFish.level - 1) * 0.02 : 0;
        const finalValue = Math.floor(Number(testFish.value) * (1 + levelBonus));
        console.log(`   📈 Level Bonus: +${(levelBonus * 100).toFixed(1)}%`);
        console.log(`   💰 Final Price: ${finalValue.toLocaleString()} FishCoin`);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Test fish created successfully!');
        console.log('🎯 Now you can test: npx tsx scripts/test-fishbarn-sell-confirmation.ts');

    } catch (error) {
        console.error('❌ Error creating test fish:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestFishForSellConfirmation(); 