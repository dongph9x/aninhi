/**
 * 🧪 Test Weapon Battle Detailed
 * 
 * Script này test chi tiết việc tích hợp weapon stats vào fish battle
 */

import { PrismaClient } from '@prisma/client';
import { WeaponService } from '../src/utils/weapon';
import { FishBattleService } from '../src/utils/fish-battle';

const prisma = new PrismaClient();

async function testWeaponBattleDetailed() {
    console.log('🧪 Test Weapon Battle Detailed\n');

    const testGuildId = "test-guild-456";
    const testUserId = "test-user-123";
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

        // 2. Tạo fish test với stats giống nhau để dễ so sánh
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
                    strength: 20,
                    agility: 15,
                    intelligence: 10,
                    defense: 12,
                    luck: 8
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
            
            // Hiển thị battle log chi tiết
            console.log('\n   📜 Battle Log (không có weapon):');
            result.battleLog.forEach((log: string, index: number) => {
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

        // 5. Bypass cooldown bằng cách reset cooldown
        console.log('\n5️⃣ Bypass cooldown:');
        
        // Reset cooldown bằng cách xóa khỏi Map
        (FishBattleService as any).battleCooldowns.clear();
        console.log('   ⏰ Đã reset cooldown');

        // 6. Test battle có weapon
        console.log('\n6️⃣ Test battle có weapon:');
        
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
            
            // Hiển thị battle log chi tiết
            console.log('\n   📜 Battle Log (có weapon):');
            result.battleLog.forEach((log: string, index: number) => {
                console.log(`   ${index + 1}. ${log}`);
            });
        }

        // 7. So sánh sức mạnh
        console.log('\n7️⃣ So sánh sức mạnh:');
        
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

        // 8. Test với weapon mạnh hơn
        console.log('\n8️⃣ Test với weapon mạnh hơn:');
        
        const legendarySword = weapons.find(w => w.id === 'legendary_sword');
        
        if (legendarySword) {
            // Gỡ weapon cũ
            await WeaponService.unequipWeapon(testUserId, testGuildId);
            
            // Mua và trang bị weapon mạnh
            await WeaponService.addWeaponToInventory(testUserId, testGuildId, legendarySword.id, 1);
            await WeaponService.equipWeapon(testUserId, testGuildId, legendarySword.id);
            
            console.log(`   ⚔️ Đã trang bị ${legendarySword.name}`);
            
            // Reset cooldown
            (FishBattleService as any).battleCooldowns.clear();
            
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
                
                // So sánh với weapon thường
                if ('success' in battleResultWithWeapon && battleResultWithWeapon.success) {
                    const withWeaponResult = battleResultWithWeapon as any;
                    const normalWeaponPower = withWeaponResult.winner.userId === testUserId ? 
                        withWeaponResult.winnerPower : withWeaponResult.loserPower;
                    const legendaryPower = result.winner.userId === testUserId ? 
                        result.winnerPower : result.loserPower;
                    
                    const legendaryIncrease = legendaryPower - normalWeaponPower;
                    const legendaryIncreasePercent = (legendaryIncrease / normalWeaponPower) * 100;
                    
                    console.log(`   📈 Tăng sức mạnh từ Iron Sword lên Legendary Sword: +${Math.floor(legendaryIncrease)} (${legendaryIncreasePercent.toFixed(1)}%)`);
                }
            }
        }

        // 9. Dọn dẹp dữ liệu test
        console.log('\n9️⃣ Dọn dẹp dữ liệu test:');
        
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

        console.log('\n✅ Test Weapon Battle Detailed hoàn tất!');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWeaponBattleDetailed(); 