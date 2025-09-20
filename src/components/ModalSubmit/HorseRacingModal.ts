import { handleHorseRacingModalSubmission } from "@/commands/text/games/horseracing";

export default {
    customId: 'horseracing_modal',
    run: async ({ interaction }) => {
        try {
            await handleHorseRacingModalSubmission(interaction);
        } catch (error) {
            console.error("Error in HorseRacingModal:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: "❌ Có lỗi xảy ra khi xử lý cược đua ngựa!", 
                    ephemeral: true 
                });
            }
        }
    },
};
