import {
    ActionRowBuilder,
    ButtonBuilder,
    type ChatInputCommandInteraction,
    EmbedBuilder,
    type MappedInteractionTypes,
    Message,
    type MessageComponentType,
    type OmitPartialGroupDMChannel,
} from "discord.js";

import type { MaybePromise } from "@/typings";

export type EmbedEditorConfig<T extends MessageComponentType> = {
    context: OmitPartialGroupDMChannel<Message> | ChatInputCommandInteraction;
    idle: number;
    type: T;
};

export class EmbedEditor<T extends MessageComponentType> {
    embed: EmbedBuilder;
    component: ActionRowBuilder<ButtonBuilder>;
    constructor(public config: EmbedEditorConfig<T>) {
        this.component = new ActionRowBuilder<ButtonBuilder>();
        this.embed = new EmbedBuilder();
    }

    async render(
        onrerender: (action?: MappedInteractionTypes[T]) => MaybePromise<unknown>,
        onstop?: () => MaybePromise<unknown>,
    ) {
        onrerender();

        if (this.component.components.length !== 0) {
            const msg = await this.config.context.reply({
                components: [this.component],
                embeds: [this.embed],
            });

            const collector = msg.createMessageComponentCollector<T>({
                idle: this.config.idle,
                componentType: this.config.type,
                filter: interaction =>
                    this.config.context instanceof Message
                        ? interaction.user.id === this.config.context.author.id
                        : interaction.user.id === this.config.context.user.id,
            });

            collector.on("collect", async interaction => {
                await interaction.deferUpdate();

                const next = await onrerender(interaction);
                if (!next) return collector.stop();

                interaction.message.edit({
                    components: [this.component],
                    embeds: [this.embed],
                });
            });

            collector.once("end", () => {
                if (typeof onstop === "function") onstop();
                msg.edit({ embeds: [this.embed], components: [] }).catch(() => null);
            });
        } else {
            this.config.context.reply({ embeds: [this.embed] });
        }
    }
}
