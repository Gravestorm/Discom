const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const requiredKeys = ['RULES']

module.exports = {
  data: new SlashCommandBuilder().setName('rules').setDescription('Update the rules')
  .addStringOption(option => option.setName('oldmessage').setDescription('Choose the rule text to change')
  .addChoices(
    { name: 'FR Regles du Serveur', value: '984205081622761502' },
    { name: 'FR Information des Salons', value: '984205085611532348' },
    { name: 'FR Information des Roles', value: '984205103412158544' },
    { name: 'FR Autres Informations', value: '984205109644886086' },
    { name: 'EN Server Rules', value: '984175285085798523' },
    { name: 'EN Channel Information', value: '984175289754071101' },
    { name: 'EN Role Information', value: '984175308657791036' },
    { name: 'EN Other Information', value: '984175313850351677' },
  ).setRequired(true))
  .addStringOption(option => option.setName('newmessage').setDescription('Message ID of the new rule text in this channel').setRequired(true)),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    const oldMessage = interaction.options.getString('oldmessage')
    const newMessage = interaction.options.getString('newmessage')
    const channel = await interaction.guild.channels.fetch(oldMessage.startsWith('9842') ? '678708610762670101' : '678610533699813407')
    await interaction.channel.messages.fetch(newMessage).then(m => channel.messages.fetch(oldMessage).then(msg => { msg.edit(m.content); m.delete() }))
  }
}