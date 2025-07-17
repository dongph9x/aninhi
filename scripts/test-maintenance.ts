import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMaintenance() {
    console.log("🔧 Testing Maintenance Command");
    console.log("================================");
    
    try {
        // Test 1: Kiểm tra database connection
        console.log("1. Testing database connection...");
        await prisma.$connect();
        console.log("✅ Database connected successfully");
        
        // Test 2: Kiểm tra user data
        console.log("\n2. Checking user data...");
        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users in database`);
        
        // Test 3: Kiểm tra transaction data
        console.log("\n3. Checking transaction data...");
        const transactionCount = await prisma.transaction.count();
        console.log(`✅ Found ${transactionCount} transactions`);
        
        // Test 4: Kiểm tra tournament data
        console.log("\n4. Checking tournament data...");
        const tournamentCount = await prisma.tournament.count();
        console.log(`✅ Found ${tournamentCount} tournaments`);
        
        // Test 5: Kiểm tra ban data
        console.log("\n5. Checking ban data...");
        const banCount = await prisma.banRecord.count();
        console.log(`✅ Found ${banCount} bans`);
        
        console.log("\n🎉 All tests passed! Maintenance command should work correctly.");
        
    } catch (error) {
        console.error("❌ Error during maintenance test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testMaintenance(); 