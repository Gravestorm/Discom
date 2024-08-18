const nconf = require('nconf')
const random = require('randomcolor')
const requiredKeys = ['NITRO', 'ROLE_NITRO', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(() => { client.guilds.fetch(nconf.get('SERVER')).then(g => g.roles.fetch(nconf.get('ROLE_NITRO')).then(r => r.setColor(random()))) }, 14400000) // 14400000 = 240 minutes
}