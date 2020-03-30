import nconf from 'nconf';
const pre = ['!', '"', '\'', '( ', '(aa'];

module.exports = (client) => {
  if (nconf.get('NICKNAME') != 'true') return;
  setInterval(() => {
    client.guilds.forEach(g => {
      if (g.me.permissions.has('MANAGE_NICKNAMES')) {
        g.members.forEach(m => {
          pre.forEach(e => {
            if (m.displayName.toLowerCase().startsWith(e)) m.setNickname(`Care-Bear${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
          });
        });
      }
    });
  }, 1800000); // 1800000 = 30 minutes
}
