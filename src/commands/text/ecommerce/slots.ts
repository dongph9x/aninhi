import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { addMoney, getBalance, subtractMoney } from "@/utils/ecommerce";

const maxBet = 100;
const slots = ["🍆", "❤️", "🍒", "🪙", "😊", "😄"];
const moving = "🎰";

export default Bot.createCommand({
    structure: {
        name: "slots",
        aliases: ["slot", "sl", "s"],
    },
    options: {
        cooldown: 15000,
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        try {
            let amount = 0;
            let all = false;

            if (args.length === 0) {
                amount = 1;
            } else if (args.length === 1 && !isNaN(parseInt(args[0]))) {
                amount = parseInt(args[0]);
            } else if (args.length === 1 && args[0] === "all") {
                all = true;
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi Cú Pháp")
                    .setDescription(
                        "Cú pháp: `slots [số tiền]` hoặc `slots all`\nVí dụ: `slots 100` hoặc `slots all`",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            if (amount === 0 && !all) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Bạn không thể cược 0 AniCoin!")
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            if (amount < 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Số tiền cược không thể âm!")
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            const currentBalance = await getBalance(userId, guildId);

            if (all) {
                amount = currentBalance;
            }

            if (maxBet && amount > maxBet) {
                amount = maxBet;
            }

            if (currentBalance < amount || currentBalance <= 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("🚫 Không Đủ Tiền")
                    .setDescription(
                        `**${message.author.username}**, bạn không có đủ AniCoin!\nSố dư hiện tại: **${currentBalance}** AniCoin`,
                    )
                    .setColor("#ff6b6b")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            const rslots: string[] = [];
            const rand = Math.random() * 100; // 0-100
            let win = 0;
            let multiplier = 0;

            if (rand <= 20) {
                // 1x 20%
                win = amount;
                multiplier = 1;
                rslots.push(slots[0], slots[0], slots[0]);
            } else if (rand <= 40) {
                // 2x 20%
                win = amount * 2;
                multiplier = 2;
                rslots.push(slots[1], slots[1], slots[1]);
            } else if (rand <= 45) {
                // 3x 5%
                win = amount * 3;
                multiplier = 3;
                rslots.push(slots[2], slots[2], slots[2]);
            } else if (rand <= 47.5) {
                // 4x 2.5%
                win = amount * 4;
                multiplier = 4;
                rslots.push(slots[3], slots[3], slots[3]);
            } else if (rand <= 48.5) {
                // 10x 1%
                win = amount * 10;
                multiplier = 10;
                rslots.push(slots[4], slots[5], slots[4]);
            } else {
                win = 0;
                multiplier = 0;
                const slot1 = Math.floor(Math.random() * (slots.length - 1));
                let slot2 = Math.floor(Math.random() * (slots.length - 1));
                const slot3 = Math.floor(Math.random() * (slots.length - 1));

                if (slot3 === slot1) {
                    slot2 =
                        (slot1 + Math.ceil(Math.random() * (slots.length - 2))) %
                        (slots.length - 1);
                }
                if (slot2 === slots.length - 2) slot2++;

                rslots.push(slots[slot1], slots[slot2], slots[slot3]);
            }

            if (win > 0) {
                await addMoney(
                    userId,
                    guildId,
                    win - amount,
                    `Slots win - bet: ${amount}, multiplier: ${multiplier}x`,
                );
            } else {
                await subtractMoney(userId, guildId, amount, `Slots lose - bet: ${amount}`);
            }

            const winmsg = win === 0 ? "không gì cả... 😢" : `**${win}** AniCoin`;

            const embed = new EmbedBuilder()
                .setTitle("🎰 SLOTS")
                .setDescription(
                    `**${message.author.username}** đã cược **${amount}** AniCoin\n\n` +
                        `🎰 ${moving} ${moving} ${moving}\n` +
                        "|         |\n" +
                        "|         |",
                )
                .setColor("#ffd93d")
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            const messageSent = await message.reply({ embeds: [embed] });

            setTimeout(async () => {
                const embed1 = new EmbedBuilder()
                    .setTitle("🎰 SLOTS")
                    .setDescription(
                        `**${message.author.username}** đã cược **${amount}** AniCoin\n\n` +
                            `🎰 ${rslots[0]} ${moving} ${moving}\n` +
                            "|         |\n" +
                            "|         |",
                    )
                    .setColor("#ffd93d")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setTimestamp();

                await messageSent.edit({ embeds: [embed1] });

                setTimeout(async () => {
                    const embed2 = new EmbedBuilder()
                        .setTitle("🎰 SLOTS")
                        .setDescription(
                            `**${message.author.username}** đã cược **${amount}** AniCoin\n\n` +
                                `🎰 ${rslots[0]} ${moving} ${rslots[2]}\n` +
                                "|         |\n" +
                                "|         |",
                        )
                        .setColor("#ffd93d")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setTimestamp();

                    await messageSent.edit({ embeds: [embed2] });

                    setTimeout(async () => {
                        const resultEmbed = new EmbedBuilder()
                            .setTitle("🎰 KẾT QUẢ SLOTS")
                            .setDescription(
                                `**${message.author.username}** đã cược **${amount}** AniCoin\n\n` +
                                    `🎰 ${rslots[0]} ${rslots[1]} ${rslots[2]}\n` +
                                    "|         |\n" +
                                    "|         |\n\n" +
                                    `**Kết quả:** ${winmsg}\n` +
                                    (multiplier > 0 ? `**Hệ số:** ${multiplier}x` : ""),
                            )
                            .setColor(win > 0 ? "#51cf66" : "#ff6b6b")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter({
                                text: `Số dư mới: ${await getBalance(userId, guildId)} AniCoin`,
                                iconURL: message.author.displayAvatarURL(),
                            })
                            .setTimestamp();

                        messageSent.edit({ embeds: [resultEmbed] });
                    }, 1000);
                }, 700);
            }, 1000);
        } catch (error) {
            console.error("Error in slots command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi xử lý slots. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
