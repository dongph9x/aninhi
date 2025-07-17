import { Client, type ClientOptions, Collection } from "discord.js";
import fs from "fs";
import path from "path";

import { Filter } from "@/classes/core/Filter";
import type {
    BaseSlashCommandBuilder,
    HandlerProps,
    MaybePromise,
    MessageComponentProps,
    ModalSubmitProps,
    ReadyContextMenuProps,
    ReadySlashCommandProps,
    TextCommandProps,
    TextCommandStructrue,
} from "@/typings";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";

export class ExtendedClient<Ready extends boolean = boolean> extends Client<Ready> {
    cwd = process.cwd();
    production = process.env.NODE_ENV === "production";
    maintenanceMode = false;

    filter = new Filter(this);
    root = path.join(this.cwd, "src");

    menu = new Collection<string, ReadyContextMenuProps>();

    components = {
        message: new Collection<string, MessageComponentProps>(),
        modalSubmit: new Collection<string, ModalSubmitProps>(),
    };

    text = {
        aliases: new Map<string, string>(),
        commands: new Collection<string, TextCommandProps>(),
        categories: new Collection<string, TextCommandStructrue[]>(),
    };

    slash = {
        categories: new Collection<string, BaseSlashCommandBuilder[]>(),
        commands: new Collection<string, ReadySlashCommandProps>(),
    };

    constructor(options: ClientOptions) {
        super(options);

        if (!this.production) {
            this.on("debug", message => logger.debug(message));
            this.on("error", message => logger.error(message));
            this.on("warn", message => logger.warn(message));
        }
    }

    private async useHandlers() {
        const handleFolder = path.join(this.root, "handlers");
        const waitUntilReady: ((client: ExtendedClient) => MaybePromise<unknown>)[] = [];

        if (!fs.existsSync(handleFolder)) {
            return logger.warn("No handlers folder found.");
        }

        for (const file of fs.readdirSync(handleFolder)) {
            if (!file.endsWith(".ts")) continue;

            const handleFilePath = path.join(handleFolder, file);
            const handler = await importDefault<HandlerProps>(handleFilePath);

            if (!handler) continue;

            if (handler.waitUntilReady) {
                waitUntilReady.push(handler.run);
            } else {
                handler.run(this);
            }
        }

        this.once("ready", () => {
            waitUntilReady.forEach(fn => fn(this));
        });
    }

    public run() {
        this.login(process.env.BOT_TOKEN);
        this.useHandlers();
    }
}
