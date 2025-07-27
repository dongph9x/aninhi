import { PrismaClient } from "@prisma/client";
import { fishCoinDB } from "./fish-coin";

const prisma = new PrismaClient();

export interface Fish {
    name: string;
    emoji: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    minValue: number;
    maxValue: number;
    chance: number;
}

export interface FishingRod {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    durability: number;
    description: string;
}

export interface Bait {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    description: string;
}

export interface CaughtFish {
    name: string;
    emoji: string;
    rarity: string;
    value: number;
    quantity: number;
}

// Danh sách cá
export const FISH_LIST: Fish[] = [
    // Cá thường (60-70%)
    { name: "Cá rô phi", emoji: "🐟", rarity: "common", minValue: 10, maxValue: 50, chance: 25 },
    { name: "Cá chép", emoji: "🐟", rarity: "common", minValue: 20, maxValue: 80, chance: 20 },
    { name: "Cá trắm", emoji: "🐟", rarity: "common", minValue: 30, maxValue: 100, chance: 15 },
    { name: "Cá mè", emoji: "🐟", rarity: "common", minValue: 15, maxValue: 60, chance: 10 },

    // Cá hiếm (20-25%)
    { name: "Cá lóc", emoji: "🐡", rarity: "rare", minValue: 100, maxValue: 300, chance: 8 },
    { name: "Cá trê", emoji: "🐠", rarity: "rare", minValue: 150, maxValue: 400, chance: 7 },
    { name: "Cá quả", emoji: "🐠", rarity: "rare", minValue: 200, maxValue: 500, chance: 6 },
    { name: "Cá chình", emoji: "🐠", rarity: "rare", minValue: 300, maxValue: 800, chance: 4 },

    // Cá quý hiếm (8-12%)
    { name: "Cá tầm", emoji: "🦈", rarity: "epic", minValue: 500, maxValue: 1500, chance: 3 },
    { name: "Cá hồi", emoji: "🦈", rarity: "epic", minValue: 800, maxValue: 2000, chance: 2.5 },
    { name: "Cá ngừ", emoji: "🐋", rarity: "epic", minValue: 1000, maxValue: 3000, chance: 2 },
    { name: "Cá mập", emoji: "🦈", rarity: "epic", minValue: 2000, maxValue: 5000, chance: 1.5 },

    // Cá huyền thoại (1-3%)
    { name: "Cá voi", emoji: "🐳", rarity: "legendary", minValue: 5000, maxValue: 15000, chance: 0.8 },
    { name: "Cá mực khổng lồ", emoji: "🦑", rarity: "legendary", minValue: 8000, maxValue: 20000, chance: 0.6 },
    { name: "Cá rồng biển", emoji: "🐉", rarity: "legendary", minValue: 15000, maxValue: 50000, chance: 0.4 },
    { name: "Cá thần", emoji: "🧜", rarity: "legendary", minValue: 50000, maxValue: 100000, chance: 0.2 },
    { name: "Vua biển", emoji: "🔱", rarity: "legendary", minValue: 100000, maxValue: 150000, chance: 0.1 },
];

// Danh sách cần câu
export const FISHING_RODS: Record<string, FishingRod> = {
    "basic": { name: "Cần câu cơ bản", emoji: "🎣", price: 100, rarityBonus: 0, durability: 10, description: "Cần câu cơ bản, độ bền thấp" },
    "copper": { name: "Cần câu đồng", emoji: "🎣", price: 1000, rarityBonus: 1, durability: 25, description: "Tăng 1% tỷ lệ hiếm, độ bền trung bình" },
    "silver": { name: "Cần câu bạc", emoji: "🎣", price: 5000, rarityBonus: 2, durability: 50, description: "Tăng 2% tỷ lệ hiếm, độ bền cao" },
    "gold": { name: "Cần câu vàng", emoji: "🎣", price: 15000, rarityBonus: 3.5, durability: 100, description: "Tăng 3.5% tỷ lệ hiếm, độ bền rất cao" },
    "diamond": { name: "Cần câu kim cương", emoji: "💎", price: 50000, rarityBonus: 5, durability: 200, description: "Tăng 5% tỷ lệ hiếm, độ bền tối đa" },
};

// Danh sách mồi
export const BAITS: Record<string, Bait> = {
    "basic": { name: "Mồi cơ bản", emoji: "🪱", price: 10, rarityBonus: 0, description: "Mồi cơ bản, tỷ lệ thường" },
    "good": { name: "Mồi ngon", emoji: "🦐", price: 50, rarityBonus: 1.5, description: "Tăng 1.5% tỷ lệ hiếm" },
    "premium": { name: "Mồi thượng hạng", emoji: "🦀", price: 200, rarityBonus: 3, description: "Tăng 3% tỷ lệ hiếm" },
    "divine": { name: "Mồi thần", emoji: "🧜‍♀️", price: 1000, rarityBonus: 5, description: "Tăng 5% tỷ lệ hiếm" },
};

// Cooldown cho câu cá (30 giây)
const FISHING_COOLDOWN = 30000;

// Chi phí mỗi lần câu
const FISHING_COST = 10;

// Thời gian cập nhật giá cá (10 phút)
const PRICE_UPDATE_INTERVAL = 10 * 60 * 1000;

export class FishPriceService {
    /**
     * Khởi tạo giá cá ban đầu
     */
    static async initializeFishPrices() {
        try {
            for (const fish of FISH_LIST) {
                // Bỏ qua cá huyền thoại - chỉ dành cho fishbarn
                if (fish.rarity === 'legendary') {
                    continue;
                }
                
                const basePrice = Math.floor((fish.minValue + fish.maxValue) / 2);
                
                await prisma.fishPrice.upsert({
                    where: { fishName: fish.name },
                    update: {},
                    create: {
                        fishName: fish.name,
                        basePrice,
                        currentPrice: basePrice,
                        priceChange: 0,
                        changePercent: 0,
                        priceHistory: JSON.stringify([{
                            price: basePrice,
                            timestamp: new Date().toISOString()
                        }])
                    }
                });
            }
            console.log("✅ Đã khởi tạo giá cá ban đầu (không bao gồm cá huyền thoại)");
        } catch (error) {
            console.error("❌ Lỗi khởi tạo giá cá:", error);
        }
    }

    /**
     * Cập nhật giá cá với biến động ±10%
     */
    static async updateFishPrices() {
        try {
            const fishPrices = await prisma.fishPrice.findMany();
            
            for (const fishPrice of fishPrices) {
                // Kiểm tra xem có phải cá huyền thoại không (để đảm bảo an toàn)
                const fish = FISH_LIST.find(f => f.name === fishPrice.fishName);
                if (fish && fish.rarity === 'legendary') {
                    continue; // Bỏ qua cá huyền thoại
                }
                
                // Tạo biến động ngẫu nhiên ±10%
                const fluctuation = (Math.random() - 0.5) * 0.2; // -10% đến +10%
                const basePrice = Number(fishPrice.basePrice);
                const newPrice = Math.max(1, Math.floor(basePrice * (1 + fluctuation)));
                const priceChange = newPrice - basePrice;
                const changePercent = (fluctuation * 100);

                // Cập nhật lịch sử giá
                const priceHistory = JSON.parse(fishPrice.priceHistory || '[]');
                priceHistory.push({
                    price: newPrice,
                    timestamp: new Date().toISOString()
                });

                // Giữ chỉ 24 điểm dữ liệu gần nhất (4 giờ với 10 phút/lần)
                if (priceHistory.length > 24) {
                    priceHistory.splice(0, priceHistory.length - 24);
                }

                await prisma.fishPrice.update({
                    where: { id: fishPrice.id },
                    data: {
                        currentPrice: newPrice,
                        priceChange,
                        changePercent,
                        lastUpdated: new Date(),
                        priceHistory: JSON.stringify(priceHistory)
                    }
                });
            }
            console.log(`✅ Đã cập nhật giá cá lúc ${new Date().toLocaleString()} (không bao gồm cá huyền thoại)`);
        } catch (error) {
            console.error("❌ Lỗi cập nhật giá cá:", error);
        }
    }

    /**
     * Lấy giá hiện tại của cá
     */
    static async getCurrentPrice(fishName: string): Promise<number> {
        try {
            // Kiểm tra xem có phải cá huyền thoại không
            const fish = FISH_LIST.find(f => f.name === fishName);
            if (fish && fish.rarity === 'legendary') {
                // Cá huyền thoại không có trong hệ thống giá biến động
                return 0;
            }

            const fishPrice = await prisma.fishPrice.findUnique({
                where: { fishName }
            });

            if (!fishPrice) {
                // Nếu chưa có giá, tạo giá mặc định (chỉ cho cá không phải huyền thoại)
                if (fish && fish.rarity !== 'legendary') {
                    const basePrice = Math.floor((fish.minValue + fish.maxValue) / 2);
                    await this.initializeFishPrices();
                    return basePrice;
                }
                return 0;
            }

            return Number(fishPrice.currentPrice);
        } catch (error) {
            console.error("❌ Lỗi lấy giá cá:", error);
            return 0;
        }
    }

    /**
     * Lấy thông tin giá chi tiết của cá
     */
    static async getFishPriceInfo(fishName: string) {
        try {
            // Kiểm tra xem có phải cá huyền thoại không
            const fish = FISH_LIST.find(f => f.name === fishName);
            if (fish && fish.rarity === 'legendary') {
                // Cá huyền thoại không có trong hệ thống giá biến động
                return null;
            }

            const fishPrice = await prisma.fishPrice.findUnique({
                where: { fishName }
            });

            if (!fishPrice) {
                return null;
            }

            return {
                fishName: fishPrice.fishName,
                basePrice: fishPrice.basePrice,
                currentPrice: fishPrice.currentPrice,
                priceChange: fishPrice.priceChange,
                changePercent: fishPrice.changePercent,
                lastUpdated: fishPrice.lastUpdated,
                priceHistory: JSON.parse(fishPrice.priceHistory || '[]')
            };
        } catch (error) {
            console.error("❌ Lỗi lấy thông tin giá cá:", error);
            return null;
        }
    }

    /**
     * Lấy tất cả giá cá hiện tại
     */
    static async getAllFishPrices() {
        try {
            const fishPrices = await prisma.fishPrice.findMany({
                orderBy: { fishName: 'asc' }
            });

            // Lọc bỏ cá huyền thoại (để đảm bảo an toàn)
            const filteredPrices = fishPrices.filter(fp => {
                const fish = FISH_LIST.find(f => f.name === fp.fishName);
                return !fish || fish.rarity !== 'legendary';
            });

            return filteredPrices.map(fp => ({
                fishName: fp.fishName,
                basePrice: fp.basePrice,
                currentPrice: fp.currentPrice,
                priceChange: fp.priceChange,
                changePercent: fp.changePercent,
                lastUpdated: fp.lastUpdated
            }));
        } catch (error) {
            console.error("❌ Lỗi lấy tất cả giá cá:", error);
            return [];
        }
    }

    /**
     * Bắt đầu hệ thống cập nhật giá tự động
     */
    static startPriceUpdateScheduler() {
        // Cập nhật giá ngay lập tức
        this.updateFishPrices();
        
        // Cập nhật giá mỗi 10 phút
        setInterval(() => {
            this.updateFishPrices();
        }, PRICE_UPDATE_INTERVAL);

        console.log("🔄 Đã khởi động hệ thống cập nhật giá cá tự động (10 phút/lần)");
    }
}

export class FishingService {
    /**
     * Lấy hoặc tạo fishing data cho người dùng
     */
    static async getFishingData(userId: string, guildId: string) {
        try {
            // Đảm bảo User tồn tại trước khi tạo FishingData
            const fishingData = await prisma.$transaction(async (tx: any) => {
                // Tạo hoặc lấy User trước
                await tx.user.upsert({
                    where: {
                        userId_guildId: {
                            userId,
                            guildId
                        }
                    },
                    update: {},
                    create: {
                        userId,
                        guildId,
                        balance: 0,
                        dailyStreak: 0
                    }
                });

                // Sau đó tạo hoặc lấy FishingData
                return await tx.fishingData.upsert({
                    where: {
                        userId_guildId: {
                            userId,
                            guildId
                        }
                    },
                    update: {},
                    create: {
                        userId,
                        guildId,
                        totalFish: 0,
                        totalEarnings: 0,
                        biggestFish: "",
                        biggestValue: 0,
                        rarestFish: "",
                        rarestRarity: "",
                        fishingTime: 0,
                        currentRod: "", // Không có cần câu mặc định
                        currentBait: "", // Không có mồi mặc định
                        lastFished: new Date(0) // Cho phép câu ngay lập tức
                    },
                    include: {
                        rods: true,
                        baits: true,
                        fish: true
                    }
                });
            });

            return fishingData;
        } catch (error) {
            console.error("Error getting fishing data:", error);
            throw error;
        }
    }

    /**
     * Kiểm tra có thể câu cá không
     * Admin bypass tất cả yêu cầu về cần câu, mồi và cooldown
     */
    static async canFish(userId: string, guildId: string, isAdmin: boolean = false): Promise<{ canFish: boolean; remainingTime: number; message?: string }> {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const now = new Date();
            const timeSinceLastFish = now.getTime() - fishingData.lastFished.getTime();

            // Kiểm tra cooldown (Admin bypass cooldown)
            if (!isAdmin && timeSinceLastFish < FISHING_COOLDOWN) {
                return {
                    canFish: false,
                    remainingTime: FISHING_COOLDOWN - timeSinceLastFish,
                    message: `Bạn cần đợi ${Math.ceil((FISHING_COOLDOWN - timeSinceLastFish) / 1000)} giây nữa để câu cá!`
                };
            }

            // Admin bypass tất cả yêu cầu về cần câu và mồi
            if (!isAdmin) {
                // Kiểm tra có cần câu không - tự động trang bị cần tốt nhất nếu chưa có
                if (!fishingData.currentRod || fishingData.currentRod === "") {
                    // Tự động trang bị cần tốt nhất còn độ bền
                    const availableRods = fishingData.rods.filter((r: { rodType: string; durability: number; id: string }) => r.durability > 0);
                    if (availableRods.length > 0) {
                        // Ưu tiên theo thứ tự: diamond > gold > silver > copper > basic
                        const rodPriority = ['diamond', 'gold', 'silver', 'copper', 'basic'];
                        let bestRod = availableRods[0];
                        for (const priorityRod of rodPriority) {
                            const foundRod = availableRods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === priorityRod);
                            if (foundRod) {
                                bestRod = foundRod;
                                break;
                            }
                        }
                        // Tự động trang bị cần tốt nhất
                        await prisma.fishingData.update({
                            where: { id: fishingData.id },
                            data: { currentRod: bestRod.rodType }
                        });
                        fishingData.currentRod = bestRod.rodType;
                    } else {
                        return {
                            canFish: false,
                            remainingTime: 0,
                            message: "Bạn cần mua cần câu trước khi câu cá! Dùng `n.fishing shop` để xem cửa hàng."
                        };
                    }
                }

                // Kiểm tra có mồi không - tự động trang bị mồi tốt nhất nếu chưa có
                if (!fishingData.currentBait || fishingData.currentBait === "") {
                    // Tự động trang bị mồi tốt nhất có sẵn
                    const availableBaits = fishingData.baits.filter((b: { baitType: string; quantity: number; id: string }) => b.quantity > 0);
                    
                    if (availableBaits.length > 0) {
                        // Ưu tiên theo thứ tự: divine > premium > good > basic
                        const baitPriority = ['divine', 'premium', 'good', 'basic'];
                        let bestBait = availableBaits[0];

                        for (const priorityBait of baitPriority) {
                            const foundBait = availableBaits.find((b: { baitType: string; quantity: number; id: string }) => b.baitType === priorityBait);
                            if (foundBait) {
                                bestBait = foundBait;
                                break;
                            }
                        }

                        // Tự động trang bị mồi tốt nhất
                        await prisma.fishingData.update({
                            where: { id: fishingData.id },
                            data: { currentBait: bestBait.baitType }
                        });

                        // Cập nhật fishingData để sử dụng trong các bước tiếp theo
                        fishingData.currentBait = bestBait.baitType;
                    } else {
                        return {
                            canFish: false,
                            remainingTime: 0,
                            message: "Bạn cần mua mồi trước khi câu cá! Dùng `n.fishing shop` để xem cửa hàng."
                        };
                    }
                }

                // Kiểm tra cần câu có độ bền không - tự động chuyển sang cần khác nếu hết độ bền
                const currentRod = fishingData.rods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === fishingData.currentRod);
                if (!currentRod || currentRod.durability <= 0) {
                    // Tự động chuyển sang cần khác còn độ bền
                    const availableRods = fishingData.rods.filter((r: { rodType: string; durability: number; id: string }) => r.rodType !== fishingData.currentRod && r.durability > 0);
                    if (availableRods.length > 0) {
                        // Ưu tiên theo thứ tự: diamond > gold > silver > copper > basic
                        const rodPriority = ['diamond', 'gold', 'silver', 'copper', 'basic'];
                        let nextRod = availableRods[0];
                        for (const priorityRod of rodPriority) {
                            const foundRod = availableRods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === priorityRod);
                            if (foundRod) {
                                nextRod = foundRod;
                                break;
                            }
                        }
                        // Tự động chuyển sang cần khác
                        await prisma.fishingData.update({
                            where: { id: fishingData.id },
                            data: { currentRod: nextRod.rodType }
                        });
                        fishingData.currentRod = nextRod.rodType;
                        // Bypass cooldown khi auto-switch rod
                        return { canFish: true, remainingTime: 0 };
                    } else {
                        return {
                            canFish: false,
                            remainingTime: 0,
                            message: "Cần câu của bạn đã hết độ bền! Hãy mua cần câu mới."
                        };
                    }
                }

                // Kiểm tra có mồi không - tự động chuyển sang mồi khác nếu mồi hiện tại hết
                const currentBait = fishingData.baits.find((b: { baitType: string; quantity: number; id: string }) => b.baitType === fishingData.currentBait);
                if (!currentBait || currentBait.quantity <= 0) {
                    // Tự động chuyển sang mồi khác có sẵn
                    const availableBaits = fishingData.baits.filter((b: { baitType: string; quantity: number; id: string }) => 
                        b.baitType !== fishingData.currentBait && b.quantity > 0
                    );
                    
                    if (availableBaits.length > 0) {
                        // Ưu tiên theo thứ tự: divine > premium > good > basic
                        const baitPriority = ['divine', 'premium', 'good', 'basic'];
                        let nextBait = availableBaits[0];

                        for (const priorityBait of baitPriority) {
                            const foundBait = availableBaits.find((b: { baitType: string; quantity: number; id: string }) => b.baitType === priorityBait);
                            if (foundBait) {
                                nextBait = foundBait;
                                break;
                            }
                        }

                        // Tự động chuyển sang mồi khác
                        await prisma.fishingData.update({
                            where: { id: fishingData.id },
                            data: { currentBait: nextBait.baitType }
                        });

                        // Cập nhật fishingData để sử dụng trong các bước tiếp theo
                        fishingData.currentBait = nextBait.baitType;
                        
                        // Bypass cooldown khi auto-switch bait để người chơi có thể câu ngay
                        return { canFish: true, remainingTime: 0 };
                    } else {
                        return {
                            canFish: false,
                            remainingTime: 0,
                            message: "Bạn đã hết mồi! Hãy mua thêm mồi."
                        };
                    }
                }
            }

            return { canFish: true, remainingTime: 0 };
        } catch (error) {
            console.error("Error checking fishing cooldown:", error);
            return { 
                canFish: false, 
                remainingTime: FISHING_COOLDOWN,
                message: "Đã xảy ra lỗi khi kiểm tra điều kiện câu cá!"
            };
        }
    }

    /**
     * Câu cá
     */
    static async fish(userId: string, guildId: string, isAdmin: boolean = false) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            
            // Kiểm tra điều kiện câu cá (Admin bypass tất cả yêu cầu)
            const cooldownCheck = await this.canFish(userId, guildId, isAdmin);
            if (!cooldownCheck.canFish) {
                throw new Error(cooldownCheck.message || `Bạn cần đợi ${Math.ceil(cooldownCheck.remainingTime / 1000)} giây nữa để câu cá!`);
            }

            // Kiểm tra số dư FishCoin
            const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, FISHING_COST);
            if (!hasEnoughFishCoin) {
                throw new Error(`Bạn cần ít nhất ${FISHING_COST} FishCoin để câu cá!`);
            }

            // Trừ FishCoin câu cá
            await fishCoinDB.subtractFishCoin(userId, guildId, FISHING_COST, 'Fishing cost');

            // Chọn cá ngẫu nhiên (Admin luôn câu được cá huyền thoại)
            const fish = isAdmin ? this.getAdminFish() : this.getRandomFish(fishingData);
            const fishValue = Math.floor(Math.random() * (fish.maxValue - fish.minValue + 1)) + fish.minValue;

            // Cập nhật fishing data
            const updatedFishingData = await prisma.fishingData.update({
                where: { id: fishingData.id },
                data: {
                    totalFish: { increment: 1 },
                    totalEarnings: { increment: fishValue },
                    fishingTime: { increment: 1 },
                    lastFished: new Date()
                },
                include: {
                    rods: true,
                    baits: true,
                    fish: true
                }
            });

            // Cập nhật biggest fish nếu cần
            if (fishValue > fishingData.biggestValue) {
                await prisma.fishingData.update({
                    where: { id: fishingData.id },
                    data: {
                        biggestFish: fish.name,
                        biggestValue: fishValue
                    }
                });
            }

            // Cập nhật rarest fish nếu cần
            if (this.getRarityValue(fish.rarity) > this.getRarityValue(fishingData.rarestRarity)) {
                await prisma.fishingData.update({
                    where: { id: fishingData.id },
                    data: {
                        rarestFish: fish.name,
                        rarestRarity: fish.rarity
                    }
                });
            }

            // Thêm cá vào inventory
            await prisma.caughtFish.upsert({
                where: {
                    fishingDataId_fishName: {
                        fishingDataId: fishingData.id,
                        fishName: fish.name
                    }
                },
                update: {
                    quantity: { increment: 1 },
                    fishValue: fishValue // Cập nhật giá trị mới nhất
                },
                create: {
                    fishingDataId: fishingData.id,
                    fishName: fish.name,
                    fishRarity: fish.rarity,
                    fishValue: fishValue,
                    quantity: 1
                }
            });

            // Giảm độ bền cần câu (Admin không bị giảm)
            if (!isAdmin) {
                const currentRod = fishingData.rods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === fishingData.currentRod);
                if (currentRod && currentRod.durability > 0) {
                    await prisma.fishingRod.update({
                        where: { id: currentRod.id },
                        data: { durability: { decrement: 1 } }
                    });

                    // Nếu cần câu hết độ bền, xóa cần câu hiện tại
                    if (currentRod.durability <= 1) {
                        await prisma.fishingData.update({
                            where: { id: fishingData.id },
                            data: { currentRod: "" }
                        });
                    }
                }

                // Giảm số lượng mồi (Admin không bị giảm)
                const currentBait = fishingData.baits.find((b: { baitType: string; quantity: number; id: string }) => b.baitType === fishingData.currentBait);
                if (currentBait && currentBait.quantity > 0) {
                    await prisma.fishingBait.update({
                        where: { id: currentBait.id },
                        data: { quantity: { decrement: 1 } }
                    });

                    // Nếu hết mồi, tự động chuyển sang mồi khác
                    if (currentBait.quantity <= 0) {
                        await this.autoSwitchBait(userId, guildId, fishingData.currentBait);
                    }
                }
            }

            return {
                fish,
                value: fishValue
            };
        } catch (error) {
            console.error("Error fishing:", error);
            throw error;
        }
    }

    /**
     * Mua cần câu
     */
    static async buyRod(userId: string, guildId: string, rodType: string) {
        try {
            const rod = FISHING_RODS[rodType];
            if (!rod) {
                throw new Error("Loại cần câu không hợp lệ!");
            }

            // Kiểm tra đủ FishCoin
            const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, rod.price);
            if (!hasEnoughFishCoin) {
                throw new Error(`Không đủ FishCoin! Cần ${rod.price} FishCoin`);
            }

            const fishingData = await this.getFishingData(userId, guildId);

            // Kiểm tra đã có cần câu này chưa
            const existingRod = fishingData.rods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === rodType);
            
            // Trừ FishCoin trước
            await fishCoinDB.subtractFishCoin(userId, guildId, rod.price, `Buy fishing rod: ${rod.name}`);

            // Thêm/cộng dồn cần câu
            if (existingRod) {
                // Nếu đã có cần câu này, cộng dồn độ bền
                await prisma.fishingRod.update({
                    where: { id: existingRod.id },
                    data: { durability: { increment: rod.durability } }
                });
            } else {
                // Nếu chưa có, tạo cần câu mới
                await prisma.fishingRod.create({
                    data: {
                        fishingDataId: fishingData.id,
                        rodType,
                        durability: rod.durability
                    }
                });

                // Tự động set làm cần câu hiện tại nếu chưa có cần câu nào
                if (!fishingData.currentRod || fishingData.currentRod === "") {
                    await prisma.fishingData.update({
                        where: { id: fishingData.id },
                        data: { currentRod: rodType }
                    });
                }
            }

            return rod;
        } catch (error) {
            console.error("Error buying rod:", error);
            throw error;
        }
    }

    /**
     * Mua mồi
     */
    static async buyBait(userId: string, guildId: string, baitType: string, quantity: number = 1) {
        try {
            const bait = BAITS[baitType];
            if (!bait) {
                throw new Error("Loại mồi không hợp lệ!");
            }

            const totalCost = bait.price * quantity;
            
            // Kiểm tra đủ FishCoin
            const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, totalCost);
            if (!hasEnoughFishCoin) {
                throw new Error(`Không đủ FishCoin! Cần ${totalCost} FishCoin`);
            }

            const fishingData = await this.getFishingData(userId, guildId);

            // Trừ FishCoin trước
            await fishCoinDB.subtractFishCoin(userId, guildId, totalCost, `Buy fishing bait: ${bait.name} x${quantity}`);

            // Thêm mồi
            await prisma.fishingBait.upsert({
                where: {
                    fishingDataId_baitType: {
                        fishingDataId: fishingData.id,
                        baitType
                    }
                },
                update: {
                    quantity: { increment: quantity }
                },
                create: {
                    fishingDataId: fishingData.id,
                    baitType,
                    quantity
                }
            });

            // Tự động set làm mồi hiện tại nếu chưa có mồi nào
            if (!fishingData.currentBait || fishingData.currentBait === "") {
                await prisma.fishingData.update({
                    where: { id: fishingData.id },
                    data: { currentBait: baitType }
                });
            }

            return { bait, quantity, totalCost };
        } catch (error) {
            console.error("Error buying bait:", error);
            throw error;
        }
    }

    /**
     * Set cần câu hiện tại
     */
    static async setCurrentRod(userId: string, guildId: string, rodType: string) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const rod = fishingData.rods.find((r: { rodType: string; durability: number; id: string }) => r.rodType === rodType);

            if (!rod) {
                throw new Error("Bạn không có cần câu này! Hãy mua trước.");
            }

            if (rod.durability <= 0) {
                throw new Error("Cần câu này đã hết độ bền!");
            }

            await prisma.fishingData.update({
                where: { id: fishingData.id },
                data: { currentRod: rodType }
            });

            return rod;
        } catch (error) {
            console.error("Error setting current rod:", error);
            throw error;
        }
    }

    /**
     * Tự động chuyển sang mồi khác khi mồi hiện tại hết
     */
    static async autoSwitchBait(userId: string, guildId: string, currentBaitType: string) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            
            // Tìm mồi khác có sẵn (không phải mồi hiện tại và có số lượng > 0)
            const availableBaits = fishingData.baits.filter((b: { baitType: string; quantity: number; id: string }) => 
                b.baitType !== currentBaitType && b.quantity > 0
            );

            if (availableBaits.length > 0) {
                // Ưu tiên mồi theo thứ tự: divine > premium > good > basic
                const baitPriority = ['divine', 'premium', 'good', 'basic'];
                let nextBait = availableBaits[0]; // Mặc định là mồi đầu tiên

                // Tìm mồi có độ ưu tiên cao nhất
                for (const priorityBait of baitPriority) {
                    const foundBait = availableBaits.find((b: { baitType: string; quantity: number; id: string }) => 
                        b.baitType === priorityBait
                    );
                    if (foundBait) {
                        nextBait = foundBait;
                        break;
                    }
                }

                // Cập nhật mồi hiện tại
                await prisma.fishingData.update({
                    where: { id: fishingData.id },
                    data: { currentBait: nextBait.baitType }
                });

                return {
                    success: true,
                    switchedTo: nextBait.baitType,
                    baitName: BAITS[nextBait.baitType]?.name || nextBait.baitType,
                    remainingQuantity: nextBait.quantity
                };
            } else {
                // Không có mồi nào khác, xóa mồi hiện tại
                await prisma.fishingData.update({
                    where: { id: fishingData.id },
                    data: { currentBait: "" }
                });

                return {
                    success: false,
                    message: "Không có mồi nào khác để chuyển sang!"
                };
            }
        } catch (error) {
            console.error("Error auto switching bait:", error);
            throw error;
        }
    }

    /**
     * Set mồi hiện tại
     */
    static async setCurrentBait(userId: string, guildId: string, baitType: string) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const bait = fishingData.baits.find((b: { baitType: string; quantity: number; id: string }) => b.baitType === baitType);

            if (!bait) {
                throw new Error("Bạn không có mồi này! Hãy mua trước.");
            }

            if (bait.quantity <= 0) {
                throw new Error("Bạn đã hết mồi này!");
            }

            await prisma.fishingData.update({
                where: { id: fishingData.id },
                data: { currentBait: baitType }
            });

            return bait;
        } catch (error) {
            console.error("Error setting current bait:", error);
            throw error;
        }
    }

    /**
     * Bán cá
     */
    static async sellFish(userId: string, guildId: string, fishName: string, quantity: number = 1) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const caughtFish = fishingData.fish.find((f: { fishName: string; quantity: number; id: string }) => f.fishName === fishName);

            if (!caughtFish) {
                throw new Error("Bạn không có cá này!");
            }

            if (caughtFish.quantity < quantity) {
                throw new Error(`Bạn chỉ có ${caughtFish.quantity} con ${fishName}!`);
            }

            // Lấy giá hiện tại của cá
            const currentPrice = await FishPriceService.getCurrentPrice(fishName);
            const totalValue = currentPrice * quantity;

            // Cộng FishCoin và trừ cá
            await fishCoinDB.addFishCoin(userId, guildId, totalValue, `Sold fish: ${fishName} x${quantity}`);

            if (caughtFish.quantity === quantity) {
                await prisma.caughtFish.delete({
                    where: { id: caughtFish.id }
                });
            } else {
                await prisma.caughtFish.update({
                    where: { id: caughtFish.id },
                    data: { quantity: { decrement: quantity } }
                });
            }

            return { fishName, quantity, totalValue, currentPrice };
        } catch (error) {
            console.error("Error selling fish:", error);
            throw error;
        }
    }

    /**
     * Chọn cá huyền thoại cho Admin
     */
    private static getAdminFish(): Fish {
        const legendaryFish = FISH_LIST.filter(fish => fish.rarity === "legendary");
        const randomIndex = Math.floor(Math.random() * legendaryFish.length);
        return legendaryFish[randomIndex];
    }

    /**
     * Chọn cá ngẫu nhiên dựa trên cần câu và mồi
     */
    private static getRandomFish(fishingData: any): Fish {
        const rod = FISHING_RODS[fishingData.currentRod];
        const bait = BAITS[fishingData.currentBait];
        const totalBonus = rod.rarityBonus + bait.rarityBonus;

        // Kiểm tra xem có phải kim cương + mồi thần không
        const isDiamondDivine = fishingData.currentRod === "diamond" && fishingData.currentBait === "divine";

        // Tạo danh sách cá với tỷ lệ đã điều chỉnh
        const adjustedFish = FISH_LIST.map(fish => {
            let adjustedChance = fish.chance;
            if (fish.rarity === "legendary") {
                if (isDiamondDivine) {
                    // Giữ nguyên logic cũ cho kim cương + mồi thần
                    adjustedChance += totalBonus * 0.1;
                } else {
                    // Giảm mạnh hơn để đảm bảo < 1%
                    adjustedChance = fish.chance * 0.01 + totalBonus * 0.03; // giảm rất mạnh
                }
            } else if (fish.rarity === "rare") {
                adjustedChance += totalBonus * 0.5;
            } else if (fish.rarity === "epic") {
                adjustedChance += totalBonus * 0.3;
            }
            return { ...fish, adjustedChance };
        });

        // Chọn cá ngẫu nhiên dựa trên tỷ lệ
        const totalChance = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
        let random = Math.random() * totalChance;

        for (const fish of adjustedFish) {
            random -= fish.adjustedChance;
            if (random <= 0) {
                return fish;
            }
        }

        // Fallback về cá thường
        return FISH_LIST[0];
    }

    /**
     * Lấy giá trị rarity để so sánh
     */
    private static getRarityValue(rarity: string): number {
        switch (rarity) {
            case "common": return 1;
            case "rare": return 2;
            case "epic": return 3;
            case "legendary": return 4;
            default: return 0;
        }
    }

    /**
     * Lấy bảng xếp hạng câu cá
     */
    static async getFishingLeaderboard(guildId: string, limit: number = 10) {
        try {
            const leaderboard = await prisma.fishingData.findMany({
                where: { guildId },
                orderBy: [
                    { totalFish: 'desc' },        // Sắp xếp theo số lần câu (nhiều nhất trước)
                    { totalEarnings: 'desc' }     // Nếu số lần câu bằng nhau thì sắp xếp theo thu nhập
                ],
                take: limit,
                include: {
                    user: true
                }
            });

            return leaderboard.map((data: any) => ({
                userId: data.userId,
                totalFish: data.totalFish,
                totalEarnings: data.totalEarnings,
                biggestFish: data.biggestFish,
                biggestValue: data.biggestValue,
                rarestFish: data.rarestFish,
                rarestRarity: data.rarestRarity,
                fishingTime: data.fishingTime
            }));
        } catch (error) {
            console.error("Error getting fishing leaderboard:", error);
            return [];
        }
    }

    /**
     * Lấy thông tin người có số lần câu cá nhiều nhất (top 1)
     */
    static async getTopFisher(guildId: string) {
        try {
            const topFisher = await prisma.fishingData.findFirst({
                where: { guildId },
                orderBy: [
                    { totalFish: 'desc' },        // Sắp xếp theo số lần câu (nhiều nhất trước)
                    { totalEarnings: 'desc' }     // Nếu số lần câu bằng nhau thì sắp xếp theo thu nhập
                ],
                include: {
                    user: true
                }
            });

            if (!topFisher) {
                return null;
            }

            return {
                userId: topFisher.userId,
                totalFish: topFisher.totalFish,
                totalEarnings: topFisher.totalEarnings,
                biggestFish: topFisher.biggestFish,
                biggestValue: topFisher.biggestValue,
                rarestFish: topFisher.rarestFish,
                rarestRarity: topFisher.rarestRarity,
                fishingTime: topFisher.fishingTime
            };
        } catch (error) {
            console.error("Error getting top fisher:", error);
            return null;
        }
    }
} 