/**
 * 🧪 Test Weapon Shop Interactions
 * 
 * Script này test các interactions của weapon shop
 */

import { PrismaClient } from '@prisma/client';
import { WeaponService } from '../src/utils/weapon';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testWeaponShopInteractions() {
    console.log('🧪 Test Weapon Shop Interactions\n');

    const testGuildId = "test-guild-123";
    const testUserId = "test-user-789";

    try {
        // 1. Tạo user test
        console.log('1️⃣ Tạo user test:');
        
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
                balance: 50000n,
                fishBalance: 1000n
            }
        });

        console.log('   ✅ User test đã được tạo');

        // 2. Test lấy danh sách vũ khí
        console.log('\n2️⃣ Test lấy danh sách vũ khí:');
        
        const weapons = WeaponService.getAllWeapons();
        console.log(`   📊 Tổng số vũ khí: ${weapons.length}`);
        
        weapons.forEach((weapon, index) => {
            console.log(`   ${index + 1}. ${weapon.name} - ${weapon.price.toLocaleString()} AniCoin`);
        });

        // 3. Test balance và khả năng mua
        console.log('\n3️⃣ Test balance và khả năng mua:');
        
        const balance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`   💳 Balance: ${balance.toLocaleString()} AniCoin`);
        
        weapons.forEach(weapon => {
            const canAfford = balance >= weapon.price;
            console.log(`   ${weapon.name}: ${canAfford ? '✅' : '❌'} (${weapon.price.toLocaleString()} AniCoin)`);
        });

        // 4. Test mua vũ khí
        console.log('\n4️⃣ Test mua vũ khí:');
        
        const weaponToBuy = weapons[0]; // Iron Sword
        console.log(`   🛒 Mua ${weaponToBuy.name}: ${weaponToBuy.price.toLocaleString()} AniCoin`);
        
        if (balance >= weaponToBuy.price) {
            await EcommerceService.subtractMoney(testUserId, testGuildId, Number(weaponToBuy.price), `Mua ${weaponToBuy.name}`);
            await WeaponService.addWeaponToInventory(testUserId, testGuildId, weaponToBuy.id, 1);
            console.log('   ✅ Mua thành công');
        } else {
            console.log('   ❌ Không đủ tiền');
        }

        // 5. Test inventory sau khi mua
        console.log('\n5️⃣ Test inventory sau khi mua:');
        
        const inventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí trong inventory: ${inventory.length}`);
        
        inventory.forEach(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (weapon) {
                console.log(`   • ${weapon.name}: ${item.quantity}x (Trang bị: ${item.isEquipped ? 'Có' : 'Không'})`);
            }
        });

        // 6. Test trang bị vũ khí
        console.log('\n6️⃣ Test trang bị vũ khí:');
        
        if (inventory.length > 0) {
            const equipSuccess = await WeaponService.equipWeapon(testUserId, testGuildId, weaponToBuy.id);
            console.log(`   ⚔️ Trang bị ${weaponToBuy.name}: ${equipSuccess ? 'Thành công' : 'Thất bại'}`);
        }

        // 7. Test lấy vũ khí đang trang bị
        console.log('\n7️⃣ Test lấy vũ khí đang trang bị:');
        
        const equippedWeapon = await WeaponService.getEquippedWeapon(testUserId, testGuildId);
        if (equippedWeapon) {
            const weapon = WeaponService.getWeaponById(equippedWeapon.weaponId);
            console.log(`   ⚔️ Vũ khí đang trang bị: ${weapon?.name}`);
        } else {
            console.log('   ❌ Không có vũ khí nào đang trang bị');
        }

        // 8. Test tính tổng sức mạnh
        console.log('\n8️⃣ Test tính tổng sức mạnh:');
        
        const stats = await WeaponService.getTotalWeaponStats(testUserId, testGuildId);
        console.log(`   ⚔️ ATK: +${stats.power}`);
        console.log(`   🛡️ DEF: +${stats.defense}`);
        console.log(`   🎯 Accuracy: +${stats.accuracy}%`);

        // 9. Test gỡ trang bị
        console.log('\n9️⃣ Test gỡ trang bị:');
        
        const unequipSuccess = await WeaponService.unequipWeapon(testUserId, testGuildId);
        console.log(`   🛡️ Gỡ trang bị: ${unequipSuccess ? 'Thành công' : 'Thất bại'}`);

        // 10. Test bán vũ khí
        console.log('\n🔟 Test bán vũ khí:');
        
        const sellResult = await WeaponService.sellWeapon(testUserId, testGuildId, weaponToBuy.id, 1);
        if (sellResult.success) {
            console.log(`   💰 Bán ${weaponToBuy.name} thành công: ${sellResult.sellPrice} AniCoin`);
        } else {
            console.log('   ❌ Bán thất bại');
        }

        // 11. Kiểm tra inventory cuối cùng
        console.log('\n1️⃣1️⃣ Kiểm tra inventory cuối cùng:');
        
        const finalInventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí còn lại: ${finalInventory.length}`);

        // 12. Dọn dẹp dữ liệu test
        console.log('\n1️⃣2️⃣ Dọn dẹp dữ liệu test:');
        
        await prisma.userWeapon.deleteMany({
            where: {
                userId: testUserId,
                guildId: testGuildId
            }
        });
        
        console.log('   🗑️ Đã xóa dữ liệu test');

        console.log('\n✅ Test Weapon Shop Interactions hoàn tất!');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWeaponShopInteractions(); 