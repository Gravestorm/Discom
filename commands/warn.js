const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const date = require('../helpers/date')

module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Enter a reason').setRequired(true))
    .addBooleanOption(option => option.setName('silent').setDescription('Should the warning be silent or send a message in this channel with a link to the rules'))
    .addBooleanOption(option => option.setName('unwarn').setDescription('Remove a warning from the user')),
  async execute(interaction) {
    if (!nconf.get('CHANNEL_LOG') || !nconf.get('ROLE_WARN1') || !nconf.get('ROLE_WARN2') || !nconf.get('ROLE_WARN3')) return
    const warn1  = nconf.get('ROLE_WARN1')
    const warn2 = nconf.get('ROLE_WARN2')
    const warn3 = nconf.get('ROLE_WARN3')
    const user = interaction.options.getMember('user')
    const logChannel = await interaction.guild.channels.fetch(nconf.get('CHANNEL_LOG'))

    if (interaction.options.getString('unwarn') === true) {
      switch (true) {
        case user.roles.cache.has(warn1):
          user.roles.remove(warn1); break
        case user.roles.cache.has(warn2):
          user.roles.remove(warn2); user.roles.add(warn1); break
        case user.roles.cache.has(warn3):
          user.roles.remove(warn3); user.roles.add(warn2); break
        default:
          break
      }
    await logChannel.send(`${user} has been unwarned by ${interaction.member} on ${date()} for ${interaction.options.getString('reason')}`)
    } else {
      switch (true) {
        case user.roles.cache.has(warn1):
          user.roles.remove(warn1); user.roles.remove(warn2); break
        case user.roles.cache.has(warn2):
          user.roles.remove(warn2); user.roles.add(warn3); break
        default:
          user.roles.add(warn1); break
      }
      await logChannel.send(`${user} has been warned by ${interaction.member} on ${date()} for ${interaction.options.getString('reason')}`)
      if (interaction.options.getString('unwarn') !== true) await interaction.reply({ content: `${user} :warning: <#678610533699813407> <#678708610762670101>` })
    }
  }
}