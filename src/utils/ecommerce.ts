import fs from "fs";
import path from "path";

// Interface cho dữ liệu người dùng
interface UserData {
    userId: string;
    guildId: string;
    balance: number;
    dailyStreak: number;
    lastDaily?: string;
    createdAt: string;
    updatedAt: string;
}

// Interface cho lịch sử giao dịch
interface TransactionHistory {
    id: string;
    userId: string;
    guildId: string;
    type: "add" | "subtract" | "transfer" | "daily" | "game";
    amount: number;
    description: string;
    createdAt: string;
}

// Interface cho database
interface EcommerceDatabase {
    users: UserData[];
    transactions: TransactionHistory[];
    dailyClaims: Record<string, string>;
    settings: {
        dailyBaseAmount: number;
        dailyStreakBonus: number;
        maxStreakBonus: number;
        dailyCooldownHours: number;
    };
}

class EcommerceManager {
    private static instance: EcommerceManager;
    private dbPath: string;
    private data: EcommerceDatabase;

    private constructor() {
        this.dbPath = path.join(process.cwd(), "data", "ecommerce.json");
        this.ensureDataDirectory();
        this.data = this.loadData();
    }

    public static getInstance(): EcommerceManager {
        if (!EcommerceManager.instance) {
            EcommerceManager.instance = new EcommerceManager();
        }
        return EcommerceManager.instance;
    }

    /**
     * Đảm bảo thư mục data tồn tại
     */
    private ensureDataDirectory(): void {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    /**
     * Load dữ liệu từ file JSON
     */
    private loadData(): EcommerceDatabase {
        if (!fs.existsSync(this.dbPath)) {
            const defaultData: EcommerceDatabase = {
                users: [],
                transactions: [],
                dailyClaims: {},
                settings: {
                    dailyBaseAmount: 1000,
                    dailyStreakBonus: 100,
                    maxStreakBonus: 1000,
                    dailyCooldownHours: 24,
                },
            };
            this.saveData(defaultData);
            return defaultData;
        }

        try {
            const fileContent = fs.readFileSync(this.dbPath, "utf-8");
            return JSON.parse(fileContent);
        } catch (error) {
            console.error("Error loading ecommerce database:", error);
            return {
                users: [],
                transactions: [],
                dailyClaims: {},
                settings: {
                    dailyBaseAmount: 1000,
                    dailyStreakBonus: 100,
                    maxStreakBonus: 1000,
                    dailyCooldownHours: 24,
                },
            };
        }
    }

    /**
     * Lưu dữ liệu vào file JSON
     */
    private saveData(data: EcommerceDatabase): void {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error saving ecommerce database:", error);
        }
    }

    /**
     * Tạo ID duy nhất
     */
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    /**
     * Lấy thông tin người dùng (tạo mới nếu chưa tồn tại)
     */
    async getUser(userId: string, guildId: string): Promise<UserData> {
        const existingUser = this.data.users.find(
            user => user.userId === userId && user.guildId === guildId,
        );

        if (existingUser) {
            return existingUser;
        }

        const newUser: UserData = {
            userId,
            guildId,
            balance: 0,
            dailyStreak: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.data.users.push(newUser);
        this.saveData(this.data);
        return newUser;
    }

    /**
     * Lấy số tiền hiện tại của người dùng
     */
    async getBalance(userId: string, guildId: string): Promise<number> {
        const user = await this.getUser(userId, guildId);
        return user.balance;
    }

    /**
     * Cộng tiền cho người dùng
     */
    async addMoney(
        userId: string,
        guildId: string,
        amount: number,
        description: string = "Added AniCoin",
    ): Promise<UserData> {
        if (amount <= 0) {
            throw new Error("Số tiền phải lớn hơn 0");
        }

        const user = await this.getUser(userId, guildId);

        const userIndex = this.data.users.findIndex(
            u => u.userId === userId && u.guildId === guildId,
        );

        this.data.users[userIndex].balance += amount;
        this.data.users[userIndex].updatedAt = new Date().toISOString();

        this.saveData(this.data);

        return this.data.users[userIndex];
    }

    /**
     * Trừ tiền của người dùng
     */
    async subtractMoney(
        userId: string,
        guildId: string,
        amount: number,
        description: string = "Subtracted AniCoin",
    ): Promise<UserData> {
        if (amount <= 0) {
            throw new Error("Số tiền phải lớn hơn 0");
        }

        const user = await this.getUser(userId, guildId);

        if (user.balance < amount) {
            throw new Error("Số dư không đủ");
        }

        const userIndex = this.data.users.findIndex(
            u => u.userId === userId && u.guildId === guildId,
        );

        this.data.users[userIndex].balance -= amount;
        this.data.users[userIndex].updatedAt = new Date().toISOString();

        // ĐÃ LOẠI BỎ GHI LỊCH SỬ GIAO DỊCH
        this.saveData(this.data);

        return this.data.users[userIndex];
    }

    /**
     * Chuyển tiền giữa hai người dùng
     */
    async transferMoney(
        fromUserId: string,
        toUserId: string,
        guildId: string,
        amount: number,
        description: string = "Transfer",
    ): Promise<{ fromUser: UserData; toUser: UserData }> {
        if (amount <= 0) {
            throw new Error("Số tiền phải lớn hơn 0");
        }

        // if (fromUserId === toUserId) {
        //     throw new Error("Không thể chuyển cho chính mình");
        // }

        const fromUser = await this.getUser(fromUserId, guildId);

        if (fromUser.balance < amount) {
            throw new Error("Số dư không đủ");
        }

        // Trừ tiền người gửi
        await this.subtractMoney(
            fromUserId,
            guildId,
            amount,
            `Transfer to ${toUserId}: ${description}`,
        );

        // Cộng tiền người nhận
        await this.addMoney(
            toUserId,
            guildId,
            amount,
            `Transfer from ${fromUserId}: ${description}`,
        );

        return {
            fromUser: await this.getUser(fromUserId, guildId),
            toUser: await this.getUser(toUserId, guildId),
        };
    }

    /**
     * Kiểm tra có thể claim daily không
     */
    async canClaimDaily(userId: string, guildId: string): Promise<boolean> {
        const claimKey = `${userId}_${guildId}`;
        const lastClaimDate = this.data.dailyClaims[claimKey];

        if (!lastClaimDate) return true;

        const now = new Date();
        const lastClaim = new Date(lastClaimDate);
        const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

        return diffHours >= this.data.settings.dailyCooldownHours;
    }

    /**
     * Lấy thời gian còn lại để claim daily
     */
    async getDailyCooldown(
        userId: string,
        guildId: string,
    ): Promise<{ canClaim: boolean; remainingHours: number; remainingMinutes: number }> {
        const claimKey = `${userId}_${guildId}`;
        const lastClaimDate = this.data.dailyClaims[claimKey];

        if (!lastClaimDate) {
            return { canClaim: true, remainingHours: 0, remainingMinutes: 0 };
        }

        const now = new Date();
        const lastClaim = new Date(lastClaimDate);
        const diffMs =
            lastClaim.getTime() +
            this.data.settings.dailyCooldownHours * 60 * 60 * 1000 -
            now.getTime();

        if (diffMs <= 0) {
            return { canClaim: true, remainingHours: 0, remainingMinutes: 0 };
        }

        const remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return { canClaim: false, remainingHours, remainingMinutes };
    }

    /**
     * Claim daily reward
     */
    async claimDaily(userId: string, guildId: string): Promise<UserData> {
        const canClaim = await this.canClaimDaily(userId, guildId);

        if (!canClaim) {
            throw new Error("Bạn đã nhận daily hôm nay rồi, hãy quay lại sau!");
        }

        const user = await this.getUser(userId, guildId);

        const baseAmount = 100;
        const streakBonus = user.dailyStreak > 1 ? Math.floor((user.dailyStreak - 1) * 0.5) : 0;
        const totalAmount = baseAmount + streakBonus;

        const userIndex = this.data.users.findIndex(
            u => u.userId === userId && u.guildId === guildId,
        );

        this.data.users[userIndex].balance += totalAmount;
        this.data.users[userIndex].dailyStreak += 1;
        this.data.users[userIndex].updatedAt = new Date().toISOString();

        const claimKey = `${userId}_${guildId}`;
        this.data.dailyClaims[claimKey] = new Date().toISOString();

        // ĐÃ LOẠI BỎ GHI LỊCH SỬ GIAO DỊCH
        this.saveData(this.data);

        return this.data.users[userIndex];
    }

    /**
     * Ghi lịch sử game
     */
    async recordGame(
        userId: string,
        guildId: string,
        gameType: string,
        betAmount: number,
        winAmount: number,
        result: "win" | "lose" | "draw",
    ): Promise<TransactionHistory> {
        // ĐÃ LOẠI BỎ GHI LỊCH SỬ GAME
        return {
            id: this.generateId(),
            userId,
            guildId,
            type: "game",
            amount: winAmount,
            description: `${gameType} game - bet: ${betAmount}, result: ${result}`,
            createdAt: new Date().toISOString(),
        };
    }

    /**
     * Lấy lịch sử giao dịch của người dùng
     */
    async getUserTransactions(
        userId: string,
        guildId: string,
        limit: number = 10,
    ): Promise<TransactionHistory[]> {
        return this.data.transactions
            .filter(transaction => transaction.userId === userId && transaction.guildId === guildId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }

    /**
     * Lấy top người dùng giàu nhất
     */
    async getTopUsers(guildId: string, limit: number = 10): Promise<UserData[]> {
        return this.data.users
            .filter(user => user.guildId === guildId)
            .sort((a, b) => b.balance - a.balance)
            .slice(0, limit);
    }

    /**
     * Lấy tất cả người dùng trong guild
     */
    async getAllUsers(guildId: string): Promise<UserData[]> {
        return this.data.users.filter(user => user.guildId === guildId);
    }

    /**
     * Xóa người dùng (Admin only)
     */
    async deleteUser(userId: string, guildId: string): Promise<boolean> {
        const userIndex = this.data.users.findIndex(
            user => user.userId === userId && user.guildId === guildId,
        );

        if (userIndex === -1) {
            return false;
        }

        this.data.users.splice(userIndex, 1);

        // Xóa tất cả giao dịch của người dùng
        this.data.transactions = this.data.transactions.filter(
            transaction => !(transaction.userId === userId && transaction.guildId === guildId),
        );

        this.saveData(this.data);
        return true;
    }

    /**
     * Reset balance của người dùng (Admin only)
     */
    async resetBalance(userId: string, guildId: string): Promise<UserData> {
        const user = await this.getUser(userId, guildId);

        const userIndex = this.data.users.findIndex(
            u => u.userId === userId && u.guildId === guildId,
        );

        this.data.users[userIndex].balance = 0;
        this.data.users[userIndex].updatedAt = new Date().toISOString();
        this.saveData(this.data);

        return this.data.users[userIndex];
    }

    /**
     * Backup database
     */
    async backup(): Promise<string> {
        const backupPath = path.join(process.cwd(), "data", `backup_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(this.data, null, 2));
        return backupPath;
    }

    /**
     * Restore database từ backup
     */
    async restore(backupPath: string): Promise<boolean> {
        try {
            const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
            this.data = backupData;
            this.saveData(this.data);
            return true;
        } catch (error) {
            console.error("Error restoring backup:", error);
            return false;
        }
    }
}

// Export singleton instance
export const ecommerceManager = EcommerceManager.getInstance();

// Export các function tiện ích
export const getBalance = (userId: string, guildId: string) =>
    ecommerceManager.getBalance(userId, guildId);
export const addMoney = (userId: string, guildId: string, amount: number, description?: string) =>
    ecommerceManager.addMoney(userId, guildId, amount, description);
export const subtractMoney = (
    userId: string,
    guildId: string,
    amount: number,
    description?: string,
) => ecommerceManager.subtractMoney(userId, guildId, amount, description);
export const transferMoney = (
    fromUserId: string,
    toUserId: string,
    guildId: string,
    amount: number,
    description?: string,
) => ecommerceManager.transferMoney(fromUserId, toUserId, guildId, amount, description);
export const claimDaily = (userId: string, guildId: string) =>
    ecommerceManager.claimDaily(userId, guildId);
export const canClaimDaily = (userId: string, guildId: string) =>
    ecommerceManager.canClaimDaily(userId, guildId);

export const getDailyCooldown = (userId: string, guildId: string) =>
    ecommerceManager.getDailyCooldown(userId, guildId);
export const getUser = (userId: string, guildId: string) =>
    ecommerceManager.getUser(userId, guildId);
export const getTopUsers = (guildId: string, limit?: number) =>
    ecommerceManager.getTopUsers(guildId, limit);
export const getUserTransactions = (userId: string, guildId: string, limit?: number) =>
    ecommerceManager.getUserTransactions(userId, guildId, limit);
export const recordGame = (
    userId: string,
    guildId: string,
    gameType: string,
    betAmount: number,
    winAmount: number,
    result: "win" | "lose" | "draw",
) => ecommerceManager.recordGame(userId, guildId, gameType, betAmount, winAmount, result);

// Export types
export type { EcommerceDatabase, TransactionHistory, UserData };
