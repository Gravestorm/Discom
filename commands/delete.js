import random from 'randomcolor';

module.exports.run = (client, msg, suffix, embed) => {
  msg.delete();
  if (!suffix[0] || isNaN(suffix[0])) return;
  msg.guild.fetchMembers().then(g => {
    if (g.me.permissions.has('MANAGE_MESSAGES') && msg.member.permissions.has('MANAGE_MESSAGES')) {
      if (suffix[0] > 100) suffix[0] = 100;
      setTimeout(() => {
        msg.channel.fetchMessages().then(msgs => {
          if (msg.mentions.channels.first() && msg.mentions.users.first()) {
            msg.channel.bulkDelete(msgs.filter(m => msg.mentions.users.has(m.author.id)).array().slice(0, suffix[0])).then(ms => {
              ms.sort((b, a) => b.id - a.id).forEach(m => {
                msg.mentions.channels.first().send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setFooter(`#${m.channel.name}`).setTimestamp(m.createdTimestamp).setColor(random()));
              });
            });
          } else if (msg.mentions.channels.first()) {
            msg.channel.bulkDelete(suffix[0]).then(ms => {
              ms.sort((b, a) => b.id - a.id).forEach(m => {
                msg.mentions.channels.first().send(embed.setAuthor(m.author.username, m.author.avatarURL).setDescription(m.content).setFooter(`#${m.channel.name}`).setTimestamp(m.createdTimestamp).setColor(random()));
              });
            });
          } else if (msg.mentions.users.first()) {
            msg.channel.bulkDelete(msgs.filter(m => msg.mentions.users.has(m.author.id)).array().slice(0, suffix[0]));
          } else {
            msg.channel.bulkDelete(suffix[0]);
          }
        });
      }, 100);
    }
  });
};

module.exports.config = {
  name: 'delete',
  aliases: ['d', 'del']
};
