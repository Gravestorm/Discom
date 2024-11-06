const { SlashCommandBuilder } = require('@discordjs/builders')
const randomColor = require('randomcolor')

const isHex = color => /^#?[0-9A-F]{6}$/i.test(color)

module.exports = {
  data: new SlashCommandBuilder().setName('role').setDescription('Create or modify your custom role with a name, color and icon')
    .addStringOption(option => option.setName('color').setDescription('Enter a hex code of a color or leave empty for a random one'))
    .addAttachmentOption(option => option.setName('icon').setDescription('Upload an image to use as the role icon (must be less than 256KB)'))
    .addStringOption(option => option.setName('name').setDescription('Enter the name of the role')),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const { guild, member } = interaction
    try {
      const inputColor = interaction.options.getString('color')
      const inputIcon = interaction.options.getAttachment('icon')
      const inputName = interaction.options.getString('name')
      const color = inputColor ? (isHex(inputColor) ? (inputColor.startsWith('#') ? inputColor : `#${inputColor}`) : randomColor()) : randomColor()
      const userCustomRole = member.roles.cache.find(role => role.name.endsWith('*'))
      if (inputIcon) {
        if (!guild.premiumTier || guild.premiumTier < 2) return await interaction.editReply({ content: 'This server needs to be Level 2 boosted to use role icons.\nCe serveur doit être boosté niveau 2 pour utiliser les icônes de rôle.', ephemeral: true })
        if (inputIcon.size > 256000) return await interaction.editReply({ content: 'The icon file must be less than 256KB.\nLe fichier d\'icône doit être inférieur à 256 Ko.', ephemeral: true })
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validTypes.includes(inputIcon.contentType)) return await interaction.editReply({ content: 'The icon must be a JPEG, PNG or GIF file.\nL\'icône doit être un fichier JPEG, PNG ou GIF.', ephemeral: true })
      }
      let role
      const roleName = `${inputName || 'Custom'}*`
      if (userCustomRole) {
        role = userCustomRole
        await role.setColor(color)
        if (inputIcon) await role.setIcon(inputIcon.url)
        if (inputName) await role.setName(roleName)
      } else {
        role = await guild.roles.create({
          name: roleName,
          color,
          position: guild.roles.cache.size - 5,
          permissions: [],
          mentionable: false,
          hoist: false
        })
        if (inputIcon) await role.setIcon(inputIcon.url)
        await member.roles.add(role)
      }
      await interaction.editReply({ content: 'Role updated successfully\nRôle mis à jour avec succès', ephemeral: true })
    } catch (err) {
      await interaction.editReply({ content: 'Error:', err, ephemeral: true })
    }
  }
}