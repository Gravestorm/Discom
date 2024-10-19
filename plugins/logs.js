const { AuditLogEvent, EmbedBuilder } = require('discord.js')
const { diffChars, diffWords } = require('diff')
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['LOGS', 'CHANNEL_LOG', 'SERVER']
const exemptChannels = ['ads', 'almanax', 'annonces', 'announcements', 'helpers', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const isExempt = (channel) => exemptChannels.includes(channel.name)
  const fetchLogChannel = async (guild) => guild.channels.fetch(nconf.get('CHANNEL_LOG'))
  const logMessage = (channel, embed) => channel.send({ embeds: [embed] })
  const generateEmbed = (message, description, timestamp, color = randomColor()) => new EmbedBuilder()
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
    .setDescription(description).setFooter({ text: `#${message.channel.name}` }).setTimestamp(timestamp).setColor(color)

  client.on('messageDelete', async (message) => {
    if (message.guildId !== nconf.get('SERVER') || isExempt(message.channel)) return
    const logChannel = await fetchLogChannel(message.guild)
    const embed = generateEmbed(message, message.content || ' ', message.createdTimestamp).setImage(message.attachments.first()?.proxyURL || null)
    logMessage(logChannel, embed)
  })

  client.on('messageDeleteBulk', async (messages) => {
    const firstMessage = messages.first()
    if (firstMessage.guildId !== nconf.get('SERVER') || isExempt(firstMessage.channel)) return
    const logChannel = await fetchLogChannel(firstMessage.guild)
    messages.reverse().forEach((message) => {
      const embed = generateEmbed(message, message.content || ' ', message.createdTimestamp).setImage(message.attachments.first()?.proxyURL || null)
      logMessage(logChannel, embed)
    })
  })

  client.on('guildBanAdd', async (ban) => {
    if (ban.guild.id !== nconf.get('SERVER')) return
    await delay(10000)
    const logChannel = await fetchLogChannel(ban.guild)
    const log = await ban.guild.fetchAuditLogs({ limit: 25, type: AuditLogEvent.MemberBanAdd })
    const entry = log.entries.find(entry => ban.user.id === entry.target.id)
    logChannel.send({ embeds: [new EmbedBuilder().setTitle('Banned:tm:').setDescription(`**User that got hammered:**\n<@${entry ? entry.target.id : ban.user.id}> - ${entry ? entry.target.id : ban.user.id} - ${(entry ? entry.target.username : ban.user.username).replace(/([_*\\])/g, '\\$1')}\n\n**Cleaner that showed their true power:**\n<@${entry ? entry.executor.id : 'Unknown'}>\n\n**Date of the incident:**\n${date(undefined, true)}\n\n**Reason that got told to the journalists:**\n${entry ? (entry.reason).replace(/([_*\\])/g, '\\$1') : '¯\\_(ツ)_/¯'}`)] })
  })

  client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author.bot || oldMessage.content === newMessage.content || isExempt(newMessage.channel)) return
  const logChannel = await fetchLogChannel(newMessage.guild)
  const formattedChanges = diffWords(oldMessage.content, newMessage.content).map(part => {
    if (part.added && part.removed) return diffChars(part.removed, part.added).map(charPart => charPart.added ? `**${charPart.value}**` : charPart.removed ? `~~${charPart.value}~~` : charPart.value).join('')
    return part.added ? `**${part.value}**` : part.removed ? `~~${part.value}~~` : part.value
  }).join('')
  const embed = generateEmbed(newMessage, `**Old:**\n${oldMessage.content.slice(0, 2000)}\n\n**New:**\n${formattedChanges.slice(0, 2000)}`, newMessage.editedTimestamp)
  logMessage(logChannel, embed)
  })
}