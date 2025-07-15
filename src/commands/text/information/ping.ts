import { Bot } from "@/classes";
import { emojis } from "@/config";

export default Bot.createCommand({
    structure: {
        name: "ping",
    },
    options: { inGuild: true },
    run: ({ client, message, t }) => {
        const latency = Date.now() - message.createdTimestamp;

        message.channel.send(`${emojis.success} | ${t("commands.ping", latency, client.ws.ping)}`);
    },
});
