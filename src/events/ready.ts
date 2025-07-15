import { ActivityType } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { logger } from "@/utils/logger";

export default Bot.createEvent({
    once: true,
    eventName: "ready",
    emit: (client, bot) => {
        client.user.setActivity({
            type: ActivityType.Playing,
            name: `${config.prefix}help`,
        });

        logger.debug(`Logged in as ${bot.user.tag}!`);
    },
});
