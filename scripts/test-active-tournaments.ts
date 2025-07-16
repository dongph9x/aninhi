import { PrismaClient } from "@prisma/client";
import { TournamentService } from "../src/utils/tournament";

const prisma = new PrismaClient();

async function testActiveTournaments() {
    try {
        console.log("=== Testing Active Tournaments Logic ===");
        
        // 1. Kiểm tra tất cả tournaments
        const allTournaments = await prisma.tournament.findMany({
            orderBy: { createdAt: 'desc' }
        });
        
        console.log("All tournaments:", allTournaments.length);
        allTournaments.forEach((t: any) => {
            console.log(`- ${t.name}: ${t.status} (ends: ${t.endTime})`);
        });

        // 2. Kiểm tra active tournaments
        const activeTournaments = await TournamentService.getAllActiveTournaments();
        console.log("Active tournaments:", activeTournaments.length);
        activeTournaments.forEach((t: any) => {
            console.log(`- ${t.name}: ${t.status} (ends: ${t.endTime})`);
        });

        // 3. Kiểm tra expired tournaments
        const expiredTournaments = await TournamentService.getExpiredTournaments();
        console.log("Expired tournaments:", expiredTournaments.length);
        expiredTournaments.forEach((t: any) => {
            console.log(`- ${t.name}: ${t.status} (ends: ${t.endTime})`);
        });

        // 4. Logic cleanup
        if (activeTournaments.length === 0) {
            console.log("✅ No active tournaments - cleanup job will skip");
        } else {
            console.log(`🔍 Found ${activeTournaments.length} active tournaments - cleanup job will check for expired ones`);
            
            const now = new Date();
            const expiredCount = activeTournaments.filter((t: any) => new Date(t.endTime) <= now).length;
            console.log(`📊 ${expiredCount} active tournaments are expired`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testActiveTournaments(); 