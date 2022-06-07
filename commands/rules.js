const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')

module.exports = {
  data: new SlashCommandBuilder().setName('rules').setDescription('Updates the rule messages'),
  async execute(interaction) {
    if (!nconf.get('SERVER')) return
    const Server = '297779010417590274'
    const EnRules = '741743167228870667'
    const EnChannels = '741748299933155329'
    const EnStaff = '741751132002451496'
    const FrRules = '741735472341975092'
    const FrChannels1 = '741739739903950900'
    const FrChannels2 = '741740653687603281'
    const FrStaff = '741750918298599437'
    const Rules = '678610533699813407'
    const EnRulesMain = '741628908360695829'
    const EnChannelsMain = '741628942275969114'
    const EnStaffMain = '741629824040304702'
    const Regles = '678708610762670101'
    const FrRulesMain = '741750038220374158'
    const FrChannels1Main = '741750078485561381'
    const FrChannels2Main = '741750097079173229'
    const FrStaffMain = '741750136673271890'
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(EnRules).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Rules).then(ch => ch.messages.fetch(EnRulesMain).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(EnChannels).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Rules).then(ch => ch.messages.fetch(EnChannelsMain).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(EnStaff).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Rules).then(ch => ch.messages.fetch(EnStaffMain).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(FrRules).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Regles).then(ch => ch.messages.fetch(FrRulesMain).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(FrChannels1).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Regles).then(ch => ch.messages.fetch(FrChannels1Main).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(FrChannels2).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Regles).then(ch => ch.messages.fetch(FrChannels2Main).then(msg => msg.edit(m.content)))))))
    await client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Server).then(c => c.messages.fetch(FrStaff).then(m => client.guilds.fetch(nconf.get('SERVER')).then(g => g.channels.fetch(Regles).then(ch => ch.messages.fetch(FrStaffMain).then(msg => msg.edit(m.content)))))))
    await interaction.reply({ content: 'Rules updated successfully.', ephemeral: true })
  }
}