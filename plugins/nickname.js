const nconf = require('nconf')
const pre = ['!', '"', '“', '”', '\'', '‘', '’', '#', '$', '%', '&', '(aa']
const requiredKeys = ['NICKNAME', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  setInterval(() => {
    client.guilds.fetch(nconf.get('SERVER')).then(g => g.members.fetch().then(m => m.forEach(m => {
      if (m.displayName.startsWith('( ')) return m.setNickname(m.displayName.replace(/ /gi, ''))
      if (m.displayName.startsWith('(') && m.displayName.charCodeAt(1) < 65) return m.setNickname(m.displayName.substring(m.length))
      pre.forEach(e => { if (m.displayName.toLowerCase().startsWith(e)) { return m.setNickname(m.displayName.substring(e.length)) } })
    })))
  }, 1800000) // 1800000 = 30 minutes
}