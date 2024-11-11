const nconf = require('nconf')
const randomColor = require('randomcolor')
const cron = require('node-cron')
const requiredKeys = ['NITRO', 'ROLE_NITRO', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const updateNitroRoleColor = async () => {
    const guild = await client.guilds.fetch(nconf.get('SERVER'))
    const role = await guild.roles.fetch(nconf.get('ROLE_NITRO'))
    await role.setColor(randomColor()).catch(err => console.error('Error updating Nitro role color:', err))
  }
  const getRandomIcon = () => {
    const iconUrls = nconf.get('ROLE_ICONS')
    if (!iconUrls || !Array.isArray(iconUrls) || iconUrls.length === 0) return null
    return iconUrls[Math.floor(Math.random() * iconUrls.length)]
  }
  const updateNitroRoleIcon = async () => {
    const guild = await client.guilds.fetch(nconf.get('SERVER'))
    const role = await guild.roles.fetch(nconf.get('ROLE_NITRO'))
    await role.setIcon(getRandomIcon()).catch(err => console.error('Error updating Nitro role icon:', err))
  }
  cron.schedule('0 0 * * *', updateNitroRoleColor, { timezone: 'Europe/Paris' })
  if (getRandomIcon()) cron.schedule('0 0 1 * *', updateNitroRoleIcon, { timezone: 'Europe/Paris' })
}