const { SlashCommandBuilder } = require('@discordjs/builders')
const { Hercai } = require('hercai')
const hercai = new Hercai()
const choices = [
  ['Gemma2', 'gemma2-9b'],
  ['Llama3', 'llama3-70b'],
  ['Mixtral', 'mixtral-8x7b'],
  ['GPT4 (Default)', 'v3-32k'],
].map(([name, value]) => ({ name, value }))

module.exports = {
  data: new SlashCommandBuilder().setName('chat').setDescription('Have a chat with the bot')
  .addStringOption(option => option.setName('prompt').setDescription('Talk to the bot').setRequired(true))
  .addStringOption(option => option.setName('version').setDescription('Choose AI version').addChoices(...choices)),
  async execute(interaction) {
    await interaction.deferReply()
    const model = interaction.options.getString('version') || 'v3-32k'
    const prompt = interaction.options.getString('prompt')
    try {
      const { reply } = await hercai.question({ model, prompt })
      const replyText = `*${prompt}*\n\n${reply}`
      if (replyText.length < 1999) {
        await interaction.editReply(replyText)
      } else {
        const chunks = replyText.match(new RegExp(`.{1,${1999}}`, 'g')) || []
        await interaction.editReply(chunks.shift())
        for (const chunk of chunks) {
          await interaction.followUp(chunk)
        }
      }
    } catch (err) {
      await interaction.editReply(err.toString())
    }
  }
}