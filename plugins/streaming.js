const nconf = require('nconf')

module.exports = (client) => {
  if (!nconf.get('ROLE_STREAMING') || !nconf.get('SERVER')) return
  setInterval(() => {
  client.guilds.fetch(nconf.get('SERVER')).then(g => g.members.fetch().then(() => {
    g.roles.cache.get(nconf.get('ROLE_STREAMER')).members.map(m => {
      let stream
      m.presence?.activities.forEach(a => { if (a.type === 1) stream = true })
      if (m.roles.resolve(nconf.get('ROLE_STREAMING')) === null && stream === true) m.roles.add(g.roles.resolve(nconf.get('ROLE_STREAMING')))
      if (m.roles.resolve(nconf.get('ROLE_STREAMING')) !== null && stream !== true) m.roles.remove(g.roles.resolve(nconf.get('ROLE_STREAMING')))
    })
  }))
  }, 120000) // 120000 = 2 minutes
}