import cleverbot from 'cleverbot';
import nconf from 'nconf';
const C = new cleverbot({
  key: nconf.get('CLEVERBOT')
});

module.exports.run = (client, msg, suffix) => {
  if (!nconf.get('CLEVERBOT')) return;
  suffix = suffix.join(' ');
  if (!suffix) suffix = 'Hello.';
  msg.channel.startTyping();
  C.query(suffix.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, 'emoji')).then(response => {
    msg.channel.send(response.output);
    msg.channel.stopTyping();
  });
};

module.exports.config = {
  name: 'chat',
  aliases: ['talk']
};
