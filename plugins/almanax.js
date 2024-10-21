const { EmbedBuilder } = require('discord.js')
const fs = require('node:fs')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const date = require('../helpers/date')
const requiredKeys = ['ALMANAX', 'CHANNEL_ALMANAX']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const checkAndPostAlmanax = async () => {
    try {
      const channel = await client.channels.fetch(nconf.get('CHANNEL_ALMANAX'))
      const messages = await channel.messages.fetch({ limit: 1 })
      const lastMessage = messages.first()
      const currentDate = date()
      if (lastMessage?.embeds[0]?.data.title.substring(2, 12) === currentDate) return
      const almanax = JSON.parse(fs.readFileSync('AlmanaxYears.json'))
      const almanaxEntry = almanax.find(data => data.D.includes(currentDate))
      if (!almanaxEntry) return
      if (lastMessage) await lastMessage.delete()
      const embed = new EmbedBuilder().setTitle(`**${currentDate} | ${almanaxEntry.N} | ${almanaxEntry.R}**`).setDescription(`**Objet:** ${almanaxEntry.IFR}\n${almanaxEntry.BFR}\n\n\n**Item:** ${almanaxEntry.IEN}\n${almanaxEntry.BEN}`).setImage(almanaxEntry.I).setColor(randomColor())
      const newMessage = await channel.send({ embeds: [embed] })
      await newMessage.crosspost()
    } catch (err) {
      console.error(`Error updating Almanax:`, err)
    }
  }
  setInterval(checkAndPostAlmanax, 300000) // 5 minutes
}