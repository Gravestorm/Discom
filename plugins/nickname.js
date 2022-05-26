const nconf = require('nconf')
const pre = ['!', '"', '“', '”', '\'', '‘', '’', '#', '$', '%', '&', '(aa']

module.exports = (client) => {
  if (!nconf.get('NICKNAME') || !nconf.get('SERVER')) return
  setInterval(() => {
    client.guilds.fetch(nconf.get('SERVER')).then(g => g.members.fetch().then(m => m.forEach(m => {
      if (m.displayName.startsWith('( ') || m.displayName.toLowerCase().startsWith('(agr) ')) return m.setNickname(m.displayName.replace(/ /gi, ''))
      if (m.displayName.startsWith('(') && m.displayName.charCodeAt(1) < 65) return m.setNickname(m.displayName.substring(e.length))
      pre.forEach(e => {
        if (m.displayName.toLowerCase().startsWith(e)) {
          return m.setNickname(m.displayName.substring(e.length))
        }
      })
    })))
  }, 1800000) // 1800000 = 30 minutes
}