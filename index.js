const { Client, Collection, Intents, MessageEmbed } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const random = require('randomcolor')
const requireAll = require('require-all')
const nconf = require('nconf')
nconf.use('memory')
nconf.argv().env()
if (fs.existsSync(path.join(__dirname, './config.js'))) nconf.defaults(require(path.join(__dirname, './config.js')))
const plugins = requireAll({ dirname: `${__dirname}/plugins`, filter: /^(?!-)(.+)\.js$/ })
const commands = requireAll({ dirname: `${__dirname}/commands`, filter: /^(?!-)(.+)\.js$/ })
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES] })
client.commands = new Collection()
for (const name in commands) client.commands.set(commands[name].data.name, commands[name])

client.on('ready', () => {
  console.log('Connected')
  for (const name in plugins) plugins[name](client)
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() || !client.commands.get(interaction.commandName)) return
  try { await client.commands.get(interaction.commandName).execute(interaction) } catch (error) { console.error(error), await interaction.reply({ content: 'Command Error', ephemeral: true }) }
})

if (nconf.get('CHANNEL_LOG')) {
  client.on('messageDelete', m => {
    if (['ads', 'almanax', 'annonces', 'announcements', 'bot', 'madhouse'].includes(m.channel.name) || !m.guild.channels.fetch(nconf.get('CHANNEL_LOG')) || m.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.permissionsFor(client.user).has('VIEW_CHANNEL')) === false || m.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.permissionsFor(client.user).has('SEND_MESSAGES')) === false) return
    m.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send({ embeds: [new MessageEmbed().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content).setImage(m.attachments.first() ? m.attachments.first().proxyURL : '').setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] }))
  })
}

client.on('rateLimit', r => {
  console.log(`Timeout: ${r.timeout}ms   Request Limit: ${r.limit}   Method: ${r.method}   Path: ${r.path}   Route: ${r.route}   Global: ${r.global}`)
})

client.on('disconnected', () => {
  console.log('Disconnected')
  setTimeout(() => { client.login(nconf.get('TOKEN')) }, 5000)
})

client.login(nconf.get('TOKEN'))