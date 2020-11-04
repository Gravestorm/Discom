import nconf from 'nconf';

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES') || !nconf.get('CHANNEL_ADS')) return;
  setInterval(() => {
    client.channels.forEach(c => {
      if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS') || c.name === nconf.get('CHANNEL_ANNONCES') || c.name === nconf.get('CHANNEL_ADS')) {
        if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
        c.fetchMessages({limit: 100}).then(msgs => {
          msgs.forEach(m => {
            if (c.name === nconf.get('CHANNEL_ADS') && (new Date() - m.createdTimestamp) / 1000 > 5000000) m.delete();
            if (m.author === client.user && (new Date() - m.createdTimestamp) / 1000 > 5000000) m.delete();
            return;
          });
        });
      }
    });
  }, 7200000); // 7200000 = 120 minutes
}
