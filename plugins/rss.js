const nconf = require('nconf')
const parser = require('rss-parser')
const requiredKeys = ['RSS', 'CHANNEL_ANNONCES', 'CHANNEL_ANNOUNCEMENTS']
const links = ['news', 'devblog', 'changelog']
const languages = ['en', 'fr']
const rssChannels = ['CHANNEL_ANNOUNCEMENTS', 'CHANNEL_ANNONCES']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const Parser = new parser()
  const processFeeds = async () => {
    for (const link of links) {
      for (let i = 0; i < languages.length; i++) {
        const language = languages[i]
        const rssChannel = rssChannels[i]
        try {
          const feed = await Parser.parseURL(`https://www.dofus.com/${language}/rss/${link}.xml`)
          const latestItem = feed.items[0]
          if (new Date() - new Date(latestItem.isoDate) > 604800000) continue
          const post = latestItem.link.trim()
          const channel = await client.channels.fetch(nconf.get(rssChannel))
          const messages = await channel.messages.fetch()
          if (!messages.some(m => m.content === post)) await channel.send(post).crosspost()
        } catch (err) {
          console.error(`Error processing feed ${link} in ${language}:`, err)
        }
      }
    }
  }
  setInterval(processFeeds, 300000) // 5 minutes
}