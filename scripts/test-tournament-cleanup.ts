import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";
import { TournamentCleanupJob } from "../src/utils/tournament-cleanup";

const prisma = new PrismaClient();

async function testTournamentCleanup() {
    console.log("=== Testing Tournament Cleanup System ===");
    
    try {
        // 1. Kiểm tra tournaments hiện tại
        console.log("\n1. Kiểm tra tournaments hiện tại:");
        const allTournaments = await prisma.tournament.findMany({
            include: {
                participants: true
            }
        });
        
        console.log(`Tổng số tournaments: ${allTournaments.length}`);
        allTournaments.forEach((t: any) => {
            console.log(`- ${t.name} (${t.id}): ${t.status}, ${t.currentParticipants}/${t.maxParticipants} participants`);
        });

        // 2. Kiểm tra tournaments hết hạn
        console.log("\n2. Kiểm tra tournaments hết hạn:");
        const expiredTournaments = await TournamentService.getExpiredTournaments();
        console.log(`Tournaments hết hạn: ${expiredTournaments.length}`);
        expiredTournaments.forEach((t: any) => {
            console.log(`- ${t.name} (${t.id}): ${t.status}, kết thúc: ${t.endTime}`);
        });

        // 3. Chạy cleanup thủ công
        console.log("\n3. Chạy cleanup thủ công:");
        const updatedCount = await TournamentService.updateExpiredTournaments();
        console.log(`Đã cập nhật ${updatedCount} tournaments`);

        // 4. Kiểm tra kết quả sau cleanup
        console.log("\n4. Kiểm tra kết quả sau cleanup:");
        const tournamentsAfterCleanup = await prisma.tournament.findMany({
            include: {
                participants: true
            }
        });
        
        tournamentsAfterCleanup.forEach((t: any) => {
            console.log(`- ${t.name} (${t.id}): ${t.status}, ${t.currentParticipants}/${t.maxParticipants} participants`);
            if (t.winnerId) {
                console.log(`  Winner: ${t.winnerId}`);
            }
        });

        // 5. Test cleanup job
        console.log("\n5. Test cleanup job:");
        await TournamentCleanupJob.runManualCleanup();

    } catch (error) {
        console.error("Error testing tournament cleanup:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testTournamentCleanup(); 