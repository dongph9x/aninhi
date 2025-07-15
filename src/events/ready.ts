import { ActivityType } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { logger } from "@/utils/logger";

export default Bot.createEvent({
    once: true,
    eventName: "ready",
    emit: async (client, bot) => {
        client.user.setActivity({
            type: ActivityType.Playing,
            name: `${config.prefix}help`,
        });

        // Khởi tạo tournament client
        try {
            const tournamentModule = await import("../commands/text/ecommerce/tournament");
            if (tournamentModule.setTournamentClient) {
                tournamentModule.setTournamentClient(client);
                logger.debug("Tournament client đã được khởi tạo!");
            }
        } catch (error) {
            logger.error(`Lỗi khởi tạo tournament client: ${error}`);
        }

        logger.debug(`Logged in as ${bot.user.tag}!`);
    },
});
