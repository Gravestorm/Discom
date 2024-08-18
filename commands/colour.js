const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const random = require('randomcolor')
const requiredKeys = ['ROLE_NITRO', 'ROLE_HELPER', 'ROLE_OMEGA']

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
  data: new SlashCommandBuilder().setName('colour').setDescription('Change the colour of your name to a random or specific colour')
    .addStringOption(option => option.setName('colour').setDescription('Write a colour name, number, hex code or rgb array')),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    const guild = interaction.guild
    const member = interaction.member
    const roleName = encode(member.user.id)
    let role = guild.roles.cache.find(r => r.name === roleName)
    let colourInput = interaction.options.getString('colour') || random()
    if (!isHex(colourInput)) {
      try {
        colourInput = random({ hue: colourInput })
      } catch (err) {
        colourInput = random()
      }
    }
    if (isHex(colourInput) && !colourInput.startsWith('#')) colourInput = `#${colourInput}`
    if (!role) {
      role = await guild.roles.create({
        name: roleName,
        color: colourInput,
        position: guild.roles.cache.size - 5,
        mentionable: false,
        hoist: false
      })
      await member.roles.add(role)
    } else {
      await role.setColor(colourInput)
    }
    await interaction.reply({ content: 'Colour changed successfully.\nLa couleur a changé avec succès.', ephemeral: true })
  }
}