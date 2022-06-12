const { SlashCommandBuilder } = require('@discordjs/builders')
const nconf = require('nconf')
const promise = require('bluebird')
const delay = ms => new promise(resolve => setTimeout(resolve, ms))

module.exports = {
  data: new SlashCommandBuilder().setName('rules').setDescription('Update the rules'),
  async execute(interaction) {
    if (!nconf.get('RULES')) return
    const channels = interaction.guild.channels

    const RulesInfo = '678610533699813407'
    const EnRulesMain = '984175285085798523'
    const EnChannelsMain = '984175289754071101'
    const EnRolesMain = '984175308657791036'
    const EnOtherMain = '984175313850351677'

    const RulesMirror = '984144517827543081'
    const EnRules = '984165764279967754'
    const EnChannels = '984165820731113492'
    const EnRoles = '984165856051355680'
    const EnOther = '984165937802510416'

    const ReglesInfo = '678708610762670101'
    const FrRulesMain = '984205081622761502'
    const FrChannelsMain = '984205085611532348'
    const FrRolesMain = '984205103412158544'
    const FrOtherMain = '984205109644886086'
  
    const ReglesMirror = '984144571107782736'
    const FrRules = '984432991558332467'
    const FrChannels = '984434005455810601'
    const FrRoles = '984435437428949022'
    const FrOther = '984437913175609344'

    await channels.fetch(RulesMirror).then(async c => {
      await channels.fetch(RulesInfo).then(async ch => {
        await c.messages.fetch(EnRules).then(m => ch.messages.fetch(EnRulesMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(EnChannels).then(m => ch.messages.fetch(EnChannelsMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(EnRoles).then(m => ch.messages.fetch(EnRolesMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(EnOther).then(m => ch.messages.fetch(EnOtherMain).then(msg => msg.edit(m.content)))
      })
    })
    await delay(5000)
    await channels.fetch(ReglesMirror).then(async c => {
      await channels.fetch(ReglesInfo).then(async ch => {
        await c.messages.fetch(FrRules).then(m => ch.messages.fetch(FrRulesMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(FrChannels).then(m => ch.messages.fetch(FrChannelsMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(FrRoles).then(m => ch.messages.fetch(FrRolesMain).then(msg => msg.edit(m.content)))
        await c.messages.fetch(FrOther).then(m => ch.messages.fetch(FrOtherMain).then(msg => msg.edit(m.content)))
      })
    })
  }
}