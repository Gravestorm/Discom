const cheerio = require('cheerio')
const cron = require('cron').CronJob
const nconf = require('nconf')
const request = require('request-promise')

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ALMANAX')) return
  new cron({
    cronTime: '00 00 00 * * *',
    onTick: () => {
      client.channels.fetch(nconf.get('CHANNEL_ALMANAX')).then(c => c.messages.fetch({ limit: 1 }).then(m => m.last().delete()))
      let text = ''
      request({ url: 'https://www.krosmoz.com/en/almanax?game=dofus', encoding: 'utf8', transform: (body) => { return cheerio.load(body) } }).then(($) => {
        let questen = $('#achievement_dofus .mid .more .more-infos p').first().text().trim()
        let offeren = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim()
        let bonusen = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim()
        let mainen = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim()
        text += `__**${new Date().toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })}**__\n\n**${mainen}**\n${bonusen}\n\n**${questen}**\n${offeren}`
        request({ url: 'https://www.krosmoz.com/fr/almanax?game=dofus', encoding: 'utf8', transform: (body) => { return cheerio.load(body) } }).then(($) => {
          let questfr = $('#achievement_dofus .mid .more .more-infos p').first().text().trim()
          let offerfr = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim()
          let image = $('#achievement_dofus .mid .more .more-infos .more-infos-content img').attr('src')
          let bonusfr = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim()
          let mainfr = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim()
          text += `\n\n\n**${mainfr}**\n${bonusfr}\n\n**${questfr}**\n${offerfr}\n\n${image.replace('.w75h75', '')}`
          client.channels.fetch(nconf.get('CHANNEL_ALMANAX')).then(c => c.send(text).then(m => m.crosspost()))
        })
      })
    },
    start: true,
    timeZone: 'Europe/Paris'
  })
}