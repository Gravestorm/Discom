const { AuditLogEvent, EmbedBuilder } = require('discord.js')
const { diffChars } = require('diff')
const delay = require('../helpers/delay')
const nconf = require('nconf')
const random = require('randomcolor')
const requiredKeys = ['LOGS', 'CHANNEL_LOG', 'SERVER']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  client.on('messageDelete', m => {
    if (m.guildId !== nconf.get('SERVER') || ['ads', 'almanax', 'annonces', 'announcements', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server'].includes(m.channel.name) || !m.guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    m.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] }))
  })
  client.on('messageDeleteBulk', msgs => {
    if (msgs.first().guildId !== nconf.get('SERVER') || ['ads', 'almanax', 'annonces', 'announcements', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server'].includes(msgs.first().channel.name) || !msgs.first().guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    msgs.first().guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => msgs.reverse().forEach(m => c.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] })))
  })
  client.on('guildBanAdd', async ban => {
    if (ban.guild.id !== nconf.get('SERVER') || !ban.guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    await delay(10000)
    const log = await ban.guild.fetchAuditLogs({ limit: 25, type: AuditLogEvent.MemberBanAdd })
    const l = log.entries.find(t => ban.user.id === t.target.id)
    ban.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send(l ? `${l.target.username}#${l.target.discriminator} (${l.target.id}) has been killed by <@${l.executor.id}> on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} for ${l.reason ? l.reason : 'fun'}` : `${ban.user.username}#${ban.user.discriminator} (${ban.user.id}) has been killed on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} by a mysterious fellow without any witnesses`))
  })
  client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.author.bot || oldMessage.content === newMessage.content || newMessage.guildId !== nconf.get('SERVER') || ['ads', 'almanax', 'annonces', 'announcements', 'leaderboard', 'madhouse', 'regles-info', 'rules-info', 'server'].includes(newMessage.channel.name) || !newMessage.guild.channels.fetch(nconf.get('CHANNEL_LOG'))) return
    const differences = diffChars(oldMessage.content, newMessage.content)
    const formattedChanges = differences.map(part => part.added ? `**${part.value}**` : part.removed ? `~~${part.value}~~` : part.value).join('')
    newMessage.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(c => c.send({ embeds: [new EmbedBuilder().setAuthor({ name: newMessage.author.username, iconURL: newMessage.author.displayAvatarURL() }).setDescription(`**Old:**\n${oldMessage.content.slice(0, 2000)}\n\n**New:**\n${formattedChanges.slice(0, 2000)}`).setFooter({ text: `#${newMessage.channel.name}` }).setTimestamp(newMessage.editedTimestamp).setColor(random())] }))
  })
}