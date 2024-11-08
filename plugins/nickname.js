const nconf = require('nconf')
const prefix = new Set(['!', '@', '#', '$', '%', '&', '"', "'"])
const prefixParenthesis = new Set(['!', '@', '#', '$', '%', '&', '"', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '[', '\\', ']', '^', '_', '`', '|', '~', 'a'])
const requiredKeys = ['NICKNAME', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const cleanDisplayName = (member) => {
    const displayName = member.displayName
    const startIndex = displayName.split('').findIndex(char => !prefix.has(char))
    if (startIndex === -1) return
    let cleanedName
    if (displayName[startIndex] === '(') {
      const endIndex = startIndex + 1 + displayName.slice(startIndex + 1).split('').findIndex(char => !prefixParenthesis.has(char))
      cleanedName = displayName[startIndex] + displayName.slice(endIndex)
    } else {
      cleanedName = displayName.slice(startIndex)
    }
    if (cleanedName !== displayName) member.setNickname(cleanedName.trim() || member.user.username).catch(err => console.error(`Error cleaning nickname of ${member}:`, err))
  }
  const handleMemberUpdate = (member) => { if (member.guild.id === nconf.get('SERVER')) cleanDisplayName(member) }
  client.on('guildMemberUpdate', (_, newMember) => handleMemberUpdate(newMember))
  client.on('guildMemberAdd', handleMemberUpdate)
}