const { EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const random = require('randomcolor')
const almanax = JSON.parse(fs.readFileSync('AlmanaxYears.json'))
const requiredKeys = ['ALMANAX', 'CHANNEL_ALMANAX']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(() => {
    client.channels.fetch(nconf.get('CHANNEL_ALMANAX')).then(c => c.messages.fetch({ limit: 1, cache: false }).then(m => {
      if (m.last()?.embeds[0]?.data.title.substring(2, 12) === new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })) return
      m.last()?.delete()
      let d = almanax.find(d => d.D.includes(new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })))
      client.channels.fetch(nconf.get('CHANNEL_ALMANAX')).then(c => c.send({ embeds: [new EmbedBuilder().setTitle(`**${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })} | ${d.N} | ${d.R}**`).setDescription(`**Objet:** ${d.IFR}\n${d.BFR}\n\n\n**Item:** ${d.IEN}\n${d.BEN}`).setImage(d.I).setColor(random())] }).then(m => m.crosspost()))
    }))
  }, 300000) // 300000 = 5 minutes
}