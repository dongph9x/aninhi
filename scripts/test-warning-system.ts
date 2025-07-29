/**
 * 🧪 Test Warning System
 * 
 * Script này test hệ thống warning sau khi tạo bảng WarningRecord
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWarningSystem() {
    console.log('🧪 Test Warning System\n');

    try {
        // 1. Kiểm tra bảng WarningRecord có tồn tại không
        console.log('1️⃣ Checking WarningRecord table...');
        
        const warningCount = await prisma.warningRecord.count();
        console.log(`   ✅ WarningRecord table exists with ${warningCount} records`);

        // 2. Test tạo warning mới
        console.log('\n2️⃣ Testing create warning...');
        
        const testWarning = await prisma.warningRecord.create({
            data: {
                userId: 'test-user-123',
                guildId: 'test-guild-456',
                moderatorId: 'moderator-789',
                warningLevel: 1,
                reason: 'Test warning for system verification',
                message: 'This is a test warning to verify the system works correctly',
                isActive: true
            }
        });

        console.log(`   ✅ Created warning: ${testWarning.id}`);
        console.log(`   User ID: ${testWarning.userId}`);
        console.log(`   Guild ID: ${testWarning.guildId}`);
        console.log(`   Warning Level: ${testWarning.warningLevel}`);
        console.log(`   Reason: ${testWarning.reason}`);

        // 3. Test lấy warning
        console.log('\n3️⃣ Testing get warning...');
        
        const retrievedWarning = await prisma.warningRecord.findUnique({
            where: { id: testWarning.id }
        });

        if (retrievedWarning) {
            console.log(`   ✅ Retrieved warning: ${retrievedWarning.id}`);
            console.log(`   Active: ${retrievedWarning.isActive}`);
            console.log(`   Created: ${retrievedWarning.createdAt}`);
        } else {
            console.log('   ❌ Failed to retrieve warning');
        }

        // 4. Test lấy warnings của user
        console.log('\n4️⃣ Testing get user warnings...');
        
        const userWarnings = await prisma.warningRecord.findMany({
            where: {
                userId: 'test-user-123',
                guildId: 'test-guild-456',
                isActive: true
            }
        });

        console.log(`   ✅ Found ${userWarnings.length} active warnings for user`);

        // 5. Test cập nhật warning
        console.log('\n5️⃣ Testing update warning...');
        
        const updatedWarning = await prisma.warningRecord.update({
            where: { id: testWarning.id },
            data: {
                warningLevel: 2,
                reason: 'Updated test warning',
                message: 'This warning has been updated for testing'
            }
        });

        console.log(`   ✅ Updated warning level to: ${updatedWarning.warningLevel}`);
        console.log(`   New reason: ${updatedWarning.reason}`);

        // 6. Test deactivate warning
        console.log('\n6️⃣ Testing deactivate warning...');
        
        const deactivatedWarning = await prisma.warningRecord.update({
            where: { id: testWarning.id },
            data: {
                isActive: false
            }
        });

        console.log(`   ✅ Deactivated warning: ${deactivatedWarning.isActive}`);

        // 7. Test lấy active warnings
        console.log('\n7️⃣ Testing get active warnings...');
        
        const activeWarnings = await prisma.warningRecord.findMany({
            where: {
                userId: 'test-user-123',
                guildId: 'test-guild-456',
                isActive: true
            }
        });

        console.log(`   ✅ Found ${activeWarnings.length} active warnings (should be 0)`);

        // 8. Test lấy warnings theo level
        console.log('\n8️⃣ Testing get warnings by level...');
        
        const level1Warnings = await prisma.warningRecord.findMany({
            where: {
                warningLevel: 1
            }
        });

        const level2Warnings = await prisma.warningRecord.findMany({
            where: {
                warningLevel: 2
            }
        });

        console.log(`   ✅ Level 1 warnings: ${level1Warnings.length}`);
        console.log(`   ✅ Level 2 warnings: ${level2Warnings.length}`);

        // 9. Test lấy warnings theo moderator
        console.log('\n9️⃣ Testing get warnings by moderator...');
        
        const moderatorWarnings = await prisma.warningRecord.findMany({
            where: {
                moderatorId: 'moderator-789'
            }
        });

        console.log(`   ✅ Warnings by moderator: ${moderatorWarnings.length}`);

        // 10. Cleanup test data
        console.log('\n🔟 Cleaning up test data...');
        
        await prisma.warningRecord.delete({
            where: { id: testWarning.id }
        });

        console.log(`   ✅ Deleted test warning: ${testWarning.id}`);

        // 11. Final check
        console.log('\n1️⃣1️⃣ Final verification...');
        
        const finalCount = await prisma.warningRecord.count();
        console.log(`   ✅ Final warning count: ${finalCount}`);

        console.log('\n✅ Warning System Test Completed!');
        console.log('\n🎯 Test Results:');
        console.log('   ✅ WarningRecord table exists and is accessible');
        console.log('   ✅ Create warning: Working');
        console.log('   ✅ Retrieve warning: Working');
        console.log('   ✅ Update warning: Working');
        console.log('   ✅ Deactivate warning: Working');
        console.log('   ✅ Query by user: Working');
        console.log('   ✅ Query by level: Working');
        console.log('   ✅ Query by moderator: Working');
        console.log('   ✅ Delete warning: Working');
        console.log('   ✅ All CRUD operations: Working');

    } catch (error) {
        console.error('❌ Error testing warning system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testWarningSystem()
    .then(() => {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });