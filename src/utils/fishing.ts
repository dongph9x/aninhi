import { PrismaClient } from "@prisma/client";

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
    { name: "Cá lóc", emoji: "🐠", rarity: "rare", minValue: 100, maxValue: 300, chance: 8 },
    { name: "Cá trê", emoji: "🐠", rarity: "rare", minValue: 150, maxValue: 400, chance: 7 },
    { name: "Cá quả", emoji: "🐠", rarity: "rare", minValue: 200, maxValue: 500, chance: 6 },
    { name: "Cá chình", emoji: "🐠", rarity: "rare", minValue: 300, maxValue: 800, chance: 4 },

    // Cá quý hiếm (8-12%)
    { name: "Cá tầm", emoji: "🦈", rarity: "epic", minValue: 500, maxValue: 1500, chance: 3 },
    { name: "Cá hồi", emoji: "🦈", rarity: "epic", minValue: 800, maxValue: 2000, chance: 2.5 },
    { name: "Cá ngừ", emoji: "🦈", rarity: "epic", minValue: 1000, maxValue: 3000, chance: 2 },
    { name: "Cá mập", emoji: "🦈", rarity: "epic", minValue: 2000, maxValue: 5000, chance: 1.5 },

    // Cá huyền thoại (1-3%)
    { name: "Cá voi", emoji: "🐋", rarity: "legendary", minValue: 5000, maxValue: 15000, chance: 0.8 },
    { name: "Cá mực khổng lồ", emoji: "🦑", rarity: "legendary", minValue: 8000, maxValue: 20000, chance: 0.6 },
    { name: "Cá rồng biển", emoji: "🐉", rarity: "legendary", minValue: 15000, maxValue: 50000, chance: 0.4 },
    { name: "Cá thần", emoji: "✨", rarity: "legendary", minValue: 50000, maxValue: 100000, chance: 0.2 },
];

// Danh sách cần câu
export const FISHING_RODS: Record<string, FishingRod> = {
    "basic": { name: "Cần câu cơ bản", emoji: "🎣", price: 100, rarityBonus: 0, durability: 10, description: "Cần câu cơ bản, độ bền thấp" },
    "copper": { name: "Cần câu đồng", emoji: "🎣", price: 1000, rarityBonus: 2, durability: 25, description: "Tăng 2% tỷ lệ hiếm, độ bền trung bình" },
    "silver": { name: "Cần câu bạc", emoji: "🎣", price: 5000, rarityBonus: 4, durability: 50, description: "Tăng 4% tỷ lệ hiếm, độ bền cao" },
    "gold": { name: "Cần câu vàng", emoji: "🎣", price: 15000, rarityBonus: 7, durability: 100, description: "Tăng 7% tỷ lệ hiếm, độ bền rất cao" },
    "diamond": { name: "Cần câu kim cương", emoji: "💎", price: 50000, rarityBonus: 10, durability: 200, description: "Tăng 10% tỷ lệ hiếm, độ bền tối đa" },
};

// Danh sách mồi
export const BAITS: Record<string, Bait> = {
    "basic": { name: "Mồi cơ bản", emoji: "🪱", price: 10, rarityBonus: 0, description: "Mồi cơ bản, tỷ lệ thường" },
    "good": { name: "Mồi ngon", emoji: "🦐", price: 50, rarityBonus: 3, description: "Tăng 3% tỷ lệ hiếm" },
    "premium": { name: "Mồi thượng hạng", emoji: "🦀", price: 200, rarityBonus: 6, description: "Tăng 6% tỷ lệ hiếm" },
    "divine": { name: "Mồi thần", emoji: "🌟", price: 1000, rarityBonus: 10, description: "Tăng 10% tỷ lệ hiếm" },
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
            console.log("✅ Đã khởi tạo giá cá ban đầu");
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
                // Tạo biến động ngẫu nhiên ±10%
                const fluctuation = (Math.random() - 0.5) * 0.2; // -10% đến +10%
                const newPrice = Math.max(1, Math.floor(fishPrice.basePrice * (1 + fluctuation)));
                const priceChange = newPrice - fishPrice.basePrice;
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
            console.log(`✅ Đã cập nhật giá cá lúc ${new Date().toLocaleString()}`);
        } catch (error) {
            console.error("❌ Lỗi cập nhật giá cá:", error);
        }
    }

    /**
     * Lấy giá hiện tại của cá
     */
    static async getCurrentPrice(fishName: string): Promise<number> {
        try {
            const fishPrice = await prisma.fishPrice.findUnique({
                where: { fishName }
            });

            if (!fishPrice) {
                // Nếu chưa có giá, tạo giá mặc định
                const fish = FISH_LIST.find(f => f.name === fishName);
                if (fish) {
                    const basePrice = Math.floor((fish.minValue + fish.maxValue) / 2);
                    await this.initializeFishPrices();
                    return basePrice;
                }
                return 0;
            }

            return fishPrice.currentPrice;
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

            return fishPrices.map(fp => ({
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
     */
    static async canFish(userId: string, guildId: string): Promise<{ canFish: boolean; remainingTime: number; message?: string }> {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const now = new Date();
            const timeSinceLastFish = now.getTime() - fishingData.lastFished.getTime();

            // Kiểm tra cooldown
            if (timeSinceLastFish < FISHING_COOLDOWN) {
                return {
                    canFish: false,
                    remainingTime: FISHING_COOLDOWN - timeSinceLastFish,
                    message: `Bạn cần đợi ${Math.ceil((FISHING_COOLDOWN - timeSinceLastFish) / 1000)} giây nữa để câu cá!`
                };
            }

            // Kiểm tra có cần câu không
            if (!fishingData.currentRod || fishingData.currentRod === "") {
                return {
                    canFish: false,
                    remainingTime: 0,
                    message: "Bạn cần mua cần câu trước khi câu cá! Dùng `n.fishing shop` để xem cửa hàng."
                };
            }

            // Kiểm tra có mồi không
            if (!fishingData.currentBait || fishingData.currentBait === "") {
                return {
                    canFish: false,
                    remainingTime: 0,
                    message: "Bạn cần mua mồi trước khi câu cá! Dùng `n.fishing shop` để xem cửa hàng."
                };
            }

            // Kiểm tra cần câu có độ bền không
            const currentRod = fishingData.rods.find(r => r.rodType === fishingData.currentRod);
            if (!currentRod || currentRod.durability <= 0) {
                return {
                    canFish: false,
                    remainingTime: 0,
                    message: "Cần câu của bạn đã hết độ bền! Hãy mua cần câu mới."
                };
            }

            // Kiểm tra có mồi không
            const currentBait = fishingData.baits.find(b => b.baitType === fishingData.currentBait);
            if (!currentBait || currentBait.quantity <= 0) {
                return {
                    canFish: false,
                    remainingTime: 0,
                    message: "Bạn đã hết mồi! Hãy mua thêm mồi."
                };
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
    static async fish(userId: string, guildId: string) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            
            // Kiểm tra điều kiện câu cá
            const cooldownCheck = await this.canFish(userId, guildId);
            if (!cooldownCheck.canFish) {
                throw new Error(cooldownCheck.message || `Bạn cần đợi ${Math.ceil(cooldownCheck.remainingTime / 1000)} giây nữa để câu cá!`);
            }

            // Kiểm tra số dư
            const balance = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!balance || balance.balance < FISHING_COST) {
                throw new Error(`Bạn cần ít nhất ${FISHING_COST} AniCoin để câu cá!`);
            }

            // Trừ tiền câu cá
            await prisma.user.update({
                where: { userId_guildId: { userId, guildId } },
                data: { balance: { decrement: FISHING_COST } }
            });

            // Chọn cá ngẫu nhiên
            const fish = this.getRandomFish(fishingData);
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

            // Giảm độ bền cần câu
            const currentRod = fishingData.rods.find(r => r.rodType === fishingData.currentRod);
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

            // Giảm số lượng mồi
            const currentBait = fishingData.baits.find(b => b.baitType === fishingData.currentBait);
            if (currentBait && currentBait.quantity > 0) {
                await prisma.fishingBait.update({
                    where: { id: currentBait.id },
                    data: { quantity: { decrement: 1 } }
                });

                // Nếu hết mồi, xóa mồi hiện tại
                if (currentBait.quantity <= 0) {
                    await prisma.fishingData.update({
                        where: { id: fishingData.id },
                        data: { currentBait: "" }
                    });
                }
            }

            return {
                fish,
                value: fishValue,
                newBalance: balance.balance - FISHING_COST + fishValue
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

            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!user || user.balance < rod.price) {
                throw new Error(`Không đủ tiền! Cần ${rod.price} AniCoin`);
            }

            const fishingData = await this.getFishingData(userId, guildId);

            // Kiểm tra đã có cần câu này chưa
            const existingRod = fishingData.rods.find(r => r.rodType === rodType);
            if (existingRod) {
                throw new Error("Bạn đã có cần câu này rồi!");
            }

            // Trừ tiền và thêm cần câu
            await prisma.$transaction(async (tx: any) => {
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { balance: { decrement: rod.price } }
                });

                await tx.fishingRod.create({
                    data: {
                        fishingDataId: fishingData.id,
                        rodType,
                        durability: rod.durability
                    }
                });

                // Tự động set làm cần câu hiện tại nếu chưa có cần câu nào
                if (!fishingData.currentRod || fishingData.currentRod === "") {
                    await tx.fishingData.update({
                        where: { id: fishingData.id },
                        data: { currentRod: rodType }
                    });
                }
            });

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
            const user = await prisma.user.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!user || user.balance < totalCost) {
                throw new Error(`Không đủ tiền! Cần ${totalCost} AniCoin`);
            }

            const fishingData = await this.getFishingData(userId, guildId);

            // Trừ tiền và thêm mồi
            await prisma.$transaction(async (tx: any) => {
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { balance: { decrement: totalCost } }
                });

                await tx.fishingBait.upsert({
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
                    await tx.fishingData.update({
                        where: { id: fishingData.id },
                        data: { currentBait: baitType }
                    });
                }
            });

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
            const rod = fishingData.rods.find(r => r.rodType === rodType);

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
     * Set mồi hiện tại
     */
    static async setCurrentBait(userId: string, guildId: string, baitType: string) {
        try {
            const fishingData = await this.getFishingData(userId, guildId);
            const bait = fishingData.baits.find(b => b.baitType === baitType);

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
            const caughtFish = fishingData.fish.find(f => f.fishName === fishName);

            if (!caughtFish) {
                throw new Error("Bạn không có cá này!");
            }

            if (caughtFish.quantity < quantity) {
                throw new Error(`Bạn chỉ có ${caughtFish.quantity} con ${fishName}!`);
            }

            // Lấy giá hiện tại của cá
            const currentPrice = await FishPriceService.getCurrentPrice(fishName);
            const totalValue = currentPrice * quantity;

            // Cộng tiền và trừ cá
            await prisma.$transaction(async (tx: any) => {
                await tx.user.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { balance: { increment: totalValue } }
                });

                if (caughtFish.quantity === quantity) {
                    await tx.caughtFish.delete({
                        where: { id: caughtFish.id }
                    });
                } else {
                    await tx.caughtFish.update({
                        where: { id: caughtFish.id },
                        data: { quantity: { decrement: quantity } }
                    });
                }
            });

            return { fishName, quantity, totalValue, currentPrice };
        } catch (error) {
            console.error("Error selling fish:", error);
            throw error;
        }
    }

    /**
     * Chọn cá ngẫu nhiên dựa trên cần câu và mồi
     */
    private static getRandomFish(fishingData: any): Fish {
        const rod = FISHING_RODS[fishingData.currentRod];
        const bait = BAITS[fishingData.currentBait];
        const totalBonus = rod.rarityBonus + bait.rarityBonus;

        // Tạo danh sách cá với tỷ lệ đã điều chỉnh
        const adjustedFish = FISH_LIST.map(fish => {
            let adjustedChance = fish.chance;
            
            // Tăng tỷ lệ cho cá hiếm hơn dựa trên bonus
            if (fish.rarity === "rare") {
                adjustedChance += totalBonus * 0.5;
            } else if (fish.rarity === "epic") {
                adjustedChance += totalBonus * 0.3;
            } else if (fish.rarity === "legendary") {
                adjustedChance += totalBonus * 0.1;
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
} 