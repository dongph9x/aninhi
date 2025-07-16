import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";

const prisma = new PrismaClient();

async function createTestTournamentWithRealChannel() {
    console.log("=== Creating Test Tournament with Real Channel ID ===");
    
    try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 30 * 1000); // 30 giây

        // Sử dụng channel ID thật (snowflake) - thay thế bằng channel ID thật của bạn
        const realChannelId = "1234567890123456789"; // Thay thế bằng channel ID thật

        const tournament = await TournamentService.createTournament({
            name: "Test Real Channel Tournament",
            description: "Tournament để test với channel ID thật",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 2,
            startTime,
            endTime,
            createdBy: "test-user",
            guildId: "test-guild",
            channelId: realChannelId
        });

        console.log("Tournament created successfully:");
        console.log(`- ID: ${tournament.id}`);
        console.log(`- Name: ${tournament.name}`);
        console.log(`- Status: ${tournament.status}`);
        console.log(`- Channel ID: ${tournament.channelId}`);
        console.log(`- Will expire in: ${Math.floor((endTime.getTime() - Date.now()) / 1000)} seconds`);

        // Tạo user để test
        await prisma.user.upsert({
            where: { userId_guildId: { userId: "test-real-user", guildId: "test-guild" } },
            update: {},
            create: {
                userId: "test-real-user",
                guildId: "test-guild",
                balance: 1000
            }
        });
        console.log("Created test user");

        // Thêm một participant (sẽ gây lỗi insufficient participants)
        await TournamentService.joinTournament(tournament.id, "test-real-user", "test-guild");
        console.log("Added test participant (will cause insufficient participants error)");

        console.log("\nTournament sẽ tự động kết thúc sau 30 giây.");
        console.log("Nếu channel ID hợp lệ, sẽ gửi thông báo lỗi 'INSUFFICIENT_PARTICIPANTS'");
        console.log("Nếu channel ID không hợp lệ, sẽ skip notification và log message");

    } catch (error) {
        console.error("Error creating test tournament:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
createTestTournamentWithRealChannel(); 