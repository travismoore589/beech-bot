const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('Set the avatar of the bot')
        .addAttachmentOption(option => 
            option.setName('avatar')
                .setDescription('An image to use as the avatar for the bot')
                .setRequired(true)),
    async execute (interaction) {
        await interactionHandlers.avatarHandler(interaction);
    }
};
