export interface Fish {
    name: string;
    emoji: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    minValue: number;
    maxValue: number;
    chance: number;
    // Các thuộc tính mở rộng cho tương lai
    description?: string;
    habitat?: string;
    season?: string[];
    weather?: string[];
    timeOfDay?: string[];
    specialAbilities?: string[];
    breedingCompatibility?: string[];
    battleStats?: {
        attack: number;
        defense: number;
        speed: number;
        health: number;
    };
}

export interface FishingRod {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    durability: number;
    description: string;
    // Các thuộc tính mở rộng
    level?: number;
    specialEffects?: string[];
    upgradeCost?: number;
}

export interface Bait {
    name: string;
    emoji: string;
    price: number;
    rarityBonus: number;
    description: string;
    // Các thuộc tính mở rộng
    effectiveness?: number;
    duration?: number;
    specialEffects?: string[];
}

// Danh sách cá chính
export const FISH_LIST: Fish[] = [
    // Cá thường (60-70%)
    { 
        name: "Cá rô phi", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 10, 
        maxValue: 50, 
        chance: 25,
        description: "Cá rô phi, loài cá nuôi phổ biến",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá chép", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 20, 
        maxValue: 80, 
        chance: 20,
        description: "Cá chép vàng, loài cá truyền thống",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá trắm cỏ", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 30, 
        maxValue: 100, 
        chance: 15,
        description: "Cá trắm cỏ, thích ăn cỏ và thực vật",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"]
    },
    { 
        name: "Cá mè hoa", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 15, 
        maxValue: 60, 
        chance: 10,
        description: "Cá mè hoa, thích ăn tảo và thực vật",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá diếc", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 12, 
        maxValue: 45, 
        chance: 12,
        description: "Cá diếc nhỏ, sống ở ao hồ",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá trôi Ấn Độ", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 18, 
        maxValue: 70, 
        chance: 11,
        description: "Cá trôi Ấn Độ, thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá mè vinh", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 8, 
        maxValue: 40, 
        chance: 13,
        description: "Cá mè vinh, thích ăn thực vật",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"]
    },
    { 
        name: "Cá rô đồng", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 14, 
        maxValue: 55, 
        chance: 14,
        description: "Cá rô đồng, sống ở ruộng lúa",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá chạch", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 16, 
        maxValue: 65, 
        chance: 12,
        description: "Cá chạch, thích sống ở đáy bùn",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"]
    },
    { 
        name: "Cá trê phi", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 22, 
        maxValue: 75, 
        chance: 11,
        description: "Cá trê phi, thịt béo ngậy",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá rô phi đen", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 13, 
        maxValue: 48, 
        chance: 13,
        description: "Cá rô phi đen, thịt chắc",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá mè trắng", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 11, 
        maxValue: 42, 
        chance: 12,
        description: "Cá mè trắng, thích ăn tảo",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá chép koi", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 25, 
        maxValue: 85, 
        chance: 10,
        description: "Cá chép koi Nhật Bản, cá cảnh đẹp",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cá vàng", 
        emoji: "🐟", 
        rarity: "common", 
        minValue: 9, 
        maxValue: 35, 
        chance: 15,
        description: "Cá vàng cảnh, dễ nuôi",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Tôm sú", 
        emoji: "🦐", 
        rarity: "common", 
        minValue: 25, 
        maxValue: 80, 
        chance: 12,
        description: "Tôm sú, loài tôm biển ngon",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Tôm hùm", 
        emoji: "🦞", 
        rarity: "common", 
        minValue: 30, 
        maxValue: 100, 
        chance: 10,
        description: "Tôm hùm, loài tôm lớn thịt ngon",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Cua biển", 
        emoji: "🦀", 
        rarity: "common", 
        minValue: 20, 
        maxValue: 70, 
        chance: 13,
        description: "Cua biển, thịt béo ngậy",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Ghẹ xanh", 
        emoji: "🦀", 
        rarity: "common", 
        minValue: 18, 
        maxValue: 60, 
        chance: 14,
        description: "Ghẹ xanh, thịt ngọt",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Mực ống", 
        emoji: "🦑", 
        rarity: "common", 
        minValue: 22, 
        maxValue: 75, 
        chance: 11,
        description: "Mực ống, thịt dai ngon",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Ốc hương", 
        emoji: "🐚", 
        rarity: "common", 
        minValue: 15, 
        maxValue: 50, 
        chance: 16,
        description: "Ốc hương, thịt ngọt thơm",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },
    { 
        name: "Ốc móng tay", 
        emoji: "🐚", 
        rarity: "common", 
        minValue: 12, 
        maxValue: 45, 
        chance: 17,
        description: "Ốc móng tay, thịt ngọt",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"]
    },

    // Cá hiếm (20-25%)
    { 
        name: "Cá lóc", 
        emoji: "🐡", 
        rarity: "rare", 
        minValue: 100, 
        maxValue: 300, 
        chance: 8,
        description: "Cá lóc, loài cá săn mồi hung dữ",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        battleStats: {
            attack: 15,
            defense: 10,
            speed: 12,
            health: 100
        }
    },
    { 
        name: "Cá trê đen", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 150, 
        maxValue: 400, 
        chance: 7,
        description: "Cá trê đen, thích sống ở đáy nước",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        battleStats: {
            attack: 12,
            defense: 15,
            speed: 8,
            health: 120
        }
    },
    { 
        name: "Cá quả", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 200, 
        maxValue: 500, 
        chance: 6,
        description: "Cá quả, loài cá to thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 18,
            defense: 12,
            speed: 10,
            health: 150
        }
    },
    { 
        name: "Cá chình điện", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 300, 
        maxValue: 800, 
        chance: 4,
        description: "Cá chình điện, có khả năng phóng điện",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["rainy", "stormy"],
        timeOfDay: ["night"],
        specialAbilities: ["electric_shock"],
        battleStats: {
            attack: 20,
            defense: 8,
            speed: 15,
            health: 80
        }
    },
    { 
        name: "Cá rô phi sọc", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 120, 
        maxValue: 350, 
        chance: 6,
        description: "Cá rô phi sọc, thịt thơm ngon",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 14,
            defense: 11,
            speed: 13,
            health: 110
        }
    },
    { 
        name: "Cá chép trắng", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 180, 
        maxValue: 450, 
        chance: 5,
        description: "Cá chép trắng quý hiếm",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 16,
            defense: 13,
            speed: 11,
            health: 130
        }
    },
    { 
        name: "Cá trắm đen", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 250, 
        maxValue: 600, 
        chance: 5,
        description: "Cá trắm đen, thịt béo",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"],
        battleStats: {
            attack: 17,
            defense: 14,
            speed: 9,
            health: 160
        }
    },
    { 
        name: "Cá mè hoa", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 140, 
        maxValue: 380, 
        chance: 6,
        description: "Cá mè hoa, vảy đẹp",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 13,
            defense: 12,
            speed: 14,
            health: 105
        }
    },
    { 
        name: "Cá rô đồng lớn", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 160, 
        maxValue: 420, 
        chance: 5,
        description: "Cá rô đồng lớn, thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 15,
            defense: 11,
            speed: 12,
            health: 125
        }
    },
    { 
        name: "Cá chạch bùn", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 130, 
        maxValue: 360, 
        chance: 6,
        description: "Cá chạch bùn, thích sống ở đáy",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        battleStats: {
            attack: 12,
            defense: 16,
            speed: 10,
            health: 115
        }
    },
    { 
        name: "Cá trê phi đen", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 190, 
        maxValue: 480, 
        chance: 5,
        description: "Cá trê phi đen, thịt béo ngậy",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 18,
            defense: 13,
            speed: 9,
            health: 140
        }
    },
    { 
        name: "Cá rô phi đỏ", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 170, 
        maxValue: 440, 
        chance: 5,
        description: "Cá rô phi đỏ, thịt chắc",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 16,
            defense: 12,
            speed: 13,
            health: 120
        }
    },
    { 
        name: "Cá mè trắng lớn", 
        emoji: "🐠", 
        rarity: "rare", 
        minValue: 150, 
        maxValue: 400, 
        chance: 6,
        description: "Cá mè trắng lớn, thích ăn tảo",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 14,
            defense: 14,
            speed: 11,
            health: 130
        }
    },
    { 
        name: "Tôm hùm đỏ", 
        emoji: "🦞", 
        rarity: "rare", 
        minValue: 200, 
        maxValue: 600, 
        chance: 5,
        description: "Tôm hùm đỏ, loài tôm quý hiếm",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 16,
            defense: 12,
            speed: 14,
            health: 140
        }
    },
    { 
        name: "Cua hoàng đế", 
        emoji: "🦀", 
        rarity: "rare", 
        minValue: 250, 
        maxValue: 700, 
        chance: 4,
        description: "Cua hoàng đế, loài cua lớn quý hiếm",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 18,
            defense: 16,
            speed: 8,
            health: 160
        }
    },
    { 
        name: "Mực khổng lồ", 
        emoji: "🦑", 
        rarity: "rare", 
        minValue: 300, 
        maxValue: 800, 
        chance: 3,
        description: "Mực khổng lồ, loài mực lớn",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 20,
            defense: 10,
            speed: 18,
            health: 120
        }
    },
    { 
        name: "Ốc vòi voi", 
        emoji: "🐚", 
        rarity: "rare", 
        minValue: 180, 
        maxValue: 500, 
        chance: 5,
        description: "Ốc vòi voi, loài ốc lớn quý hiếm",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 12,
            defense: 18,
            speed: 6,
            health: 150
        }
    },

    // Cá quý hiếm (8-12%)
    { 
        name: "Cá tầm", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 500, 
        maxValue: 1500, 
        chance: 3,
        description: "Cá tầm, loài cá quý hiếm, trứng làm caviar",
        habitat: "freshwater",
        season: ["spring", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 25,
            defense: 20,
            speed: 10,
            health: 200
        }
    },
    { 
        name: "Cá hồi Đại Tây Dương", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 800, 
        maxValue: 2000, 
        chance: 2.5,
        description: "Cá hồi Đại Tây Dương, thịt béo ngon",
        habitat: "saltwater",
        season: ["spring", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"],
        battleStats: {
            attack: 22,
            defense: 15,
            speed: 18,
            health: 150
        }
    },
    { 
        name: "Cá ngừ vây xanh", 
        emoji: "🐋", 
        rarity: "epic", 
        minValue: 1000, 
        maxValue: 3000, 
        chance: 2,
        description: "Cá ngừ vây xanh, bơi nhanh thịt đỏ",
        habitat: "saltwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"],
        battleStats: {
            attack: 30,
            defense: 12,
            speed: 25,
            health: 180
        }
    },
    { 
        name: "Cá mập trắng", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 2000, 
        maxValue: 5000, 
        chance: 1.5,
        description: "Cá mập trắng, kẻ săn mồi đỉnh cao",
        habitat: "saltwater",
        season: ["summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        specialAbilities: ["shark_frenzy"],
        battleStats: {
            attack: 35,
            defense: 18,
            speed: 20,
            health: 250
        }
    },
    { 
        name: "Cá lóc khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 600, 
        maxValue: 1800, 
        chance: 2.8,
        description: "Cá lóc khổng lồ, loài cá săn mồi hung dữ",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        specialAbilities: ["giant_strike"],
        battleStats: {
            attack: 28,
            defense: 16,
            speed: 14,
            health: 220
        }
    },
    { 
        name: "Cá trê khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 700, 
        maxValue: 2000, 
        chance: 2.3,
        description: "Cá trê khổng lồ, thịt béo ngậy",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        battleStats: {
            attack: 24,
            defense: 22,
            speed: 8,
            health: 240
        }
    },
    { 
        name: "Cá quả khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 800, 
        maxValue: 2200, 
        chance: 2.1,
        description: "Cá quả khổng lồ, loài cá to thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 26,
            defense: 18,
            speed: 12,
            health: 200
        }
    },
    { 
        name: "Cá chình điện khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 900, 
        maxValue: 2500, 
        chance: 1.8,
        description: "Cá chình điện khổng lồ, phóng điện mạnh",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["rainy", "stormy"],
        timeOfDay: ["night"],
        specialAbilities: ["giant_electric_shock"],
        battleStats: {
            attack: 32,
            defense: 12,
            speed: 18,
            health: 160
        }
    },
    { 
        name: "Cá rô phi khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 550, 
        maxValue: 1600, 
        chance: 2.7,
        description: "Cá rô phi khổng lồ, thịt thơm ngon",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 23,
            defense: 17,
            speed: 15,
            health: 190
        }
    },
    { 
        name: "Cá chép khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 650, 
        maxValue: 1900, 
        chance: 2.4,
        description: "Cá chép khổng lồ, thịt béo",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 25,
            defense: 19,
            speed: 11,
            health: 210
        }
    },
    { 
        name: "Cá trắm khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 750, 
        maxValue: 2100, 
        chance: 2.2,
        description: "Cá trắm khổng lồ, thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day"],
        battleStats: {
            attack: 27,
            defense: 16,
            speed: 13,
            health: 230
        }
    },
    { 
        name: "Cá mè khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 500, 
        maxValue: 1500, 
        chance: 2.9,
        description: "Cá mè khổng lồ, thích ăn tảo",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 21,
            defense: 20,
            speed: 16,
            health: 180
        }
    },
    { 
        name: "Cá rô đồng khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 600, 
        maxValue: 1700, 
        chance: 2.6,
        description: "Cá rô đồng khổng lồ, thịt ngon",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["sunny", "cloudy", "rainy"],
        timeOfDay: ["day", "night"],
        battleStats: {
            attack: 24,
            defense: 15,
            speed: 14,
            health: 200
        }
    },
    { 
        name: "Cá chạch khổng lồ", 
        emoji: "🦈", 
        rarity: "epic", 
        minValue: 700, 
        maxValue: 2000, 
        chance: 2.0,
        description: "Cá chạch khổng lồ, thích sống ở đáy",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["cloudy", "rainy"],
        timeOfDay: ["night"],
        battleStats: {
            attack: 20,
            defense: 24,
            speed: 12,
            health: 220
        }
    },

    // Cá huyền thoại (1-3%)
    { 
        name: "Cá voi xanh", 
        emoji: "🐳", 
        rarity: "legendary", 
        minValue: 5000, 
        maxValue: 15000, 
        chance: 0.8,
        description: "Cá voi xanh, sinh vật lớn nhất đại dương",
        habitat: "saltwater",
        season: ["winter", "spring"],
        weather: ["stormy"],
        timeOfDay: ["day", "night"],
        specialAbilities: ["whale_song", "ocean_guardian"],
        battleStats: {
            attack: 50,
            defense: 40,
            speed: 15,
            health: 500
        }
    },
    { 
        name: "Cá mực khổng lồ", 
        emoji: "🦑", 
        rarity: "legendary", 
        minValue: 8000, 
        maxValue: 20000, 
        chance: 0.6,
        description: "Cá mực khổng lồ, sinh vật bí ẩn dưới đáy biển",
        habitat: "saltwater",
        season: ["autumn", "winter"],
        weather: ["stormy"],
        timeOfDay: ["night"],
        specialAbilities: ["ink_cloud", "deep_dweller"],
        battleStats: {
            attack: 45,
            defense: 25,
            speed: 30,
            health: 300
        }
    },
    { 
        name: "Cá rồng biển", 
        emoji: "🐉", 
        rarity: "legendary", 
        minValue: 15000, 
        maxValue: 50000, 
        chance: 0.4,
        description: "Cá rồng biển, sinh vật huyền thoại",
        habitat: "saltwater",
        season: ["spring", "summer"],
        weather: ["stormy"],
        timeOfDay: ["day", "night"],
        specialAbilities: ["dragon_breath", "sea_mastery"],
        battleStats: {
            attack: 60,
            defense: 35,
            speed: 25,
            health: 400
        }
    },
    { 
        name: "Cá thần biển", 
        emoji: "🧜", 
        rarity: "legendary", 
        minValue: 50000, 
        maxValue: 100000, 
        chance: 0.2,
        description: "Cá thần biển, sinh vật thần thánh của đại dương",
        habitat: "saltwater",
        season: ["all"],
        weather: ["all"],
        timeOfDay: ["all"],
        specialAbilities: ["divine_presence", "ocean_control", "healing_waters"],
        battleStats: {
            attack: 80,
            defense: 50,
            speed: 40,
            health: 600
        }
    },
    { 
        name: "Vua biển", 
        emoji: "🔱", 
        rarity: "legendary", 
        minValue: 100000, 
        maxValue: 150000, 
        chance: 0.1,
        description: "Vua biển, chúa tể của đại dương",
        habitat: "saltwater",
        season: ["all"],
        weather: ["all"],
        timeOfDay: ["all"],
        specialAbilities: ["sea_king_authority", "ocean_dominion", "tidal_wave"],
        battleStats: {
            attack: 100,
            defense: 70,
            speed: 35,
            health: 800
        }
    },
    { 
        name: "Cá rồng nước ngọt", 
        emoji: "🐉", 
        rarity: "legendary", 
        minValue: 12000, 
        maxValue: 35000, 
        chance: 0.3,
        description: "Cá rồng nước ngọt, sinh vật huyền thoại của sông hồ",
        habitat: "freshwater",
        season: ["spring", "summer", "autumn"],
        weather: ["stormy"],
        timeOfDay: ["day", "night"],
        specialAbilities: ["freshwater_dominion", "river_control", "water_bending"],
        battleStats: {
            attack: 55,
            defense: 30,
            speed: 28,
            health: 350
        }
    },
    { 
        name: "Cá thần nước ngọt", 
        emoji: "🧜‍♂️", 
        rarity: "legendary", 
        minValue: 30000, 
        maxValue: 80000, 
        chance: 0.15,
        description: "Cá thần nước ngọt, bảo vệ của sông hồ",
        habitat: "freshwater",
        season: ["all"],
        weather: ["all"],
        timeOfDay: ["all"],
        specialAbilities: ["freshwater_guardian", "river_healing", "water_purification"],
        battleStats: {
            attack: 70,
            defense: 45,
            speed: 35,
            health: 450
        }
    },
    { 
        name: "Vua nước ngọt", 
        emoji: "👑", 
        rarity: "legendary", 
        minValue: 80000, 
        maxValue: 120000, 
        chance: 0.08,
        description: "Vua nước ngọt, chúa tể của sông hồ",
        habitat: "freshwater",
        season: ["all"],
        weather: ["all"],
        timeOfDay: ["all"],
        specialAbilities: ["freshwater_king_authority", "river_dominion", "flood_control"],
        battleStats: {
            attack: 85,
            defense: 60,
            speed: 32,
            health: 700
        }
    },
];

// Danh sách cần câu
export const FISHING_RODS: Record<string, FishingRod> = {
    "basic": { 
        name: "Cần câu cơ bản", 
        emoji: "🎣", 
        price: 100, 
        rarityBonus: 0, 
        durability: 10, 
        description: "Cần câu cơ bản, độ bền thấp",
        level: 1,
        upgradeCost: 1000
    },
    "copper": { 
        name: "Cần câu đồng", 
        emoji: "🎣", 
        price: 1000, 
        rarityBonus: 1, 
        durability: 25, 
        description: "Tăng 1% tỷ lệ hiếm, độ bền trung bình",
        level: 2,
        upgradeCost: 5000
    },
    "silver": { 
        name: "Cần câu bạc", 
        emoji: "🎣", 
        price: 5000, 
        rarityBonus: 2, 
        durability: 50, 
        description: "Tăng 2% tỷ lệ hiếm, độ bền cao",
        level: 3,
        upgradeCost: 15000
    },
    "gold": { 
        name: "Cần câu vàng", 
        emoji: "🎣", 
        price: 15000, 
        rarityBonus: 3.5, 
        durability: 100, 
        description: "Tăng 3.5% tỷ lệ hiếm, độ bền rất cao",
        level: 4,
        upgradeCost: 50000
    },
    "diamond": { 
        name: "Cần câu kim cương", 
        emoji: "💎", 
        price: 50000, 
        rarityBonus: 5, 
        durability: 200, 
        description: "Tăng 5% tỷ lệ hiếm, độ bền tối đa",
        level: 5,
        specialEffects: ["legendary_boost"]
    },
};

// Danh sách mồi
export const BAITS: Record<string, Bait> = {
    "basic": { 
        name: "Mồi cơ bản", 
        emoji: "🪱", 
        price: 10, 
        rarityBonus: 0, 
        description: "Mồi cơ bản, tỷ lệ thường",
        effectiveness: 1,
        duration: 1
    },
    "good": { 
        name: "Mồi ngon", 
        emoji: "🦐", 
        price: 50, 
        rarityBonus: 1.5, 
        description: "Tăng 1.5% tỷ lệ hiếm",
        effectiveness: 1.5,
        duration: 2
    },
    "premium": { 
        name: "Mồi thượng hạng", 
        emoji: "🦀", 
        price: 200, 
        rarityBonus: 3, 
        description: "Tăng 3% tỷ lệ hiếm",
        effectiveness: 2,
        duration: 3
    },
    "divine": { 
        name: "Mồi thần", 
        emoji: "🧜‍♀️", 
        price: 1000, 
        rarityBonus: 5, 
        description: "Tăng 5% tỷ lệ hiếm",
        effectiveness: 3,
        duration: 5,
        specialEffects: ["legendary_attraction"]
    },
};

// Các hàm tiện ích
export class FishDataService {
    /**
     * Lấy danh sách cá theo rarity
     */
    static getFishByRarity(rarity: string): Fish[] {
        return FISH_LIST.filter(fish => fish.rarity === rarity);
    }

    /**
     * Lấy danh sách cá theo habitat
     */
    static getFishByHabitat(habitat: string): Fish[] {
        return FISH_LIST.filter(fish => fish.habitat === habitat);
    }

    /**
     * Lấy danh sách cá theo mùa
     */
    static getFishBySeason(season: string): Fish[] {
        return FISH_LIST.filter(fish => 
            fish.season?.includes(season) || fish.season?.includes('all')
        );
    }

    /**
     * Lấy danh sách cá theo thời tiết
     */
    static getFishByWeather(weather: string): Fish[] {
        return FISH_LIST.filter(fish => 
            fish.weather?.includes(weather) || fish.weather?.includes('all')
        );
    }

    /**
     * Lấy danh sách cá theo thời gian trong ngày
     */
    static getFishByTimeOfDay(timeOfDay: string): Fish[] {
        return FISH_LIST.filter(fish => 
            fish.timeOfDay?.includes(timeOfDay) || fish.timeOfDay?.includes('all')
        );
    }

    /**
     * Lấy cá theo tên
     */
    static getFishByName(name: string): Fish | undefined {
        return FISH_LIST.find(fish => fish.name === name);
    }

    /**
     * Lấy cần câu theo loại
     */
    static getRodByType(rodType: string): FishingRod | undefined {
        return FISHING_RODS[rodType];
    }

    /**
     * Lấy mồi theo loại
     */
    static getBaitByType(baitType: string): Bait | undefined {
        return BAITS[baitType];
    }

    /**
     * Lấy giá trị rarity để so sánh
     */
    static getRarityValue(rarity: string): number {
        switch (rarity) {
            case "common": return 1;
            case "rare": return 2;
            case "epic": return 3;
            case "legendary": return 4;
            default: return 0;
        }
    }

    /**
     * Lấy tất cả cá có khả năng đặc biệt
     */
    static getFishWithSpecialAbilities(): Fish[] {
        return FISH_LIST.filter(fish => fish.specialAbilities && fish.specialAbilities.length > 0);
    }

    /**
     * Lấy tất cả cá có thống kê chiến đấu
     */
    static getFishWithBattleStats(): Fish[] {
        return FISH_LIST.filter(fish => fish.battleStats);
    }
} 