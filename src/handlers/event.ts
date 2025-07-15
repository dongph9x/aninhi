import fs from "fs";
import path from "path";

import { Bot } from "@/classes";
import type { EventProps } from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export default Bot.createHandler({
    run: async client => {
        const eventFolder = path.join(client.root, "events");
        let count = 0;

        for (const file of fs.readdirSync(eventFolder)) {
            if (!file.endsWith("ts")) continue;

            const eventPath = path.join(eventFolder, file);
            const event = await importDefault<EventProps>(eventPath);

            if (!event) continue;
            if (event.disabled) continue;

            const bindedEvent = event.emit.bind(null, client);

            if (event.once) {
                client.once(event.eventName as string, bindedEvent);
            } else {
                client.on(event.eventName as string, bindedEvent);
            }

            count++;
        }

        logger.debug(`${count} events is ready.`);
    },
});
