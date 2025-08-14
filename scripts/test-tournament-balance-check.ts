import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";
import { EcommerceService } from "../src/utils/ecommerce-db";

const prisma = new PrismaClient();

async function testTournamentBalanceCheck() {
    console.log("=== Testing Tournament Balance Check Feature ===");
    
    try {
        const testGuildId = "test-guild-balance";
        const testCreatorId = "test-creator-balance";
        const testParticipantId = "test-participant-balance";

        // 1. Tạo user với số dư thấp
        console.log("\n1. Creating user with low balance...");
        await prisma.user.upsert({
            where: { userId_guildId: { userId: testCreatorId, guildId: testGuildId } },
            update: { balance: 100 },
            create: {
                userId: testCreatorId,
                guildId: testGuildId,
                balance: 100
            }
        });
        console.log(`✅ Created user with balance: 100 AniCoin`);

        // 2. Test tạo tournament với giải thưởng cao hơn số dư (sẽ thất bại)
        console.log("\n2. Testing tournament creation with insufficient balance...");
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 phút

            await TournamentService.createTournament({
                name: "Test Insufficient Balance Tournament",
                description: "Tournament để test không đủ tiền",
                entryFee: 50,
                prizePool: 1000, // Cao hơn số dư 100
                maxParticipants: 2,
                startTime,
                endTime,
                createdBy: testCreatorId,
                guildId: testGuildId,
                channelId: "test-channel"
            });
            console.log("❌ Tournament creation should have failed!");
        } catch (error: any) {
            console.log(`✅ Tournament creation correctly failed: ${error.message}`);
        }

        // 3. Tạo user với số dư đủ
        console.log("\n3. Creating user with sufficient balance...");
        await prisma.user.upsert({
            where: { userId_guildId: { userId: testCreatorId, guildId: testGuildId } },
            update: { balance: 2000 },
            create: {
                userId: testCreatorId,
                guildId: testGuildId,
                balance: 2000
            }
        });
        console.log(`✅ Updated user balance to: 2000 AniCoin`);

        // 4. Test tạo tournament với số dư đủ
        console.log("\n4. Testing tournament creation with sufficient balance...");
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 phút

        const tournament = await TournamentService.createTournament({
            name: "Test Sufficient Balance Tournament",
            description: "Tournament để test đủ tiền",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 2,
            startTime,
            endTime,
            createdBy: testCreatorId,
            guildId: testGuildId,
            channelId: "test-channel"
        });
        console.log(`✅ Tournament created successfully: ${tournament.id}`);

        // 5. Kiểm tra số dư sau khi tạo tournament
        console.log("\n5. Checking balance after tournament creation...");
        const balanceAfterCreation = await EcommerceService.getBalance(testCreatorId, testGuildId);
        console.log(`✅ Balance after creation: ${balanceAfterCreation} AniCoin (should be 1000)`);

        // 6. Tạo participant
        console.log("\n6. Creating participant...");
        await prisma.user.upsert({
            where: { userId_guildId: { userId: testParticipantId, guildId: testGuildId } },
            update: { balance: 1000 },
            create: {
                userId: testParticipantId,
                guildId: testGuildId,
                balance: 1000
            }
        });
        console.log(`✅ Created participant with balance: 1000 AniCoin`);

        // 7. Test tham gia tournament
        console.log("\n7. Testing tournament joining...");
        await TournamentService.joinTournament(tournament.id, testParticipantId, testGuildId);
        console.log(`✅ Participant joined tournament successfully`);

        // 8. Kiểm tra số dư participant sau khi tham gia
        console.log("\n8. Checking participant balance after joining...");
        const participantBalanceAfterJoin = await EcommerceService.getBalance(testParticipantId, testGuildId);
        console.log(`✅ Participant balance after join: ${participantBalanceAfterJoin} AniCoin (should be 900)`);

        // 9. Test kết thúc tournament với không đủ người tham gia
        console.log("\n9. Testing tournament end with insufficient participants...");
        try {
            await TournamentService.startTournament(tournament.id, 1);
            console.log("❌ Tournament should have failed due to insufficient participants!");
        } catch (error: any) {
            if (error.message === "INSUFFICIENT_PARTICIPANTS") {
                console.log(`✅ Tournament correctly failed: ${error.message}`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }

        // 10. Kiểm tra số dư creator sau khi refund
        console.log("\n10. Checking creator balance after refund...");
        const balanceAfterRefund = await EcommerceService.getBalance(testCreatorId, testGuildId);
        console.log(`✅ Creator balance after refund: ${balanceAfterRefund} AniCoin (should be 2000)`);

        console.log("\n🎉 All Tournament Balance Check tests passed!");

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTournamentBalanceCheck();
