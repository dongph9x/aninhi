import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";

const prisma = new PrismaClient();

async function createTestTournament() {
    console.log("=== Creating Test Tournament ===");
    
    try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 1 * 60 * 1000); // 1 phút

        const tournament = await TournamentService.createTournament({
            name: "Test Auto-Update Tournament",
            description: "Tournament để test auto-update message",
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

        // Tạo user trước
        await prisma.user.upsert({
            where: { userId_guildId: { userId: "test-participant", guildId: "test-guild" } },
            update: {},
            create: {
                userId: "test-participant",
                guildId: "test-guild",
                balance: 1000
            }
        });
        console.log("Created test user");

        // Thêm một participant
        await TournamentService.joinTournament(tournament.id, "test-participant", "test-guild");
        console.log("Added test participant");

    } catch (error) {
        console.error("Error creating test tournament:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
createTestTournament(); 