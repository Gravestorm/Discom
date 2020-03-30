import nconf from 'nconf';
const pre = ['!', '"', '\'', ,'#', '$', '%', '&', '((', '(! ', '(aa'];

module.exports = (client) => {
  if (!nconf.get('ROLE_NICKNAME')) return;
  setInterval(() => {
    client.guilds.forEach(g => {
      if (g.me.permissions.has('MANAGE_NICKNAMES') && g.me.permissions.has('MANAGE_ROLES') && g.roles.find(r => r.name === nconf.get('ROLE_NICKNAME'))) {
        g.members.forEach(m => {
          pre.forEach(e => {
            if (m.displayName.startsWith('( ')) m.setNickname(m.displayName.replace(/ /gi, ''));
            if (m.displayName.toLowerCase().startsWith(e)) {
              m.setNickname(`Care-Bear${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
              m.addRole(g.roles.find(r => r.name === nconf.get('ROLE_NICKNAME')).id);
            }
          });
        });
      }
    });
  }, 1800000); // 1800000 = 30 minutes
}
