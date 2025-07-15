import {
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    Message,
    type OmitPartialGroupDMChannel,
} from "discord.js";

import { EmbedEditor } from "@/classes/embeds/EmbedEditor";
import { emojis } from "@/config";
import type { MaybePromise } from "@/typings";

export class Pagination extends EmbedEditor<ComponentType.Button> {
    prevButton!: ButtonBuilder;
    nextButton!: ButtonBuilder;
    startButton!: ButtonBuilder;
    endButton!: ButtonBuilder;
    stopButton!: ButtonBuilder;
    constructor(
        context: OmitPartialGroupDMChannel<Message> | ChatInputCommandInteraction,
        public totalPage: number,
    ) {
        super({
            type: ComponentType.Button,
            context: context,
            idle: 30000,
        });

        if (totalPage > 2) {
            this.prevButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("Collector:PrevButton")
                .setEmoji(emojis.prev)
                .setDisabled(true);

            this.nextButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("Collector:NextButton")
                .setEmoji(emojis.next);

            this.startButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("Collector:StartButton")
                .setEmoji(emojis.start)
                .setDisabled(true);

            this.endButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("Collector:EndButton")
                .setEmoji(emojis.end);

            this.stopButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("Collector:StopButton")
                .setEmoji(emojis.stop);

            this.component.addComponents(
                this.startButton,
                this.prevButton,
                this.nextButton,
                this.endButton,
                this.stopButton,
            );
        }
    }

    async start(onchange: (page: number) => MaybePromise<unknown>) {
        await onchange(0);
        let currentPage = 0;

        this.render(async interaction => {
            if (interaction) {
                switch (interaction.customId.slice(10)) {
                    case "PrevButton": {
                        currentPage--;
                        break;
                    }
                    case "NextButton": {
                        currentPage++;
                        break;
                    }
                    case "StartButton": {
                        currentPage = 0;
                        break;
                    }
                    case "EndButton": {
                        currentPage = this.totalPage - 1;
                        break;
                    }
                    case "StopButton": {
                        return false;
                    }
                }

                this.startButton.setDisabled(currentPage === 0);
                this.prevButton.setDisabled(currentPage === 0);
                this.nextButton.setDisabled(currentPage + 1 === this.totalPage);
                this.endButton.setDisabled(currentPage + 1 === this.totalPage);

                await onchange(currentPage);
            }
        });
    }
}
