const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const nconf = require('nconf')
const random = require('randomcolor')

module.exports = {
  data: new SlashCommandBuilder().setName('delete').setDescription('Delete a number of messages in this channel, optionally from a user and/or move them to a channel')
    .addNumberOption(option => option.setName('number').setDescription('Number of messages').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('Select a user'))
    .addChannelOption(option => option.setName('channel').setDescription('Select a channel')),
  async execute(interaction) {
    if (!nconf.get('CHANNEL_LOG')) return
    const num = interaction.options.getNumber('number')
    if (num > 100) num = 100
    const user = interaction.options.getMember('user')
    const channel = interaction.options.getChannel('channel')
    if (!user && !channel) await interaction.channel.bulkDelete(num)
    if (!user && channel) await interaction.channel.bulkDelete(num).then(msgs => msgs.reverse().forEach(m => channel.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] })))
    if (user && !channel) await interaction.channel.messages.fetch({ limit: 100, cache: false }).then(msgs => msgs.filter(m => m.author.id === user.id).first(num).reverse().forEach(m => m.delete()))
    if (user && channel) await interaction.channel.messages.fetch({ limit: 100, cache: false }).then(msgs => msgs.filter(m => m.author.id === user.id).first(num).reverse().forEach(m => { m.delete(); channel.send({ embeds: [new EmbedBuilder().setAuthor({ name: m.author.username, iconURL: m.author.displayAvatarURL() }).setDescription(m.content ? m.content : ' ').setImage(m.attachments.first() ? m.attachments.first().proxyURL : null).setFooter({ text: `#${m.channel.name}` }).setTimestamp(m.createdTimestamp).setColor(random())] }) }))
    await interaction.reply({ content: 'Messages deleted successfully.', ephemeral: true })
  }
}