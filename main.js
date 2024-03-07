const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const BOT = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

BOT.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    BOT.commands.set(command.data.name, command);
}

BOT.once('ready', () => {
BOT.user.setStatus('available');
    BOT.user.setActivity('cursed quotes', { type: 'LISTENING',
    
    });
    console.log('Ready!');
});

BOT.login(process.env.TOKEN).then(() => {
    console.log('bot successfully logged in');
});

BOT.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = BOT.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

module.exports = {
    owner: true,
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
