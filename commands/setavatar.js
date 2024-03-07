const interactionHandlers = require('../modules/interaction-handlers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setavatar')
    .setDescription('Set the avatar of the bot')
    .addAttachmentOption(option => option.setName('avatar').setDescription('An image to use as the avatar for the bot').setRequired(true)),
    async execute (interaction, client) {

        const { options } = interaction;
        const avatar = options.getAttachment('avatar');

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(message);

            await interaction.reply({ embeds: [embed], ephermeral: true });
        }

        if (interaction.user.id !== '607017300989706240, 641147500908118016') return await interaction.reply({ content: `You do not have permission to use this command!`, ephermeral: true });

        var error; 
        await client.user.setAvatar(avatar.url).catch(async err => {
            error = true; 
            console.log(err);
            return await sendMessage(`⚠️ Error : \`${err.toString()}\``);
        });

        if (error) return; 
        await sendMessage(`Avatar updated successfully!`);

    }
}
