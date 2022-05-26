const nconf = require('nconf')
const parser = require('rss-parser')
const P = new parser()
const url = ['news', 'devblog', 'changelog']

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES')) return
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