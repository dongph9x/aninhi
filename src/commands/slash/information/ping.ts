import { Bot } from "@/classes";
import { emojis } from "@/config";

export default Bot.createSlashCommand({
    metadata: builder => {
        builder
            .setName("ping")
            .setDescription("Show the bot's latency.")
            .setDescriptionLocalization("vi", "Xem độ trễ của bot.");
    },
    run: ({ client, interaction, t }) => {
        const latency = Date.now() - interaction.createdTimestamp;

        interaction.reply(`${emojis.success} | ${t("commands.ping", latency, client.ws.ping)}`);
    },
});
