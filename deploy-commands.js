const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken("MTA0MjY5MzAxNTczMjQ5ODQ3Mg.G-WnuZ.k8B5LXS1R6M2l8DgjQVhYurEURaQP6cSE1qPL8");

rest.put(Routes.applicationCommands("1042693015732498472"), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
