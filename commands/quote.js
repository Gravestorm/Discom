import random from 'randomcolor';

module.exports.run = (client, msg, suffix, embed) => {
  msg.delete();
  if (!suffix[0] || isNaN(suffix[0])) return;
  if (msg.mentions.channels.first()) {
    msg.mentions.channels.first().fetchMessage(suffix[0]).then(m => {
      msg.channel.send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setImage(m.attachments.first() ? m.attachments.first().proxyURL : '').setFooter(`Requested by ${msg.author.username} from #${m.channel.name}`, msg.author.avatarURL).setTimestamp(m.createdTimestamp).setColor(random()))
    });
  } else {
    msg.channel.fetchMessage(suffix[0]).then(m => {
      msg.channel.send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setImage(m.attachments.first() ? m.attachments.first().proxyURL : '').setFooter(`Requested by ${msg.author.username} from #${m.channel.name}`, msg.author.avatarURL).setTimestamp(m.createdTimestamp).setColor(random()))
    });
  }
};

module.exports.config = {
  name: 'quote',
  aliases: ['q']
};
