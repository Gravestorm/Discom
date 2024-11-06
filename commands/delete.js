const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Collection } = require('discord.js')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['CHANNEL_LOG']

module.exports = {
  data: new SlashCommandBuilder().setName('delete').setDescription('Delete a number of messages in this channel, optionally from a user and/or move them to a channel')
    .addNumberOption(option => option.setName('number').setDescription('Number of messages').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('Select a user'))
    .addChannelOption(option => option.setName('channel').setDescription('Select a channel')),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    await interaction.deferReply({ephemeral: true})
    const num = Math.min(interaction.options.getNumber('number'), 100)
    const user = interaction.options.getMember('user')
    const targetChannel = interaction.options.getChannel('channel')
    const messages = await interaction.channel.messages.fetch({ limit: user ? 100 : num })
    let filteredMessages
    if (user) {
      const filtered = messages.filter(message => message.author.id === user.id)
      filteredMessages = new Collection()
      let count = 0
      for (const [id, message] of filtered) {
        if (count >= num) break
        filteredMessages.set(id, message)
        count++
      }
    } else {
      filteredMessages = messages
    }
    if (filteredMessages.size > 0) {
      try {
        if (targetChannel) {
          const embeds = [...filteredMessages.values()].reverse().map(message =>
            new EmbedBuilder()
              .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
              .setDescription(message.content || ' ')
              .setImage(message.attachments.first()?.proxyURL || null)
              .setFooter({ text: `#${message.channel.name}` })
              .setTimestamp(message.createdTimestamp)
              .setColor(randomColor())
          )
          const embedChunks = []
          for (let i = 0; i < embeds.length; i += 10) embedChunks.push(embeds.slice(i, i + 10))
          await Promise.all(embedChunks.map(chunk => targetChannel.send({ embeds: chunk })))
        }
        await interaction.channel.bulkDelete(filteredMessages)
        await interaction.editReply({ content: `Successfully deleted ${filteredMessages.size} messages.`, ephemeral: true })
      } catch (err) {
        console.error('Error during deletion:', err)
        await interaction.editReply({ content: 'An error occurred while deleting messages.', ephemeral: true })
      }
    } else {
      await interaction.editReply({ content: 'No messages found to delete.', ephemeral: true })
    }
  }
}