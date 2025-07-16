import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugFishing() {
    try {
        // Test user and guild
        const userId = "test-user-123";
        const guildId = "test-guild-123";
        
        // Simulate the exact command the user used
        const command = 'n.fishing sell "Cá rô phi" 1';
        const args = command.split(" ").slice(2); // Skip "n.fishing" and "sell"
        
        console.log("=== Debugging Fishing Command ===");
        console.log("Original command:", command);
        console.log("Parsed args:", args);
        
        const fishName = args[0];
        const quantity = parseInt(args[1]) || 1;
        
        console.log("Extracted fish name:", `"${fishName}"`);
        console.log("Extracted quantity:", quantity);
        
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });
        console.log("User exists:", !!user);
        
        if (!user) {
            console.log("Creating user...");
            await prisma.user.create({
                data: { userId, guildId, balance: 1000 }
            });
        }

        // 2. Get fishing data
        const fishingData = await prisma.fishingData.findUnique({
            where: { userId_guildId: { userId, guildId } },
            include: { fish: true }
        });
        console.log("Fishing data exists:", !!fishingData);
        
        if (!fishingData) {
            console.log("Creating fishing data...");
            await prisma.fishingData.create({
                data: {
                    userId,
                    guildId,
                    totalFish: 0,
                    totalEarnings: 0,
                    biggestFish: "",
                    biggestValue: 0,
                    rarestFish: "",
                    rarestRarity: "",
                    fishingTime: 0,
                    currentRod: "basic",
                    currentBait: "basic",
                    lastFished: new Date(0)
                }
            });
        }

        // 3. Check current fish inventory
        const currentFishingData = await prisma.fishingData.findUnique({
            where: { userId_guildId: { userId, guildId } },
            include: { fish: true }
        });
        
        console.log("Current fish inventory:");
        console.log(currentFishingData?.fish);

        // 4. Add a test fish if none exists
        if (!currentFishingData?.fish.length) {
            console.log("Adding test fish...");
            await prisma.caughtFish.create({
                data: {
                    fishingDataId: currentFishingData!.id,
                    fishName: "Cá rô phi",
                    fishRarity: "common",
                    fishValue: 30,
                    quantity: 1
                }
            });
        }

        // 5. Check fish inventory again
        const updatedFishingData = await prisma.fishingData.findUnique({
            where: { userId_guildId: { userId, guildId } },
            include: { fish: true }
        });
        
        console.log("Updated fish inventory:");
        console.log(updatedFishingData?.fish);

        // 6. Test the sell logic with the parsed fish name
        const caughtFish = updatedFishingData?.fish.find((f: any) => f.fishName === fishName);
        console.log("Found fish for selling:", caughtFish);
        
        if (caughtFish) {
            console.log("Fish name match:", caughtFish.fishName === fishName);
            console.log("Fish quantity:", caughtFish.quantity);
            console.log("Requested quantity:", quantity);
            console.log("Can sell:", caughtFish.quantity >= quantity);
        } else {
            console.log("No fish found with name:", fishName);
            
            // Show all available fish names
            console.log("Available fish names:");
            updatedFishingData?.fish.forEach((f: any) => {
                console.log(`- "${f.fishName}"`);
            });
        }

        // 7. Test exact string comparison
        console.log("Testing string comparison:");
        console.log("Input fish name:", `"${fishName}"`);
        console.log("Database fish name:", `"${caughtFish?.fishName}"`);
        console.log("Exact match:", caughtFish?.fishName === fishName);
        console.log("Trimmed match:", caughtFish?.fishName.trim() === fishName.trim());

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugFishing(); 