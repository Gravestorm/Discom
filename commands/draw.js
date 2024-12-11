const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const fs = require('fs').promises
const { Hercai } = require('hercai')
const hercai = new Hercai()
const choices = [
  ['Shonin', 'shonin'],
  ['Raava', 'raava'],
  ['Animefy', 'animefy'],
  ['Simurg', 'simurg'],
  ['Lexica', 'lexica'],
  ['Dall-E 3', 'v3'],
  ['Prodia (Default)', 'prodia'],
].map(([name, value]) => ({ name, value }))

module.exports = {
  data: new SlashCommandBuilder().setName('draw').setDescription('Ask the bot to generate an image')
  .addStringOption(option => option.setName('prompt').setDescription('Write a prompt for the image').setRequired(true))
  .addStringOption(option => option.setName('version').setDescription('Choose AI version').addChoices(...choices))
  .addBooleanOption(option => option.setName('silent').setDescription('Should the response be visible only to you if true or be public if false')),
  async execute(interaction) {
    const isSilent = options.getBoolean('silent') || true
    await interaction.deferReply({ ephemeral: isSilent })
    const model = interaction.options.getString('version') || 'prodia'
    const prompt = interaction.options.getString('prompt')
    try {
      const { reply } = await hercai.drawImage({ model, prompt })
      const { data } = await axios.get(reply, { responseType: 'arraybuffer' })
      const tempFilePath = path.join(process.cwd(), `${Date.now()}.png`)
      await fs.writeFile(tempFilePath, Buffer.from(data))
      await interaction.editReply({ content: `*${prompt}*\n\n`, files: [tempFilePath], ephemeral: isSilent })
      await fs.unlink(tempFilePath)
    } catch (err) {
      await interaction.editReply({ content: err.toString(), ephemeral: isSilent })
    }
  }
}