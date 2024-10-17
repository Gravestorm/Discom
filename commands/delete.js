const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['CHANNEL_LOG']

const createEmbed = (message) => new EmbedBuilder()
  .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
  .setDescription(message.content || ' ')
  .setImage(message.attachments.first()?.proxyURL || null)
  .setFooter({ text: `#${message.channel.name}` })
  .setTimestamp(message.createdTimestamp)
  .setColor(randomColor())

module.exports = {
  data: new SlashCommandBuilder().setName('delete').setDescription('Delete a number of messages in this channel, optionally from a user and/or move them to a channel')
    .addNumberOption(option => option.setName('number').setDescription('Number of messages').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('Select a user'))
    .addChannelOption(option => option.setName('channel').setDescription('Select a channel')),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    const num = Math.min(interaction.options.getNumber('number'), 100)
    const user = interaction.options.getMember('user')
    const targetChannel = interaction.options.getChannel('channel')
    const deleteAndMove = async (messages) => {
      for (const message of messages) {
        await message.delete()
        if (targetChannel) await targetChannel.send({ embeds: [createEmbed(message)] })
      }
    }
    let messages
    if (user) messages = (await interaction.channel.messages.fetch({ limit: 100 })).filter(message => message.author.id === user.id).first(num)
    else messages = await interaction.channel.bulkDelete(num)
    if (messages.size > 0) {
      if (user || targetChannel) await deleteAndMove([...messages.values()].reverse())
      await interaction.reply({ content: 'Messages deleted successfully.', ephemeral: true })
    } else {
      await interaction.reply({ content: 'No messages found to delete.', ephemeral: true })
    }
  }
}