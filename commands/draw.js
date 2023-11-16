const { SlashCommandBuilder } = require('@discordjs/builders')
const { Hercai } = require('hercai')
const herc = new Hercai()

module.exports = {
  data: new SlashCommandBuilder().setName('draw').setDescription('Ask the bot to generate an image')
    .addStringOption(option => option.setName('prompt').setDescription('Write a prompt for the image').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply()
    let msg = `*${interaction.options.getString('prompt')}*\n\n`
    await herc.drawImage({ model: "v2", prompt: interaction.options.getString('prompt') }).then(response => {
      return interaction.editReply({ content: msg, files: [response.url] })
    })
  }
}