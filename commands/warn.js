const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')

module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Enter a reason').setRequired(true)),
  async execute(interaction) {
    if (!nconf.get('CHANNEL_BOT') || !nconf.get('CHANNEL_LOG')) return
    const user = interaction.options.getMember('user')
    await interaction.guild.channels.fetch(nconf.get('CHANNEL_BOT')).then(async c => {
      await c.messages.fetch('995777599135551548').then(m => {
        const obj = { u: [] }
        let text = ''
        m.content.split('\n').forEach(e => obj.u.push({ N: e.split(' ')[0], W: Number(e.split(' ')[1]) }))
        if (obj.u.find(d => `<@${user.id}>` === d.N)) obj.u.find(d => `<@${user.id}>` === d.N).W++
        else obj.u.push({ N: user, W: 1 })
        obj.u.forEach(t => text += `${t.N} ${t.W}\n`)
        m.edit(text)
      })
      await interaction.guild.channels.fetch(nconf.get('CHANNEL_LOG')).then(async c => {
        c.send(`${user} has been warned by ${interaction.member} on ${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} for ${interaction.options.getString('reason')}`)
      })
    })
    await interaction.reply({ content: `${user} :warning: <#678610533699813407> <#678708610762670101>` })
  }
}