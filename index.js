import './init-config';
import cheerio from 'cheerio';
import Cleverbot from 'cleverbot';
import Discord from 'discord.js';
import nconf from 'nconf';
import Parser from 'rss-parser';
import randomColor from 'randomcolor';
import rp from 'request-promise';
import startExpress from './express';
import Twit from 'twit';
import ytpl from 'ytpl';
const client = new Discord.Client();
const embed = new Discord.RichEmbed();
const parser = new Parser();
const clever = new Cleverbot({
  key: nconf.get('CLEVERBOT')
});
const T = new Twit({
  consumer_key: nconf.get('CONSUMER_KEY'),
  consumer_secret: nconf.get('CONSUMER_SECRET'),
  access_token: nconf.get('ACCESS_TOKEN'),
  access_token_secret: nconf.get('ACCESS_TOKEN_SECRET'),
  timeout_ms: 60 * 1000
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
      msg.delete();
      if (!suffix[0] || isNaN(suffix[0])) return;
      msg.guild.fetchMembers().then(g => {
        if (g.me.permissions.has('MANAGE_MESSAGES') && msg.member.permissions.has('MANAGE_MESSAGES')) {
          if (suffix[0] > 100) suffix[0] = 100;
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
          }, 100);
        }
      });
    }
  },
  c: {
    process: (client, msg, suffix) => {
      msg.delete();
      if (!nconf.get('ROLE_NITRO')) return;
      msg.guild.fetchMembers().then(g => {
        if (g.me.permissions.has('MANAGE_MESSAGES') && g.me.permissions.has('MANAGE_ROLES') && msg.member.permissions.has('VIEW_AUDIT_LOG')) {
          if (!suffix[0]) suffix[0] = 'random';
          if (!suffix[1]) suffix[1] = 'bright';
          g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(randomColor({
            hue: suffix[0],
            luminosity: suffix[1]
          }));
        }
      });
    }
  },
  q: {
    process: (client, msg, suffix) => {
      msg.delete();
      if (!suffix[0] || isNaN(suffix[0])) return;
      if (msg.mentions.channels.first()) {
        msg.mentions.channels.first().fetchMessage(suffix[0]).then(m => {
          msg.channel.send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setImage(m.attachments.first() ? m.attachments.first().proxyURL : '').setFooter(`Requested by ${msg.author.username} from #${m.channel.name}`, msg.author.avatarURL).setTimestamp(m.createdTimestamp).setColor(randomColor()))
        });
      } else {
        msg.channel.fetchMessage(suffix[0]).then(m => {
          msg.channel.send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setImage(m.attachments.first() ? m.attachments.first().proxyURL : '').setFooter(`Requested by ${msg.author.username} from #${m.channel.name}`, msg.author.avatarURL).setTimestamp(m.createdTimestamp).setColor(randomColor()))
        });
      }
    }
  }
};
client.on('ready', () => {
  if (!nconf.get('LOCAL')) startExpress();
  setTimeout(() => {
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
  }, 1000);
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
  }, 2000);
  setTimeout(() => {
    if (!nconf.get('ROLE_NITRO')) return;
    setInterval(() => {
      client.guilds.forEach(g => {
        if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_NITRO'))) {
          g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(randomColor());
        }
      });
    }, 3600000); // 3600000 = 60 minutes
  }, 3000);
  setTimeout(() => {
    if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES') || !nconf.get('CONSUMER_KEY') || !nconf.get('CONSUMER_SECRET') || !nconf.get('ACCESS_TOKEN') || !nconf.get('ACCESS_TOKEN_SECRET')) return;
    setInterval(() => {
      T.get('statuses/user_timeline', {screen_name: 'DOFUS_EN', exclude_replies: true, include_rts: false, count: 1}, (err, data) => {
        if (!data[0]) return;
        let tweet = `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`;
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === tweet)) return;
              msgs.forEach(m => {
                if (m.content.includes('https://twitter.com/') && m.author === client.user && !m.reactions.first()) m.delete();
              });
              c.send(tweet);
            });
          }
        });
      });
      T.get('statuses/user_timeline', {screen_name: 'DOFUSfr', exclude_replies: true, include_rts: false, count: 1}, (err, data) => {
        if (!data[0]) return;
        let tweet = `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`;
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNONCES')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === tweet)) return;
              msgs.forEach(m => {
                if (m.content.includes('https://twitter.com/') && m.author === client.user && !m.reactions.first()) m.delete();
              });
              c.send(tweet);
            });
          }
        });
      });
    }, 60000); // 60000 = 1 minute
  }, 4000);
  setTimeout(() => {
    if (!nconf.get('CHANNEL_ADS')) return;
    setInterval(() => {
      ytpl('UUJ_tz6Xl_YtrAHd3gqChhMA', {limit: 1}, (err, playlist) => {
        if (!playlist) return;
        let vid = playlist.items[0].url_simple;
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ADS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === vid)) return;
              c.send(vid);
            });
          }
        });
      });
      ytpl('UUvNdYvCMA9FcjFAV2gg8R6A', {limit: 1}, (err, playlist) => {
        if (!playlist) return;
        let vid = playlist.items[0].url_simple;
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ADS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === vid)) return;
              c.send(vid);
            });
          }
        });
      });
    }, 600000); // 600000 = 10 minutes
  }, 5000);
  setTimeout(() => {
    if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES')) return;
    setInterval(() => {
      parser.parseURL('https://www.dofus.com/en/rss/news.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
      parser.parseURL('https://www.dofus.com/en/rss/devblog.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
      parser.parseURL('https://www.dofus.com/en/rss/changelog.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
      parser.parseURL('https://www.dofus.com/fr/rss/news.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNONCES')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
      parser.parseURL('https://www.dofus.com/fr/rss/devblog.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNONCES')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
      parser.parseURL('https://www.dofus.com/fr/rss/changelog.xml', (err, feed) => {
        if (!feed) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNONCES')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post);
            });
          }
        });
      })
    }, 300000); // 300000 = 5 minutes
  }, 6000);
  setTimeout(() => {
    if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES') || !nconf.get('CHANNEL_ADS')) return;
    setInterval(() => {
      client.channels.forEach(c => {
        if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS') || c.name === nconf.get('CHANNEL_ANNONCES') || c.name === nconf.get('CHANNEL_ADS')) {
          if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
          c.fetchMessages().then(msgs => {
            msgs.forEach(m => {
              if (m.reactions.first() || m.author !== client.user || (new Date() - m.createdTimestamp) / 1000 < 604800) return;
              m.delete();
            });
          });
        }
      });
    }, 7200000); // 7200000 = 120 minutes
  }, 7000);
});
if (nconf.get('CHANNEL_LOG')) {
  client.on('messageDelete', msg => {
    if (msg.content[0] === '!' || !msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')) || ['ads', 'almanax', 'annonces', 'announcements', 'madhouse'].includes(msg.channel.name)) return;
    msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')).send(embed.setAuthor(msg.author.username, msg.author.avatarURL).setDescription(msg.content).setImage(msg.attachments.first() ? msg.attachments.first().proxyURL : '').setFooter(`#${msg.channel.name}`).setTimestamp(msg.createdTimestamp).setColor(randomColor()));
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
