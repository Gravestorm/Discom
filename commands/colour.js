const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const random = require('randomcolor')

module.exports = {
  data: new SlashCommandBuilder().setName('colour').setDescription('Change the colour of the Nitro Booster role to a random or specific colour')
    .addStringOption(option => option.setName('hue').setDescription('Write a colour name or hex code'))
    .addStringOption(option => option.setName('luminosity').setDescription('Choose the brightness of the colour').addChoices({ name: 'Bright', value: 'bright' }).addChoices({ name: 'Light', value: 'light' }).addChoices({ name: 'Dark', value: 'dark' })),
  async execute(interaction) {
    if (!nconf.get('ROLE_NITRO')) return
    await interaction.guild.roles.resolve(nconf.get('ROLE_NITRO')).setColor(random({ luminosity: interaction.options.getString('luminosity') ? interaction.options.getString('luminosity') : 'random', hue: interaction.options.getString('hue') ? interaction.options.getString('hue') : 'random' }))
    await interaction.reply({ content: 'Colour changed successfully.\nLa couleur a changé avec succès.', ephemeral: true })
  }
}