import nconf from 'nconf';
import twit from 'twit';
const T = new twit({
  consumer_key: nconf.get('CONSUMER_KEY'),
  consumer_secret: nconf.get('CONSUMER_SECRET'),
  access_token: nconf.get('ACCESS_TOKEN'),
  access_token_secret: nconf.get('ACCESS_TOKEN_SECRET'),
  timeout_ms: 60 * 1000
});

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ANNOUNCEMENTS') || !nconf.get('CHANNEL_ANNONCES') || !nconf.get('CONSUMER_KEY') || !nconf.get('CONSUMER_SECRET') || !nconf.get('ACCESS_TOKEN') || !nconf.get('ACCESS_TOKEN_SECRET')) return;
  setInterval(() => {
    T.get('statuses/user_timeline', { screen_name: 'DOFUS_EN', exclude_replies: true, include_rts: false, count: 1 }, (err, data) => {
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
    T.get('statuses/user_timeline', { screen_name: 'DOFUSfr', exclude_replies: true, include_rts: false, count: 1 }, (err, data) => {
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
}
