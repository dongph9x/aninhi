/**
 * 🧪 Test Weapon Fish Battle Integration
 * 
 * Script này test việc tích hợp weapon stats vào fish battle
 */

import { PrismaClient } from '@prisma/client';
import { WeaponService } from '../src/utils/weapon';
import { FishBattleService } from '../src/utils/fish-battle';
import { FishBreedingService } from '../src/utils/fish-breeding';

const prisma = new PrismaClient();

async function testWeaponFishBattleIntegration() {
    console.log('🧪 Test Weapon Fish Battle Integration\n');

    const testGuildId = "test-guild-123";
    const testUserId = "test-user-456";
    const opponentUserId = "test-user-789";

    try {
        // 1. Tạo users test
        console.log('1️⃣ Tạo users test:');
        
        await prisma.user.upsert({
            where: {
                userId_guildId: {
                    userId: testUserId,
                    guildId: testGuildId
                }
            },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 100000n,
                fishBalance: 1000n
            }
        });

        await prisma.user.upsert({
            where: {
                userId_guildId: {
                    userId: opponentUserId,
                    guildId: testGuildId
                }
            },
            update: {},
            create: {
                userId: opponentUserId,
                guildId: testGuildId,
                balance: 100000n,
                fishBalance: 1000n
            }
        });

        console.log('   ✅ Users test đã được tạo');

        // 2. Tạo fish test
        console.log('\n2️⃣ Tạo fish test:');
        
        const userFish = await prisma.fish.create({
            data: {
                species: "Test Fish",
                userId: testUserId,
                guildId: testGuildId,
                generation: 1,
                level: 1,
                status: "adult",
                rarity: "common",
                stats: JSON.stringify({
                    strength: 20,
                    agility: 15,
                    intelligence: 10,
                    defense: 12,
                    luck: 8
                })
            }
        });

        const opponentFish = await prisma.fish.create({
            data: {
                species: "Opponent Fish",
                userId: opponentUserId,
                guildId: testGuildId,
                generation: 1,
                level: 1,
                status: "adult",
                rarity: "common",
                stats: JSON.stringify({
                    strength: 18,
                    agility: 16,
                    intelligence: 12,
                    defense: 10,
                    luck: 6
                })
            }
        });

        console.log(`   🐟 User fish: ${userFish.species} (ID: ${userFish.id})`);
        console.log(`   🐟 Opponent fish: ${opponentFish.species} (ID: ${opponentFish.id})`);

        // 3. Test battle không có weapon
        console.log('\n3️⃣ Test battle không có weapon:');
        
        const battleResultNoWeapon = await FishBattleService.battleFish(
            testUserId, 
            testGuildId, 
            userFish.id, 
            opponentFish.id
        );

        if ('success' in battleResultNoWeapon && !battleResultNoWeapon.success) {
            console.log(`   ❌ Battle thất bại: ${battleResultNoWeapon.error}`);
        } else {
            const result = battleResultNoWeapon as any;
            console.log(`   ⚔️ Battle kết quả: ${result.winner.species} thắng!`);
            console.log(`   💪 Sức mạnh: ${Math.floor(result.winnerPower)} vs ${Math.floor(result.loserPower)}`);
            
            // Hiển thị battle log
            console.log('\n   📜 Battle Log (không có weapon):');
            result.battleLog.slice(0, 10).forEach((log: string, index: number) => {
                console.log(`   ${index + 1}. ${log}`);
            });
        }

        // 4. Mua và trang bị weapon
        console.log('\n4️⃣ Mua và trang bị weapon:');
        
        const weapons = WeaponService.getAllWeapons();
        const ironSword = weapons.find(w => w.id === 'sword');
        
        if (ironSword) {
            // Mua weapon
            await WeaponService.addWeaponToInventory(testUserId, testGuildId, ironSword.id, 1);
            console.log(`   🛒 Đã mua ${ironSword.name}`);
            
            // Trang bị weapon
            const equipSuccess = await WeaponService.equipWeapon(testUserId, testGuildId, ironSword.id);
            console.log(`   ⚔️ Trang bị ${ironSword.name}: ${equipSuccess ? 'Thành công' : 'Thất bại'}`);
            
            // Kiểm tra weapon stats
            const weaponStats = await WeaponService.getTotalWeaponStats(testUserId, testGuildId);
            console.log(`   📊 Weapon stats: ATK +${weaponStats.power}, DEF +${weaponStats.defense}, Accuracy +${weaponStats.accuracy}%`);
        }

        // 5. Test battle có weapon
        console.log('\n5️⃣ Test battle có weapon:');
        
        const battleResultWithWeapon = await FishBattleService.battleFish(
            testUserId, 
            testGuildId, 
            userFish.id, 
            opponentFish.id
        );

        if ('success' in battleResultWithWeapon && !battleResultWithWeapon.success) {
            console.log(`   ❌ Battle thất bại: ${battleResultWithWeapon.error}`);
        } else {
            const result = battleResultWithWeapon as any;
            console.log(`   ⚔️ Battle kết quả: ${result.winner.species} thắng!`);
            console.log(`   💪 Sức mạnh: ${Math.floor(result.winnerPower)} vs ${Math.floor(result.loserPower)}`);
            
            // Hiển thị battle log
            console.log('\n   📜 Battle Log (có weapon):');
            result.battleLog.forEach((log: string, index: number) => {
                console.log(`   ${index + 1}. ${log}`);
            });
        }

        // 6. So sánh sức mạnh
        console.log('\n6️⃣ So sánh sức mạnh:');
        
        if ('success' in battleResultNoWeapon && battleResultNoWeapon.success && 
            'success' in battleResultWithWeapon && battleResultWithWeapon.success) {
            
            const noWeaponResult = battleResultNoWeapon as any;
            const withWeaponResult = battleResultWithWeapon as any;
            
            const noWeaponPower = noWeaponResult.winner.userId === testUserId ? 
                noWeaponResult.winnerPower : noWeaponResult.loserPower;
            const withWeaponPower = withWeaponResult.winner.userId === testUserId ? 
                withWeaponResult.winnerPower : withWeaponResult.loserPower;
            
            const powerIncrease = withWeaponPower - noWeaponPower;
            const increasePercent = (powerIncrease / noWeaponPower) * 100;
            
            console.log(`   💪 Sức mạnh không có weapon: ${Math.floor(noWeaponPower)}`);
            console.log(`   💪 Sức mạnh có weapon: ${Math.floor(withWeaponPower)}`);
            console.log(`   📈 Tăng sức mạnh: +${Math.floor(powerIncrease)} (${increasePercent.toFixed(1)}%)`);
        }

        // 7. Test với weapon mạnh hơn
        console.log('\n7️⃣ Test với weapon mạnh hơn:');
        
        const legendarySword = weapons.find(w => w.id === 'legendary_sword');
        
        if (legendarySword) {
            // Gỡ weapon cũ
            await WeaponService.unequipWeapon(testUserId, testGuildId);
            
            // Mua và trang bị weapon mạnh
            await WeaponService.addWeaponToInventory(testUserId, testGuildId, legendarySword.id, 1);
            await WeaponService.equipWeapon(testUserId, testGuildId, legendarySword.id);
            
            console.log(`   ⚔️ Đã trang bị ${legendarySword.name}`);
            
            // Test battle với weapon mạnh
            const battleResultLegendary = await FishBattleService.battleFish(
                testUserId, 
                testGuildId, 
                userFish.id, 
                opponentFish.id
            );

            if ('success' in battleResultLegendary && battleResultLegendary.success) {
                const result = battleResultLegendary as any;
                console.log(`   ⚔️ Battle với ${legendarySword.name}: ${result.winner.species} thắng!`);
                console.log(`   💪 Sức mạnh: ${Math.floor(result.winnerPower)} vs ${Math.floor(result.loserPower)}`);
            }
        }

        // 8. Dọn dẹp dữ liệu test
        console.log('\n8️⃣ Dọn dẹp dữ liệu test:');
        
        await prisma.fish.deleteMany({
            where: {
                OR: [
                    { id: userFish.id },
                    { id: opponentFish.id }
                ]
            }
        });
        
        await prisma.userWeapon.deleteMany({
            where: {
                userId: testUserId,
                guildId: testGuildId
            }
        });
        
        console.log('   🗑️ Đã xóa dữ liệu test');

        console.log('\n✅ Test Weapon Fish Battle Integration hoàn tất!');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWeaponFishBattleIntegration(); 