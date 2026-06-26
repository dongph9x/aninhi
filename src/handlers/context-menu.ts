import { ContextMenuCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";

import { Bot } from "@/classes";
import type { ContextMenuProps, ReadyContextMenuProps } from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export default Bot.createHandler({
    run: async client => {
        const componentFolder = path.join(client.root, "components/ContextMenu");
        if (!fs.existsSync(componentFolder)) {
            try {
                logger.warn(`Folder "${componentFolder}" not found, creating...`);
                fs.mkdirSync(componentFolder, { recursive: true });
            } catch (error) {
                logger.warn(`Could not create folder "${componentFolder}" (read-only filesystem?), treating as empty.`);
            }
            return;
        }

        for (const file of fs.readdirSync(componentFolder)) {
            if (!file.endsWith(".ts")) continue;

            const componentPath = path.join(componentFolder, file);
            const component = await importDefault<ContextMenuProps>(componentPath);

            if (!component) continue;

            component.builder = new ContextMenuCommandBuilder();
            component.builder.setType(component.type);
            component.metadata(component.builder);

            client.menu.set(component.builder.name, component as ReadyContextMenuProps);
        }

        logger.debug(`${client.menu.size} context menu is ready.`);
    },
});
