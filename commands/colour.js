const { SlashCommandBuilder } = require('@discordjs/builders')
const random = require('randomcolor')

function encode(id) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let num = BigInt(id)
  let result = ''
  while (num > 0) {
    result = chars[num % 62n] + result
    num = num / 62n
  }
  return result || '0'
}

function isHex(colour) {
  return /^#?[0-9A-F]{6}$/i.test(colour)
}

module.exports = {
  data: new SlashCommandBuilder().setName('colour').setDescription('Change the colour of your name to a random or a specific one')
    .addStringOption(option => option.setName('colour').setDescription('Write a hex code of a colour or leave empty for a random one')),
  async execute(interaction) {
    const guild = interaction.guild
    const member = interaction.member
    const roleName = encode(member.user.id)
    let role = guild.roles.cache.find(r => r.name === roleName)
    let input = interaction.options.getString('colour') || ''
    input = isHex(input) ? (input.startsWith('#') ? input : `#${input}`) : random()
    if (!role) {
      role = await guild.roles.create({
        name: roleName,
        color: input,
        position: guild.roles.cache.size - 5,
        permissions: [],
        mentionable: false,
        hoist: false
      })
      await member.roles.add(role)
    } else {
      await role.setColor(input)
    }
    await interaction.reply({ content: 'Colour changed successfully.\nLa couleur a changé avec succès.', ephemeral: true })
  }
}