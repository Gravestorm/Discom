const { SlashCommandBuilder } = require('@discordjs/builders')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const nconf = require('nconf')
const requiredKeys = ['CHANNEL_ADS', 'CHANNEL_BOT', 'ROLE_YOUTUBER', 'ROLE_STREAMER', 'THREAD_ADS']

module.exports = {
    data: new SlashCommandBuilder().setName('ads').setDescription('Request Streamer/Youtuber role')
      .addStringOption(option => option.setName('url').setDescription('Twitch/Youtube URL').setRequired(true).setMaxLength(300)),

    async execute(interaction) {
      if (!requiredKeys.every(key => nconf.get(key))) return
      const url = interaction.options.getString('url')
      const botChannel = await interaction.guild.channels.fetch(nconf.get('CHANNEL_BOT'))
      const embed = new EmbedBuilder().setTitle('New Role Request').setDescription(`User ${interaction.user} has requested a role`).addFields({ name: 'Submitted URL', value: url })

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`grant_youtuber_role:${interaction.user.id}:${url}`).setLabel('Give Youtuber Role').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`grant_streamer_role:${interaction.user.id}:${url}`).setLabel('Give Streamer Role').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`deny_role_request:${interaction.user.id}:${url}`).setLabel('Deny Role Request').setStyle(ButtonStyle.Danger)
      )

      await botChannel.send({ embeds: [embed], components: [actionRow] })
      await interaction.reply({ content: 'Candidature reçue avec succès, veuillez patienter pendant que nous examinons et vous donnez le rôle.\nApplication received successfully, please wait patiently while we review and give you the role.', ephemeral: true })
    },

    async handleRoleRequestButtons(interaction) {
      if (!interaction.isButton()) return
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true })

      const [action, userId, url] = interaction.customId.split(':')
      const targetUser = await interaction.guild.members.fetch(userId)
      const adsChannel = nconf.get('CHANNEL_ADS')
      const logChannel = await interaction.guild.channels.fetch(nconf.get('THREAD_ADS'))

      let roleName = ''
      let roleId = ''

      switch (action) {
        case 'grant_youtuber_role':
          roleName = 'Youtuber'; roleId = nconf.get('ROLE_YOUTUBER'); break
        case 'grant_streamer_role':
          roleName = 'Streamer'; roleId = nconf.get('ROLE_STREAMER'); break
        case 'deny_role_request':
          roleName = 'Denied'; break
      }

      await interaction.message.delete()

      if (roleId) {
        await targetUser.roles.add(roleId)
        await targetUser.send({ content: `Votre demande de rôle a été approuvée! Vous avez reçu le rôle ${roleName} et pouvez désormais publier dans <#${adsChannel}>\nYour role request has been approved! You have been granted the ${roleName} role and can now post in <#${adsChannel}>` })
        await logChannel.send({ content: `<@${interaction.user.id}> gave the ${roleName} role to <@${userId}>\nURL: ${url}` })
      } else {
        await targetUser.send({ content: 'Votre demande de rôle a été refusée.\nYour role request has been denied.' })
        await logChannel.send({ content: `<@${interaction.user.id}> denied the role request for <@${userId}>\nURL: ${url}` })
      }
    }
}