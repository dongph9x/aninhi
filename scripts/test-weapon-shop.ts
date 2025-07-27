/**
 * 🧪 Test Weapon Shop
 * 
 * Script này test các tính năng của weapon shop
 */

import { PrismaClient } from '@prisma/client';
import { WeaponService } from '../src/utils/weapon';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testWeaponShop() {
    console.log('🧪 Test Weapon Shop\n');

    const testGuildId = "test-guild-123";
    const testUserId = "test-user-456";

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
                balance: 1000000n,
                fishBalance: 5000n
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

        // 3. Test thêm vũ khí vào inventory
        console.log('\n3️⃣ Test thêm vũ khí vào inventory:');
        
        await WeaponService.addWeaponToInventory(testUserId, testGuildId, "sword", 2);
        await WeaponService.addWeaponToInventory(testUserId, testGuildId, "shield", 1);
        await WeaponService.addWeaponToInventory(testUserId, testGuildId, "spear", 1);
        
        console.log('   ✅ Đã thêm vũ khí vào inventory');

        // 4. Test lấy inventory
        console.log('\n4️⃣ Test lấy inventory:');
        
        const inventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí trong inventory: ${inventory.length}`);
        
        inventory.forEach(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (weapon) {
                console.log(`   • ${weapon.name}: ${item.quantity}x (Trang bị: ${item.isEquipped ? 'Có' : 'Không'})`);
            }
        });

        // 5. Test trang bị vũ khí
        console.log('\n5️⃣ Test trang bị vũ khí:');
        
        const equipSuccess = await WeaponService.equipWeapon(testUserId, testGuildId, "sword");
        console.log(`   ⚔️ Trang bị sword: ${equipSuccess ? 'Thành công' : 'Thất bại'}`);

        // 6. Test lấy vũ khí đang trang bị
        console.log('\n6️⃣ Test lấy vũ khí đang trang bị:');
        
        const equippedWeapon = await WeaponService.getEquippedWeapon(testUserId, testGuildId);
        if (equippedWeapon) {
            const weapon = WeaponService.getWeaponById(equippedWeapon.weaponId);
            console.log(`   ⚔️ Vũ khí đang trang bị: ${weapon?.name}`);
        } else {
            console.log('   ❌ Không có vũ khí nào đang trang bị');
        }

        // 7. Test tính tổng sức mạnh
        console.log('\n7️⃣ Test tính tổng sức mạnh:');
        
        const stats = await WeaponService.getTotalWeaponStats(testUserId, testGuildId);
        console.log(`   ⚔️ ATK: +${stats.power}`);
        console.log(`   🛡️ DEF: +${stats.defense}`);
        console.log(`   🎯 Accuracy: +${stats.accuracy}%`);

        // 8. Test gỡ trang bị
        console.log('\n8️⃣ Test gỡ trang bị:');
        
        const unequipSuccess = await WeaponService.unequipWeapon(testUserId, testGuildId);
        console.log(`   🛡️ Gỡ trang bị: ${unequipSuccess ? 'Thành công' : 'Thất bại'}`);

        // 9. Test bán vũ khí
        console.log('\n9️⃣ Test bán vũ khí:');
        
        const sellResult = await WeaponService.sellWeapon(testUserId, testGuildId, "shield", 1);
        if (sellResult.success) {
            console.log(`   💰 Bán shield thành công: ${sellResult.sellPrice} AniCoin`);
        } else {
            console.log('   ❌ Bán shield thất bại');
        }

        // 10. Test mô phỏng mua vũ khí
        console.log('\n🔟 Test mô phỏng mua vũ khí:');
        
        const balance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`   💳 Balance hiện tại: ${balance.toLocaleString()} AniCoin`);
        
        const weaponToBuy = WeaponService.getWeaponById("bow");
        if (weaponToBuy) {
            const cost = Number(weaponToBuy.price);
            console.log(`   🏹 Mua ${weaponToBuy.name}: ${cost.toLocaleString()} AniCoin`);
            
            if (balance >= cost) {
                console.log('   ✅ Đủ tiền để mua');
            } else {
                console.log('   ❌ Không đủ tiền để mua');
            }
        }

        // 11. Kiểm tra inventory cuối cùng
        console.log('\n1️⃣1️⃣ Kiểm tra inventory cuối cùng:');
        
        const finalInventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí còn lại: ${finalInventory.length}`);
        
        finalInventory.forEach(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (weapon) {
                console.log(`   • ${weapon.name}: ${item.quantity}x`);
            }
        });

        // 12. Dọn dẹp dữ liệu test
        console.log('\n1️⃣2️⃣ Dọn dẹp dữ liệu test:');
        
        await prisma.userWeapon.deleteMany({
            where: {
                userId: testUserId,
                guildId: testGuildId
            }
        });
        
        console.log('   🗑️ Đã xóa dữ liệu test');

        console.log('\n✅ Test Weapon Shop hoàn tất!');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWeaponShop(); 