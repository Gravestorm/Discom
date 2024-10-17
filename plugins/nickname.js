const nconf = require('nconf')
const prefix = new Set(['!', '"', '#', '$', '%', '&', '\'', '('])
const prefixParenthesis = new Set([')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '|', '~', 'a', 'b', 'c'])
const requiredKeys = ['NICKNAME', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const cleanDisplayName = (member) => {
    let displayName = member.displayName
    let startIndex = 0
    while (startIndex < displayName.length && prefix.has(displayName[startIndex])) startIndex++
    if (displayName[startIndex] === '(') {
      if (displayName.toLowerCase().startsWith('(boune', startIndex)) return
      let endIndex = startIndex + 1
      while (endIndex < displayName.length && prefixParenthesis.has(displayName[endIndex])) endIndex++
      if (endIndex > startIndex + 1) startIndex = endIndex - 1
    }
    const cleanedName = member.displayName.slice(startIndex).trim() || member.user.username
    if (cleanedName !== member.displayName) member.setNickname(cleanedName).catch(err => console.error(`Error cleaning nickname of ${member}:`, err))
  }
  const handleMemberUpdate = (member) => cleanDisplayName(member)
  client.on('guildMemberUpdate', (_, newMember) => handleMemberUpdate(newMember))
  client.on('guildMemberAdd', handleMemberUpdate)
}