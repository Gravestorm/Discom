const nconf = require('nconf')
const ytpl = require('ytpl')
const requiredKeys = ['YOUTUBE', 'CHANNEL_ADS']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(async () => {
    const en = await ytpl('https://www.youtube.com/channel/UCJ_tz6Xl_YtrAHd3gqChhMA', { limit: 1 })
    const fr = await ytpl('https://www.youtube.com/user/dofus', { limit: 1 })
    const ena = await ytpl('https://www.youtube.com/user/MyAnkamaEN', { limit: 1 })
    const fra = await ytpl('https://www.youtube.com/user/AnkamaTV', { limit: 1 })
    let envid = en.items[0].shortUrl
    let frvid = fr.items[0].shortUrl
    let enavid = ena.items[0].shortUrl
    let fravid = fra.items[0].shortUrl
    client.channels.fetch(nconf.get('CHANNEL_ADS')).then(c => c.messages.fetch().then(msgs => {
      if (!msgs.find(m => m.content === envid)) c.send(envid)
      if (!msgs.find(m => m.content === frvid)) c.send(frvid)
      if (!msgs.find(m => m.content === enavid)) c.send(enavid)
      if (!msgs.find(m => m.content === fravid)) c.send(fravid)
    }))
  }, 14400000) // 14400000 = 240 minutes
}