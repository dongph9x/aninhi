import { Bot } from "@/classes";
import { emojis } from "@/config";

export default Bot.createCommand({
    structure: {
        name: "uptime",
    },
    options: { inGuild: true },
    run: ({ client, message, t }) => {
        let totalSeconds = client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        message.channel.send(
            `${emojis.success} | ${t("commands.uptime", `${days}d ${hours}h ${minutes}m ${seconds}s`)}`,
        );
    },
});
