const { ChannelType } = require('discord.js')
const nconf = require('nconf')
const requiredKeys = ['VOICE', 'SERVER']

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const emojis = ['🦊', '🐼', '🦄', '🐸', '🐯', '🐭', '🦁', '🦝', '🐻', '🐨', '🐹', '🐰', '🐷', '🐮']
  const categoryId = '356037209255575553'
  const minimumChannels = 4

  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.guild || oldState.guild.id !== nconf.get('SERVER')) return
    const category = oldState.guild.channels.cache.get(categoryId)
    const allChannels = [...category.children.cache.values()]
      .filter(channel => channel.type === ChannelType.GuildVoice && /^General \d+ \(FR\)(?=\s|$)/.test(channel.name))
      .map(channel => ({ channel, number: parseInt(channel.name.match(/General (\d+)/)?.[1]) }))
      .sort((a, b) => a.number - b.number)
    const fullChannels = allChannels.filter(({ channel }) => channel.members.size > 0)
    const emptyChannels = allChannels.filter(({ channel }) => channel.members.size === 0)
    const lockedChannels = allChannels.filter(({ number }) => number <= minimumChannels)
    const modifiableChannels = allChannels.filter(({ number }) => number > minimumChannels)
    const lockedEmptyChannels = lockedChannels.filter(({ channel }) => channel.members.size === 0)
    const modifiableEmptyChannels = modifiableChannels.filter(({ channel }) => channel.members.size === 0)

    if (fullChannels.length === allChannels.length) {
      const num = Math.max(...allChannels.map(channel => channel.number)) + 1
      await category.children.create({ name: `General ${num} (FR) ${emojis[num - 1] || emojis[(num - 1) % emojis.length]}`, type: ChannelType.GuildVoice })
    }

    if (emptyChannels.length > 1 && modifiableEmptyChannels.length > 0) {
      const channelsToDelete = lockedEmptyChannels.length > 0 ? modifiableEmptyChannels : modifiableEmptyChannels.slice(1)
      for (const { channel } of channelsToDelete) await channel.delete()
    }

    const updatedChannels = [...category.children.cache.values()]
      .filter(channel => channel.type === ChannelType.GuildVoice && /^General \d+ \(FR\)(?=\s|$)/.test(channel.name))
      .map(channel => ({ channel, number: parseInt(channel.name.match(/General (\d+)/)?.[1]) }))
      .sort((a, b) => a.number - b.number)
    let currentNumber = 1
    for (const { channel, number } of updatedChannels) {
      if (number !== currentNumber) await channel.edit({ name: `General ${currentNumber} (FR) ${emojis[currentNumber - 1]  || emojis[(currentNumber - 1) % emojis.length]}` })
      currentNumber++
    }
  })
}