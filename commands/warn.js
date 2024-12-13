const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const date = require('../helpers/date')
const requiredKeys = ['ROLE_WARN1', 'ROLE_WARN2', 'ROLE_WARN3', 'THREAD_WARN']

module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Enter a reason').setRequired(true))
    .addBooleanOption(option => option.setName('silent').setDescription('Should the warning be silent or send a message in this channel with a link to the rules'))
    .addBooleanOption(option => option.setName('unwarn').setDescription('Remove a warning from the user')),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    const { guild, member: moderator, options } = interaction
    const user = options.getMember('user')
    const reason = options.getString('reason')
    const isUnwarn = options.getBoolean('unwarn')
    const isSilent = options.getBoolean('silent')
    const warnRoles = requiredKeys.slice(1).map(key => nconf.get(key))
    const logChannel = await guild.channels.fetch(nconf.get('THREAD_WARN'))
    const getCurrentWarnLevel = () => warnRoles.findIndex(role => user.roles.cache.has(role))
    const updateWarnRole = async (currentLevel, isUnwarn) => {
      const newLevel = isUnwarn ? Math.max(currentLevel - 1, -1) : Math.min(currentLevel + 1, 2)
      if (currentLevel !== -1) await user.roles.remove(warnRoles[currentLevel])
      if (newLevel !== -1) await user.roles.add(warnRoles[newLevel])
    }
    const currentLevel = getCurrentWarnLevel()
    await updateWarnRole(currentLevel, isUnwarn)
    const action = isUnwarn ? 'unwarned' : 'warned'
    await logChannel.send(`${user} has been ${action} by ${moderator} on ${date()} for ${reason}`)
    const replyContent = isUnwarn ? 'User unwarned successfully' : isSilent ? 'User warned successfully' : `${user} :warning: <#678610533699813407> <#678708610762670101>`
    await interaction.reply({ content: replyContent, ephemeral: isSilent || isUnwarn })
  }
}