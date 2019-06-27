import './init-config';
import cheerio from 'cheerio';
import Cleverbot from 'cleverbot';
import Discord from 'discord.js';
import nconf from 'nconf';
import rp from 'request-promise';
import startExpress from './express';
const client = new Discord.Client();
let clever = new Cleverbot({
  key: nconf.get('CLEVERBOT')
});
const commands = {
  chat: {
    process: function(client, msg, suffix) {
      if (!nconf.get('CLEVERBOT')) return;
      if (!suffix) suffix = 'Hello.';
      msg.channel.startTyping();
      clever.query(suffix.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')).then((response) => {
        msg.channel.send(response.output);
        msg.channel.stopTyping();
      });
    }
  },
  d: {
    process: function(client, msg, suffix) {
      msg.member.guild.fetchMembers().then(g => {
        if (g.me.permissions.has('MANAGE_MESSAGES') && msg.member.permissions.has('MANAGE_MESSAGES')) {
          if (suffix > 100) suffix = 100;
          msg.channel.bulkDelete(suffix);
        }
      });
    }
  }
};
client.on('ready', () => {
  startExpress();
  setTimeout(() => {
    if (client.channels.find(c => c.name === 'almanax')) {
      setInterval(() => {
        client.channels.forEach((c) => {
          if (c.name === 'almanax') {
            c.fetchMessages().then(msgs => {
              let text = '';
              let date = new Date();
              let year = date.getFullYear();
              let month = date.getMonth() + 1;
              let day = date.getDate();
              if (month < 10) month = `0${month}`;
              if (day < 10) day = `0${day}`;
              let dat = `${year}-${month}-${day}`;
              if (msgs.first()) {
                let datt = msgs.first().content[12] + msgs.first().content[13];
                if (datt.toString() !== day.toString()) {
                  msgs.first().delete();
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
  }, 3000);
  setTimeout(() => {
    setInterval(() => {
      client.guilds.forEach(g => {
        g.fetchMembers().then(g => {
          if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === 'Streamer') && g.roles.find(r => r.name === 'Streaming')) {
            g.members.forEach((member) => {
              if (member.roles.has(g.roles.find(r => r.name === 'Streamer').id) === true && member.roles.has(g.roles.find(r => r.name === 'Streaming').id) !== true && member.user.presence.game && member.user.presence.game.streaming === true) {
                member.addRole(g.roles.find(r => r.name === 'Streaming').id);
              } else if (member.roles.has(g.roles.find(r => r.name === 'Streaming').id) === true) {
                if (!member.user.presence.game) {
                  member.removeRole(g.roles.find(r => r.name === 'Streaming').id);
                } else if (member.user.presence.game && member.user.presence.game.streaming !== true) {
                  member.removeRole(g.roles.find(r => r.name === 'Streaming').id);
                }
              }
            });
          } else if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === 'Streaming')) {
            g.members.forEach((member) => {
              if (member.roles.has(g.roles.find(r => r.name === 'Streaming').id) !== true && member.user.presence.game && member.user.presence.game.streaming === true) {
                member.addRole(g.roles.find(r => r.name === 'Streaming').id);
              } else if (member.roles.has(g.roles.find(r => r.name === 'Streaming').id) === true) {
                if (!member.user.presence.game) {
                  member.removeRole(g.roles.find(r => r.name === 'Streaming').id);
                } else if (member.user.presence.game && member.user.presence.game.streaming !== true) {
                  member.removeRole(g.roles.find(r => r.name === 'Streaming').id);
                }
              }
            });
          }
        });
      });
    }, 60000); // 60000 = 1 minute
  }, 6000);
});
client.on('message', msg => {
  if (msg.content[0] === '!') {
    const command = msg.content.toLowerCase().split(' ')[0].substring(1);
    const suffix = msg.content.substring(command.length + 2);
    const cmd = commands[command];
    if (cmd) return cmd.process(client, msg, suffix);
    return;
  }
  if (msg.channel.name === 'announcements' || msg.channel.name === 'annonces') {
    if (msg.content[0] === 'R' && msg.content[1] === 'T' || msg.content[0] === '@' || msg.content.includes('#DWS') === true) {
      msg.delete();
      return;
    }
  }
});
client.on('disconnected', () => {
  console.log('Disconnected');
  setTimeout(() => {
    client.login(nconf.get('TOKEN'));
  }, 5000);
});
client.login(nconf.get('TOKEN'));
