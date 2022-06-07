const nconf = require('nconf')

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES') || !nconf.get('CHANNEL_ADS')) return
  setInterval(() => {
    client.channels.fetch(nconf.get('CHANNEL_ANNOUNCEMENTS')).then(c => c.messages.fetch({ limit: 100 }).then(msgs => {
      msgs.forEach(m => { if (m.author === client.user && (new Date() - m.createdTimestamp) / 1000 > 5000000) m.delete() })
    }))
    client.channels.fetch(nconf.get('CHANNEL_ANNONCES')).then(c => c.messages.fetch({ limit: 100 }).then(msgs => {
      msgs.forEach(m => { if (m.author === client.user && (new Date() - m.createdTimestamp) / 1000 > 5000000) m.delete() })
    }))
    client.channels.fetch(nconf.get('CHANNEL_ADS')).then(c => c.messages.fetch({ limit: 100 }).then(msgs => {
      msgs.forEach(m => { if ((new Date() - m.createdTimestamp) / 1000 > 5000000) m.delete() })
    }))
  }, 7200000) // 7200000 = 120 minutes
}