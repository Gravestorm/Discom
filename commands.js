const fs = require('node:fs')
const path = require('node:path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { CLIENT, SERVER, TOKEN } = require('./config.js')
const commands = []
for (const file of fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'))) commands.push(require(path.join(path.join(__dirname, 'commands'), file)).data.toJSON())
new REST({ version: '9' }).setToken(TOKEN).put(Routes.applicationGuildCommands(CLIENT, SERVER), { body: commands }).then(() => console.log('Commands registered')).catch(console.error)