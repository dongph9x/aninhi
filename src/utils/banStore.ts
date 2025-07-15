import fs from "fs";
import path from "path";

const BAN_FILE = path.resolve(__dirname, "../../data/bans.json");

export type BanRecord = {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    banAt: number;
    expiresAt: number | null; // null nếu vĩnh viễn
    type: "permanent" | "temporary";
};

function ensureFile() {
    if (!fs.existsSync(BAN_FILE)) {
        fs.writeFileSync(BAN_FILE, JSON.stringify([]));
    }
}

export function getBans(): BanRecord[] {
    ensureFile();
    const raw = fs.readFileSync(BAN_FILE, "utf8");
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function addBan(ban: BanRecord) {
    const bans = getBans();
    bans.push(ban);
    fs.writeFileSync(BAN_FILE, JSON.stringify(bans, null, 2));
}

export function removeBan(userId: string, guildId: string) {
    const bans = getBans().filter(b => !(b.userId === userId && b.guildId === guildId));
    fs.writeFileSync(BAN_FILE, JSON.stringify(bans, null, 2));
}

export function getBanByUserId(userId: string, guildId: string): BanRecord | undefined {
    return getBans().find(b => b.userId === userId && b.guildId === guildId);
} 