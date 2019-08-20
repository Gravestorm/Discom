import nconf from 'nconf';
import ytpl from 'ytpl';
const url = ['UUJ_tz6Xl_YtrAHd3gqChhMA', 'UUvNdYvCMA9FcjFAV2gg8R6A'];

module.exports = (client) => {
  if (!nconf.get('CHANNEL_ADS')) return;
  setInterval(() => {
    url.forEach(n => {
      ytpl(n, { limit: 1 }, (err, playlist) => {
        if (!playlist || playlist.items[0] || new Date(playlist.last_updated).getTime() / 1000 > 604800) return;
        let vid = playlist.items[0].url_simple;
        client.channels.forEach(c => {
          if (c.name === nconf.get('CHANNEL_ADS')) {
            if (c.permissionsFor(client.user).has('VIEW_CHANNEL') === false || c.permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
            c.fetchMessages().then(msgs => {
              if (msgs.find(m => m.content === vid)) return;
              c.send(vid);
            });
          }
        });
      });
    })
  }, 600000); // 600000 = 10 minutes
}
