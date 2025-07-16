const { EmbedBuilder } = require('discord.js')
const nconf = require('nconf')
const randomColor = require('randomcolor')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE_URL'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')
const requiredKeys = ['LEADERBOARD', 'CHANNEL_LEADERBOARD', 'USER1', 'SERVER', 'DATABASE_URL']
const baseUrl = `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search`
const channels = {
  fr: ['297779639609327617', '364086525799038976', '1313146990787297331', '1394492145997578260', '1394492176477585539', '1079510661471666297', '626165637252907045', '372100313890553856', '534121863857569792', '1270756963575271424', '1022612394905718854', '297784724775239681', '297784820086341632', '715113653199831041', '715113687958159400'],
  en: ['78581046714572800', '364081918116888576', '1394490251744907395', '1394492432585854987', '626165608010088449', '297780920268750858', '534121764045717524', '1270759070793597000', '297784699403894794', '297791026398232578'],
  ot: ['678708610762670101', '678610533699813407', '356039693332381696', '297780078245576704', '297779810279751680', '356038271140233216', '299523503592439809', '1308372853879607406', '1308372908682383370', '364158526941298698', '1361674951156826213', '297780878980153344', '297809615490383873', '297779846187188234', '1227717112802578605', '582715083537514526', '985844390402596865', '297779010417590274', '972901996162088992', '590904233650552833', '892471107318345749', '1144005251385528331', '818570606374420501']
}
const allChannels = [...channels.fr, ...channels.en, ...channels.ot]

const format = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const formatTimeDifference = (x) => {
  const milliseconds = Number(x)
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  return `${days} day${days !== 1 ? 's' : ''}`
}

const generateLeaderboard = (members, valueKey, formatFunc = x => x) =>
  members.slice(0, 20).map((member, i) => {
    const value = formatFunc(member[valueKey])
    const styles = ['[1;31m', '[1;34m', '[1;35m', '[1;33m', '[1;32m', '[1;36m']
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣️', '5️⃣️', '6️⃣️', '7️⃣️', '8️⃣', '9️⃣️', '🔟', '#️⃣']
    const style = i < 6 ? styles[i] : styles[5]
    const emoji = emojis[i] || emojis[10]
    const brackets = i < 3 ? ['<<< ', ' >>>'] : i < 10 ? ['[ ', ' ]'] : ['', '']
    const nameStyle = i < 10 ? style : '[0m'
    return `${emoji} ${style}${value}[0m ${brackets[0]}${nameStyle}${member.name}[0m${brackets[1]}${i === 9 ? '\n[1;37m---[0m' : ''}\n`
  }).join('')

const sendLeaderboardEmbed = async (channel, title, description) => 
  await channel.send({embeds: [new EmbedBuilder().setTitle(title).setDescription(`\`\`\`ansi\n${description}\`\`\``).setColor(randomColor())]})

const generateAndSendLeaderboards = async (pool, channel) => {
  const leaderboards = [
    {
      query: 'SELECT * FROM members ORDER BY created ASC LIMIT 20',
      key: 'created',
      title: 'Oldest account creation date\nDate de création de compte la plus ancienne',
      formatFunc: x => date(Number(x))
    },
    {
      query: 'SELECT * FROM members ORDER BY joined ASC LIMIT 20',
      key: 'joined',
      title: 'Oldest server join date including people who rejoined later\nDate de première adhésion au serveur incluant les personnes ayant rejoint de nouveau',
      formatFunc: x => date(Number(x))
    },
    {
      query: 'SELECT * FROM members ORDER BY rejoined ASC LIMIT 20',
      key: 'rejoined',
      title: 'Oldest server join date not including people who rejoined later\nDate de première adhésion au serveur sans inclure les personnes ayant rejoint de nouveau',
      formatFunc: x => date(Number(x))
    },
    {
      query: 'SELECT * FROM members ORDER BY first_msg ASC LIMIT 20',
      key: 'first_msg',
      title: 'Oldest first message sent\nPremier message envoyé le plus ancien',
      formatFunc: x => date(Number(x))
    },
    { 
      query: `SELECT *, (first_msg - rejoined) as quickest_msg_time FROM members WHERE first_msg > rejoined ORDER BY quickest_msg_time ASC LIMIT 20`, 
      key: 'quickest_msg_time', 
      title: 'Quickest first message sent after joining the server\nPremier message le plus rapide envoyé après avoir rejoint le serveur',
      formatFunc: formatTimeDifference
    },
    { 
      query: `SELECT *, (first_msg - rejoined) as slowest_msg_time FROM members WHERE first_msg > rejoined ORDER BY slowest_msg_time DESC LIMIT 20`, 
      key: 'slowest_msg_time', 
      title: 'Slowest first message sent after joining the server\nPremier message le plus lent envoyé après avoir rejoint le serveur',
      formatFunc: formatTimeDifference
    },
    {
      query: 'SELECT * FROM members ORDER BY other_msg DESC LIMIT 20',
      key: 'other_msg',
      title: 'Total messages sent in Other channels\nNombre total de messages envoyés dans les salons Autres'
    },
    {
      query: 'SELECT * FROM members ORDER BY fr_msg DESC LIMIT 20',
      key: 'fr_msg',
      title: 'Total messages sent in French channels\nNombre total de messages envoyés dans les salons Français'
    },
    {
      query: 'SELECT * FROM members ORDER BY en_msg DESC LIMIT 20',
      key: 'en_msg',
      title: 'Total messages sent in English channels\nNombre total de messages envoyés dans les salons Anglais'
    },
    {
      query: 'SELECT * FROM members ORDER BY pings DESC LIMIT 20',
      key: 'pings',
      title: 'Most pinged people\nPersonnes les plus mentionnées'
    },
    {
      query: 'SELECT * FROM members ORDER BY msg_per_day_created DESC LIMIT 20',
      key: 'msg_per_day_created',
      title: 'Average messages per day since account creation\nMoyenne de messages par jour depuis la création du compte',
      formatFunc: x => Number(x).toFixed(2)
    },
    {
      query: 'SELECT * FROM members ORDER BY msg_per_day_joined DESC LIMIT 20',
      key: 'msg_per_day_joined',
      title: 'Average messages per day since joining the server\nMoyenne de messages par jour depuis l’arrivée sur le serveur',
      formatFunc: x => Number(x).toFixed(2)
    },
    {
      query: 'SELECT * FROM members ORDER BY total_msg DESC LIMIT 20',
      key: 'total_msg',
      title: 'Total messages sent in all channels\nNombre total de messages envoyés dans tous les salons'
    },
  ]

  const generatedLeaderboards = await Promise.all(leaderboards.map(async ({ query, key, title, formatFunc }) => {
    const { rows } = await pool.query(query)
    return { title, description: generateLeaderboard(rows, key, formatFunc) }
  }))

  await Promise.all(generatedLeaderboards.map(({ title, description }) => sendLeaderboardEmbed(channel, title, description)))

  const { rows } = await pool.query(`
    SELECT id, name, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day_created, msg_per_day_joined,
    rank() OVER (ORDER BY total_msg DESC) AS total_msg_rank,
    rank() OVER (ORDER BY en_msg DESC) AS en_msg_rank,
    rank() OVER (ORDER BY fr_msg DESC) AS fr_msg_rank,
    rank() OVER (ORDER BY other_msg DESC) AS other_msg_rank,
    rank() OVER (ORDER BY pings DESC) AS pings_rank,
    rank() OVER (ORDER BY msg_per_day_created DESC) AS msg_per_day_created_rank,
    rank() OVER (ORDER BY msg_per_day_joined DESC) AS msg_per_day_joined_rank
    FROM members
  `)

  const combinedRanks = rows.map(row => ({ 
    name: row.name, 
    rankSum: ['total_msg_rank', 'en_msg_rank', 'fr_msg_rank', 'other_msg_rank', 'pings_rank', 'msg_per_day_created_rank', 'msg_per_day_joined_rank']
      .reduce((sum, key) => sum + Number(row[key]), 0) 
  })).sort((a, b) => a.rankSum - b.rankSum).slice(0, 20)

  const overallRankString = generateLeaderboard(combinedRanks, 'rankSum', x => (x / 7).toFixed(2))
  await sendLeaderboardEmbed(channel, 'Overall rank\nClassement général', overallRankString)
}

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  const stats = { server: {}, member: {} }
  const counts = { all: 0, msg0: 0, msg1: 0, msg10: 0, msg100: 0, en: 0, fr: 0, ot: 0, enFr: 0, enFrOt: 0 }
  const { rows: members } = await pool.query('SELECT * FROM members')
  counts.all = members.length

  members.forEach(member => {
    if (member.total_msg === 0) counts.msg0++
    else if (member.total_msg < 11) counts.msg1++
    else if (member.total_msg < 100) counts.msg10++
    else counts.msg100++
    if (member.en_msg > 0 && member.fr_msg === 0) counts.en++
    else if (member.en_msg === 0 && member.fr_msg > 0) counts.fr++
    else if (member.en_msg === 0 && member.fr_msg === 0 && member.other_msg > 0) counts.ot++
    if (member.en_msg > 0 && member.fr_msg > 0) counts.enFr++
    if (member.en_msg > 0 && member.fr_msg > 0 && member.other_msg > 0) counts.enFrOt++
    ['total_msg', 'en_msg', 'fr_msg', 'other_msg'].forEach(key => {
      stats.member[key] = (stats.member[key] || 0) + member[key]
    })
  })

  const channel = await client.channels.fetch(nconf.get('CHANNEL_LEADERBOARD'))
  const messages = await channel.messages.fetch({ limit: 15, cache: false })
  await messages.forEach(message => message.delete()) 

  for (const [key, channelIds] of Object.entries(channels)) {
    const res = await fetch(`${baseUrl}?${channelIds.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`, nconf.get('USER1'))
    stats.server[`${key}_msg`] = JSON.parse(res).total_results
    await delay(6000)
  }

  const res = await fetch(`${baseUrl}?${allChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`, nconf.get('USER1'))
  stats.server.total_msg = JSON.parse(res).total_results

  const summaryMessage = `
Out of **${format(counts.all)}** users: **${format(counts.msg0)}** sent 0 messages, **${format(counts.msg1)}** sent 1~10 messages, **${format(counts.msg10)}** sent 11~99 messages, **${format(counts.msg100)}** sent 100+ messages.
Out of **${format(counts.all - counts.msg0)}** users who sent a message: **${format(counts.en)}** only in English channels, **${format(counts.fr)}** only in French channels, **${format(counts.ot)}** only in Other channels,
**${format(counts.enFr)}** in both English and French channels and **${format(counts.enFrOt)}** in English, French, as well as Other channels.\n
Total messages sent in the server:
All channels: **${format(stats.server.total_msg)}** (**${format(stats.member.total_msg)}** from users still in the server, **${format(stats.server.total_msg - stats.member.total_msg)}** from users no longer in the server)
English channels: **${format(stats.server.en_msg)} (${format(stats.member.en_msg)}** from users still in the server, **${format(stats.server.en_msg - stats.member.en_msg)}** from users no longer in the server)
French channels: **${format(stats.server.fr_msg)} (${format(stats.member.fr_msg)}** from users still in the server, **${format(stats.server.fr_msg - stats.member.fr_msg)}** from users no longer in the server)
Other channels: **${format(stats.server.ot_msg)} (${format(stats.member.other_msg)}** from users still in the server, **${format(stats.server.ot_msg - stats.member.other_msg)}** from users no longer in the server)`
  await generateAndSendLeaderboards(pool, channel)
  await channel.send(summaryMessage)
}