const nconf = require('nconf')
const requiredKeys = ['STREAMING', 'ROLE_STREAMER', 'ROLE_STREAMING', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const updateStreamingRoles = async () => {
    try {
      const guild = await client.guilds.fetch(nconf.get('SERVER'))
      await guild.members.fetch()
      const streamingRole = guild.roles.cache.get(nconf.get('ROLE_STREAMING'))
      const streamerRole = guild.roles.cache.get(nconf.get('ROLE_STREAMER'))
      streamerRole.members.forEach(member => {
        const isStreaming = member.presence?.activities.some(activity => activity.type === 1)
        const hasStreamingRole = member.roles.cache.has(streamingRole.id)
        if (isStreaming && !hasStreamingRole) member.roles.add(streamingRole)
        if (!isStreaming && hasStreamingRole) member.roles.remove(streamingRole)
      })
    } catch (err) {
      console.error('Error updating streaming roles:', err)
    }
  }
  setInterval(updateStreamingRoles, 120000) // 2 minutes
}