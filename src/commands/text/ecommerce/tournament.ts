import { EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { addMoney, getBalance, subtractMoney, recordGame } from "@/utils/ecommerce";

// Global client reference để gửi thông báo
let globalClient: any = null;

// Hàm để set client reference
export function setTournamentClient(client: any) {
    globalClient = client;
}

// Interface cho Tournament
interface Tournament {
    id: string;
    name: string;
    description: string;
    entryFee: number;
    prizePool: number;
    maxParticipants: number;
    currentParticipants: number;
    participants: string[];
    status: "registration" | "active" | "completed";
    startTime: string;
    endTime: string;
    createdBy: string;
    guildId: string;
    channelId: string; // Thêm channel ID để gửi thông báo
    winner?: string;
}

// Lưu trữ tournaments
export const tournaments: Record<string, Tournament> = {};

// Hệ thống kiểm tra tournament định kỳ
let tournamentCheckInterval: NodeJS.Timeout | null = null;

function generateTournamentId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Khởi tạo hệ thống kiểm tra tournament
function initTournamentChecker() {
    if (tournamentCheckInterval) {
        clearInterval(tournamentCheckInterval);
    }

    // Kiểm tra mỗi 30 giây
    tournamentCheckInterval = setInterval(async () => {
        const now = new Date();

        for (const [tournamentId, tournament] of Object.entries(tournaments)) {
            if (tournament.status === "registration") {
                const endTime = new Date(tournament.endTime);
                if (now >= endTime) {
                    console.log(`Tournament ${tournamentId} đã hết thời gian, đang kết thúc...`);
                    await startTournament(tournamentId);
                }
            }
        }
    }, 30000); // 30 giây
}

// Khởi tạo ngay khi module được load
initTournamentChecker();

function createTournamentEmbed(tournament: Tournament): EmbedBuilder {
    const statusEmoji = tournament.status === "registration" ? "📝" :
        tournament.status === "active" ? "⚔️" : "🏆";
    const statusText = tournament.status === "registration" ? "Đăng ký" :
        tournament.status === "active" ? "Đang diễn ra" : "Hoàn thành";

    const embed = new EmbedBuilder()
        .setTitle(`${statusEmoji} ${tournament.name}`)
        .setDescription(tournament.description)
        .addFields(
            { name: "💰 Phí đăng ký", value: `${tournament.entryFee.toLocaleString()} AniCoin`, inline: true },
            { name: "🏆 Giải thưởng", value: `${tournament.prizePool.toLocaleString()} AniCoin`, inline: true },
            { name: "👥 Người tham gia", value: `${tournament.currentParticipants}/${tournament.maxParticipants}`, inline: true },
            { name: "📅 Bắt đầu", value: `<t:${Math.floor(new Date(tournament.startTime).getTime() / 1000)}:R>`, inline: true },
            { name: "⏰ Kết thúc", value: `<t:${Math.floor(new Date(tournament.endTime).getTime() / 1000)}:R>`, inline: true },
            { name: "📊 Trạng thái", value: statusText, inline: true },
        )
        .setColor(tournament.status === "registration" ? "#00ff00" :
            tournament.status === "active" ? "#ffaa00" : "#ff0000")
        .setTimestamp();

    if (tournament.winner) {
        embed.addFields({ name: "👑 Người chiến thắng", value: `<@${tournament.winner}>`, inline: false });
    }

    return embed;
}

function createHelpEmbed(message: Message): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("🏆 Tournament System - Hướng dẫn")
        .setDescription(
            "**Tạo tournament:** `n.tournament create <tên> <mô tả> <phí đăng ký> <giải thưởng> <số người tham gia> <thời gian (phút)>`\n" +
            "**Tham gia:** `n.tournament join <ID>`\n" +
            "**Xem danh sách:** `n.tournament list`\n" +
            "**Xem chi tiết:** `n.tournament info <ID>`\n" +
            "**Kết thúc sớm:** `n.tournament end <ID>`\n\n" +
            "**Ví dụ:**\n" +
            "• `n.tournament create \"Giải đấu mùa hè\" \"Giải đấu thường niên\" 1000 50000 8 30`\n" +
            "• `n.tournament join abc123`\n" +
            "• `n.tournament end abc123`\n\n" +
            "**Lưu ý:**\n" +
            "• Tournament sẽ tự động bắt đầu sau thời gian đăng ký\n" +
            "• Người chiến thắng sẽ được chọn ngẫu nhiên\n" +
            "• Giải thưởng sẽ được trao tự động\n" +
            "• Có thể kết thúc sớm bằng lệnh `end` (chỉ người tạo)"
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
            case "help":
                const helpEmbed = createHelpEmbed(message);
                return message.reply({ embeds: [helpEmbed] });
            default:
                return message.reply("❌ Lệnh không hợp lệ! Dùng `n.tournament help` để xem hướng dẫn.");
        }
    },
});

async function createTournament(message: Message, args: string[]) {
    if (args.length < 4) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.tournament create <tên> <mô tả> <phí đăng ký> <giải thưởng> <số người tham gia> <thời gian (phút)>`");
    }

    // Xử lý tên và mô tả có thể có nhiều từ
    let name = args[0];
    let description = args[1];
    let currentIndex = 2;

    // Nếu tên có dấu ngoặc kép, tìm phần cuối
    if (name.startsWith('"') && !name.endsWith('"')) {
        for (let i = 1; i < args.length; i++) {
            name += " " + args[i];
            if (args[i].endsWith('"')) {
                name = name.slice(1, -1); // Bỏ dấu ngoặc kép
                currentIndex = i + 1;
                break;
            }
        }
    } else if (name.startsWith('"') && name.endsWith('"')) {
        name = name.slice(1, -1); // Bỏ dấu ngoặc kép
    }

    // Nếu mô tả có dấu ngoặc kép, tìm phần cuối
    if (currentIndex < args.length) {
        description = args[currentIndex];
        if (description.startsWith('"') && !description.endsWith('"')) {
            for (let i = currentIndex + 1; i < args.length; i++) {
                description += " " + args[i];
                if (args[i].endsWith('"')) {
                    description = description.slice(1, -1); // Bỏ dấu ngoặc kép
                    currentIndex = i + 1;
                    break;
                }
            }
        } else if (description.startsWith('"') && description.endsWith('"')) {
            description = description.slice(1, -1); // Bỏ dấu ngoặc kép
            currentIndex++;
        } else {
            currentIndex++;
        }
    }

    // Lấy các tham số số
    const entryFee = parseInt(args[currentIndex]);
    const prizePool = parseInt(args[currentIndex + 1]);
    const maxParticipants = parseInt(args[currentIndex + 2]);
    const durationMinutes = parseInt(args[currentIndex + 3]) || 60;

    // Debug: Kiểm tra từng tham số
    if (isNaN(entryFee)) {
        return message.reply(`❌ Phí đăng ký không hợp lệ: "${args[currentIndex]}"`);
    }
    if (isNaN(prizePool)) {
        return message.reply(`❌ Giải thưởng không hợp lệ: "${args[currentIndex + 1]}"`);
    }
    if (isNaN(maxParticipants)) {
        return message.reply(`❌ Số người tham gia không hợp lệ: "${args[currentIndex + 2]}"`);
    }
    if (isNaN(durationMinutes)) {
        return message.reply(`❌ Thời gian không hợp lệ: "${args[currentIndex + 3]}"`);
    }

    if (entryFee < 0 || prizePool < 0 || maxParticipants < 2) {
        return message.reply("❌ Phí đăng ký, giải thưởng phải >= 0 và số người tham gia >= 2!");
    }

    const tournamentId = generateTournamentId();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const tournament: Tournament = {
        id: tournamentId,
        name,
        description,
        entryFee,
        prizePool,
        maxParticipants,
        currentParticipants: 0,
        participants: [],
        status: "registration",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        createdBy: message.author.id,
        guildId: message.guildId!,
        channelId: message.channelId,
    };

    tournaments[tournamentId] = tournament;

    const embed = createTournamentEmbed(tournament);
    embed.setFooter({ text: `ID: ${tournamentId} | Tạo bởi ${message.author.username}` });

    await message.reply({ embeds: [embed] });

    console.log(`Tournament ${tournamentId} đã được tạo, sẽ kết thúc lúc: ${endTime.toLocaleString()}`);
}

async function joinTournament(message: Message, args: string[]) {
    if (args.length === 0) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament join <ID>`");
    }

    const tournamentId = args[0];
    const tournament = tournaments[tournamentId];

    if (!tournament) {
        return message.reply("❌ Tournament không tồn tại!");
    }

    if (tournament.status !== "registration") {
        return message.reply("❌ Tournament đã đóng đăng ký!");
    }

    if (tournament.participants.includes(message.author.id)) {
        return message.reply("❌ Bạn đã đăng ký tham gia rồi!");
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
        return message.reply("❌ Tournament đã đầy!");
    }

    const balance = await getBalance(message.author.id, tournament.guildId);
    if (balance < tournament.entryFee) {
        return message.reply(`❌ Bạn không đủ AniCoin! Cần: ${tournament.entryFee.toLocaleString()}, Có: ${balance.toLocaleString()}`);
    }

    // Trừ phí đăng ký
    await subtractMoney(message.author.id, tournament.guildId, tournament.entryFee, `Tournament entry: ${tournament.name}`);

    // Thêm vào danh sách tham gia
    tournament.participants.push(message.author.id);
    tournament.currentParticipants++;

    const embed = new EmbedBuilder()
        .setTitle("✅ Đăng ký thành công!")
        .setDescription(`Bạn đã tham gia **${tournament.name}**`)
        .addFields(
            { name: "💰 Phí đã trừ", value: `${tournament.entryFee.toLocaleString()} AniCoin`, inline: true },
            { name: "👥 Người tham gia", value: `${tournament.currentParticipants}/${tournament.maxParticipants}`, inline: true },
        )
        .setColor("#00ff00")
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function listTournaments(message: Message) {
    const guildTournaments = Object.values(tournaments).filter(t => t.guildId === message.guildId);

    if (guildTournaments.length === 0) {
        return message.reply("📝 Không có tournament nào đang diễn ra!");
    }

    const embed = new EmbedBuilder()
        .setTitle("🏆 Danh sách Tournament")
        .setDescription(guildTournaments.map(t =>
            `**${t.name}** (ID: ${t.id})\n` +
            `📊 ${t.currentParticipants}/${t.maxParticipants} người tham gia | ` +
            `💰 ${t.entryFee.toLocaleString()} AniCoin | ` +
            `🏆 ${t.prizePool.toLocaleString()} AniCoin\n` +
            `📅 <t:${Math.floor(new Date(t.endTime).getTime() / 1000)}:R>\n`
        ).join("\n"))
        .setColor(config.embedColor)
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function showTournamentInfo(message: Message, args: string[]) {
    if (args.length === 0) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament info <ID>`");
    }

    const tournamentId = args[0];
    const tournament = tournaments[tournamentId];

    if (!tournament) {
        return message.reply("❌ Tournament không tồn tại!");
    }

    const embed = createTournamentEmbed(tournament);

    if (tournament.participants.length > 0) {
        embed.addFields({
            name: "👥 Danh sách tham gia",
            value: tournament.participants.map(p => `<@${p}>`).join(", "),
            inline: false
        });
    }

    await message.reply({ embeds: [embed] });
}

async function startTournament(tournamentId: string) {
    const tournament = tournaments[tournamentId];
    if (!tournament || tournament.status !== "registration") return;

    console.log(`Bắt đầu kết thúc tournament: ${tournamentId}`);

    if (tournament.currentParticipants < 2) {
        tournament.status = "completed";
        console.log(`Tournament ${tournamentId} bị hủy do không đủ người tham gia`);

        // Hoàn tiền cho người tham gia
        for (const participantId of tournament.participants) {
            await addMoney(participantId, tournament.guildId, tournament.entryFee, `Tournament cancelled: ${tournament.name}`);
        }

        // Thông báo hủy tournament
        try {
            if (globalClient) {
                const channel = globalClient.channels.cache.get(tournament.channelId);
                if (channel && channel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setTitle("❌ Tournament bị hủy")
                        .setDescription(`**${tournament.name}** đã bị hủy do không đủ người tham gia.\n` +
                            `👥 Số người tham gia: ${tournament.currentParticipants}/${tournament.maxParticipants}\n` +
                            `💰 Phí đăng ký đã được hoàn lại cho tất cả người tham gia.`)
                        .setColor("#ff0000")
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                    console.log(`Đã gửi thông báo hủy tournament đến channel ${tournament.channelId}`);
                }
            }
        } catch (error) {
            console.error("Error sending tournament cancellation message:", error);
        }
        
        return;
    }

    tournament.status = "active";

    // Chọn người chiến thắng ngẫu nhiên
    const winnerIndex = Math.floor(Math.random() * tournament.participants.length);
    const winner = tournament.participants[winnerIndex];

    // Trao giải thưởng
    await addMoney(winner, tournament.guildId, tournament.prizePool, `Tournament winner: ${tournament.name}`);

    // Cập nhật tournament
    tournament.winner = winner;
    tournament.status = "completed";

    console.log(`Tournament ${tournamentId} kết thúc! Người chiến thắng: ${winner}, Giải thưởng: ${tournament.prizePool}`);

    // Ghi lại lịch sử
    await recordGame(
        winner,
        tournament.guildId,
        "tournament_win",
        0,
        tournament.prizePool,
        "win",
    );

    // Thông báo người chiến thắng
    try {
        if (globalClient) {
            const channel = globalClient.channels.cache.get(tournament.channelId);
            if (channel && channel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle("🏆 Tournament kết thúc!")
                    .setDescription(`**${tournament.name}** đã kết thúc!\n\n` +
                        `👑 **Người chiến thắng:** <@${winner}>\n` +
                        `🏆 **Giải thưởng:** ${tournament.prizePool.toLocaleString()} AniCoin\n` +
                        `👥 **Số người tham gia:** ${tournament.currentParticipants}/${tournament.maxParticipants}\n\n` +
                        `🎉 Chúc mừng người chiến thắng!`)
                    .setColor("#00ff00")
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
                console.log(`Đã gửi thông báo người chiến thắng đến channel ${tournament.channelId}`);
            }
        }
    } catch (error) {
        console.error("Error sending tournament winner message:", error);
    }
}

async function endTournament(message: Message, args: string[]) {
    if (args.length === 0) {
        return message.reply("❌ Thiếu ID tournament! Dùng: `n.tournament end <ID>`");
    }

    const tournamentId = args[0];
    const tournament = tournaments[tournamentId];

    if (!tournament) {
        return message.reply("❌ Tournament không tồn tại!");
    }

    if (tournament.status !== "registration") {
        return message.reply("❌ Tournament đã kết thúc rồi!");
    }

    // Kiểm tra quyền (chỉ người tạo hoặc admin mới có thể kết thúc)
    if (tournament.createdBy !== message.author.id) {
        return message.reply("❌ Bạn không có quyền kết thúc tournament này!");
    }

    // Kết thúc tournament
    await startTournament(tournamentId);

    const embed = new EmbedBuilder()
        .setTitle("🏆 Tournament đã kết thúc!")
        .setDescription(`**${tournament.name}** đã được kết thúc thủ công.`)
        .setColor("#ff0000")
        .setTimestamp();

    await message.reply({ embeds: [embed] });
} 