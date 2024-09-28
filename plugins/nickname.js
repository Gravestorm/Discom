const nconf = require('nconf')
const prefix = ['!', '"', '#', '$', '%', '&', '\'']
const prefixParenthesis = [')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '|', '~', 'a', 'b', 'c']
const requiredKeys = ['NICKNAME', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.displayName === newMember.displayName) return
    let newDisplayName = newMember.displayName
    while (prefix.some(char => newDisplayName.toLowerCase().startsWith(char))) {
      const matchingChar = prefix.find(char => newDisplayName.toLowerCase().startsWith(char))
      newDisplayName = newDisplayName.substring(matchingChar.length)
    }
    if (newDisplayName.startsWith('(')) {
      let endIndex = 1
      while (prefixParenthesis.includes(newDisplayName[endIndex])) endIndex++
      if (endIndex > 1) newDisplayName = '(' + newDisplayName.substring(endIndex)
    }
    if (newDisplayName.trim() === '') newDisplayName = newMember.user.username
    if (newDisplayName !== newMember.displayName) newMember.setNickname(newDisplayName).catch(console.error)
  })
}
