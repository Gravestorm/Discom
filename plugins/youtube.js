const nconf = require('nconf')
const ytpl = require('ytpl')
const fetch = require('../helpers/fetch')
const requiredKeys = ['YOUTUBE', 'CLIENT', 'SERVER', 'CHANNEL_ADS']
const youtubeChannels = [
  { url: 'https://www.youtube.com/channel/UCJ_tz6Xl_YtrAHd3gqChhMA', name: 'DOFUS EN' },
  { url: 'https://www.youtube.com/user/dofus', name: 'DOFUS FR' },
  { url: 'https://www.youtube.com/user/MyAnkamaEN', name: 'Ankama EN' },
  { url: 'https://www.youtube.com/user/AnkamaTV', name: 'Ankama FR' }
]

module.exports = () => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const fetchLatestVideos = async () => {
    try {
      const existingMessages = await fetch(`https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?author_id=${nconf.get('CLIENT')}&channel_id=${nconf.get('CHANNEL_ADS')}&include_nsfw=true`)
      const existingUrls = new Set(JSON.parse(existingMessages).messages.map(m => m[0].content))
      const channel = await client.channels.fetch(nconf.get('CHANNEL_ADS'))
      const videoPromises = youtubeChannels.map(async ({ url }) => {
        const playlist = await ytpl(url, { limit: 1 })
        return playlist.items[0].shortUrl
      })
      const latestVideos = await Promise.all(videoPromises)
      for (const video of latestVideos) {
        if (!existingUrls.has(video)) await channel.send(video)
      }
    } catch (err) {
      console.error('Error fetching/posting YouTube videos:', err)
    }
  }
  setInterval(fetchLatestVideos, 14400000) // 240 minutes
}