const nconf = require('nconf')
const random = require('randomcolor')

module.exports = (client) => {
  if (!nconf.get('ROLE_NITRO') || !nconf.get('SERVER')) return
  setInterval(() => { client.guilds.fetch(nconf.get('SERVER')).then(g => g.roles.fetch(nconf.get('ROLE_NITRO')).then(r => r.setColor(random()))) }, 3600000) // 3600000 = 60 minutes
}