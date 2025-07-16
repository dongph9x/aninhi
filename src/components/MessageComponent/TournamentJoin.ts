import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { TournamentService } from "@/utils/tournament";
import { EcommerceService } from "@/utils/ecommerce-db";

export default Bot.createMessageComponent<ComponentType.Button, { tournamentId: string }>({
    type: ComponentType.Button,
    run: async ({ interaction, data }) => {
        try {
            const tournamentId = data.tournamentId;
            if (!tournamentId) {
                return interaction.reply({
                    content: "❌ Không tìm thấy ID tournament!",
                    ephemeral: true,
                });
            }

            // Lấy tournament từ database
            const tournament = await TournamentService.getTournamentById(tournamentId);
            if (!tournament) {
                return interaction.reply({
                    content: "❌ Tournament không tồn tại hoặc đã kết thúc!",
                    ephemeral: true,
                });
            }

            if (tournament.guildId !== interaction.guildId) {
                return interaction.reply({
                    content: "❌ Tournament này không thuộc server này!",
                    ephemeral: true,
                });
            }

            if (tournament.status !== "registration") {
                return interaction.reply({
                    content: "❌ Tournament đã đóng đăng ký!",
                    ephemeral: true,
                });
            }

            // Kiểm tra đã tham gia chưa
            const existingParticipant = tournament.participants.find((p: any) => p.userId === interaction.user.id);
            if (existingParticipant) {
                return interaction.reply({
                    content: "❌ Bạn đã đăng ký tham gia rồi!",
                    ephemeral: true,
                });
            }

            if (tournament.currentParticipants >= tournament.maxParticipants) {
                return interaction.reply({
                    content: "❌ Tournament đã đầy!",
                    ephemeral: true,
                });
            }

            // Kiểm tra số dư
            const balance = await EcommerceService.getBalance(interaction.user.id, tournament.guildId);
            if (balance < tournament.entryFee) {
                return interaction.reply({
                    content: `❌ Bạn không đủ AniCoin! Cần: ${tournament.entryFee.toLocaleString()}, Có: ${balance.toLocaleString()}`,
                    ephemeral: true,
                });
            }

            // Tham gia tournament
            await TournamentService.joinTournament(tournamentId, interaction.user.id, tournament.guildId);
            
            // Trừ phí đăng ký
            await EcommerceService.subtractMoney(interaction.user.id, tournament.guildId, tournament.entryFee, `Tournament entry: ${tournament.name}`);

            // Lấy tournament đã cập nhật
            const updatedTournament = await TournamentService.getTournamentById(tournamentId);
            if (!updatedTournament) {
                return interaction.reply({
                    content: "❌ Lỗi khi cập nhật tournament!",
                    ephemeral: true,
                });
            }

            // Cập nhật embed và button
            const { createTournamentEmbed } = await import("@/commands/text/ecommerce/tournament");
            const updatedEmbed = createTournamentEmbed(updatedTournament);

            let components = [];
            if (updatedTournament.currentParticipants >= updatedTournament.maxParticipants) {
                // Tournament đầy - disable button
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(JSON.stringify({
                            n: "TournamentJoin",
                            d: { tournamentId: tournamentId }
                        }))
                        .setLabel("Tournament Đã Đầy")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
                components.push(row);
            } else {
                // Tournament còn chỗ - giữ button join
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(JSON.stringify({
                            n: "TournamentJoin",
                            d: { tournamentId: tournamentId }
                        }))
                        .setLabel("Tham gia ngay")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("🏆")
                );
                components.push(row);
            }

            // Cập nhật message gốc
            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: components,
            });

            await interaction.reply({
                content: `✅ Bạn đã tham gia **${tournament.name}**!\n💰 Phí đã trừ: ${tournament.entryFee.toLocaleString()} AniCoin\n👥 Người tham gia: ${updatedTournament.currentParticipants}/${updatedTournament.maxParticipants}`,
                ephemeral: true,
            });

        } catch (error) {
            console.error("Error in tournament join button:", error);
            // Kiểm tra xem interaction đã được reply chưa
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Đã xảy ra lỗi khi tham gia tournament. Vui lòng thử lại sau.",
                    ephemeral: true,
                });
            }
        }
    },
}); 