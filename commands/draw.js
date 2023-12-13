const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const fs = require('fs').promises
const { Hercai } = require('hercai')
const herc = new Hercai()

module.exports = {
  data: new SlashCommandBuilder().setName('draw').setDescription('Ask the bot to generate an image')
    .addStringOption(option => option.setName('prompt').setDescription('Write a prompt for the image').setRequired(true))
    .addStringOption(option => option.setName('version').setDescription('Choose AI version').addChoices(
      { name: 'Dall-E 3', value: 'v3' },
      { name: 'Dall-E 2 Beta', value: 'v2-beta' },
      { name: 'Dall-E 2', value: 'v2' },
      { name: 'Dall-E 1', value: 'v1' },
      { name: 'Lexica', value: 'lexica' },
      { name: 'Prodia (default)', value: 'prodia' },
    )),
  async execute(interaction) {
    await interaction.deferReply()
    let msg = `*${interaction.options.getString('prompt')}*\n\n`
    await herc.drawImage({ model: interaction.options.getString('version') ? interaction.options.getString('version') : 'prodia', prompt: interaction.options.getString('prompt') }).then(async (response) => {
      const { data } = await axios.get(response.url, { responseType: 'arraybuffer' })
      const tempFilePath = `${response.url.split('?')[0].split('/').pop()}.png`
      await fs.writeFile(tempFilePath, Buffer.from(data))
      await interaction.editReply({ content: msg, files: [tempFilePath] })
      await fs.unlink(tempFilePath)
    }).catch(err => interaction.editReply(err.toString()))
  }
}