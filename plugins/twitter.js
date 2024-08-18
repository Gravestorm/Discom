const nconf = require('nconf')
const twit = require('twit')
const requiredKeys = ['TWITTER', 'CHANNEL_ANNOUNCEMENTS', 'CHANNEL_ANNONCES', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const T = new twit({
    consumer_key: nconf.get('CONSUMER_KEY'),
    consumer_secret: nconf.get('CONSUMER_SECRET'),
    access_token: nconf.get('ACCESS_TOKEN'),
    access_token_secret: nconf.get('ACCESS_TOKEN_SECRET'),
    timeout_ms: 60 * 1000
  })
  setInterval(() => {
    T.get('statuses/user_timeline', { screen_name: 'DOFUS_EN', exclude_replies: true, include_rts: false, count: 1 }, (err, data) => {
      if (err || !data[0]) return
      let tweet = `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`
      client.channels.fetch(nconf.get('CHANNEL_ANNOUNCEMENTS')).then(c => c.messages.fetch().then(msgs => {
        if (msgs.find(m => m.content === tweet)) return
        msgs.forEach(m => { if (m.content.includes('https://twitter.com/') && m.author === client.user) m.delete() })
        c.send(tweet)
      }))
    })
    T.get('statuses/user_timeline', { screen_name: 'DOFUSfr', exclude_replies: true, include_rts: false, count: 1 }, (err, data) => {
      if (err || !data[0]) return
      let tweet = `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`
      client.channels.fetch(nconf.get('CHANNEL_ANNONCES')).then(c => c.messages.fetch().then(msgs => {
        if (msgs.find(m => m.content === tweet)) return
        msgs.forEach(m => { if (m.content.includes('https://twitter.com/') && m.author === client.user) m.delete() })
        c.send(tweet)
      }))
    })
  }, 60000) // 60000 = 1 minute
}