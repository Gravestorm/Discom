const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const cheerio = require('cheerio')
const fetch = require('request-promise')
const fs = require('node:fs')
const nconf = require('nconf')
const random = require('randomcolor')
const almanax = JSON.parse(fs.readFileSync('almanax.json'))

module.exports = {
  data: new SlashCommandBuilder().setName('almanax').setDescription('Fetches the Almanax of a specific day')
    .addStringOption(option => option.setName('date').setDescription('Enter the day in the following format: yyyy-mm-dd (e.g. 2022-12-31)').setRequired(true)),
  async execute(interaction) {
    if (!nconf.get('CHANNEL_ALMANAX')) return
    let date
    let datef = '2012-09-19'.split('-')
    let datet = '9999-12-31'.split('-')
    let datec = interaction.options.getString('date').toLocaleString('LT', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('-')
    let df = new Date(datef[0], parseInt(datef[1]) - 1, datef[2])
    let dt = new Date(datet[0], parseInt(datet[1]) - 1, datet[2])
    let dc = new Date(datec[0], parseInt(datec[1]) - 1, datec[2])
    dc > df && dc < dt ? date = new Date(interaction.options.getString('date')).toLocaleString('LT', { year: 'numeric', month: '2-digit', day: '2-digit' }) : date = new Date().toLocaleString('LT', { year: 'numeric', month: '2-digit', day: '2-digit' })
    await fetch({ url: `https://www.krosmoz.com/en/almanax/${date}?game=dofus`, encoding: 'utf8', transform: (body) => { return cheerio.load(body) } }).then(async ($) => {
      let d = almanax.find(d => $('#achievement_dofus .mid .more .more-infos p').first().text().trim().replace('Quest: Offering for ', '') === d.N)
      await interaction.reply({ content: dc > df && dc < dt ? ' ' : 'Correct date format: yyyy-mm-dd (e.g. 2022-12-31)', embeds: [new EmbedBuilder().setTitle(`**${date} | ${d.N} | ${d.R}**`).setDescription(`**Objet:** ${d.IFR}\n${d.BFR}\n\n\n**Item:** ${d.IEN}\n${d.BEN}`).setThumbnail(d.I).setColor(random())], ephemeral: true })
    }).catch(err => { throw err })
  }
}