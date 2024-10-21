const nconf = require('nconf')
const Parser = require('rss-parser')
const date = require('../helpers/date')
const requiredKeys = ['RSS', 'CHANNEL_ANNONCES', 'CHANNEL_ANNOUNCEMENTS']
const links = ['news', 'devblog', 'changelog']
const languages = ['en', 'fr']
const rssChannels = ['CHANNEL_ANNOUNCEMENTS', 'CHANNEL_ANNONCES']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const processFeeds = async () => {
    const parser = new Parser()
    for (const link of links) {
      for (let i = 0; i < languages.length; i++) {
        const language = languages[i]
        const rssChannel = rssChannels[i]
        try {
          const feed = await parser.parseURL(`https://www.dofus.com/${language}/rss/${link}.xml`)
          const latestItem = feed.items[0]
          if (date() - date(latestItem.isoDate) > 604800000) continue
          const post = latestItem.link.trim()
          const channel = await client.channels.fetch(nconf.get(rssChannel))
          const messages = await channel.messages.fetch()
          if (!messages.some(message => message.content === post)) await channel.send(post).crosspost()
        } catch (err) {
          console.error(`Error processing feed ${link} in ${language}:`, err)
        }
      }
    }
  }
  setInterval(processFeeds, 300000) // 5 minutes
}