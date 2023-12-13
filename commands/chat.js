const { SlashCommandBuilder } = require('@discordjs/builders')
const { Hercai } = require('hercai')
const herc = new Hercai()

module.exports = {
  data: new SlashCommandBuilder().setName('chat').setDescription('Have a chat with the bot').addStringOption(option => option.setName('text').setDescription('Talk to the bot').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply()
    await herc.question({ model: 'v3-beta', content: interaction.options.getString('text') }).then(async response => {
      const replyText = `*${interaction.options.getString('text')}*\n\n${response.reply}`
      if (replyText.length >= 1999) {
        const chunks = []
        let currentChunk = ''
        for (const word of replyText.split(' ')) {
          if (currentChunk.length + word.length <= 1999) {
            currentChunk += word + ' '
          } else {
            chunks.push(currentChunk)
            currentChunk = word + ' '
          }
        }
        if (currentChunk.trim() !== '') {
          chunks.push(currentChunk.trim())
        }
        for (const chunk of chunks) {
          await interaction.followUp(chunk)
        }
      } else {
        await interaction.editReply(replyText)
      }
    }).catch(err => interaction.editReply(err.toString()))
  }
}