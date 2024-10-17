const { EmbedBuilder } = require('discord.js')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')
const requiredKeys = ['LEADERBOARD', 'CHANNEL_LEADERBOARD', 'USER', 'SERVER', 'DATABASE']

const format = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const createLeaderboard = async (query, formatFn = x => x) => {
  const members = await pool.query(query)
  return members.rows.reduce((acc, m, i) => {
    const rank = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i] || '#️⃣'
    const color = ['[1;31m', '[1;34m', '[1;35m', '[1;33m', '[1;33m', '[1;32m'][i] || '[1;36m'
    const wrapper = i < 3 ? ['<<<', '<<', '<'][i] : i < 10 ? '[]' : ''
    const value = formatFn(m[Object.keys(m)[1]])
    const line = `${rank} ${color}${value}[0m ${wrapper[0] || ''}${m.name}${wrapper[1] || ''}\n`
    return i === 9 ? acc + line + '[1;37m---[0m\n' : acc + line
  }, '')
}

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const stats = { users: 0, user0: 0, user1: 0, user10: 0, user100: 0, userEN: 0, userFR: 0, userOT: 0, userENFR: 0, userALL: 0, totalT: 0, totalEN: 0, totalFR: 0, totalOT: 0 }
  const serverStats = { T: 0, EN: 0, FR: 0, OT: 0 }
  const members = await pool.query('SELECT * FROM members')
  members.rows.forEach(member => {
    stats.users++
    if (member.total_msg === 0) stats.user0++
    else if (member.total_msg < 11) stats.user1++
    else if (member.total_msg < 100) stats.user10++
    else stats.user100++
    if (member.en_msg > 0 && member.fr_msg === 0) stats.userEN++
    if (member.en_msg === 0 && member.fr_msg > 0) stats.userFR++
    if (member.en_msg === 0 && member.fr_msg === 0 && member.other_msg > 0) stats.userOT++
    if (member.en_msg > 0 && member.fr_msg > 0) stats.userENFR++
    if (member.en_msg > 0 && member.fr_msg > 0 && member.other_msg > 0) stats.userALL++
    stats.totalT += member.total_msg
    stats.totalEN += member.en_msg
    stats.totalFR += member.fr_msg
    stats.totalOT += member.other_msg
  })

  const leaderboards = {
    created: await createLeaderboard('SELECT * FROM members ORDER BY created ASC LIMIT 20', date),
    joined: await createLeaderboard('SELECT * FROM members ORDER BY joined ASC LIMIT 20', date),
    rejoined: await createLeaderboard('SELECT * FROM members ORDER BY rejoined ASC LIMIT 20', date),
    firstMsg: await createLeaderboard('SELECT * FROM members ORDER BY first_msg ASC LIMIT 20', date),
    overallRank: await createLeaderboard(`SELECT name, (rank() OVER (ORDER BY total_msg DESC) + rank() OVER (ORDER BY en_msg DESC) + rank() OVER (ORDER BY fr_msg DESC) + rank() OVER (ORDER BY other_msg DESC) + rank() OVER (ORDER BY pings DESC) + rank() OVER (ORDER BY msg_per_day DESC)) / 6.0 AS rank FROM members ORDER BY rank ASC LIMIT 20`, x => x.toFixed(2)),
    otherMsg: await createLeaderboard('SELECT * FROM members ORDER BY other_msg DESC LIMIT 20'),
    frMsg: await createLeaderboard('SELECT * FROM members ORDER BY fr_msg DESC LIMIT 20'),
    enMsg: await createLeaderboard('SELECT * FROM members ORDER BY en_msg DESC LIMIT 20'),
    pings: await createLeaderboard('SELECT * FROM members ORDER BY pings DESC LIMIT 20'),
    msgPerDay: await createLeaderboard('SELECT * FROM members ORDER BY msg_per_day DESC LIMIT 20', x => Number(x).toFixed(2)),
    totalMsg: await createLeaderboard('SELECT * FROM members ORDER BY total_msg DESC LIMIT 20')
  }
  const channel = await client.channels.fetch(nconf.get('CHANNEL_LEADERBOARD'))
  await channel.bulkDelete(12)
  const links = ['EN', 'FR', 'OT', 'T'].map(type => `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?${nconf.get(`CHANNELS_${type}`).map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`)
  for (const [i, link] of links.entries()) {
    await delay(6000)
    const res = await fetch(link)
    const result = JSON.parse(res)
    serverStats[Object.keys(serverStats)[i]] = result.total_results
  }
  const summaryMessage = `Out of **${format(stats.users)}** users: **${format(stats.user0)}** sent 0 messages, **${format(stats.user1)}** sent 1~10 messages, **${format(stats.user10)}** sent 11~99 messages, **${format(stats.user100)}** sent 100+ messages.\n
  Out of **${format(stats.user1 + stats.user10 + stats.user100)}** users who sent a message: **${format(stats.userEN)}** only in English channels, **${format(stats.userFR)}** only in French channels, **${format(stats.userOT)}** only in Other channels,\n
  **${format(stats.userENFR)}** in both English and French channels and **${format(stats.userALL)}** in English, French, as well as Other channels.\n\n
  Messages sent in the server:\n
  All channels: **${format(serverStats.T)}** (**${format(stats.totalT)}** from users still in the server, **${format(serverStats.T - stats.totalT)}** from users no longer in the server)\n
  English channels: **${format(serverStats.EN)} (${format(stats.totalEN)}** from users still in the server, **${format(serverStats.EN - stats.totalEN)}** from users no longer in the server)\n
  French channels: **${format(serverStats.FR)} (${format(stats.totalFR)}** from users still in the server, **${format(serverStats.FR - stats.totalFR)}** from users no longer in the server)\n
  Other channels: **${format(serverStats.OT)} (${format(stats.totalOT)}** from users still in the server, **${format(serverStats.OT - stats.totalOT)}** from users no longer in the server)`
  await channel.send(summaryMessage)
  const titles = [
    'Oldest account creation date\nDate de création de compte la plus ancienne',
    'Oldest server join date without rejoins\nDate d\'adhésion au serveur la plus ancienne sans réadhésions',
    'Oldest server join date with rejoins\nDate d\'adhésion au serveur la plus ancienne avec réadhésions',
    'Oldest first message sent\nPremier message envoyé le plus ancien',
    'Overall rank from the info below\nClassement global à partir des informations ci-dessous',
    'Total messages sent in Other channels\nTotal des messages envoyés sur les salons Autres',
    'Total messages sent in French channels\nTotal des messages envoyés sur les salons Françaises',
    'Total messages sent in English channels\nTotal des messages envoyés sur les salons Anglaises',
    'Most pinged users\nUtilisateurs les plus sollicités',
    'Average messages per day since account creation\nMessages moyens par jour depuis la création du compte',
    'Total messages sent in all channels\nTotal des messages envoyés sur tous les salons'
  ]
  for (const [index, [key, value]] of Object.entries(leaderboards).entries()) {
    await channel.send({ embeds: [new EmbedBuilder().setTitle(titles[index]).setDescription(`\`\`\`ansi\n${value}\`\`\``).setColor(randomColor())] })
  }
}