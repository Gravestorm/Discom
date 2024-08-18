const nconf = require('nconf')
const requiredKeys = ['PUBLISH', 'SERVER']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  client.on('messageCreate', m => {
    if (m.guildId !== nconf.get('SERVER') || !['almanax', 'annonces', 'announcements'].includes(m.channel.name)) return
    m.crosspost()
  })
}