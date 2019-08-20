import nconf from 'nconf';
import random from 'randomcolor';

module.exports.run = (client, msg, suffix) => {
  msg.delete();
  if (!nconf.get('ROLE_NITRO')) return;
  msg.guild.fetchMembers().then(g => {
    if (g.me.permissions.has('MANAGE_ROLES') && msg.member.permissions.has('VIEW_AUDIT_LOG') && g.roles.find(r => r.name === nconf.get('ROLE_NITRO'))) {
      if (!suffix[0]) suffix[0] = 'random';
      if (!suffix[1]) suffix[1] = 'bright';
      g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(random({
        hue: suffix[0],
        luminosity: suffix[1]
      }));
    }
  });
};

module.exports.config = {
  name: 'colour',
  aliases: ['c', 'color']
};
