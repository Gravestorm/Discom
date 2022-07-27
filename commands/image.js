const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const promise = require('bluebird')
const delay = ms => new promise(resolve => setTimeout(resolve, ms))

module.exports = {
  data: new SlashCommandBuilder().setName('image').setDescription('Grant the permission to send images for a user')
    .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
    .addNumberOption(option => option.setName('minutes').setDescription('Enter the amount of time in minutes')),
  async execute(interaction) {
    if (!nconf.get('ROLE_IMAGE')) return
    await interaction.deferReply({ ephemeral: true })
    await interaction.options.getMember('user').roles.add(nconf.get('ROLE_IMAGE'))
    await interaction.editReply({ content: 'Permission given successfully.', ephemeral: true })
    interaction.options.getNumber('minutes') ? await delay(interaction.options.getNumber('minutes') * 60000) : await delay(120000)
    await interaction.options.getMember('user').roles.remove(nconf.get('ROLE_IMAGE'))
    await interaction.editReply({ content: 'Permission removed successfully.', ephemeral: true })
  }
}