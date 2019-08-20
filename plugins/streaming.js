import nconf from 'nconf';

module.exports = (client) => {
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
}
