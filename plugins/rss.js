import nconf from 'nconf';
import parser from 'rss-parser';
const P = new parser();
const url = ['news', 'devblog', 'changelog'];

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES')) return;
  setInterval(() => {
    url.forEach(n => {
      P.parseURL(`https://www.dofus.com/en/rss/${n}.xml`, (err, feed) => {
        if (!feed || !feed.items[0] || new Date(feed.items[0].isoDate).getTime() / 1000 > 604800) return;
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
      P.parseURL(`https://www.dofus.com/fr/rss/${n}.xml`, (err, feed) => {
        if (!feed || !feed.items[0] || new Date(feed.items[0].isoDate).getTime() / 1000 > 604800) return;
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
    })
  }, 300000); // 300000 = 5 minutes
}
