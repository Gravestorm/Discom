const nconf = require('nconf')
const requiredKeys = ['CHANNEL_ADS', 'CHANNEL_ANNONCES', 'CHANNEL_ANNOUNCEMENTS']

module.exports = (client) => {
  if (!nconf.get('CLEANUP')) return
  const configuredChannels = requiredKeys.filter(key => nconf.get(key))
  if (configuredChannels.length === 0) return
  const cleanupChannel = async (channelKey) => {
    try {
      const channel = await client.channels.fetch(nconf.get(channelKey))
      const messages = await channel.messages.fetch({ limit: 100 })
      const currentDate = Date.now()
      const deletePromises = messages.map(message => {
        const daysSincePosted = (currentDate - message.createdTimestamp) / (1000 * 60 * 60 * 24)
        if ((channelKey === 'CHANNEL_ADS' && daysSincePosted > 7 && (message.content.includes('twitch.tv') || message.content.includes('kick.com'))) ||
            (channelKey !== 'CHANNEL_ADS' && daysSincePosted > 60 && message.author.bot)) {
          return message.delete()
        }
      }).filter(Boolean)
      await Promise.all(deletePromises)
    } catch (err) {
      console.error(`Error cleaning up ${channelKey}:`, err)
    }
  }
  setInterval(() => { configuredChannels.forEach(cleanupChannel) }, 14400000) // 240 minutes
}