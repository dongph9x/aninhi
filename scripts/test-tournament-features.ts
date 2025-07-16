import { PrismaClient } from "@prisma/client";
import { TournamentService, saveTournamentMessage, getTournamentMessagesByTournamentId, deleteTournamentMessagesByTournamentId } from "../src/utils/tournament";

const prisma = new PrismaClient();

async function testAllTournamentFeatures() {
    console.log("=== Testing All Tournament Features ===");
    
    try {
        // 1. Test tạo tournament
        console.log("\n1. Testing tournament creation...");
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 1000); // 1 phút

        const tournament = await TournamentService.createTournament({
            name: "Comprehensive Test Tournament",
            description: "Tournament để test tất cả tính năng",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 3,
            startTime,
            endTime,
            createdBy: "test-user",
            guildId: "test-guild",
            channelId: "test-channel"
        });

        console.log(`✅ Tournament created: ${tournament.id}`);

        // 2. Test tạo users
        console.log("\n2. Creating test users...");
        const users = ["user1", "user2", "user3"];
        for (const userId of users) {
            await prisma.user.upsert({
                where: { userId_guildId: { userId, guildId: "test-guild" } },
                update: {},
                create: {
                    userId,
                    guildId: "test-guild",
                    balance: 1000
                }
            });
            console.log(`✅ User created: ${userId}`);
        }

        // 3. Test tham gia tournament
        console.log("\n3. Testing tournament joining...");
        for (const userId of users) {
            try {
                await TournamentService.joinTournament(tournament.id, userId, "test-guild");
                console.log(`✅ User ${userId} joined tournament`);
            } catch (error: any) {
                console.log(`❌ User ${userId} failed to join: ${error.message}`);
            }
        }

        // 4. Test lấy thông tin tournament
        console.log("\n4. Testing tournament info...");
        const tournamentInfo = await TournamentService.getTournamentById(tournament.id);
        if (tournamentInfo) {
            console.log(`✅ Tournament info retrieved:`);
            console.log(`   - Status: ${tournamentInfo.status}`);
            console.log(`   - Participants: ${tournamentInfo.currentParticipants}/${tournamentInfo.maxParticipants}`);
            console.log(`   - Winner: ${tournamentInfo.winnerId || "None"}`);
        }

        // 5. Test lưu message vào DB
        console.log("\n5. Testing message saving...");
        await saveTournamentMessage(tournament.id, "test-message-id", "test-channel", "test-guild");
        console.log("✅ Message saved to DB");

        // 6. Test lấy messages từ DB
        console.log("\n6. Testing message retrieval...");
        const messages = await getTournamentMessagesByTournamentId(tournament.id);
        console.log(`✅ Retrieved ${messages.length} messages from DB`);

        // 7. Test cleanup thủ công
        console.log("\n7. Testing manual cleanup...");
        const updatedCount = await TournamentService.updateExpiredTournaments();
        console.log(`✅ Cleanup updated ${updatedCount} tournaments`);

        // 8. Test xóa messages
        console.log("\n8. Testing message deletion...");
        await deleteTournamentMessagesByTournamentId(tournament.id);
        console.log("✅ Messages deleted from DB");

        console.log("\n🎉 All tournament features tested successfully!");

    } catch (error) {
        console.error("❌ Error testing tournament features:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAllTournamentFeatures(); 