import './init-config';
import cheerio from 'cheerio';
import Cleverbot from 'cleverbot';
import Discord from 'discord.js';
import nconf from 'nconf';
import randomColor from 'randomcolor';
import rp from 'request-promise';
import startExpress from './express';
const client = new Discord.Client();
const embed = new Discord.RichEmbed();
let clever = new Cleverbot({
  key: nconf.get('CLEVERBOT')
});
const commands = {
  chat: {
    process: (client, msg, suffix) => {
      if (!nconf.get('CLEVERBOT')) return;
      suffix = suffix.join(' ');
      if (!suffix) suffix = 'Hello.';
      msg.channel.startTyping();
      clever.query(suffix.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, 'emoji')).then(response => {
        msg.channel.send(response.output);
        msg.channel.stopTyping();
      });
    }
  },
  d: {
    process: (client, msg, suffix) => {
      if (!suffix[0] || isNaN(suffix[0])) return;
      msg.guild.fetchMembers().then(g => {
        if (g.me.permissions.has('MANAGE_MESSAGES') && msg.member.permissions.has('MANAGE_MESSAGES')) {
          if (suffix[0] > 100) suffix[0] = 100;
          msg.channel.bulkDelete(1);
          setTimeout(() => {
            msg.channel.fetchMessages().then(msgs => {
              if (msg.mentions.channels.first() && msg.mentions.users.first()) {
                msg.channel.bulkDelete(msgs.filter(m => msg.mentions.users.has(m.author.id)).array().slice(0, suffix[0])).then(ms => {
                  ms.sort((b, a) => b.id - a.id).forEach(m => {
                    msg.mentions.channels.first().send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setFooter(`#${m.channel.name}`).setTimestamp(m.createdTimestamp).setColor(randomColor()));
                  });
                });
              } else if (msg.mentions.channels.first()) {
                msg.channel.bulkDelete(suffix[0]).then(ms => {
                  ms.sort((b, a) => b.id - a.id).forEach(m => {
                    msg.mentions.channels.first().send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setFooter(`#${m.channel.name}`).setTimestamp(m.createdTimestamp).setColor(randomColor()));
                  });
                });
              } else if (msg.mentions.users.first()) {
                msg.channel.bulkDelete(msgs.filter(m => msg.mentions.users.has(m.author.id)).array().slice(0, suffix[0]));
              } else {
                msg.channel.bulkDelete(suffix[0]);
              }
            });
          }, 500);
        }
      });
    }
  },
  c: {
    process: (client, msg, suffix) => {
      if (!nconf.get('ROLE_NITRO')) return;
      msg.guild.fetchMembers().then(g => {
        if (g.me.permissions.has('MANAGE_MESSAGES') && g.me.permissions.has('MANAGE_ROLES') && msg.member.permissions.has('VIEW_AUDIT_LOG')) {
          if (!suffix[0]) suffix[0] = 'random';
          if (!suffix[1]) suffix[1] = 'bright';
          msg.channel.bulkDelete(1);
          g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(randomColor({
            hue: suffix[0],
            luminosity: suffix[1]
          }));
        }
      });
    }
  }
};
client.on('ready', () => {
  startExpress();
  setTimeout(() => {
    if (!nconf.get('CHANNEL_ALMANAX')) return;
      setInterval(() => {
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ALMANAX')) {
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
  }, 3000);
  setTimeout(() => {
    if (!nconf.get('ROLE_STREAMING')) return;
    setInterval(() => {
      client.guilds.forEach(g => {
        g.fetchMembers().then(g => {
          if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_STREAMER')) && g.roles.find(r => r.name === nconf.get('ROLE_STREAMING'))) {
            g.members.forEach(m => {
              if (m.roles.has(g.roles.find(r => r.name === nconf.get('ROLE_STREAMER')).id) === true && m.roles.has(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id) !== true && m.user.presence.game && m.user.presence.game.streaming === true) {
                m.addRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
              } else if (m.roles.has(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id) === true) {
                if (!m.user.presence.game) {
                  m.removeRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
                } else if (m.user.presence.game && m.user.presence.game.streaming !== true) {
                  m.removeRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
                }
              }
            });
          } else if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_STREAMING'))) {
            g.members.forEach(m => {
              if (m.roles.has(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id) !== true && m.user.presence.game && m.user.presence.game.streaming === true) {
                m.addRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
              } else if (m.roles.has(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id) === true) {
                if (!m.user.presence.game) {
                  m.removeRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
                } else if (m.user.presence.game && m.user.presence.game.streaming !== true) {
                  m.removeRole(g.roles.find(r => r.name === nconf.get('ROLE_STREAMING')).id);
                }
              }
            });
          }
        });
      });
    }, 60000); // 60000 = 1 minute
  }, 6000);
  setTimeout(() => {
    if (!nconf.get('ROLE_NITRO')) return;
    setInterval(() => {
      client.guilds.forEach(g => {
        if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_NITRO'))) {
          g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(randomColor());
        }
      });
    }, 3600000); // 3600000 = 60 minutes
  }, 9000);
});
if (nconf.get('CHANNEL_DELETE')) {
  client.on('messageDelete', msg => {
    if (nconf.get('CHANNEL_IGNORE').includes(msg.channel.name)) return;
    client.channels.find(c => c.name === nconf.get('CHANNEL_DELETE')).send(embed.setAuthor(msg.author.username, msg.author.avatarURL).setDescription(msg.content).setFooter(`#${msg.channel.name}`).setTimestamp(msg.createdTimestamp).setColor(randomColor()));
  });
}
client.on('message', msg => {
  if (msg.content[0] === '!' && msg.channel.type !== 'dm' && msg.author.bot !== true) {
    const suffix = msg.content.slice(1).split(/ +/);
    const command = suffix.shift().toLowerCase();
    const cmd = commands[command];
    if (cmd) return cmd.process(client, msg, suffix);
    return;
  }
});
client.on('disconnected', () => {
  console.log('Disconnected');
  setTimeout(() => {
    client.login(nconf.get('TOKEN'));
  }, 5000);
});
client.login(nconf.get('TOKEN'));
