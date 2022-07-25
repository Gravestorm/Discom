const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')

module.exports = {
  data: new SlashCommandBuilder().setName('ads').setDescription('Request Streamer/Youtuber/Artist role')
    .addStringOption(option => option.setName('url').setDescription('Twitch/Youtube/Art URL').setRequired(true)),
  async execute(interaction) {
    if (!nconf.get('CHANNEL_BOT')) return
    await interaction.guild.channels.fetch(nconf.get('CHANNEL_BOT')).then(c => c.send(`${interaction.user} wants to access #ads (URL: <${interaction.options.getString('url')}>)`))
    await interaction.reply({ content: 'Application received successfully, please wait patiently while we review and give you the role.\nCandidature reçue avec succès, veuillez patienter pendant que nous examinons et vous donnons le rôle.', ephemeral: true })
  }
}