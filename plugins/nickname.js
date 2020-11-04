import nconf from 'nconf';
const pre = ['!', '"', '“', '”', '\'', '‘', '’', '#', ,'$', '%', '&', '(aa'];

module.exports = (client) => {
  if (!nconf.get('ROLE_NICKNAME')) return;
  setInterval(() => {
    client.guilds.forEach(g => {
      if (g.me.permissions.has('MANAGE_NICKNAMES') && g.me.permissions.has('MANAGE_ROLES')) {
        g.members.forEach(m => {
          if (m.displayName.startsWith('( ') || m.displayName.toLowerCase().startsWith('(agr) ')) return m.setNickname(m.displayName.replace(/ /gi, ''));
          if (m.displayName.startsWith('(') && m.displayName.charCodeAt(1) < 65) return m.setNickname(m.displayName.substring(e.length));
          pre.forEach(e => {
            if (m.displayName.toLowerCase().startsWith(e)) {
              return m.setNickname(m.displayName.substring(e.length));
            }
          });
        });
      }
    });
  }, 1800000); // 1800000 = 30 minutes
}
