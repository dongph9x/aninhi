import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

import { Bot } from "@/classes";
import { tournaments } from "@/commands/text/ecommerce/tournament";
import { addMoney, getBalance, subtractMoney } from "@/utils/ecommerce";

export default Bot.createMessageComponent<ComponentType.Button>({
    type: ComponentType.Button,
    run: async ({ interaction }) => {
        // Kiểm tra customId có phải là tournament_join không
        if (!interaction.customId.startsWith("tournament_join:")) {
            return;
        }
        try {
            const tournamentId = interaction.customId.split(":")[1];
            if (!tournamentId) {
                return interaction.reply({
                    content: "❌ Không tìm thấy ID tournament!",
                    flags: 64,
                });
            }

            const tournament = tournaments[tournamentId];
            if (!tournament) {
                return interaction.reply({
                    content: "❌ Tournament không tồn tại hoặc đã kết thúc!",
                    flags: 64,
                });
            }

            if (tournament.status !== "registration") {
                return interaction.reply({
                    content: "❌ Tournament đã đóng đăng ký!",
                    flags: 64,
                });
            }

            if (tournament.participants.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "❌ Bạn đã đăng ký tham gia rồi!",
                    flags: 64,
                });
            }

            if (tournament.currentParticipants >= tournament.maxParticipants) {
                return interaction.reply({
                    content: "❌ Tournament đã đầy!",
                    flags: 64,
                });
            }

            const balance = await getBalance(interaction.user.id, tournament.guildId);
            if (balance < tournament.entryFee) {
                return interaction.reply({
                    content: `❌ Bạn không đủ AniCoin! Cần: ${tournament.entryFee.toLocaleString()}, Có: ${balance.toLocaleString()}`,
                    flags: 64,
                });
            }

            // Trừ phí đăng ký
            await subtractMoney(
                interaction.user.id,
                tournament.guildId,
                tournament.entryFee,
                `Tournament entry: ${tournament.name}`
            );

            // Thêm vào danh sách tham gia
            tournament.participants.push(interaction.user.id);
            tournament.currentParticipants++;

            // Cập nhật button nếu tournament đầy
            if (tournament.currentParticipants >= tournament.maxParticipants) {
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`tournament_full:${tournamentId}`)
                        .setLabel("Tournament Đã Đầy")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

                // Cập nhật message gốc
                await interaction.message.edit({
                    components: [row],
                });
            }

            await interaction.reply({
                content: `✅ Bạn đã tham gia **${tournament.name}**!\n💰 Phí đã trừ: ${tournament.entryFee.toLocaleString()} AniCoin\n👥 Người tham gia: ${tournament.currentParticipants}/${tournament.maxParticipants}`,
                flags: 64,
            });

        } catch (error) {
            console.error("Error in tournament join button:", error);
            // Kiểm tra xem interaction đã được reply chưa
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Đã xảy ra lỗi khi tham gia tournament. Vui lòng thử lại sau.",
                    flags: 64,
                });
            }
        }
    },
}); 