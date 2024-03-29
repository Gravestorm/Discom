const nconf = require('nconf')
const random = require('randomcolor')
const requiredKeys = ['ROLE_NITRO', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(() => { client.guilds.fetch(nconf.get('SERVER')).then(g => g.roles.fetch(nconf.get('ROLE_NITRO')).then(r => r.setColor(random()))) }, 3600000) // 3600000 = 60 minutes
}