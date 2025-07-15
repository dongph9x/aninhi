import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";

import { Bot, SubCommand } from "@/classes";
import type { ReadySlashCommandProps, SlashCommandProps } from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export default Bot.createHandler({
    run: async client => {
        const commandFolder = path.join(client.root, "commands/slash");

        if (!fs.existsSync(commandFolder)) {
            logger.warn("No slash command folder found, creating...");
            return fs.mkdirSync(commandFolder, { recursive: true });
        }

        for (const category of fs.readdirSync(commandFolder)) {
            const categoryFolder = path.join(commandFolder, category);

            for (const file of fs.readdirSync(categoryFolder)) {
                const commandPath = path.join(categoryFolder, file);
                const pull = await importDefault<SlashCommandProps>(commandPath);

                if (!pull) continue;

                pull.builder = new SlashCommandBuilder();
                pull.metadata(pull.builder);

                if (!pull.hidden) {
                    const cmds = client.slash.categories.get(category);

                    if (!Array.isArray(cmds)) {
                        client.slash.categories.set(category, [pull.builder]);
                    } else {
                        cmds.push(pull.builder);
                    }
                }

                if (!file.endsWith(".ts")) {
                    await SubCommand.slash(commandPath, pull);
                }

                client.slash.commands.set(pull.builder.name, pull as ReadySlashCommandProps);
            }
        }

        logger.debug(`${client.slash.commands.size} slash commands is ready.`);
    },
});
