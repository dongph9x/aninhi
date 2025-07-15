import type {
    ApplicationCommandType,
    AutocompleteInteraction,
    CacheType,
    Channel,
    ChatInputCommandInteraction,
    ClientEvents,
    ContextMenuCommandBuilder,
    ContextMenuCommandType,
    GuildMember,
    If,
    MappedInteractionTypes,
    Message,
    MessageComponentType,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    OmitPartialGroupDMChannel,
    PermissionResolvable,
    Role,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandBuilder,
    User,
    UserContextMenuCommandInteraction,
} from "discord.js";

import type { ExtendedClient } from "@/classes";
import type { autocomplete } from "@/config";
import type { Locale, TranslationFn } from "@/utils/locales";

export type SubCommandMap = Map<string, ReadySubSlashCommandProps>;
export type SlashCommandSubCommands = Map<string, ReadySubSlashCommandProps | SubCommandMap>;
export type BaseSlashCommandBuilder = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
export type AutocompleteFn = (interaction: AutocompleteParams) => MaybePromise<unknown>;
export type ParameterType = string | GuildMember | User | Channel | Role;
export type AutoCompleteMap = Record<string, AutocompleteFn>;
export type KeyOfAutoCompleteMap = keyof typeof autocomplete;
export type OptionalReadyEvent = "warn" | "error" | "debug";
export type InGuildCacheType = "cached" | "raw";
export type MaybePromise<T> = Promise<T> | T;

export interface MappedContextMenuTypes<T extends boolean = boolean> {
    [ApplicationCommandType.User]: UserContextMenuCommandInteraction<
        If<T, InGuildCacheType, CacheType>
    >;
    [ApplicationCommandType.Message]: MessageContextMenuCommandInteraction<
        If<T, InGuildCacheType, CacheType>
    >;
}

export type CommandOptions<InGuild extends boolean = boolean> = {
    cooldown?: number;
    permissions?: PermissionResolvable;
    ownershipServerOnly?: boolean;
    globalCooldown?: number;
    inGuild?: InGuild;
    onlyDev?: boolean;
    nsfw?: boolean;
};

export type ModalSubmitOptions<T extends boolean = boolean> = Omit<CommandOptions<T>, "cooldown">;

export type BaseParams = {
    client: ExtendedClient<true>;
};

export interface BaseComponentParams<Data = unknown> extends BaseParams {
    t: TranslationFn;
    locale: Locale;
    data: Data;
}

export type BaseProps<InGuild extends boolean = boolean> = {
    options?: CommandOptions<InGuild>;
};

export interface MessageComponentParams<
    T extends MessageComponentType = MessageComponentType,
    Data = unknown,
    InGuild extends boolean = boolean,
> extends BaseComponentParams<Data> {
    interaction: MappedInteractionTypes<InGuild>[T];
}

export interface MessageComponentProps<
    T extends MessageComponentType = MessageComponentType,
    Data = unknown,
    InGuild extends boolean = boolean,
> extends BaseProps<InGuild> {
    run: (args: MessageComponentParams<T, Data, InGuild>) => MaybePromise<unknown>;
    type: T;
}

export interface ModalSubmitParams<Data = unknown, T extends boolean = boolean>
    extends BaseComponentParams<Data> {
    interaction: ModalSubmitInteraction<If<T, InGuildCacheType, CacheType>>;
}

export type ModalSubmitProps<Data = unknown, T extends boolean = boolean> = {
    options?: ModalSubmitOptions<T>;
    run: (args: ModalSubmitParams<Data, T>) => MaybePromise<unknown>;
};

export type EventProps<T extends keyof ClientEvents = keyof ClientEvents> = {
    eventName: T;
    once?: boolean;
    disabled?: boolean;
    emit: (
        client: ExtendedClient<T extends OptionalReadyEvent ? boolean : true>,
        ...args: ClientEvents[T]
    ) => MaybePromise<unknown>;
};

export type TextCommandStructrue = {
    name: string;
    aliases?: string[];
};

export interface CommandParams extends BaseParams {
    t: TranslationFn;
    locale: Locale;
}

export interface TextCommandParams<
    T extends ParameterType[] = ParameterType[],
    InGuild extends boolean = boolean,
    IncludeContent extends boolean = boolean,
> extends CommandParams {
    message: OmitPartialGroupDMChannel<Message<InGuild>>;
    args: (string | undefined)[];
    params: { [P in keyof T]: T[P] extends string ? string : T[P] | undefined };
    content: If<IncludeContent, string>;
}

export interface BaseTextCommandProps<
    T extends ParameterType[] = ParameterType[],
    InGuild extends boolean = boolean,
    IncludeContent extends boolean = boolean,
> extends BaseProps<InGuild> {
    params?: Map<string, SubTextCommandProps>;
    subCommandAliases?: Map<string, string>;
    includeContent?: IncludeContent;
    run: (args: TextCommandParams<T, InGuild, IncludeContent>) => MaybePromise<unknown>;
}

export interface SubTextCommandProps<
    T extends ParameterType[] = ParameterType[],
    InGuild extends boolean = boolean,
    IncludeContent extends boolean = boolean,
> extends BaseTextCommandProps<T, InGuild, IncludeContent> {
    aliases?: string[];
}

export interface TextCommandProps<
    T extends ParameterType[] = ParameterType[],
    InGuild extends boolean = boolean,
    IncludeContent extends boolean = boolean,
> extends BaseTextCommandProps<T, InGuild, IncludeContent> {
    structure: TextCommandStructrue;
    hidden?: boolean;
}

export interface AutocompleteParams extends BaseParams {
    interaction: AutocompleteInteraction;
}

export interface SlashCommandParams<InGuild extends boolean = boolean> extends CommandParams {
    interaction: ChatInputCommandInteraction<If<InGuild, InGuildCacheType, CacheType>>;
}

export interface BaseSlashCommandProps<InGuild extends boolean = boolean>
    extends BaseProps<InGuild> {
    autocomplete?: Record<string, KeyOfAutoCompleteMap | AutocompleteFn>;
    subcommands?: SlashCommandSubCommands;
}

export interface SlashCommandProps<InGuild extends boolean = boolean>
    extends BaseSlashCommandProps<InGuild> {
    hidden?: boolean;
    builder?: BaseSlashCommandBuilder;
    metadata: (builder: BaseSlashCommandBuilder) => void;
    run?: (args: SlashCommandParams<InGuild>) => MaybePromise<unknown>;
}

export interface ReadySlashCommandProps extends SlashCommandProps {
    builder: BaseSlashCommandBuilder;
}

export interface SubSlashCommandProps<InGuild extends boolean = boolean>
    extends BaseSlashCommandProps<InGuild> {
    builder?: SlashCommandSubcommandBuilder;
    metadata: (builder: SlashCommandSubcommandBuilder) => void;
    run: (args: SlashCommandParams<InGuild>) => MaybePromise<unknown>;
}

export interface ReadySubSlashCommandProps extends SubSlashCommandProps {
    builder: SlashCommandSubcommandBuilder;
}

export interface ReadyContextMenuProps extends ContextMenuProps {
    builder: ContextMenuCommandBuilder;
}

export type HandlerProps<Ready extends boolean = boolean> = {
    waitUntilReady?: Ready;
    run: (client: ExtendedClient<If<Ready, true, boolean>>) => MaybePromise<unknown>;
};

export interface ContextMenuParams<
    T extends keyof MappedContextMenuTypes = ContextMenuCommandType,
    InGuild extends boolean = boolean,
> extends CommandParams {
    interaction: MappedContextMenuTypes<InGuild>[T];
}

export interface ContextMenuProps<
    T extends keyof MappedContextMenuTypes = ContextMenuCommandType,
    InGuild extends boolean = boolean,
> extends BaseProps<InGuild> {
    type: T;
    builder?: ContextMenuCommandBuilder;
    metadata: (builder: ContextMenuCommandBuilder) => void;
    run: (args: ContextMenuParams<T, InGuild>) => MaybePromise<unknown>;
}

export type CustomIdData = {
    d?: unknown;
    n: string;
};

export * from "./path-value";
