const { AuditLogEvent, EmbedBuilder } = require('discord.js')
const { diffChars } = require('diff')
const delay = require('../helpers/delay')
const nconf = require('nconf')
const random = require('randomcolor')
const requiredKeys = ['LOGS', 'CHANNEL_LOG', 'SERVER']
const exemptChannels = ['ads', 'almanax', 'annonces', 'announcements', 'helpers', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const isExempt = (channel) => exemptChannels.includes(channel.name)
  const fetchLogChannel = async (guild) => guild.channels.fetch(nconf.get('CHANNEL_LOG'))
  const logMessage = (channel, embed) => channel.send({ embeds: [embed] })
  const generateEmbed = (message, description, timestamp, color = random()) => new EmbedBuilder()
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
    .setDescription(description).setFooter({ text: `#${message.channel.name}` }).setTimestamp(timestamp).setColor(color)

  client.on('messageDelete', async (message) => {
    if (message.guildId !== nconf.get('SERVER') || isExempt(message.channel)) return
    const logChannel = await fetchLogChannel(message.guild)
    if (!logChannel) return
    const embed = generateEmbed(message, message.content || ' ', message.createdTimestamp).setImage(message.attachments.first()?.proxyURL || null)
    logMessage(logChannel, embed)
  })

  client.on('messageDeleteBulk', async (messages) => {
    const firstMsg = messages.first()
    if (firstMsg.guildId !== nconf.get('SERVER') || isExempt(firstMsg.channel)) return
    const logChannel = await fetchLogChannel(firstMsg.guild)
    if (!logChannel) return
    messages.reverse().forEach((msg) => {
      const embed = generateEmbed( msg, msg.content || ' ', msg.createdTimestamp).setImage(msg.attachments.first()?.proxyURL || null)
      logMessage(logChannel, embed)
    })
  })

  client.on('guildBanAdd', async (ban) => {
    if (ban.guild.id !== nconf.get('SERVER')) return
    await delay(10000)
    const logChannel = await fetchLogChannel(ban.guild)
    if (!logChannel) return
    const log = await ban.guild.fetchAuditLogs({ limit: 25, type: AuditLogEvent.MemberBanAdd })
    const entry = log.entries.find(e => ban.user.id === e.target.id)
    const message = entry ? `${entry.target.username} (${entry.target.id}) was banned by <@${entry.executor.id}> on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} for ${entry.reason || 'fun'}` : `${ban.user.username} (${ban.user.id}) was banned on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} without witnesses`
    logChannel.send(message)
  })

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author.bot || oldMessage.content === newMessage.content || isExempt(newMessage.channel)) return
    const logChannel = await fetchLogChannel(newMessage.guild)
    if (!logChannel) return
    const differences = diffChars(oldMessage.content, newMessage.content)
    const formattedChanges = differences.map(part => part.added ? `**${part.value}**` : part.removed ? `~~${part.value}~~` : part.value).join('')
    const embed = generateEmbed(newMessage, `**Old:**\n${oldMessage.content.slice(0, 2000)}\n\n**New:**\n${formattedChanges.slice(0, 2000)}`, newMessage.editedTimestamp)
    logMessage(logChannel, embed)
  })
}