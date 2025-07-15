import fs from "fs";
import path from "path";

import { Bot, SubCommand } from "@/classes";
import type { TextCommandProps } from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export default Bot.createHandler({
    run: async client => {
        const commandFolder = path.join(client.root, "commands/text");

        if (!fs.existsSync(commandFolder)) {
            logger.warn("No text command folder found, creating...");
            return fs.mkdirSync(commandFolder, { recursive: true });
        }

        for (const category of fs.readdirSync(commandFolder)) {
            const categoryFolder = path.join(commandFolder, category);

            for (const file of fs.readdirSync(categoryFolder)) {
                const commandPath = path.join(categoryFolder, file);
                const pull = await importDefault<TextCommandProps>(commandPath);

                if (!pull) continue;

                if (Array.isArray(pull.structure.aliases)) {
                    for (const alias of pull.structure.aliases) {
                        client.text.aliases.set(alias, pull.structure.name);
                    }
                }

                if (!pull.hidden) {
                    const cmds = client.text.categories.get(category);

                    if (!Array.isArray(cmds)) {
                        client.text.categories.set(category, [pull.structure]);
                    } else {
                        cmds.push(pull.structure);
                    }
                }

                if (!file.endsWith(".ts")) {
                    await SubCommand.text(commandPath, pull);
                }

                client.text.commands.set(pull.structure.name, pull);
            }
        }

        logger.debug(`${client.text.commands.size} text commands is ready.`);
    },
});
