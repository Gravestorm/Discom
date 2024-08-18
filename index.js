const { Client, Collection, GatewayIntentBits, InteractionType } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const path = require('node:path')
const requireAll = require('require-all')
nconf.use('memory')
nconf.argv().env()
if (fs.existsSync(path.join(__dirname, './config.js'))) nconf.defaults(require(path.join(__dirname, './config.js')))
const plugins = requireAll({ dirname: `${__dirname}/plugins`, filter: /^(?!-)(.+)\.js$/ })
const commands = requireAll({ dirname: `${__dirname}/commands`, filter: /^(?!-)(.+)\.js$/ })
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
client.commands = new Collection()
for (const name in commands) client.commands.set(commands[name].data.name, commands[name])

client.on('ready', () => { console.log('Connected'); for (const name in plugins) plugins[name](client) })

client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand || !client.commands.get(interaction.commandName)) return
  try { await client.commands.get(interaction.commandName).execute(interaction) } catch (err) { console.error(err), await interaction.reply({ content: 'Command Error', ephemeral: true }) }
})

client.on('rateLimited', r => { console.log(`Timeout: ${r.timeout}ms\nRequest Limit: ${r.limit}\nMethod: ${r.method}\nPath: ${r.path}\nRoute: ${r.route}\nGlobal: ${r.global}`) })

client.on('disconnected', () => { console.log('Disconnected'); setTimeout(() => { client.login(nconf.get('TOKEN')) }, 5000) })

if (nconf.get('TOKEN')) client.login(nconf.get('TOKEN')); else throw 'Enter the Bot TOKEN in config.js'