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
import type { ChannelRestrictions } from "@/config";
import { importDefault } from "@/utils/import";
import { logger } from "@/utils/logger";
import { ChannelRestrictionsStorage } from "@/utils/channel-restrictions-storage";
import { MaintenanceStorage } from "@/utils/maintenance-storage";

export class ExtendedClient<Ready extends boolean = boolean> extends Client<Ready> {
    cwd = process.cwd();
    production = process.env.NODE_ENV === "production";
    maintenanceMode = false; // Sẽ được load từ storage khi khởi tạo

    filter = new Filter(this);
    root = path.join(this.cwd, "src");

    // Channel restrictions configuration
    channelRestrictions?: ChannelRestrictions;

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

    // Fish barn messages storage
    fishBarnMessages = new Collection<string, {
        userId: string;
        guildId: string;
        inventory: any;
        selectedFishId?: string;
    }>();

    constructor(options: ClientOptions) {
        super(options);

        // Load channel restrictions và maintenance mode khi khởi tạo
        this.loadChannelRestrictions();
        this.loadMaintenanceMode();

        if (!this.production) {
            this.on("debug", message => logger.debug(message));
            this.on("error", message => logger.error(message));
            this.on("warn", message => logger.warn(message));
        }
    }

    private loadChannelRestrictions() {
        try {
            this.channelRestrictions = ChannelRestrictionsStorage.load();
            console.log('Channel restrictions loaded successfully');
        } catch (error) {
            console.error('Error loading channel restrictions:', error);
            this.channelRestrictions = undefined;
        }
    }

    private loadMaintenanceMode() {
        try {
            const maintenanceConfig = MaintenanceStorage.load();
            this.maintenanceMode = maintenanceConfig.enabled;
            console.log(`Maintenance mode loaded: ${this.maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
        } catch (error) {
            console.error('Error loading maintenance mode:', error);
            this.maintenanceMode = true; // Fallback to enabled
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
