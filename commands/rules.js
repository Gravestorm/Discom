const { SlashCommandBuilder } = require('@discordjs/builders')
const choices = [
  ['FR Regles du Serveur', '984205081622761502'],
  ['FR Information des Salons', '984205085611532348'],
  ['FR Information des Roles', '984205103412158544'],
  ['FR Autres Informations', '984205109644886086'],
  ['EN Server Rules', '984175285085798523'],
  ['EN Channel Information', '984175289754071101'],
  ['EN Role Information', '984175308657791036'],
  ['EN Other Information', '984175313850351677'],
].map(([name, value]) => ({ name, value }))

module.exports = {
  data: new SlashCommandBuilder().setName('rules').setDescription('Update the rules')
    .addStringOption(option => option.setName('oldmessage').setDescription('Choose the rule text to change').addChoices(...choices).setRequired(true))
    .addStringOption(option => option.setName('newmessage').setDescription('Message ID of the new rule text in this channel').setRequired(true)),
  async execute(interaction) {
    const oldMessageId = interaction.options.getString('oldmessage')
    const newMessageId = interaction.options.getString('newmessage')
    const channelId = oldMessageId.startsWith('9842') ? '678708610762670101' : '678610533699813407'
    try {
      const channel = await interaction.guild.channels.fetch(channelId)
      const [newMessage, oldMessage] = await Promise.all([ interaction.channel.messages.fetch(newMessageId), channel.messages.fetch(oldMessageId) ])
      await oldMessage.edit(newMessage.content)
      await interaction.reply({ content: 'Rules updated successfully.', ephemeral: true })
    } catch (err) {
      await interaction.reply({ content: err.toString(), ephemeral: true })
    }
  }
}