import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { EcommerceService } from "@/utils/ecommerce-db";
import { TournamentService, saveTournamentMessage } from "@/utils/tournament";
import { TournamentCleanupJob } from "@/utils/tournament-cleanup";

// Global client reference để gửi thông báo
let globalClient: any = null;

// Global storage cho winnerCount của tournaments
const tournamentWinnerCounts = new Map<string, number>();

// Hàm để set client reference
export function setTournamentClient(client: any) {
    globalClient = client;
    // Lưu vào global reference để tournament-cleanup có thể sử dụng
    (globalThis as any).tournamentClient = client;
}

// Hệ thống kiểm tra tournament định kỳ
let tournamentCheckInterval: NodeJS.Timeout | null = null;

// Khởi tạo hệ thống kiểm tra tournament
function initTournamentChecker() {
    if (tournamentCheckInterval) {
        clearInterval(tournamentCheckInterval);
    }

    // Kiểm tra mỗi 30 giây
    tournamentCheckInterval = setInterval(async () => {
        const now = new Date();
        console.log(`[Tournament Checker] Đang kiểm tra tournaments...`);

        try {
            const expiredTournaments = await TournamentService.getExpiredTournaments();
            
            for (const tournament of expiredTournaments) {
                console.log(`Tournament ${tournament.id} đã hết thời gian, đang kết thúc...`);
                await startTournament(tournament.id);
            }
        } catch (error) {
            console.error("Error checking tournaments:", error);
        }
    }, 30000); // 30 giây
}

// Khởi tạo ngay khi module được load
initTournamentChecker();

export function createTournamentEmbed(tournament: any): EmbedBuilder {
    const statusEmoji = tournament.status === "registration" ? "📝" :
        tournament.status === "active" ? "⚔️" : "🏆";
    const statusText = tournament.status === "registration" ? "Đăng ký" :
        tournament.status === "active" ? "Đang diễn ra" : "Hoàn thành";

    // Chọn format thời gian dựa trên trạng thái
    const timeFormat = tournament.status === "completed" ? "F" : "R"; // F = absolute, R = relative

    const embed = new EmbedBuilder()
        .setTitle(`${statusEmoji} ${tournament.name}`)
        .setDescription(tournament.description)
        .addFields(
            { name: "💰 Phí đăng ký", value: `${tournament.entryFee.toLocaleString()} AniCoin`, inline: true },
            { name: "🏆 Giải thưởng", value: `${tournament.prizePool.toLocaleString()} AniCoin`, inline: true },
            { name: "👥 Người tham gia", value: `${tournament.currentParticipants}/${tournament.maxParticipants}`, inline: true },
            { name: "📅 Bắt đầu", value: `<t:${Math.floor(new Date(tournament.startTime).getTime() / 1000)}:${timeFormat}>`, inline: true },
            { name: "⏰ Kết thúc", value: `<t:${Math.floor(new Date(tournament.endTime).getTime() / 1000)}:${timeFormat}>`, inline: true },
            { name: "📊 Trạng thái", value: statusText, inline: true },
        )
        .setColor(tournament.status === "registration" ? "#00ff00" :
            tournament.status === "active" ? "#ffaa00" : "#ff0000")
        .setTimestamp();

    if (tournament.winnerId) {
        embed.addFields({ name: "👑 Người chiến thắng", value: `<@${tournament.winnerId}>`, inline: false });
    }

    return embed;
}

function createHelpEmbed(message: Message): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("🏆 Tournament System - Hướng dẫn")
        .setDescription(
            "**Tạo tournament:** `n.tournament create_<tên>_<mô tả>_<phí đăng ký>_<giải thưởng>_<số người tham gia>_<thời gian (phút)>_<số người nhận thưởng>` (chỉ ADMIN)\n" +
            "**Tham gia:** `n.tournament join <ID>`\n" +
            "**Xem danh sách:** `n.tournament list`\n" +
            "**Xem chi tiết:** `n.tournament info <ID>`\n" +
            "**Kết thúc sớm:** `n.tournament end <ID>` (chỉ người tạo)\n" +
            "**Force kết thúc:** `n.tournament force <ID>` (admin)\n" +
            "**Cleanup:** `n.tournament cleanup` (admin)\n" +
            "**Restart job:** `n.tournament restart` (admin)\n\n" +
            "**Ví dụ:**\n" +
            "• `n.tournament create_Giải đấu mùa hè_Giải đấu thường niên_1000_50000_8_30_3` (3 người nhận thưởng)\n" +
            "• `n.tournament create_Tournament Test_Test tự động kết thúc_100_1000_2_1_1` (1 người nhận thưởng)\n" +
            "• `n.tournament join abc123`\n" +
            "• `n.tournament end abc123`\n" +
            "• `n.tournament force abc123`\n\n" +
            "**Lưu ý:**\n" +
            "• Sử dụng dấu gạch dưới (_) để phân cách các tham số\n" +
            "• Mô tả có thể chứa khoảng trắng\n" +
            "• Tournament sẽ tự động bắt đầu sau thời gian đăng ký\n" +
            "• Người chiến thắng sẽ được chọn ngẫu nhiên\n" +
            "• Giải thưởng sẽ được chia đều cho số người nhận thưởng\n" +
            "• Số người nhận thưởng mặc định là 1 nếu không chỉ định\n" +
            "• Có thể kết thúc sớm bằng lệnh `end` (chỉ người tạo)\n" +
            "• Dùng `force` để force kết thúc nếu auto-end không hoạt động\n" +
            "• **Chỉ ADMIN mới có thể tạo tournament**"
        )
        .setColor(config.embedColor)
        .setTimestamp();

    return embed;
}

export default Bot.createCommand({
    structure: {
        name: "tournament",
        aliases: ["tour", "t"],
    },
    options: {
        cooldown: 3000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const args = message.content.split(" ").slice(1);
        const guildId = message.guildId!;
        const userId = message.author.id;

        if (args.length === 0) {
            const helpEmbed = createHelpEmbed(message);
            return message.reply({ embeds: [helpEmbed] });
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "create":
                return await createTournament(message, args.slice(1));
            case "join":
                return await joinTournament(message, args.slice(1));
            case "list":
                return await listTournaments(message);
            case "info":
                return await showTournamentInfo(message, args.slice(1));
            case "end":
                return await endTournament(message, args.slice(1));
            case "force":
                return await forceEndTournament(message, args.slice(1));
            case "cleanup":
            case "dọn dẹp":
                return await cleanupTournaments(message);
            case "restart":
            case "khởi động lại":
                return await restartCleanupJob(message);
            case "help":
                const helpEmbed = createHelpEmbed(message);
                return message.reply({ embeds: [helpEmbed] });
            default:
                // Kiểm tra xem có phải format create_... không
                if (subCommand.startsWith("create_")) {
                    const createArgs = message.content.split(" ").slice(1); // Lấy tất cả arguments
                    return await createTournament(message, createArgs);
                }
                return message.reply("❌ Lệnh không hợp lệ! Dùng `n.tournament help` để xem hướng dẫn.");
        }
    },
});

async function createTournament(message: Message, args: string[]) {
    // Xử lý format: create_tên_mô tả_phí_giải thưởng_số người_thời gian
    let fullCommand = args.join(" ");
    
    // Kiểm tra xem có phải format create_... không
    if (!fullCommand.startsWith("create_")) {
        return message.reply("❌ Format không đúng! Dùng: `n.tournament create_<tên>_<mô tả>_<phí>_<giải thưởng>_<số người>_<thời gian>`");
    }

    // Split theo dấu gạch dưới
    const parts = fullCommand.split("_");
    
    if (parts.length < 7) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.tournament create_<tên>_<mô tả>_<phí>_<giải thưởng>_<số người>_<thời gian>_<số người nhận thưởng>`");
    }

    // Xử lý mô tả có thể chứa khoảng trắng
    const name = parts[1];
    let description = parts[2];
    let entryFee = parseInt(parts[3]);
    let prizePool = parseInt(parts[4]);
    let maxParticipants = parseInt(parts[5]);
    let durationMinutes = parseInt(parts[6]) || 60;
    let winnerCount = parseInt(parts[7]) || 1;

    // Nếu có nhiều hơn 8 parts, có thể mô tả chứa khoảng trắng
    if (parts.length > 8) {
        // Tìm vị trí của các số cuối
        const lastNumberIndex = parts.findIndex((part, index) => {
            if (index < 2) return false; // Bỏ qua "create" và name
            const num = parseInt(part);
            return !isNaN(num) && index >= parts.length - 5; // 5 số cuối
        });

        if (lastNumberIndex >= 3) {
            // Ghép lại mô tả từ parts[2] đến parts[lastNumberIndex-1]
            description = parts.slice(2, lastNumberIndex).join(" ");
            entryFee = parseInt(parts[lastNumberIndex]);
            prizePool = parseInt(parts[lastNumberIndex + 1]);
            maxParticipants = parseInt(parts[lastNumberIndex + 2]);
            durationMinutes = parseInt(parts[lastNumberIndex + 3]) || 60;
            winnerCount = parseInt(parts[lastNumberIndex + 4]) || 1;
        }
    }

    // Kiểm tra các tham số
    if (!name || !description) {
        return message.reply("❌ Tên và mô tả không được để trống!");
    }

    if (isNaN(entryFee)) {
        return message.reply(`❌ Phí đăng ký không hợp lệ: "${parts[3]}"`);
    }
    if (isNaN(prizePool)) {
        return message.reply(`❌ Giải thưởng không hợp lệ: "${parts[4]}"`);
    }
    if (isNaN(maxParticipants)) {
        return message.reply(`❌ Số người tham gia không hợp lệ: "${parts[5]}"`);
    }
    if (isNaN(durationMinutes)) {
        return message.reply(`❌ Thời gian không hợp lệ: "${parts[6]}"`);
    }

    if (entryFee < 0 || prizePool < 0 || maxParticipants < 2) {
        return message.reply("❌ Phí đăng ký, giải thưởng phải >= 0 và số người tham gia >= 2!");
    }

    if (winnerCount < 1 || winnerCount > maxParticipants) {
        return message.reply("❌ Số người nhận thưởng phải >= 1 và <= số người tham gia!");
    }

    try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        const tournament = await TournamentService.createTournament({
            name,
            description,
            entryFee,
            prizePool,
            maxParticipants,
            startTime,
            endTime,
            createdBy: message.author.id,
            guildId: message.guildId!,
            channelId: message.channelId
        });

        const embed = createTournamentEmbed(tournament);
        embed.setDescription(`✅ **Tournament đã được tạo thành công bởi ADMIN!**\n\n${tournament.description}`);
        
        // Thêm thông tin về số người nhận thưởng
        if (winnerCount > 1) {
            const prizePerWinner = Math.floor(prizePool / winnerCount);
            embed.addFields({
                name: "🏆 Thông tin giải thưởng",
                value: `Số người nhận thưởng: **${winnerCount}**\nGiải thưởng mỗi người: **${prizePerWinner.toLocaleString()}** AniCoin`,
                inline: false
            });
        }

        // Tạo nút join hoặc nút đã kết thúc
        let row;
        if (tournament.status === "registration") {
            const joinButton = new ButtonBuilder()
                .setCustomId(JSON.stringify({
                    n: "TournamentJoin",
                    d: { tournamentId: tournament.id }
                }))
                .setLabel("Tham gia ngay")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🏆");
            row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);
        } else {
            const endedButton = new ButtonBuilder()
                .setCustomId("tournament_ended")
                .setLabel("Đã kết thúc")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);
            row = new ActionRowBuilder<ButtonBuilder>().addComponents(endedButton);
        }

        const reply = await message.reply({ 
            embeds: [embed],
            components: [row]
        });

        // Lưu winnerCount cho tournament này
        tournamentWinnerCounts.set(tournament.id, winnerCount);
        
        // Lưu message ID vào DB để cập nhật sau này
        await saveTournamentMessage(tournament.id, reply.id, message.channelId, message.guildId!);
    } catch (error: any) {
        console.error("Error creating tournament:", error);
        await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi tạo tournament!"}`);
    }
}

async function joinTournament(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament join <ID>`");
    }

    const tournamentId = args[0];

    try {
        // Kiểm tra tournament
        const tournament = await TournamentService.getTournamentById(tournamentId);
        if (!tournament) {
            return message.reply("❌ Tournament không tồn tại!");
        }

        if (tournament.guildId !== message.guildId) {
            return message.reply("❌ Tournament này không thuộc server này!");
        }

        // Kiểm tra trạng thái tournament
        if (tournament.status !== "registration") {
            if (tournament.status === "completed") {
                return message.reply("❌ Tournament này đã kết thúc!");
            } else {
                return message.reply("❌ Tournament này không còn nhận đăng ký!");
            }
        }

        // Kiểm tra số người tham gia
        if (tournament.currentParticipants >= tournament.maxParticipants) {
            return message.reply(`❌ Tournament này đã đầy! (${tournament.currentParticipants}/${tournament.maxParticipants})`);
        }

        // Kiểm tra số dư
        const balance = await EcommerceService.getBalance(message.author.id, message.guildId!);
        if (balance < tournament.entryFee) {
            return message.reply(`❌ Không đủ tiền! Cần ${tournament.entryFee} AniCoin, số dư: ${balance} AniCoin`);
        }

        // Tham gia tournament
        await TournamentService.joinTournament(tournamentId, message.author.id, message.guildId!);
        
        // Trừ phí đăng ký
        await EcommerceService.subtractMoney(message.author.id, message.guildId!, tournament.entryFee, `Tournament entry fee - ${tournament.name}`);

        const embed = new EmbedBuilder()
            .setTitle("✅ Tham gia thành công!")
            .setDescription(`**${message.author.username}** đã tham gia tournament **${tournament.name}**\nPhí đăng ký: ${tournament.entryFee} AniCoin`)
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        console.error("Error joining tournament:", error);
        
        // Xử lý các lỗi cụ thể
        if (error.message.includes("đã tham gia")) {
            await message.reply("❌ Bạn đã tham gia tournament này rồi!");
        } else if (error.message.includes("đã đóng đăng ký")) {
            await message.reply("❌ Tournament này đã đóng đăng ký!");
        } else if (error.message.includes("đã đầy")) {
            await message.reply("❌ Tournament này đã đầy người tham gia!");
        } else {
            await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi tham gia tournament!"}`);
        }
    }
}

async function listTournaments(message: Message) {
    try {
        const tournaments = await TournamentService.getActiveTournamentsByGuild(message.guildId!);

        if (tournaments.length === 0) {
            return message.reply("📝 Không có tournament nào đang hoạt động trong server này!");
        }

        const embed = new EmbedBuilder()
            .setTitle("🏆 Danh sách Tournament")
            .setDescription(tournaments.map((t: any) => 
                `**${t.name}** (${t.currentParticipants}/${t.maxParticipants})\n` +
                `💰 ${t.entryFee} AniCoin | 🏆 ${t.prizePool} AniCoin\n` +
                `📅 <t:${Math.floor(new Date(t.endTime).getTime() / 1000)}:R>\n` +
                `ID: \`${t.id}\``
            ).join("\n\n"))
            .setColor(config.embedColor)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error("Error listing tournaments:", error);
        await message.reply("❌ Đã xảy ra lỗi khi lấy danh sách tournament!");
    }
}

async function showTournamentInfo(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament info <ID>`");
    }

    const tournamentId = args[0];

    try {
        const tournament = await TournamentService.getTournamentById(tournamentId);
        if (!tournament) {
            return message.reply("❌ Tournament không tồn tại!");
        }

        if (tournament.guildId !== message.guildId) {
            return message.reply("❌ Tournament này không thuộc server này!");
        }

        const embed = createTournamentEmbed(tournament);
        
        if (tournament.participants.length > 0) {
            embed.addFields({
                name: "👥 Danh sách tham gia",
                value: tournament.participants.map((p: any) => `<@${p.userId}>`).join(", "),
                inline: false
            });
        }

        // Tạo nút join hoặc nút đã kết thúc
        let components = [];
        if (tournament.status === "registration") {
            const joinButton = new ButtonBuilder()
                .setCustomId(JSON.stringify({
                    n: "TournamentJoin",
                    d: { tournamentId: tournament.id }
                }))
                .setLabel("Tham gia ngay")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🏆");
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton);
            components.push(row);
        } else {
            const endedButton = new ButtonBuilder()
                .setCustomId("tournament_ended")
                .setLabel("Đã kết thúc")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(endedButton);
            components.push(row);
        }

        const reply = await message.reply({ 
            embeds: [embed],
            components: components.length > 0 ? components : undefined
        });

        // Lưu message ID vào DB để cập nhật sau này (chỉ khi tournament đang đăng ký)
        if (tournament.status === "registration") {
            await saveTournamentMessage(tournament.id, reply.id, message.channelId, message.guildId!);
        }
    } catch (error) {
        console.error("Error showing tournament info:", error);
        await message.reply("❌ Đã xảy ra lỗi khi lấy thông tin tournament!");
    }
}

async function startTournament(tournamentId: string) {
    try {
        const winnerCount = tournamentWinnerCounts.get(tournamentId) || 1;
        const result = await TournamentService.startTournament(tournamentId, winnerCount);
        const tournament = await TournamentService.getTournamentById(tournamentId);
        
        if (!tournament) return;

        // Gửi thông báo
        if (globalClient && tournament.channelId) {
            try {
                const channel = await globalClient.channels.fetch(tournament.channelId);
                if (channel) {
                    let description = `Tournament **${tournament.name}** đã kết thúc!\n\n`;
                    
                    if (result && result.winners && result.winners.length > 0) {
                        if (result.winners.length === 1) {
                            description += `👑 **Người chiến thắng:** <@${result.winners[0].userId}>\n💰 **Giải thưởng:** ${tournament.prizePool} AniCoin`;
                        } else {
                            description += `🏆 **Người chiến thắng (${result.winners.length}):**\n`;
                            result.winners.forEach((winner: any, index: number) => {
                                const prize = index === 0 ? result.prizePerWinner + (Number(tournament.prizePool) - (result.prizePerWinner * result.winners.length)) : result.prizePerWinner;
                                description += `${index + 1}. <@${winner.userId}> - ${prize.toLocaleString()} AniCoin\n`;
                            });
                        }
                    } else {
                        description += "Không có người tham gia";
                    }

                    const embed = new EmbedBuilder()
                        .setTitle("🏆 Tournament Kết Thúc!")
                        .setDescription(description)
                        .setColor("#ffaa00")
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error("Error sending tournament notification:", error);
            }
        }
    } catch (error: any) {
        console.error("Error starting tournament:", error);
        
        // Xử lý trường hợp không đủ người tham gia
        if (error.message === "INSUFFICIENT_PARTICIPANTS") {
            const tournament = await TournamentService.getTournamentById(tournamentId);
            if (tournament && globalClient && tournament.channelId) {
                try {
                    const channel = await globalClient.channels.fetch(tournament.channelId);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setTitle("🏆 Tournament Đã Kết Thúc!")
                            .setDescription(`Tournament **${tournament.name}** đã kết thúc!\n\n❌ **Không đủ người tham gia** (cần ít nhất 2 người)\n💰 **Tiền giải thưởng đã được trả lại cho người tạo**`)
                            .setColor("#ff0000")
                            .setTimestamp();

                        await channel.send({ embeds: [embed] });
                    }
                } catch (channelError) {
                    console.error("Error sending insufficient participants notification:", channelError);
                }
            }
        }
    }
}

async function endTournament(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament end <ID>`");
    }

    const tournamentId = args[0];

    try {
        const winnerCount = tournamentWinnerCounts.get(tournamentId) || 1;
        const result = await TournamentService.endTournament(tournamentId, message.author.id, winnerCount);
        const tournament = await TournamentService.getTournamentById(tournamentId);
        
        if (!tournament) {
            return message.reply("❌ Tournament không tồn tại!");
        }

        let description = `Tournament **${tournament.name}** đã được kết thúc sớm!\n\n`;
        
        if (result && result.winners && result.winners.length > 0) {
            if (result.winners.length === 1) {
                description += `👑 **Người chiến thắng:** <@${result.winners[0].userId}>\n💰 **Giải thưởng:** ${tournament.prizePool} AniCoin`;
            } else {
                description += `🏆 **Người chiến thắng (${result.winners.length}):**\n`;
                result.winners.forEach((winner: any, index: number) => {
                    const prize = index === 0 ? result.prizePerWinner + (Number(tournament.prizePool) - (result.prizePerWinner * result.winners.length)) : result.prizePerWinner;
                    description += `${index + 1}. <@${winner.userId}> - ${prize.toLocaleString()} AniCoin\n`;
                });
            }
        } else {
            description += "❌ **Không có người tham gia**\n💰 **Tiền giải thưởng đã được trả lại cho người tạo**";
        }

        const embed = new EmbedBuilder()
            .setTitle("🏆 Tournament Đã Kết Thúc!")
            .setDescription(description)
            .setColor(result && result.winners && result.winners.length > 0 ? "#ffaa00" : "#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        console.error("Error ending tournament:", error);
        await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi kết thúc tournament!"}`);
    }
}

async function forceEndTournament(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament force <ID>`");
    }

    const tournamentId = args[0];

    try {
        const winner = await TournamentService.forceEndTournament(tournamentId);
        const tournament = await TournamentService.getTournamentById(tournamentId);
        
        if (!tournament) {
            return message.reply("❌ Tournament không tồn tại!");
        }

        let description = `Tournament **${tournament.name}** đã được force kết thúc bởi admin!\n\n`;
        
        if (winner) {
            description += `👑 **Người chiến thắng:** <@${winner.userId}>\n💰 **Giải thưởng:** ${tournament.prizePool.toLocaleString()} AniCoin`;
        } else {
            description += "❌ **Không có người tham gia**\n💰 **Tiền giải thưởng đã được trả lại cho người tạo**";
        }

        const embed = new EmbedBuilder()
            .setTitle("🏆 Tournament Đã Bị Force Kết Thúc!")
            .setDescription(description)
            .setColor(winner ? "#ff0000" : "#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        console.error("Error force ending tournament:", error);
        await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi force kết thúc tournament!"}`);
    }
}

async function cleanupTournaments(message: Message) {
    try {
        // Chạy cleanup thủ công
        await TournamentCleanupJob.runManualCleanup();
        
        const embed = new EmbedBuilder()
            .setTitle("🧹 Tournament Cleanup")
            .setDescription("Đã chạy cleanup tournaments hết hạn thành công!")
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        console.error("Error running tournament cleanup:", error);
        await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi chạy cleanup!"}`);
    }
}

async function restartCleanupJob(message: Message) {
    try {
        // Dừng job cũ
        TournamentCleanupJob.stop();
        
        // Khởi động lại job
        TournamentCleanupJob.start();
        
        const embed = new EmbedBuilder()
            .setTitle("🔄 Tournament Cleanup Job Restarted")
            .setDescription("Đã khởi động lại job cleanup tournaments thành công!")
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error: any) {
        console.error("Error restarting tournament cleanup job:", error);
        await message.reply(`❌ ${error.message || "Đã xảy ra lỗi khi khởi động lại job!"}`);
    }
} 