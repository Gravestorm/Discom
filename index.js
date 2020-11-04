import './init-config';
import Discord from 'discord.js';
import fs from 'fs';
import nconf from 'nconf';
import random from 'randomcolor';
import requireAll from 'require-all';
const client = new Discord.Client();
const embed = new Discord.RichEmbed();
const commands = requireAll({ dirname: `${__dirname}/commands`, filter: /^(?!-)(.+)\.js$/ });
const plugins = requireAll({ dirname: `${__dirname}/plugins`, filter: /^(?!-)(.+)\.js$/ });
client.commands = new Map();
client.aliases = new Map();

for (const name in commands) {
  const command = commands[name];
  client.commands.set(command.config.name, command);
  for (const a of command.config.aliases) client.aliases.set(a, command.config.name);
}

client.on('ready', () => {
  for (const name in plugins) {
    plugins[name](client);
  }
});

if (nconf.get('CHANNEL_LOG')) {
  client.on('messageDelete', msg => {
    if (msg.content[0] === '!' || !msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')) || ['ads', 'almanax', 'annonces', 'announcements', 'bot', 'madhouse'].includes(msg.channel.name) || msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')).permissionsFor(client.user).has('VIEW_CHANNEL') === false || msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')).permissionsFor(client.user).has('SEND_MESSAGES') === false) return;
    msg.guild.channels.find(c => c.name === nconf.get('CHANNEL_LOG')).send(embed.setAuthor(msg.author.username, msg.author.avatarURL).setDescription(msg.content).setImage(msg.attachments.first() ? msg.attachments.first().proxyURL : '').setFooter(`#${msg.channel.name}`).setTimestamp(msg.createdTimestamp).setColor(random()));
  });
}

client.on('message', msg => {
  const suffix = msg.content.slice(1).split(/ +/);
  const command = suffix.shift().toLowerCase();
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  if (cmd && msg.content[0] === '!' && msg.channel.type !== 'dm' && msg.author.bot !== true) {
    cmd.run(client, msg, suffix, embed);
  }
});

client.on('disconnected', () => {
  console.log('Disconnected');
  setTimeout(() => { client.login(nconf.get('TOKEN')) }, 5000);
});

client.login(nconf.get('TOKEN'));
