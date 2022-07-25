const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const promise = require('bluebird')
const delay = ms => new promise(resolve => setTimeout(resolve, ms))

module.exports = {
  data: new SlashCommandBuilder().setName('image').setDescription('Give permissions to send images for a user')
  .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true)),
  async execute(interaction) {
    if (!nconf.get('ROLE_IMAGE')) return
    await interaction.deferReply({ ephemeral: true })
    await interaction.options.getMember('user').roles.add(nconf.get('ROLE_IMAGE'))
    await interaction.editReply({ content: 'Permission given successfully.', ephemeral: true })
    await delay(120000) // 120000 = 2 minutes
    await interaction.options.getMember('user').roles.remove(nconf.get('ROLE_IMAGE'))
    await interaction.editReply({ content: 'Permission removed successfully.', ephemeral: true })
  }
}