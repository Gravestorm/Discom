const { SlashCommandBuilder } = require('@discordjs/builders')
const cleverbot = require('cleverbot')
const nconf = require('nconf')
const C = new cleverbot({ key: nconf.get('CLEVERBOT') })

module.exports = {
  data: new SlashCommandBuilder().setName('chat').setDescription('Have a chat with the bot')
    .addStringOption(option => option.setName('text').setDescription('Talk to the bot').setRequired(true)),
  async execute(interaction) {
    if (!nconf.get('CLEVERBOT')) return
    let msg = `***${interaction.user.username}:*** *${interaction.options.getString('text')}*\n\n`
    await C.query(interaction.options.getString('text').replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, 'emoji')).then(response => {
      msg += response.output
      return interaction.reply(msg)
    })
  }
}