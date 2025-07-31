import { PrismaClient } from '@prisma/client';
import { FISH_LIST } from '../config/fish-data';

const prisma = new PrismaClient();

export interface PityConfig {
    legendaryThreshold: number;  // Số lần câu tối đa trước khi đảm bảo ra cá huyền thoại
    pityMultiplier: number;      // Hệ số tăng tỷ lệ khi gần đến ngưỡng
    resetOnLegendary: boolean;   // Có reset pity count khi câu được cá huyền thoại không
}

export class PitySystemService {
    // Cấu hình mặc định cho pity system
    private static readonly DEFAULT_CONFIG: PityConfig = {
        legendaryThreshold: 500,  // 500 lần câu không ra cá huyền thoại
        pityMultiplier: 2.0,     // Tăng gấp đôi tỷ lệ khi gần ngưỡng
        resetOnLegendary: true    // Reset pity count khi câu được cá huyền thoại
    };

    /**
     * Lấy thông tin pity của user
     */
    static async getPityInfo(userId: string, guildId: string) {
        try {
            const fishingData = await prisma.fishingData.findUnique({
                where: { userId_guildId: { userId, guildId } }
            });

            if (!fishingData) {
                return {
                    legendaryPityCount: 0,
                    legendaryThreshold: this.DEFAULT_CONFIG.legendaryThreshold,
                    remainingToGuaranteed: this.DEFAULT_CONFIG.legendaryThreshold,
                    pityPercentage: 0,
                    lastLegendaryCaught: null
                };
            }

            const remainingToGuaranteed = Math.max(0, this.DEFAULT_CONFIG.legendaryThreshold - fishingData.legendaryPityCount);
            const pityPercentage = Math.min(100, (fishingData.legendaryPityCount / this.DEFAULT_CONFIG.legendaryThreshold) * 100);

            return {
                legendaryPityCount: fishingData.legendaryPityCount,
                legendaryThreshold: this.DEFAULT_CONFIG.legendaryThreshold,
                remainingToGuaranteed,
                pityPercentage,
                lastLegendaryCaught: fishingData.lastLegendaryCaught
            };
        } catch (error) {
            console.error("Error getting pity info:", error);
            // Trả về giá trị mặc định thay vì null
            return {
                legendaryPityCount: 0,
                legendaryThreshold: this.DEFAULT_CONFIG.legendaryThreshold,
                remainingToGuaranteed: this.DEFAULT_CONFIG.legendaryThreshold,
                pityPercentage: 0,
                lastLegendaryCaught: null
            };
        }
    }

    /**
     * Kiểm tra xem có nên kích hoạt pity system không
     */
    static async shouldActivatePity(userId: string, guildId: string): Promise<boolean> {
        try {
            const pityInfo = await this.getPityInfo(userId, guildId);
            if (!pityInfo) return false;

            // Kích hoạt pity khi đạt ngưỡng
            return pityInfo.legendaryPityCount >= this.DEFAULT_CONFIG.legendaryThreshold;
        } catch (error) {
            console.error("Error checking pity activation:", error);
            return false;
        }
    }

    /**
     * Lấy tỷ lệ pity cho cá huyền thoại
     */
    static async getPityMultiplier(userId: string, guildId: string): Promise<number> {
        try {
            const pityInfo = await this.getPityInfo(userId, guildId);
            if (!pityInfo) return 1.0;

            // Tính toán pity multiplier dựa trên số lần câu
            const pityProgress = pityInfo.legendaryPityCount / this.DEFAULT_CONFIG.legendaryThreshold;
            
            if (pityProgress >= 0.8) {
                // Tăng mạnh khi gần ngưỡng (80% trở lên)
                return this.DEFAULT_CONFIG.pityMultiplier * (1 + pityProgress);
            } else if (pityProgress >= 0.5) {
                // Tăng vừa phải khi đạt 50%
                return 1.0 + (pityProgress * 0.5);
            }

            return 1.0;
        } catch (error) {
            console.error("Error getting pity multiplier:", error);
            return 1.0;
        }
    }

    /**
     * Cập nhật pity count sau khi câu cá
     */
    static async updatePityCount(userId: string, guildId: string, caughtFish: any) {
        try {
            const isLegendary = caughtFish.rarity === 'legendary';
            
            if (isLegendary) {
                // Reset pity count khi câu được cá huyền thoại
                await prisma.fishingData.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: {
                        legendaryPityCount: 0,
                        lastLegendaryCaught: new Date()
                    }
                });
            } else {
                // Tăng pity count khi không câu được cá huyền thoại
                await prisma.fishingData.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: {
                        legendaryPityCount: { increment: 1 }
                    }
                });
            }
        } catch (error) {
            console.error("Error updating pity count:", error);
        }
    }

    /**
     * Lấy cá huyền thoại ngẫu nhiên khi kích hoạt pity
     */
    static getRandomLegendaryFish(): any {
        const legendaryFish = FISH_LIST.filter(fish => fish.rarity === 'legendary');
        const randomIndex = Math.floor(Math.random() * legendaryFish.length);
        return legendaryFish[randomIndex];
    }

    /**
     * Tạo embed hiển thị thông tin pity
     */
    static createPityEmbed(pityInfo: any) {
        const { EmbedBuilder } = require('discord.js');
        
        const embed = new EmbedBuilder()
            .setTitle("🎣 Thông tin Pity System")
            .setColor("#ff6b6b")
            .setDescription("Hệ thống bảo hộ cá huyền thoại")
            .addFields(
                {
                    name: "📊 Số lần câu không ra cá huyền thoại",
                    value: `${pityInfo.legendaryPityCount}/${pityInfo.legendaryThreshold}`,
                    inline: true
                },
                {
                    name: "🎯 Còn lại đến đảm bảo",
                    value: `${pityInfo.remainingToGuaranteed} lần`,
                    inline: true
                },
                {
                    name: "📈 Tỷ lệ pity",
                    value: `${pityInfo.pityPercentage.toFixed(1)}%`,
                    inline: true
                }
            );

        if (pityInfo.lastLegendaryCaught) {
            embed.addFields({
                name: "🐋 Lần cuối câu được cá huyền thoại",
                value: `<t:${Math.floor(pityInfo.lastLegendaryCaught.getTime() / 1000)}:R>`,
                inline: false
            });
        }

        // Thêm thông tin về hệ thống
        embed.addFields({
            name: "ℹ️ Thông tin hệ thống",
            value: "• Cứ 500 lần câu không ra cá huyền thoại sẽ được đảm bảo ra 1 con\n• Tỷ lệ ra cá huyền thoại tăng dần khi gần ngưỡng\n• Pity count sẽ reset khi câu được cá huyền thoại",
            inline: false
        });

        return embed;
    }

    /**
     * Tạo embed thông báo kích hoạt pity
     */
    static createPityActivationEmbed(caughtFish: any) {
        const { EmbedBuilder } = require('discord.js');
        
        const embed = new EmbedBuilder()
            .setTitle("🎉 PITY SYSTEM KÍCH HOẠT!")
            .setColor("#ffd700")
            .setDescription("🎣 Bạn đã câu được cá huyền thoại nhờ hệ thống bảo hộ!")
            .addFields(
                {
                    name: "🐋 Cá huyền thoại",
                    value: `${caughtFish.emoji} **${caughtFish.name}**`,
                    inline: true
                },
                {
                    name: "💰 Giá trị",
                    value: `${caughtFish.minValue.toLocaleString()} - ${caughtFish.maxValue.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "📝 Mô tả",
                    value: caughtFish.description,
                    inline: false
                }
            )
            .setFooter({ text: "Hệ thống pity đã reset về 0" })
            .setTimestamp();

        return embed;
    }
} 