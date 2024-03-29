const nconf = require('nconf')
const parser = require('rss-parser')
const P = new parser()
const url = ['news', 'devblog', 'changelog']
const requiredKeys = ['CHANNEL_ANNONCES', 'CHANNEL_ANNOUNCEMENTS']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(() => {
    url.forEach(n => {
      P.parseURL(`https://www.dofus.com/en/rss/${n}.xml`, (err, feed) => {
        if (err || !feed || (new Date - new Date(feed.items[0].isoDate).getTime()) / 1000 > 604800) return
        let post = feed.items[0].link.trim()
        client.channels.fetch(nconf.get('CHANNEL_ANNOUNCEMENTS')).then(c => c.messages.fetch().then(msgs => {
          if (msgs.find(m => m.content === post)) return
          c.send(post).then(m => m.crosspost())
        }))
      })
      P.parseURL(`https://www.dofus.com/fr/rss/${n}.xml`, (err, feed) => {
        if (err || !feed || (new Date - new Date(feed.items[0].isoDate).getTime()) / 1000 > 604800) return
        let post = feed.items[0].link.trim()
        client.channels.fetch(nconf.get('CHANNEL_ANNONCES')).then(c => c.messages.fetch().then(msgs => {
          if (msgs.find(m => m.content === post)) return
          c.send(post).then(m => m.crosspost())
        }))
      })
    })
  }, 300000) // 300000 = 5 minutes
}