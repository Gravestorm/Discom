const { AuditLogEvent, AttachmentBuilder, EmbedBuilder } = require('discord.js')
const { diffChars, diffWords } = require('diff')
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['LOGS', 'CHANNEL_LOG', 'SERVER']
const exemptChannels = ['ads', 'almanax', 'annonces', 'announcements', 'helpers', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server']

const fetchLogChannel = guild => guild.channels.fetch(nconf.get('CHANNEL_LOG'))

const isExempt = channel => exemptChannels.includes(channel.name)

function generateEmbed(message, description, timestamp, color = randomColor()) {
  return new EmbedBuilder()
    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
    .setDescription(description)
    .setFooter({ text: `#${message.channel.name}` })
    .setTimestamp(timestamp)
    .setColor(color)
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function processAttachment(attachment, message, mainEmbed) {
  try {
    const response = await fetch(attachment.url)
    if (!response.ok) console.error(`Failed to fetch attachment: ${response.status} ${response.statusText}`)
    const buffer = await response.arrayBuffer()
    if (!buffer || buffer.byteLength === 0) console.error('Received empty buffer for attachment')
    const attachmentFile = new AttachmentBuilder(Buffer.from(buffer), {
      name: attachment.name, description: `Deleted file from ${message.author.tag}`
    })
    const embed = new EmbedBuilder()
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setDescription(`**Name:** ${attachment.name}\n**Size:** ${formatFileSize(attachment.size)}\n**Type:** ${attachment.contentType || 'Unknown'}`)
      .setFooter({ text: `#${message.channel.name}` })
      .setTimestamp(message.createdTimestamp)
      .setColor(mainEmbed.data.color)
    return { file: attachmentFile, embed: embed }
  } catch (err) {
    console.error(`Failed to process attachment: ${attachment.name}`, err)
    return {
      embed: new EmbedBuilder()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setDescription(`❌ Failed to save attachment: ${attachment.name}\nError: ${err.message}`)
        .setFooter({ text: `#${message.channel.name}` })
        .setTimestamp(message.createdTimestamp)
        .setColor('Red')
    }
  }
}

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return

  client.on('messageDelete', async (message) => {
    if (message.guildId !== nconf.get('SERVER') || isExempt(message.channel)) return
    const logChannel = await fetchLogChannel(message.guild)
    if (!logChannel) return
    const mainEmbed = generateEmbed(message, message.content || ' ', message.createdTimestamp)
    if (message.content) await logChannel.send({ embeds: [mainEmbed] })
    if (message.attachments.size > 0) {
      const processedAttachments = await Promise.all(Array.from(message.attachments.values()).map(attachment => processAttachment(attachment, message, mainEmbed)))
      for (const attachment of processedAttachments) {
        if (attachment.file) await logChannel.send({ files: [attachment.file], embeds: [attachment.embed] })
        else await logChannel.send({ embeds: [attachment.embed] })
      }
    }
  })

  client.on('guildBanAdd', async (ban) => {
    if (ban.guild.id !== nconf.get('SERVER')) return
    await delay(10000)
    const logChannel = await fetchLogChannel(ban.guild)
    if (!logChannel) return
    const log = await ban.guild.fetchAuditLogs({ limit: 25, type: AuditLogEvent.MemberBanAdd })
    const entry = log.entries.find(entry => ban.user.id === entry.target.id)
    const embed = new EmbedBuilder().setTitle('Banned:tm:').setDescription(`**User that got <:Ben:307581492010418176>**\n<@${entry?.target.id || ban.user.id}> - ${entry?.target.id || ban.user.id} - ${(entry?.target.username || ban.user.username).replace(/([_*\\])/g, '\\$1')}\n\n**Cleaner that did the <:Ben:307581492010418176>**\n<@${entry?.executor.id || 'Unknown'}>\n\n**Date of the <:Ben:307581492010418176>**\n${date(undefined, true)}\n\n**Reason for the <:Ben:307581492010418176>**\n${entry?.reason ? entry.reason.replace(/([_*\\])/g, '\\$1') : '¯\\_(ツ)_/¯'}`)
    await logChannel.send({ embeds: [embed] })
  })

  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content || newMessage.author.bot || isExempt(newMessage.channel) || newMessage.guild.id !== nconf.get('SERVER')) return
    const logChannel = await fetchLogChannel(newMessage.guild)
    if (!logChannel) return
    const formattedChanges = diffWords(oldMessage.content, newMessage.content).map(part => {
      if (part.added && part.removed) return diffChars(part.removed, part.added).map(charPart => charPart.added ? `**${charPart.value}**` : charPart.removed ? `~~${charPart.value}~~` : charPart.value).join('')
      return part.added ? `**${part.value}**` : part.removed ? `~~${part.value}~~` : part.value
    }).join('')
    const embed = generateEmbed(newMessage, `**Old:**\n${oldMessage.content.slice(0, 2000)}\n\n**New:**\n${formattedChanges.slice(0, 2000)}`, newMessage.editedTimestamp)
    await logChannel.send({ embeds: [embed] })
  })
}