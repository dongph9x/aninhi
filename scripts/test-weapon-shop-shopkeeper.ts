/**
 * 🧪 Test Weapon Shop Shopkeeper
 * 
 * Script này test việc hiển thị ảnh shopkeeper trong weapon shop
 */

import { PrismaClient } from '@prisma/client';
import { WeaponService } from '../src/utils/weapon';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testWeaponShopShopkeeper() {
    console.log('🧪 Test Weapon Shop Shopkeeper\n');

    const testGuildId = "test-guild-789";
    const testUserId = "test-user-123";

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
                balance: 100000n,
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

        // 3. Test mua vũ khí
        console.log('\n3️⃣ Test mua vũ khí:');
        
        const ironSword = weapons.find(w => w.id === 'sword');
        
        if (ironSword) {
            // Mua weapon
            await EcommerceService.subtractMoney(testUserId, testGuildId, Number(ironSword.price), `Mua ${ironSword.name}`);
            await WeaponService.addWeaponToInventory(testUserId, testGuildId, ironSword.id, 1);
            console.log(`   🛒 Đã mua ${ironSword.name}`);
            
            // Trang bị weapon
            const equipSuccess = await WeaponService.equipWeapon(testUserId, testGuildId, ironSword.id);
            console.log(`   ⚔️ Trang bị ${ironSword.name}: ${equipSuccess ? 'Thành công' : 'Thất bại'}`);
        }

        // 4. Test inventory
        console.log('\n4️⃣ Test inventory:');
        
        const inventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí trong inventory: ${inventory.length}`);
        
        inventory.forEach(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (weapon) {
                console.log(`   • ${weapon.name}: ${item.quantity}x (Trang bị: ${item.isEquipped ? 'Có' : 'Không'})`);
            }
        });

        // 5. Test weapon info
        console.log('\n5️⃣ Test weapon info:');
        
        if (ironSword) {
            console.log(`   📝 Thông tin ${ironSword.name}:`);
            console.log(`   • ID: ${ironSword.id}`);
            console.log(`   • Tên: ${ironSword.name}`);
            console.log(`   • Giá: ${ironSword.price.toLocaleString()} AniCoin`);
            console.log(`   • ATK: +${ironSword.power}`);
            console.log(`   • DEF: +${ironSword.defense}`);
            console.log(`   • Accuracy: +${ironSword.accuracy}%`);
            console.log(`   • Rarity: ${ironSword.rarity}`);
            console.log(`   • Type: ${ironSword.type}`);
        }

        // 6. Test weapon stats
        console.log('\n6️⃣ Test weapon stats:');
        
        const weaponStats = await WeaponService.getTotalWeaponStats(testUserId, testGuildId);
        console.log(`   📊 Weapon stats: ATK +${weaponStats.power}, DEF +${weaponStats.defense}, Accuracy +${weaponStats.accuracy}%`);

        // 7. Test gỡ trang bị
        console.log('\n7️⃣ Test gỡ trang bị:');
        
        const unequipSuccess = await WeaponService.unequipWeapon(testUserId, testGuildId);
        console.log(`   🛡️ Gỡ trang bị: ${unequipSuccess ? 'Thành công' : 'Thất bại'}`);

        // 8. Kiểm tra inventory sau khi gỡ trang bị
        console.log('\n8️⃣ Kiểm tra inventory sau khi gỡ trang bị:');
        
        const finalInventory = await WeaponService.getUserWeaponInventory(testUserId, testGuildId);
        console.log(`   📦 Số lượng vũ khí còn lại: ${finalInventory.length}`);
        
        finalInventory.forEach(item => {
            const weapon = WeaponService.getWeaponById(item.weaponId);
            if (weapon) {
                console.log(`   • ${weapon.name}: ${item.quantity}x (Trang bị: ${item.isEquipped ? 'Có' : 'Không'})`);
            }
        });

        // 9. Dọn dẹp dữ liệu test
        console.log('\n9️⃣ Dọn dẹp dữ liệu test:');
        
        await prisma.userWeapon.deleteMany({
            where: {
                userId: testUserId,
                guildId: testGuildId
            }
        });
        
        console.log('   🗑️ Đã xóa dữ liệu test');

        console.log('\n✅ Test Weapon Shop Shopkeeper hoàn tất!');
        console.log('\n🎭 **Lưu ý:** Ảnh shopkeeper sẽ hiển thị trong tất cả các embed của weapon shop:');
        console.log('   • Main shop (n.weaponshop)');
        console.log('   • Buy weapon button');
        console.log('   • Inventory button');
        console.log('   • Equip weapon button');
        console.log('   • Help button');
        console.log('   • Weapon info');
        console.log('   • Success messages');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWeaponShopShopkeeper(); 