import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkExpiredTournaments() {
    try {
        console.log("=== Checking Expired Tournaments ===");
        
        const now = new Date();
        console.log("Current time:", now);

        // Tìm tất cả tournaments đang registration
        const registrationTournaments = await prisma.tournament.findMany({
            where: { status: "registration" },
            orderBy: { createdAt: 'desc' }
        });

        console.log("Registration tournaments:", registrationTournaments.length);
        registrationTournaments.forEach((t: any) => {
            const endTime = new Date(t.endTime);
            const isExpired = endTime <= now;
            console.log(`- ${t.name}: ${t.status} (ends: ${endTime}) - Expired: ${isExpired}`);
        });

        // Tìm tournaments đã hết hạn
        const expiredTournaments = await prisma.tournament.findMany({
            where: {
                status: "registration",
                endTime: { lte: now }
            }
        });

        console.log("Expired tournaments:", expiredTournaments.length);
        expiredTournaments.forEach((t: any) => {
            console.log(`- ${t.name}: ${t.status} (ends: ${t.endTime})`);
        });

        // Kiểm tra active tournaments
        const activeTournaments = await prisma.tournament.findMany({
            where: { status: "registration" },
            orderBy: { createdAt: 'desc' }
        });

        console.log("Active tournaments (should be 0 if all expired):", activeTournaments.length);
        activeTournaments.forEach((t: any) => {
            const endTime = new Date(t.endTime);
            const isExpired = endTime <= now;
            console.log(`- ${t.name}: ${t.status} (ends: ${endTime}) - Expired: ${isExpired}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkExpiredTournaments(); 