import { EmbedBuilder, Message, User } from "discord.js";

import { Bot } from "@/classes";
import { addMoney, getBalance, subtractMoney } from "@/utils/ecommerce";

const maxBet = 300000;
const hitEmoji = "👊";
const standEmoji = "🛑";
const suits = ["♠️", "♥️", "♦️", "♣️"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Lưu trạng thái ván bài tạm thời trong RAM
const games: Record<string, any> = {};

function createDeck() {
    const deck: string[] = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push(`${value}${suit}`);
        }
    }
    return deck;
}

function draw(deck: string[]): string {
    const idx = Math.floor(Math.random() * deck.length);
    return deck.splice(idx, 1)[0];
}

function getPoints(hand: string[]): number {
    let points = 0;
    let aces = 0;
    for (const card of hand) {
        const value = card.slice(0, -2).replace(/[^A-Z0-9]/g, "");
        if (value === "A") {
            points += 11;
            aces++;
        } else if (["K", "Q", "J"].includes(value)) {
            points += 10;
        } else {
            points += parseInt(value);
        }
    }
    while (points > 21 && aces > 0) {
        points -= 10;
        aces--;
    }
    return points;
}

function handToString(hand: string[], hideFirst = false) {
    if (hideFirst) {
        return `?? ${hand.slice(1).join(" ")}`;
    }
    return hand.join(" ");
}

function getGameKey(userId: string, guildId: string) {
    return `${guildId}_${userId}`;
}

export default Bot.createCommand({
    structure: {
        name: "blackjack",
        aliases: ["bj", "21"],
    },
    options: {
        cooldown: 15000,
        permissions: ["SendMessages", "AddReactions", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);
        const gameKey = getGameKey(userId, guildId);

        // Nếu đã có ván đang chơi
        if (games[gameKey]) {
            const { player, dealer, bet, deck } = games[gameKey];
            await sendGameEmbed(message, player, dealer, bet, deck, false);
            return;
        }

        // Xử lý cược
        let bet: number | "all" = 1;
        if (args[0] && !isNaN(parseInt(args[0]))) bet = parseInt(args[0]);
        if (args[0] === "all") bet = "all";
        if (bet !== "all" && (bet <= 0 || isNaN(bet))) {
            return message.reply("Số tiền cược không hợp lệ!");
        }
        const balance = await getBalance(userId, guildId);
        if (bet === "all") bet = Math.min(balance, maxBet);
        if (typeof bet === "number" && bet > maxBet) bet = maxBet;
        if (balance < (bet as number)) {
            return message.reply(`Bạn không đủ AniCoin! Số dư: ${balance}`);
        }
        if ((bet as number) <= 0) {
            return message.reply("Bạn không thể cược 0 AniCoin!");
        }
        await subtractMoney(userId, guildId, bet as number, "Blackjack bet");

        // Khởi tạo ván bài
        const deck = createDeck();
        const player = [draw(deck), draw(deck)];
        const dealer = [draw(deck), draw(deck)];
        games[gameKey] = { player, dealer, bet, deck, finished: false };
        await sendGameEmbed(message, player, dealer, bet as number, deck, true);
    },
});

async function sendGameEmbed(
    message: Message,
    player: string[],
    dealer: string[],
    bet: number,
    deck: string[],
    first: boolean,
) {
    const userId = message.author.id;
    const guildId = message.guildId!;
    const gameKey = getGameKey(userId, guildId);
    const playerPoints = getPoints(player);
    const dealerPoints = getPoints(dealer);
    const embed = new EmbedBuilder()
        .setTitle("🃏 Blackjack")
        .setDescription(
            `**${message.author.username}**\n\n` +
                `Bài của bạn: ${handToString(player)} (**${playerPoints}**)\n` +
                `Bài của dealer: ${handToString(dealer, first)}\n` +
                `Cược: **${bet}** AniCoin\n\n` +
                (playerPoints === 21 ? "🎉 **Blackjack!** 🎉\n" : "") +
                (first && playerPoints < 21
                    ? `Bấm ${hitEmoji} để rút bài, ${standEmoji} để dừng`
                    : ""),
        )
        .setColor("#ffd93d")
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();

    const msg = await message.reply({ embeds: [embed] });

    if (first && playerPoints < 21) {
        await msg.react(hitEmoji);
        await msg.react(standEmoji);
        console.log("Setting up reaction collector for user:", userId);

        // Reaction Collector
        const filter = (reaction: any, user: User) => {
            return (
                [hitEmoji, standEmoji].includes(reaction.emoji.name) &&
                user.id === userId &&
                !user.bot
            );
        };

        const collector = msg.createReactionCollector({ filter, time: 60000 });

        collector.on("collect", async (reaction, user) => {
            console.log(`Collected reaction: ${reaction.emoji.name} from user: ${user.id}`);

            if (!games[gameKey] || games[gameKey].finished) {
                console.log("Game already finished or not found");
                return;
            }

            if (reaction.emoji.name === hitEmoji) {
                console.log("Hit action triggered");
                games[gameKey].player.push(draw(deck));
                const points = getPoints(games[gameKey].player);

                // Cập nhật embed hiện tại
                const updatedEmbed = new EmbedBuilder()
                    .setTitle("🃏 Blackjack")
                    .setDescription(
                        `**${message.author.username}**\n\n` +
                            `Bài của bạn: ${handToString(games[gameKey].player)} (**${points}**)\n` +
                            `Bài của dealer: ${handToString(games[gameKey].dealer, true)}\n` +
                            `Cược: **${bet}** AniCoin\n\n` +
                            (points === 21 ? "🎉 **Blackjack!** 🎉\n" : "") +
                            (points < 21
                                ? `Bấm ${hitEmoji} để rút bài, ${standEmoji} để dừng`
                                : points > 21
                                    ? "💥 **Bust! Quá 21 điểm!** 💥"
                                    : ""),
                    )
                    .setColor(points > 21 ? "#ff6b6b" : "#ffd93d")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setTimestamp();

                await msg.edit({ embeds: [updatedEmbed] });

                if (points > 21) {
                    await endGame(
                        message,
                        false,
                        bet,
                        games[gameKey].player,
                        games[gameKey].dealer,
                        false,
                        msg,
                    );
                    collector.stop();
                } else if (points === 21) {
                    await dealerTurn(
                        message,
                        bet,
                        deck,
                        games[gameKey].player,
                        games[gameKey].dealer,
                        msg,
                    );
                    collector.stop();
                }
            } else if (reaction.emoji.name === standEmoji) {
                console.log("Stand action triggered");

                // Cập nhật embed để hiển thị đang chờ dealer
                const waitingEmbed = new EmbedBuilder()
                    .setTitle("🃏 Blackjack")
                    .setDescription(
                        `**${message.author.username}**\n\n` +
                            `Bài của bạn: ${handToString(games[gameKey].player)} (**${getPoints(games[gameKey].player)}**)\n` +
                            `Bài của dealer: ${handToString(games[gameKey].dealer, true)}\n` +
                            `Cược: **${bet}** AniCoin\n\n` +
                            "⏳ **Dealer đang chơi...**",
                    )
                    .setColor("#ffd93d")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setTimestamp();

                await msg.edit({ embeds: [waitingEmbed] });
                await dealerTurn(
                    message,
                    bet,
                    deck,
                    games[gameKey].player,
                    games[gameKey].dealer,
                    msg,
                );
                collector.stop();
            }

            // Xóa reaction của user
            try {
                await reaction.users.remove(user.id);
            } catch (error) {
                console.log("Could not remove reaction:", error);
            }
        });

        collector.on("end", async () => {
            console.log("Collector ended");
            try {
                await msg.reactions.removeAll();
            } catch (error) {
                console.log("Could not remove reactions:", error);
            }
        });
    } else if (playerPoints > 21) {
        await endGame(message, false, bet, player, dealer);
    } else if (playerPoints === 21) {
        await dealerTurn(message, bet, deck, player, dealer);
    }
}

async function dealerTurn(
    message: Message,
    bet: number,
    deck: string[],
    player: string[],
    dealer: string[],
    msg?: Message,
) {
    while (getPoints(dealer) < 17) {
        dealer.push(draw(deck));
    }
    const playerPoints = getPoints(player);
    const dealerPoints = getPoints(dealer);
    let result: "win" | "lose" | "draw" = "draw";
    if (playerPoints > 21) result = "lose";
    else if (dealerPoints > 21) result = "win";
    else if (playerPoints > dealerPoints) result = "win";
    else if (playerPoints < dealerPoints) result = "lose";
    else result = "draw";
    await endGame(message, result === "win", bet, player, dealer, result === "draw", msg);
}

async function endGame(
    message: Message,
    win: boolean,
    bet: number,
    player: string[],
    dealer: string[],
    draw = false,
    msg?: Message,
) {
    const userId = message.author.id;
    const guildId = message.guildId!;
    const gameKey = getGameKey(userId, guildId);
    games[gameKey].finished = true;
    let reward = 0;
    let resultText = "";
    if (draw) {
        reward = bet;
        resultText = `🤝 **Hòa!** Bạn nhận lại ${bet} AniCoin.`;
        await addMoney(userId, guildId, bet, "Blackjack draw");
    } else if (win) {
        reward = bet * 2;
        resultText = `🎉 **Bạn thắng!** Nhận ${bet * 2} AniCoin!`;
        await addMoney(userId, guildId, bet * 2, "Blackjack win");
    } else {
        resultText = `😢 **Bạn thua!** Mất ${bet} AniCoin.`;
    }
    const embed = new EmbedBuilder()
        .setTitle("🃏 Kết Quả Blackjack")
        .setDescription(
            `**${message.author.username}**\n\n` +
                `Bài của bạn: ${handToString(player)} (**${getPoints(player)}**)\n` +
                `Bài của dealer: ${handToString(dealer)} (**${getPoints(dealer)}**)\n\n` +
                resultText,
        )
        .setColor(win ? "#51cf66" : draw ? "#ffd93d" : "#ff6b6b")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({
            text: `Số dư mới: ${await getBalance(userId, guildId)} AniCoin`,
            iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

    if (msg) {
        await msg.edit({ embeds: [embed] });
        try {
            await msg.reactions.removeAll();
        } catch {}
    } else {
        await message.reply({ embeds: [embed] });
    }
    delete games[gameKey];
}
