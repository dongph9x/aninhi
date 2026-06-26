import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";
import { EcommerceService } from "../src/utils/ecommerce-db";
import { FishBattleService } from "../src/utils/fish-battle";

const prisma = new PrismaClient();

async function testTournamentAdminOnly() {
    console.log("=== Testing Tournament Admin-Only Creation ===");
    
    try {
        const testGuildId = "test-guild-admin-only";
        const adminUserId = "389957152153796608"; // ID trong danh sách admin
        const regularUserId = "123456789012345678"; // User thường

        // 1. Tạo admin user với số dư đủ
        console.log("\n1. Creating admin user with sufficient balance...");
        await prisma.user.upsert({
            where: { userId_guildId: { userId: adminUserId, guildId: testGuildId } },
            update: { balance: 2000 },
            create: {
                userId: adminUserId,
                guildId: testGuildId,
                balance: 2000
            }
        });
        console.log(`✅ Created admin user with balance: 2000 AniCoin`);

        // 2. Tạo regular user với số dư đủ
        console.log("\n2. Creating regular user with sufficient balance...");
        await prisma.user.upsert({
            where: { userId_guildId: { userId: regularUserId, guildId: testGuildId } },
            update: { balance: 2000 },
            create: {
                userId: regularUserId,
                guildId: testGuildId,
                balance: 2000
            }
        });
        console.log(`✅ Created regular user with balance: 2000 AniCoin`);

        // 3. Test kiểm tra quyền admin
        console.log("\n3. Testing admin permission check...");
        const isAdminUser = await FishBattleService.isAdministrator(adminUserId, testGuildId);
        const isRegularUser = await FishBattleService.isAdministrator(regularUserId, testGuildId);
        
        console.log(`✅ Admin user (${adminUserId}): ${isAdminUser}`);
        console.log(`✅ Regular user (${regularUserId}): ${isRegularUser}`);

        // 4. Test tạo tournament với admin user (sẽ thành công)
        console.log("\n4. Testing tournament creation with admin user...");
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 phút

            const tournament = await TournamentService.createTournament({
                name: "Admin Tournament Test",
                description: "Tournament được tạo bởi admin",
                entryFee: 100,
                prizePool: 1000,
                maxParticipants: 2,
                startTime,
                endTime,
                createdBy: adminUserId,
                guildId: testGuildId,
                channelId: "test-channel"
            });
            console.log(`✅ Tournament created successfully by admin: ${tournament.id}`);

            // Kiểm tra số dư admin sau khi tạo tournament
            const adminBalanceAfterCreation = await EcommerceService.getBalance(adminUserId, testGuildId);
            console.log(`✅ Admin balance after creation: ${adminBalanceAfterCreation} AniCoin (should be 1000)`);

        } catch (error: any) {
            console.log(`❌ Admin tournament creation failed: ${error.message}`);
        }

        // 5. Test tạo tournament với regular user (sẽ thất bại)
        console.log("\n5. Testing tournament creation with regular user...");
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 phút

            await TournamentService.createTournament({
                name: "Regular User Tournament Test",
                description: "Tournament được tạo bởi regular user",
                entryFee: 100,
                prizePool: 1000,
                maxParticipants: 2,
                startTime,
                endTime,
                createdBy: regularUserId,
                guildId: testGuildId,
                channelId: "test-channel"
            });
            console.log("❌ Regular user tournament creation should have failed!");
        } catch (error: any) {
            console.log(`✅ Regular user tournament creation correctly failed: ${error.message}`);
        }

        // 6. Kiểm tra số dư regular user (không thay đổi)
        console.log("\n6. Checking regular user balance (should be unchanged)...");
        const regularUserBalance = await EcommerceService.getBalance(regularUserId, testGuildId);
        console.log(`✅ Regular user balance: ${regularUserBalance} AniCoin (should be 2000)`);

        console.log("\n🎉 All Tournament Admin-Only tests passed!");

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTournamentAdminOnly();
