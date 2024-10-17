const nconf = require('nconf')
const requiredKeys = ['PUBLISH', 'SERVER']
const channels = new Set(['almanax', 'annonces', 'announcements'])

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  client.on('messageCreate', message => {
    if (message.guildId !== nconf.get('SERVER') || !channels.has(message.channel.name)) return
    message.crosspost().catch(err => console.error(`Error crossposting ${message}:`, err))
  })
}