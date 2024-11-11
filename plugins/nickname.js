const nconf = require('nconf')
const prefix = new Set(['!', '@', '#', '$', '%', '&', '"', "'"])
const prefixParenthesis = new Set(['!', '@', '#', '$', '%', '&', '"', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '[', '\\', ']', '^', '_', '`', '|', '~', 'a'])
const requiredKeys = ['NICKNAME', 'SERVER']

module.exports = (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const cleanDisplayName = async (member) => {
    if (!member?.guild || member.guild.id !== nconf.get('SERVER')) return
    const { displayName, user } = member
    if (displayName === user.username) return
    let cleanedName = displayName
    if (displayName.match(/^[!@#$%&"'()]+$/) || !displayName.split('').some(char => !prefixParenthesis.has(char))) {
      cleanedName = user.username
    } else {
      const startIndex = displayName.split('').findIndex(char => !prefix.has(char))
      if (startIndex === -1) {
        cleanedName = user.username
      } else if (displayName[startIndex] === '(') {
        const afterParenthesis = displayName.slice(startIndex + 1)
        const letterIndex = afterParenthesis.search(/[a-zA-Z0-9]/)
        if (letterIndex !== -1) {
          const validContent = afterParenthesis.slice(letterIndex)
          cleanedName = '(' + validContent
        } else {
          cleanedName = user.username
        }
      } else {
        cleanedName = displayName.slice(startIndex)
      }
    }
    if (cleanedName !== displayName) await member.setNickname(cleanedName || user.username).catch(err => console.error(`Error cleaning nickname for ${member.id} - ${displayName}:`, err))
  }

  client.on('userUpdate', async (oldUser, newUser) => {
    if (oldUser.displayName === newUser.displayName) return
    const guild = client.guilds.cache.get(nconf.get('SERVER'))
    const member = await guild.members.fetch(newUser.id).catch(() => null)
    if (member) cleanDisplayName(member)
  })

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.displayName === newMember.displayName) return
    cleanDisplayName(newMember)
  })

  client.on('guildMemberAdd', cleanDisplayName)
}