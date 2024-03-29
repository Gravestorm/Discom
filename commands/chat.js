const { SlashCommandBuilder } = require('@discordjs/builders')
const { Hercai } = require('hercai')
const herc = new Hercai()

module.exports = {
  data: new SlashCommandBuilder().setName('chat').setDescription('Have a chat with the bot')
  .addStringOption(option => option.setName('text').setDescription('Talk to the bot').setRequired(true))
  .addStringOption(option => option.setName('version').setDescription('Choose AI version').addChoices(
    { name: 'Google Gemini-Pro', value: 'gemini' },
    { name: 'GPT-4 Turbo-16k', value: 'turbo-16k' },
    { name: 'GPT-4 Turbo', value: 'turbo' },
    { name: 'GPT-4-32k', value: 'v3-32k' },
    { name: 'GPT-4 (default)', value: 'v3' },
  )),
  async execute(interaction) {
    await interaction.deferReply()
    const response = await herc.question({ model: interaction.options.getString('version') ? interaction.options.getString('version') : 'v3', content: interaction.options.getString('text') }).catch(err => interaction.editReply(err.toString()))
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
  }
}