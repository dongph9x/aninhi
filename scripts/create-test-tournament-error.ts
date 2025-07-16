import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";

const prisma = new PrismaClient();

async function createTestTournamentForError() {
    console.log("=== Creating Test Tournament for Error Testing ===");
    
    try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 30 * 1000); // 30 giây

        const tournament = await TournamentService.createTournament({
            name: "Test Error Tournament",
            description: "Tournament để test thông báo lỗi",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 2,
            startTime,
            endTime,
            createdBy: "test-user",
            guildId: "test-guild",
            channelId: "test-channel"
        });

        console.log("Tournament created successfully:");
        console.log(`- ID: ${tournament.id}`);
        console.log(`- Name: ${tournament.name}`);
        console.log(`- Status: ${tournament.status}`);
        console.log(`- Start: ${tournament.startTime}`);
        console.log(`- End: ${tournament.endTime}`);
        console.log(`- Will expire in: ${Math.floor((endTime.getTime() - Date.now()) / 1000)} seconds`);

        // Tạo user để test
        await prisma.user.upsert({
            where: { userId_guildId: { userId: "test-participant-error", guildId: "test-guild" } },
            update: {},
            create: {
                userId: "test-participant-error",
                guildId: "test-guild",
                balance: 1000
            }
        });
        console.log("Created test user");

        // Thêm một participant (sẽ gây lỗi insufficient participants)
        await TournamentService.joinTournament(tournament.id, "test-participant-error", "test-guild");
        console.log("Added test participant (will cause insufficient participants error)");

        console.log("\nTournament sẽ tự động kết thúc sau 30 giây và gửi thông báo lỗi 'INSUFFICIENT_PARTICIPANTS'");

    } catch (error) {
        console.error("Error creating test tournament:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
createTestTournamentForError(); 