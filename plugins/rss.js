import fetch from 'node-fetch';
import nconf from 'nconf';
import parser from 'rss-parser';
const P = new parser();
const url = ['news', 'devblog', 'changelog'];

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES')) return;
  setInterval(() => {
    url.forEach(n => {
      P.parseURL(`https://www.dofus.com/en/rss/${n}.xml`, (err, feed) => {
        if (err || !feed || (new Date - new Date(feed.items[0].isoDate).getTime()) / 1000 > 604800) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNOUNCEMENTS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post).then(m => {
                fetch(`https://discord.com/api/v6/channels/${m.channel.id}/messages/${m.id}/crosspost`, {
                    method: 'POST',
                    headers: { Authorization: `Bot ${nconf.get('TOKEN')}` }
                  }
                )
              });
            });
          }
        });
      })
      P.parseURL(`https://www.dofus.com/fr/rss/${n}.xml`, (err, feed) => {
        if (err || !feed || (new Date - new Date(feed.items[0].isoDate).getTime()) / 1000 > 604800) return;
        let post = feed.items[0].link.trim();
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ANNONCES')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === post)) return;
              c.send(post).then(m => {
                fetch(`https://discord.com/api/v6/channels/${m.channel.id}/messages/${m.id}/crosspost`, {
                    method: 'POST',
                    headers: { Authorization: `Bot ${nconf.get('TOKEN')}` }
                  }
                )
              });
            });
          }
        });
      })
    })
  }, 300000); // 300000 = 5 minutes
}
