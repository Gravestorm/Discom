const { SlashCommandBuilder } = require('@discordjs/builders')
const { Hercai } = require('hercai')
const herc = new Hercai()

module.exports = {
  data: new SlashCommandBuilder().setName('chat').setDescription('Have a chat with the bot')
    .addStringOption(option => option.setName('text').setDescription('Talk to the bot').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply()
    let msg = `*${interaction.member.nickname}: ${interaction.options.getString('text')}*\n\n`
    await herc.question({ model: "v2", content: interaction.options.getString('text') }).then(response => {
      msg += response.reply
      return interaction.editReply(msg)
    })
  }
}