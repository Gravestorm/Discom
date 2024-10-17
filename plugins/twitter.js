const nconf = require('nconf')
const twit = require('twit')
const requiredKeys = ['TWITTER', 'CHANNEL_ANNOUNCEMENTS', 'CHANNEL_ANNONCES', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET']
const accounts = [{ screen_name: 'DOFUS_EN', channel_key: 'CHANNEL_ANNOUNCEMENTS' }, { screen_name: 'DOFUSfr', channel_key: 'CHANNEL_ANNONCES' }]

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const Twit = new twit({
    consumer_key: nconf.get('CONSUMER_KEY'),
    consumer_secret: nconf.get('CONSUMER_SECRET'),
    access_token: nconf.get('ACCESS_TOKEN'),
    access_token_secret: nconf.get('ACCESS_TOKEN_SECRET'),
    timeout_ms: 60 * 1000
  })
  const fetchAndPostTweet = async ({ screen_name, channel_key }) => {
    try {
      const { data } = await Twit.get('statuses/user_timeline', { screen_name, exclude_replies: true, include_rts: false, count: 1 })
      if (!data[0]) return
      const tweet = `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`
      const channel = await client.channels.fetch(nconf.get(channel_key))
      const messages = await channel.messages.fetch()
      if (messages.some(m => m.content === tweet)) return
      await Promise.all(messages.filter(m => m.content.includes('https://twitter.com/') && m.author.id === client.user.id).map(m => m.delete()))
      await channel.send(tweet)
    } catch (err) {
      console.error(`Error fetching/posting tweet for ${screen_name}:`, err)
    }
  }
  setInterval(() => { accounts.forEach(fetchAndPostTweet) }, 60000) // 1 minute
}