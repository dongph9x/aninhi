import { type ClientEvents, type MessageComponentType } from "discord.js";

import type {
    ContextMenuProps,
    EventProps,
    HandlerProps,
    MappedContextMenuTypes,
    MessageComponentProps,
    ModalSubmitProps,
    ParameterType,
    SlashCommandProps,
    SubSlashCommandProps,
    SubTextCommandProps,
    TextCommandProps,
} from "@/typings";

export class Bot {
    static createMessageComponent<
        T extends MessageComponentType,
        Data = undefined,
        InGuild extends boolean = boolean,
    >(args: MessageComponentProps<T, Data, InGuild>) {
        return args;
    }

    static createModalSubmitComponent<Data = undefined, T extends boolean = boolean>(
        args: ModalSubmitProps<Data, T>,
    ) {
        return args;
    }

    static createEvent<T extends keyof ClientEvents>(args: EventProps<T>) {
        return args;
    }

    static createCommand<
        T extends ParameterType[] = ParameterType[],
        InGuild extends boolean = boolean,
        IncludeContent extends boolean = boolean,
    >(args: TextCommandProps<T, InGuild, IncludeContent>) {
        return args;
    }

    static createSubCommand<
        T extends ParameterType[] = ParameterType[],
        InGuild extends boolean = boolean,
        IncludeContent extends boolean = boolean,
    >(args: SubTextCommandProps<T, InGuild, IncludeContent>) {
        return args;
    }

    static createSlashCommand<T extends boolean = boolean>(args: SlashCommandProps<T>) {
        return args;
    }

    static createSubSlashCommand<T extends boolean = boolean>(args: SubSlashCommandProps<T>) {
        return args;
    }

    static createHandler<T extends boolean = boolean>(args: HandlerProps<T>) {
        return args;
    }

    static createContextMenu<
        T extends keyof MappedContextMenuTypes,
        InGuild extends boolean = boolean,
    >(args: ContextMenuProps<T, InGuild>) {
        return args;
    }
}
