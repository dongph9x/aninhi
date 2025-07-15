import fs from "fs";
import path from "path";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export default Bot.createHandler({
    run: async client => {
        const componentFolder = path.join(client.root, "components/MessageComponent");
        if (!fs.existsSync(componentFolder)) {
            logger.warn(`Folder "${componentFolder}" not found, creating...`);
            return fs.mkdirSync(componentFolder, { recursive: true });
        }

        for (const file of fs.readdirSync(componentFolder)) {
            if (!file.endsWith(".ts")) continue;

            const componentPath = path.join(componentFolder, file);
            const component = await importDefault<MessageComponentProps>(componentPath);

            if (!component) continue;

            const componentName = file.slice(0, file.indexOf(".ts"));
            client.components.message.set(componentName, component);
        }

        logger.debug(`${client.components.message.size} message components is ready.`);
    },
});
