import nconf from 'nconf';
import random from 'randomcolor';

module.exports = (client) => {
  if (!nconf.get('ROLE_NITRO')) return;
  setInterval(() => {
    client.guilds.forEach(g => {
      if (g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_NITRO'))) {
        g.roles.find(r => r.name === nconf.get('ROLE_NITRO')).setColor(random());
      }
    });
  }, 3600000); // 3600000 = 60 minutes
}
