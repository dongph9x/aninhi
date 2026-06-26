import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { BankHandler } from './BankHandler';

export default {
    name: 'bank',
    async button(interaction: ButtonInteraction) {
        await BankHandler.handleButtonInteraction(interaction);
    },
    async selectMenu(interaction: StringSelectMenuInteraction) {
        await BankHandler.handleSelectMenuInteraction(interaction);
    }
}; 