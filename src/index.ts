import { Partials, PresenceUpdateStatus } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

import { ExtendedClient } from "@/classes";

const cwd = process.cwd();
const envFolder = path.join(cwd, "env");

config({ path: path.resolve(envFolder, ".env") });
config({ path: path.resolve(envFolder, ".env.local") });
config({ path: path.resolve(envFolder, `.env.${process.env.NODE_ENV}`) });

const localFile = path.resolve(envFolder, `.env.${process.env.NODE_ENV}.local`);
if (fs.existsSync(localFile)) config({ path: localFile });

const client = new ExtendedClient({
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
    intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent", "GuildMessageReactions"],
    presence: { status: PresenceUpdateStatus.Online, afk: false },
});

client.run();
