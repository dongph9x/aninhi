import { Partials, PresenceUpdateStatus } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

import { ExtendedClient } from "@/classes";
import { databaseService } from "@/utils/database";

const cwd = process.cwd();

// Load .env files from root directory
config({ path: path.resolve(cwd, ".env") });
config({ path: path.resolve(cwd, ".env.local") });
config({ path: path.resolve(cwd, `.env.${process.env.NODE_ENV}`) });

const localFile = path.resolve(cwd, `.env.${process.env.NODE_ENV}.local`);
if (fs.existsSync(localFile)) config({ path: localFile });

// Also try loading from env folder if it exists
const envFolder = path.join(cwd, "env");
if (fs.existsSync(envFolder)) {
    config({ path: path.resolve(envFolder, ".env") });
    config({ path: path.resolve(envFolder, ".env.local") });
    config({ path: path.resolve(envFolder, `.env.${process.env.NODE_ENV}`) });
    
    const envLocalFile = path.resolve(envFolder, `.env.${process.env.NODE_ENV}.local`);
    if (fs.existsSync(envLocalFile)) config({ path: envLocalFile });
}

async function startBot() {
    try {
        // Initialize database
        console.log('🔌 Initializing database...');
        await databaseService.initialize();
        console.log('✅ Database initialized successfully');

        // Initialize fish price system
        console.log('🐟 Initializing fish price system...');
        const { FishPriceService } = await import("@/utils/fishing");
        await FishPriceService.initializeFishPrices();
        FishPriceService.startPriceUpdateScheduler();
        console.log('✅ Fish price system initialized successfully');

        // Create Discord client
        const client = new ExtendedClient({
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
            intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent", "GuildMessageReactions"],
            presence: { status: PresenceUpdateStatus.Online, afk: false },
        });

        // Start bot
        client.run();

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down...');
            await databaseService.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Shutting down...');
            await databaseService.disconnect();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();
