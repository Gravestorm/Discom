const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['CHANNEL_ALMANAX']

module.exports = {
  data: new SlashCommandBuilder().setName('almanax').setDescription('Fetches the Almanax of a specific day')
    .addStringOption(option => option.setName('date').setDescription('Enter the day in the following format: yyyy-mm-dd (e.g. 2024-12-31)').setRequired(true)),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    const almanax = JSON.parse(fs.readFileSync('AlmanaxYears.json'))
    const dateFormat = { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }
    const dateRange = { start: new Date('2012-09-19'), end: new Date('2040-12-31') }
    const inputDate = new Date(interaction.options.getString('date'))
    const isValidDate = inputDate >= dateRange.start && inputDate <= dateRange.end
    const date = isValidDate ? inputDate : new Date()
    const formattedDate = date.toLocaleString('LT', dateFormat)
    const almanaxData = almanax.find(data => data.D.includes(formattedDate))
    const embed = new EmbedBuilder()
      .setTitle(`**${formattedDate} | ${almanaxData.N} | ${almanaxData.R}**`)
      .setDescription(`**Objet:** ${almanaxData.IFR}\n${almanaxData.BFR}\n\n\n**Item:** ${almanaxData.IEN}\n${almanaxData.BEN}`)
      .setThumbnail(almanaxData.I)
      .setColor(randomColor())
    await interaction.reply({
      content: isValidDate ? ' ' : 'Correct date format: yyyy-mm-dd (e.g. 2024-12-31)',
      embeds: [embed],
      ephemeral: true
    })
  }
}