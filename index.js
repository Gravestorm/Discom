const { Client, Collection, GatewayIntentBits, InteractionType } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const path = require('node:path')
const requireAll = require('require-all')
nconf.use('memory').argv().env()
if (fs.existsSync(path.join(__dirname, './config.js'))) nconf.defaults(require(path.join(__dirname, './config.js')))
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] })
client.commands = new Collection()
const loadModules = (dir) => requireAll({ dirname: path.join(__dirname, dir), filter: /^(?!-)(.+)\.js$/ })
const plugins = loadModules('plugins')
const commands = loadModules('commands')
if (nconf.get('COMMANDS')) Object.values(commands).forEach(cmd => client.commands.set(cmd.data.name, cmd))

client.on('ready', () => {
  console.log('Connected')
  Object.values(plugins).forEach(plugin => plugin(client))
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
      await command.execute(interaction)
    } catch (err) {
      await interaction.reply({ content: err.toString(), ephemeral: true })
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith('grant_') || interaction.customId.startsWith('deny_')) {
      const adsRoleCommand = require('./commands/ads.js')
      try {
        await adsRoleCommand.handleRoleRequestButtons(interaction)
      } catch (err) {
        await interaction.reply({ content: err.toString(), ephemeral: true })
      }
    }
  }
})

client.on('rateLimited', ({ timeout, limit, method, path, route, global }) => {
  console.log(`Timeout: ${timeout}ms | Limit: ${limit} | Method: ${method} | Path: ${path} | Route: ${route} | Global: ${global}`)
})

client.on('disconnected', () => {
  console.log('Disconnected')
  setTimeout(() => client.login(nconf.get('TOKEN')), 5000)
})

if (nconf.get('TOKEN')) client.login(nconf.get('TOKEN'))
else throw 'Enter the Bot TOKEN in config.js'