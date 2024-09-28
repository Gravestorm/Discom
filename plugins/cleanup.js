const nconf = require('nconf')
const requiredKeys = ['CHANNEL_ADS', 'CHANNEL_ANNONCES', 'CHANNEL_ANNOUNCEMENTS']

module.exports = (client) => {
  const configuredChannels = requiredKeys.filter(key => nconf.get(key))
  if (!nconf.get('CLEANUP') || configuredChannels.length === 0) return
  setInterval(() => {
    configuredChannels.forEach(channelKey => {
      const channelId = nconf.get(channelKey)
      client.channels.fetch(channelId).then(c => c.messages.fetch({ limit: 100 }).then(msgs => {
        msgs.forEach(m => {
          const daysSincePosted = (new Date() - m.createdTimestamp) / (1000 * 60 * 60 * 24)
          if (channelKey === 'CHANNEL_ADS' ? daysSincePosted > 7 && m.content.includes('twitch.tv') : daysSincePosted > 60 && m.author.bot) m.delete()
        })
      })).catch(err => console.error(`Error fetching messages for ${channelId}:`, err))
    })
  }, 14400000) // 14400000 = 240 minutes
}