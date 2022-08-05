const { AuditLogEvent, Client, Collection, EmbedBuilder, GatewayIntentBits, InteractionType } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const path = require('node:path')
const promise = require('bluebird')
const delay = ms => new promise(resolve => setTimeout(resolve, ms))
const random = require('randomcolor')
const requireAll = require('require-all')
nconf.use('memory')
nconf.argv().env()
if (fs.existsSync(path.join(__dirname, './config.js'))) nconf.defaults(require(path.join(__dirname, './config.js')))
const plugins = requireAll({ dirname: `${__dirname}/plugins`, filter: /^(?!-)(.+)\.js$/ })
const commands = requireAll({ dirname: `${__dirname}/commands`, filter: /^(?!-)(.+)\.js$/ })
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
client.commands = new Collection()
for (const name in commands) client.commands.set(commands[name].data.name, commands[name])

client.on('ready', () => { console.log('Connected'); for (const name in plugins) plugins[name](client) })

client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand || !client.commands.get(interaction.commandName)) return
  try { await client.commands.get(interaction.commandName).execute(interaction) } catch (err) { console.error(err), await interaction.reply({ content: 'Command Error', ephemeral: true }) }
})

if (nconf.get('CHANNEL_LOG') && nconf.get('SERVER')) {
  client.on('messageDelete', m => {
    if (m.guildId !== nconf.get('SERVER') || ['ads', 'almanax', 'annonces', 'announcements', 'bot', 'madhouse', 'rules-info', 'regles-info', 'rules-mirror', 'regles-mirror', 'leaderboard'].includes(m.channel.name) || !m.guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    m.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] }))
  })
  client.on('messageDeleteBulk', msgs => {
    if (msgs.first().guildId !== nconf.get('SERVER') || ['ads', 'almanax', 'annonces', 'announcements', 'bot', 'madhouse', 'rules-info', 'regles-info', 'rules-mirror', 'regles-mirror', 'leaderboard'].includes(msgs.first().channel.name) || !msgs.first().guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    msgs.first().guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => msgs.reverse().forEach(m => c.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] })))
  })
  client.on('guildBanAdd', async ban => {
    if (ban.guild.id !== nconf.get('SERVER') || !ban.guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    await delay(10000)
    const log = await ban.guild.fetchAuditLogs({ limit: 25, type: AuditLogEvent.MemberBanAdd })
    const l = log.entries.find(t => ban.user.id === t.target.id)
    ban.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send(l ? `${l.target.username}#${l.target.discriminator} (${l.target.id}) has been killed by <@${l.executor.id}> on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} for ${l.reason ? l.reason : 'fun'}` : `${ban.user.username}#${ban.user.discriminator} (${ban.user.id}) has been killed on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} by a mysterious fellow without any witnesses`))
  })
}

client.on('rateLimited', r => { console.log(`Timeout: ${r.timeout}ms   Request Limit: ${r.limit}   Method: ${r.method}   Path: ${r.path}   Route: ${r.route}   Global: ${r.global}`) })

client.on('disconnected', () => { console.log('Disconnected'); setTimeout(() => { client.login(nconf.get('TOKEN')) }, 5000) })

if (nconf.get('TOKEN')) client.login(nconf.get('TOKEN')); else throw 'Enter the Bot TOKEN in config.js'