const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const random = require('randomcolor')
const almanax = JSON.parse(fs.readFileSync('AlmanaxYears.json'))
const requiredKeys = ['CHANNEL_ALMANAX']

module.exports = {
  data: new SlashCommandBuilder().setName('almanax').setDescription('Fetches the Almanax of a specific day')
    .addStringOption(option => option.setName('date').setDescription('Enter the day in the following format: yyyy-mm-dd (e.g. 2024-12-31)').setRequired(true)),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    let date
    let datef = '2012-09-19'.split('-')
    let datet = '2040-12-31'.split('-')
    let datec = interaction.options.getString('date').toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).split('-')
    let df = new Date(datef[0], parseInt(datef[1]) - 1, datef[2])
    let dt = new Date(datet[0], parseInt(datet[1]) - 1, datet[2])
    let dc = new Date(datec[0], parseInt(datec[1]) - 1, datec[2])
    dc > df && dc < dt ? date = new Date(interaction.options.getString('date')).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }) : date = new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
    let d = almanax.find(d => d.D.includes(date))
    await interaction.reply({ content: dc > df && dc < dt ? ' ' : 'Correct date format: yyyy-mm-dd (e.g. 2024-12-31)', embeds: [new EmbedBuilder().setTitle(`**${date} | ${d.N} | ${d.R}**`).setDescription(`**Objet:** ${d.IFR}\n${d.BFR}\n\n\n**Item:** ${d.IEN}\n${d.BEN}`).setThumbnail(d.I).setColor(random())], ephemeral: true })
  }
}