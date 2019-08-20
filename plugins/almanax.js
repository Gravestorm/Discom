import cheerio from 'cheerio';
import nconf from 'nconf';
import rp from 'request-promise';

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ALMANAX')) return;
  setInterval(() => {
    client.channels.forEach(c => {
      if (c.name === nconf.get('CHANNEL_ALMANAX')) {
        if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
        c.fetchMessages().then(m => {
          let text = '';
          let date = new Date();
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          if (month < 10) month = `0${month}`;
          if (day < 10) day = `0${day}`;
          let dat = `${year}-${month}-${day}`;
          if (m.first()) {
            let datt = m.first().content[12] + m.first().content[13];
            if (datt.toString() !== day.toString()) {
              m.first().delete();
              let options = {
                uri: 'http://www.krosmoz.com/en/almanax',
                encoding: 'utf8',
                transform: (body) => {
                  return cheerio.load(body);
                }
              };
              rp(options).then(($) => {
                let questen = $('#achievement_dofus .mid .more .more-infos p').first().text().trim();
                let offeren = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim();
                let bonusen = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim();
                let mainen = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim();
                text += `__**${dat}**__\n\n**${mainen}**\n${bonusen}\n\n**${questen}**\n${offeren}`;
                let options = {
                  uri: 'http://www.krosmoz.com/fr/almanax',
                  encoding: 'utf8',
                  transform: (body) => {
                    return cheerio.load(body);
                  }
                };
                rp(options).then(($) => {
                  let questfr = $('#achievement_dofus .mid .more .more-infos p').first().text().trim();
                  let offerfr = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim();
                  let image = $('#achievement_dofus .mid .more .more-infos .more-infos-content img').attr('src');
                  let bonusfr = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim();
                  let mainfr = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim();
                  text += `\n\n\n**${mainfr}**\n${bonusfr}\n\n**${questfr}**\n${offerfr}\n\n${image}`;
                  c.send(text);
                });
              });
            }
          } else {
            let options = {
              uri: 'http://www.krosmoz.com/en/almanax',
              encoding: 'utf8',
              transform: (body) => {
                return cheerio.load(body);
              }
            };
            rp(options).then(($) => {
              let questen = $('#achievement_dofus .mid .more .more-infos p').first().text().trim();
              let offeren = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim();
              let bonusen = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim();
              let mainen = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim();
              text += `__**${dat}**__\n\n**${mainen}**\n${bonusen}\n\n**${questen}**\n${offeren}`;
              let options = {
                uri: 'http://www.krosmoz.com/fr/almanax',
                encoding: 'utf8',
                transform: (body) => {
                  return cheerio.load(body);
                }
              };
              rp(options).then(($) => {
                let questfr = $('#achievement_dofus .mid .more .more-infos p').first().text().trim();
                let offerfr = $('#achievement_dofus .mid .more .more-infos .more-infos-content .fleft').first().text().trim();
                let image = $('#achievement_dofus .mid .more .more-infos .more-infos-content img').attr('src');
                let bonusfr = $('#achievement_dofus .mid .more').first().children().remove('div.more-infos').end().text().trim();
                let mainfr = $('#achievement_dofus .mid').first().children().remove('div.more').end().text().trim();
                text += `\n\n\n**${mainfr}**\n${bonusfr}\n\n**${questfr}**\n${offerfr}\n\n${image}`;
                c.send(text);
              });
            });
          }
        });
      }
    });
  }, 600000); // 600000 = 10 minutes
}
