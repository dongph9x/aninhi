import { PrismaClient } from "@prisma/client";
import { EmbedBuilder } from "discord.js";
import { EcommerceService } from "./ecommerce-db";

const prisma = new PrismaClient();

export async function saveTournamentMessage(tournamentId: string, messageId: string, channelId: string, guildId: string) {
    await prisma.tournamentMessage.create({
        data: {
            tournamentId,
            messageId,
            channelId,
            guildId
        }
    });
}

export async function getTournamentMessagesByTournamentId(tournamentId: string) {
    return prisma.tournamentMessage.findMany({
        where: { tournamentId }
    });
}

export async function deleteTournamentMessagesByTournamentId(tournamentId: string) {
    await prisma.tournamentMessage.deleteMany({
        where: { tournamentId }
    });
}

export interface TournamentData {
    name: string;
    description: string;
    entryFee: number;
    prizePool: number;
    maxParticipants: number;
    winnerCount?: number;
    startTime: Date;
    endTime: Date;
    createdBy: string;
    guildId: string;
    channelId: string;
}

export class TournamentService {
    /**
     * Tạo tournament mới
     */
    static async createTournament(data: TournamentData) {
        try {
            // Kiểm tra quyền admin
            const { FishBattleService } = await import('./fish-battle');
            const isAdmin = await FishBattleService.isAdministrator(data.createdBy, data.guildId);
            
            if (!isAdmin) {
                throw new Error("Chỉ ADMIN mới có thể tạo tournament!");
            }

            // Kiểm tra số dư của người tạo tournament
            const balance = await EcommerceService.getBalance(data.createdBy, data.guildId);
            if (balance < data.prizePool) {
                throw new Error(`Không đủ tiền để tạo tournament! Cần ${data.prizePool.toLocaleString()} AniCoin để trả giải thưởng, số dư: ${balance.toLocaleString()} AniCoin`);
            }

            const tournament = await prisma.tournament.create({
                data: {
                    ...data,
                    status: "registration",
                    currentParticipants: 0
                }
            });

            // Trừ tiền giải thưởng từ người tạo tournament
            await EcommerceService.subtractMoney(data.createdBy, data.guildId, data.prizePool, `Tournament prize pool - ${data.name}`);

            return tournament;
        } catch (error) {
            console.error("Error creating tournament:", error);
            throw error;
        }
    }

    /**
     * Lấy tournament theo ID
     */
    static async getTournamentById(id: string) {
        try {
            const tournament = await prisma.tournament.findUnique({
                where: { id },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            return tournament;
        } catch (error) {
            console.error("Error getting tournament:", error);
            return null;
        }
    }

    /**
     * Lấy danh sách tournaments của server
     */
    static async getTournamentsByGuild(guildId: string, status?: string) {
        try {
            const where: any = { guildId };
            if (status) {
                where.status = status;
            }

            const tournaments = await prisma.tournament.findMany({
                where,
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return tournaments;
        } catch (error) {
            console.error("Error getting tournaments:", error);
            return [];
        }
    }

    /**
     * Tham gia tournament
     */
    static async joinTournament(tournamentId: string, userId: string, guildId: string) {
        try {
            // Kiểm tra tournament có tồn tại và đang đăng ký không
            const tournament = await prisma.tournament.findUnique({
                where: { id: tournamentId }
            });

            if (!tournament) {
                throw new Error("Tournament không tồn tại");
            }

            if (tournament.status !== "registration") {
                throw new Error("Tournament đã đóng đăng ký");
            }

            if (tournament.currentParticipants >= tournament.maxParticipants) {
                throw new Error("Tournament đã đầy");
            }

            // Kiểm tra người dùng đã tham gia chưa
            const existingParticipant = await prisma.tournamentParticipant.findUnique({
                where: {
                    tournamentId_userId: {
                        tournamentId,
                        userId
                    }
                }
            });

            if (existingParticipant) {
                throw new Error("Bạn đã tham gia tournament này rồi");
            }

            // Thêm người tham gia
            await prisma.tournamentParticipant.create({
                data: {
                    tournamentId,
                    userId,
                    guildId
                }
            });

            // Cập nhật số người tham gia
            await prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    currentParticipants: { increment: 1 }
                }
            });

            return true;
        } catch (error) {
            console.error("Error joining tournament:", error);
            throw error;
        }
    }

    /**
     * Bắt đầu tournament
     */
    static async startTournament(tournamentId: string, winnerCount: number = 1) {
        try {
            const tournament = await prisma.tournament.findUnique({
                where: { id: tournamentId },
                include: {
                    participants: true
                }
            });

            if (!tournament) {
                throw new Error("Tournament không tồn tại");
            }

            if (tournament.status !== "registration") {
                throw new Error("Tournament không thể bắt đầu");
            }

            if (tournament.currentParticipants < 2) {
                // Không đủ người tham gia, trả lại tiền cho người tạo
                await EcommerceService.addMoney(
                    tournament.createdBy,
                    tournament.guildId,
                    Number(tournament.prizePool),
                    `Tournament refund - ${tournament.name} (insufficient participants)`
                );

                // Cập nhật tournament thành completed
                await prisma.tournament.update({
                    where: { id: tournamentId },
                    data: {
                        status: "completed"
                    }
                });

                throw new Error("INSUFFICIENT_PARTICIPANTS");
            }

            // Chọn người chiến thắng ngẫu nhiên
            const participants = tournament.participants;
            const actualWinnerCount = Math.min(winnerCount, participants.length);
            
            // Shuffle participants và chọn winners
            const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
            const winners = shuffledParticipants.slice(0, actualWinnerCount);
            
            // Tính toán giải thưởng cho mỗi người
            const prizePerWinner = Math.floor(Number(tournament.prizePool) / actualWinnerCount);
            const remainingPrize = Number(tournament.prizePool) - (prizePerWinner * actualWinnerCount);

            // Cập nhật tournament với winner đầu tiên (để tương thích ngược)
            await prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: "completed",
                    winnerId: winners[0].userId
                }
            });

            // Phát thưởng cho tất cả winners
            for (let i = 0; i < winners.length; i++) {
                let prize = prizePerWinner;
                // Người đầu tiên nhận thêm phần dư
                if (i === 0) {
                    prize += remainingPrize;
                }
                
                await EcommerceService.addMoney(
                    winners[i].userId, 
                    tournament.guildId, 
                    prize, 
                    `Tournament win - ${tournament.name} (${i + 1}/${actualWinnerCount})`
                );
            }

            return { winners, prizePerWinner };
        } catch (error) {
            console.error("Error starting tournament:", error);
            throw error;
        }
    }

    /**
     * Kết thúc tournament sớm
     */
    static async endTournament(tournamentId: string, userId: string, winnerCount: number = 1) {
        try {
            const tournament = await prisma.tournament.findUnique({
                where: { id: tournamentId }
            });

            if (!tournament) {
                throw new Error("Tournament không tồn tại");
            }

            if (tournament.createdBy !== userId) {
                throw new Error("Chỉ người tạo tournament mới có thể kết thúc");
            }

            if (tournament.status !== "registration") {
                throw new Error("Tournament đã kết thúc");
            }

            // Chọn người chiến thắng ngẫu nhiên
            const participants = await prisma.tournamentParticipant.findMany({
                where: { tournamentId }
            });

            if (participants.length === 0) {
                // Không có ai tham gia, trả lại tiền cho người tạo và hủy tournament
                await EcommerceService.addMoney(
                    tournament.createdBy,
                    tournament.guildId,
                    Number(tournament.prizePool),
                    `Tournament refund - ${tournament.name} (no participants)`
                );

                await prisma.tournament.update({
                    where: { id: tournamentId },
                    data: { status: "completed" }
                });
                return null;
            }

            const actualWinnerCount = Math.min(winnerCount, participants.length);
            const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
            const winners = shuffledParticipants.slice(0, actualWinnerCount);

            // Tính toán giải thưởng cho mỗi người
            const prizePerWinner = Math.floor(Number(tournament.prizePool) / actualWinnerCount);
            const remainingPrize = Number(tournament.prizePool) - (prizePerWinner * actualWinnerCount);

            // Cập nhật tournament với winner đầu tiên
            await prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: "completed",
                    winnerId: winners[0].userId
                }
            });

            // Phát thưởng cho tất cả winners
            for (let i = 0; i < winners.length; i++) {
                let prize = prizePerWinner;
                // Người đầu tiên nhận thêm phần dư
                if (i === 0) {
                    prize += remainingPrize;
                }
                
                await EcommerceService.addMoney(
                    winners[i].userId, 
                    tournament.guildId, 
                    prize, 
                    `Tournament win - ${tournament.name} (${i + 1}/${actualWinnerCount})`
                );
            }

            return { winners, prizePerWinner };
        } catch (error) {
            console.error("Error ending tournament:", error);
            throw error;
        }
    }

    /**
     * Force kết thúc tournament (admin)
     */
    static async forceEndTournament(tournamentId: string) {
        try {
            const tournament = await prisma.tournament.findUnique({
                where: { id: tournamentId },
                include: {
                    participants: true
                }
            });

            if (!tournament) {
                throw new Error("Tournament không tồn tại");
            }

            if (tournament.status === "completed") {
                throw new Error("Tournament đã kết thúc");
            }

            let winner = null;
            if (tournament.participants.length > 0) {
                winner = tournament.participants[Math.floor(Math.random() * tournament.participants.length)];
                
                // Phát thưởng cho người chiến thắng
                await EcommerceService.addMoney(
                    winner.userId,
                    tournament.guildId,
                    Number(tournament.prizePool),
                    `Tournament force end win - ${tournament.name}`
                );
            } else {
                // Không có ai tham gia, trả lại tiền cho người tạo
                await EcommerceService.addMoney(
                    tournament.createdBy,
                    tournament.guildId,
                    Number(tournament.prizePool),
                    `Tournament force end refund - ${tournament.name} (no participants)`
                );
            }

            // Cập nhật tournament
            await prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: "completed",
                    winnerId: winner?.userId || null
                }
            });

            return winner;
        } catch (error) {
            console.error("Error force ending tournament:", error);
            throw error;
        }
    }

    /**
     * Xóa tournament
     */
    static async deleteTournament(tournamentId: string) {
        try {
            // Xóa participants trước
            await prisma.tournamentParticipant.deleteMany({
                where: { tournamentId }
            });

            // Xóa tournament
            await prisma.tournament.delete({
                where: { id: tournamentId }
            });

            return true;
        } catch (error) {
            console.error("Error deleting tournament:", error);
            throw error;
        }
    }

    /**
     * Lấy tournaments sắp hết hạn
     */
    static async getExpiredTournaments() {
        try {
            const now = new Date();
            const tournaments = await prisma.tournament.findMany({
                where: {
                    status: "registration",
                    endTime: { lte: now }
                }
            });

            return tournaments;
        } catch (error) {
            console.error("Error getting expired tournaments:", error);
            return [];
        }
    }

    /**
     * Tự động cập nhật trạng thái tournaments hết hạn
     */
    static async updateExpiredTournaments() {
        try {
            const expiredTournaments = await this.getExpiredTournaments();
            let updatedCount = 0;

            for (const tournament of expiredTournaments) {
                console.log(`[Tournament Cleanup] Đang xử lý tournament ${tournament.id} - ${tournament.name}`);
                
                // Kiểm tra có người tham gia không
                const participants = await prisma.tournamentParticipant.findMany({
                    where: { tournamentId: tournament.id }
                });

                if (participants.length === 0) {
                    // Không có ai tham gia, đánh dấu là completed
                    await prisma.tournament.update({
                        where: { id: tournament.id },
                        data: { 
                            status: "completed",
                            winnerId: null
                        }
                    });
                    console.log(`[Tournament Cleanup] Tournament ${tournament.id} kết thúc - không có người tham gia`);
                    
                    // Gửi thông báo lỗi
                    await this.sendTournamentErrorNotification(tournament, "NO_PARTICIPANTS");
                } else if (participants.length === 1) {
                    // Chỉ có 1 người tham gia, hoàn tiền và kết thúc
                    const participant = participants[0];
                    
                    await prisma.tournament.update({
                        where: { id: tournament.id },
                        data: {
                            status: "completed",
                            winnerId: null
                        }
                    });
                    
                    // Hoàn tiền cho người tham gia
                    await EcommerceService.addMoney(participant.userId, tournament.guildId, tournament.entryFee, `Tournament refund - ${tournament.name} (insufficient participants)`);
                    
                    console.log(`[Tournament Cleanup] Tournament ${tournament.id} kết thúc - chỉ có 1 người tham gia, đã hoàn tiền`);
                    
                    // Gửi thông báo lỗi
                    await this.sendTournamentErrorNotification(tournament, "INSUFFICIENT_PARTICIPANTS", participant.userId);
                } else {
                    // Có đủ người tham gia, chọn người chiến thắng ngẫu nhiên
                    const winner = participants[Math.floor(Math.random() * participants.length)];
                    
                    await prisma.tournament.update({
                        where: { id: tournament.id },
                        data: {
                            status: "completed",
                            winnerId: winner.userId
                        }
                    });
                    
                    // Cộng tiền cho người chiến thắng
                    await EcommerceService.addMoney(winner.userId, tournament.guildId, tournament.prizePool, `Tournament winner - ${tournament.name}`);
                    
                    console.log(`[Tournament Cleanup] Tournament ${tournament.id} kết thúc - người chiến thắng: ${winner.userId}`);
                    
                    // Gửi thông báo kết thúc thành công
                    await this.sendTournamentEndNotification(tournament, winner.userId);
                }
                updatedCount++;
            }

            console.log(`[Tournament Cleanup] Đã cập nhật ${updatedCount} tournaments hết hạn`);
            return updatedCount;
        } catch (error) {
            console.error("Error updating expired tournaments:", error);
            return 0;
        }
    }

    /**
     * Gửi thông báo lỗi tournament
     */
    static async sendTournamentErrorNotification(tournament: any, errorType: string, participantId?: string) {
        try {
            const client = (globalThis as any).tournamentClient;
            if (!client || !tournament.channelId) return;

            // Kiểm tra channel ID có phải là snowflake hợp lệ không
            if (!/^\d{17,19}$/.test(tournament.channelId)) {
                console.log(`[Tournament] Skipping notification for invalid channel ID: ${tournament.channelId}`);
                return;
            }

            const channel = await client.channels.fetch(tournament.channelId);
            if (!channel || !channel.isTextBased()) return;

            let embed;
            switch (errorType) {
                case "NO_PARTICIPANTS":
                    embed = new EmbedBuilder()
                        .setTitle("❌ Tournament Bị Hủy")
                        .setDescription(`Tournament **${tournament.name}** đã bị hủy vì không có ai tham gia.\n\n💰 **Phí đăng ký:** ${tournament.entryFee} AniCoin\n🏆 **Giải thưởng:** ${tournament.prizePool} AniCoin`)
                        .setColor("#ff0000")
                        .setTimestamp();
                    break;
                    
                case "INSUFFICIENT_PARTICIPANTS":
                    embed = new EmbedBuilder()
                        .setTitle("❌ Tournament Bị Hủy")
                        .setDescription(`Tournament **${tournament.name}** đã bị hủy vì không đủ người tham gia (cần ít nhất 2 người).\n\n👤 **Người tham gia:** <@${participantId}>\n💰 **Đã hoàn tiền:** ${tournament.entryFee} AniCoin\n🏆 **Giải thưởng:** ${tournament.prizePool} AniCoin`)
                        .setColor("#ff0000")
                        .setTimestamp();
                    break;
                    
                default:
                    embed = new EmbedBuilder()
                        .setTitle("❌ Tournament Lỗi")
                        .setDescription(`Tournament **${tournament.name}** đã gặp lỗi và bị hủy.`)
                        .setColor("#ff0000")
                        .setTimestamp();
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("Error sending tournament error notification:", error);
        }
    }

    /**
     * Gửi thông báo kết thúc tournament thành công
     */
    static async sendTournamentEndNotification(tournament: any, winnerId: string) {
        try {
            const client = (globalThis as any).tournamentClient;
            if (!client || !tournament.channelId) return;

            // Kiểm tra channel ID có phải là snowflake hợp lệ không
            if (!/^\d{17,19}$/.test(tournament.channelId)) {
                console.log(`[Tournament] Skipping notification for invalid channel ID: ${tournament.channelId}`);
                return;
            }

            const channel = await client.channels.fetch(tournament.channelId);
            if (!channel || !channel.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setTitle("🏆 Tournament Kết Thúc!")
                .setDescription(`Tournament **${tournament.name}** đã kết thúc thành công!\n\n👑 **Người chiến thắng:** <@${winnerId}>\n💰 **Giải thưởng:** ${tournament.prizePool} AniCoin`)
                .setColor("#00ff00")
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error("Error sending tournament end notification:", error);
        }
    }

    /**
     * Lấy tournaments theo trạng thái (chỉ lấy active)
     */
    static async getActiveTournamentsByGuild(guildId: string) {
        try {
            const where: any = {
                status: "registration" // Chỉ lấy tournaments đang đăng ký
            };
            
            // Nếu guildId không phải "*", thêm filter guildId
            if (guildId !== "*") {
                where.guildId = guildId;
            }

            const tournaments = await prisma.tournament.findMany({
                where,
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return tournaments;
        } catch (error) {
            console.error("Error getting active tournaments:", error);
            return [];
        }
    }

    /**
     * Lấy tất cả active tournaments từ mọi guild
     */
    static async getAllActiveTournaments() {
        try {
            const tournaments = await prisma.tournament.findMany({
                where: {
                    status: "registration" // Chỉ lấy tournaments đang đăng ký
                },
                include: {
                    participants: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return tournaments;
        } catch (error) {
            console.error("Error getting all active tournaments:", error);
            return [];
        }
    }
} 