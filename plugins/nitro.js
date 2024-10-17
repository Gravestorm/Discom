const nconf = require('nconf')
const randomColor = require('randomcolor')
const requiredKeys = ['NITRO', 'ROLE_NITRO', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const updateNitroRoleColor = async () => {
    try {
      const guild = await client.guilds.fetch(nconf.get('SERVER'))
      const role = await guild.roles.fetch(nconf.get('ROLE_NITRO'))
      await role.setColor(randomColor())
    } catch (err) {
      console.error('Error updating Nitro role color:', err)
    }
  }
  setInterval(updateNitroRoleColor, 14400000) // 240 minutes
}