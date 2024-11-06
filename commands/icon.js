const { SlashCommandBuilder } = require('@discordjs/builders')

const encode = id => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let num = BigInt(id)
  let result = ''
  while (num > 0) {
    result = chars[num % 62n] + result
    num /= 62n
  }
  return result || '0'
}

module.exports = {
  data: new SlashCommandBuilder().setName('icon').setDescription('Change the icon of your role')
    .addAttachmentOption(option => option.setName('icon').setDescription('Upload an image to use as your role icon (must be less than 256KB)').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ephemeral: true})
    const { guild, member } = interaction
    const roleName = encode(member.user.id)
    if (!guild.premiumTier || guild.premiumTier < 2) {
      return await interaction.editReply({
        content: 'This server needs to be Level 2 boosted to use role icons.\nCe serveur doit être boosté niveau 2 pour utiliser les icônes de rôle.',
        ephemeral: true 
      })
    }
    const iconAttachment = interaction.options.getAttachment('icon')
    if (iconAttachment.size > 256000) {
      return await interaction.editReply({
        content: 'The icon file must be less than 256KB.\nLe fichier d\'icône doit être inférieur à 256 Ko.',
        ephemeral: true
      })
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(iconAttachment.contentType)) {
      return await interaction.editReply({
        content: 'The icon must be a JPEG, PNG or GIF file.\nL\'icône doit être un fichier JPEG, PNG ou GIF.',
        ephemeral: true
      })
    }
    try {
      let role = guild.roles.cache.find(r => r.name === roleName)
      if (!role) {
        role = await guild.roles.create({
          name: roleName,
          position: guild.roles.cache.size - 5,
          permissions: [],
          mentionable: false,
          hoist: false
        })
        await member.roles.add(role)
      }
      await role.setIcon(iconAttachment.url)
      await interaction.editReply({
        content: 'Role icon changed successfully.\nL\'icône du rôle a changé avec succès.',
        ephemeral: true
      })
    } catch (err) {
      console.error('Error setting role icon:', err)
      await interaction.editReply({
        content: 'An error occurred while setting the role icon. Make sure the image is in the correct format and size.\nUne erreur s\'est produite lors de la définition de l\'icône du rôle. Assurez-vous que l\'image est au bon format et à la bonne taille.',
        ephemeral: true
      })
    }
  }
}