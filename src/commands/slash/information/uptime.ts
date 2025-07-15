import { Bot } from "@/classes";
import { emojis } from "@/config";

export default Bot.createSlashCommand({
    metadata: builder => {
        builder
            .setName("uptime")
            .setDescription("Show the bot's uptime.")
            .setDescriptionLocalization("vi", "Thời gian hoạt động của bot.");
    },
    run: ({ client, interaction, t }) => {
        let totalSeconds = client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        interaction.reply(
            `${emojis.success} | ${t("commands.uptime", `${days}d ${hours}h ${minutes}m ${seconds}s`)}`,
        );
    },
});
