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
const frChannels = ['297779639609327617', '364086525799038976', '1270756963575271424', '626165637252907045', '372100313890553856', '534121863857569792', '1079510661471666297', '1022612394905718854']
const enChannels = ['78581046714572800', '364081918116888576', '1270759070793597000', '626165608010088449', '297780920268750858', '534121764045717524']
const otChannels = ['297779810279751680', '356038271140233216', '299523503592439809', '1006449121948868659', '297780878980153344', '297809615490383873', '297779846187188234', '1227717112802578605', '582715083537514526', '678244173006241842', '297779010417590274', '892471107318345749']
const allChannels = [...frChannels, ...enChannels, ...otChannels]

const format = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

function generateLeaderboard(members, valueKey, formatFunc = (x) => x) {
  return members.slice(0, 20).map((member, i) => {
    const value = formatFunc(member[valueKey])
    if (i === 0) return `1️⃣ [1;2m[1;31m${value}[0m [1;37m<<< [0m[1;31m${member.name}[0m [1;37m>>>[0m\n`
    if (i === 1) return `2️⃣ [1;34m${value}[0m [1;37m<<[0m [1;34m${member.name}[0m [1;37m>>[0m\n`
    if (i === 2) return `3️⃣ [1;35m${value}[0m [1;37m<[0m [1;35m${member.name}[0m [1;37m>[0m\n`
    if (i === 3) return `4️⃣️ [1;33m${value}[0m [1;37m[[0m [1;33m${member.name}[0m [1;37m][0m\n`
    if (i === 4) return `5️⃣️ [1;33m${value}[0m [1;37m[[0m [1;33m${member.name}[0m [1;37m][0m\n`
    if (i === 5) return `6️⃣️ [1;32m${value}[0m [1;37m[[0m [1;32m${member.name}[0m [1;37m][0m\n`
    if (i === 6) return `7️⃣️ [1;32m${value}[0m [1;37m[[0m [1;32m${member.name}[0m [1;37m][0m\n`
    if (i === 7) return `8️⃣ [1;32m${value}[0m [1;37m[[0m [1;32m${member.name}[0m [1;37m][0m\n`
    if (i === 8) return `9️⃣️ [1;32m${value}[0m [1;37m[[0m [1;32m${member.name}[0m [1;37m][0m\n`
    if (i === 9) return `🔟 [1;32m${value}[0m [1;37m[[0m [1;32m${member.name}[0m [1;37m][0m\n[1;37m---[0m\n`
    return `#️⃣ [1;36m${value}[0m ${member.name}\n`
  }).join('')
}

async function sendLeaderboardEmbed(channel, title, description) {
  await channel.send({embeds: [new EmbedBuilder().setTitle(title).setDescription(`\`\`\`ansi\n${description}\`\`\``).setColor(randomColor())]})
}

async function generateAndSendLeaderboards(pool, channel) {
  const leaderboards = [
    { query: 'SELECT * FROM members ORDER BY created ASC LIMIT 20', key: 'created', title: 'Oldest account creation date\nDate de création de compte la plus ancienne', formatFunc: (x) => date(Number(x)) },
    { query: 'SELECT * FROM members ORDER BY joined ASC LIMIT 20', key: 'joined', title: 'Oldest server join date without rejoins\nDate d\'adhésion au serveur la plus ancienne sans réadhésions', formatFunc: (x) => date(Number(x)) },
    { query: 'SELECT * FROM members ORDER BY rejoined ASC LIMIT 20', key: 'rejoined', title: 'Oldest server join date with rejoins\nDate d\'adhésion au serveur la plus ancienne avec réadhésions', formatFunc: (x) => date(Number(x)) },
    { query: 'SELECT * FROM members ORDER BY first_msg ASC LIMIT 20', key: 'first_msg', title: 'Oldest first message sent\nPremier message envoyé le plus ancien', formatFunc: (x) => date(Number(x)) },
    { query: 'SELECT * FROM members ORDER BY other_msg DESC LIMIT 20', key: 'other_msg', title: 'Total messages sent in Other channels\nTotal des messages envoyés sur les salons Autres' },
    { query: 'SELECT * FROM members ORDER BY fr_msg DESC LIMIT 20', key: 'fr_msg', title: 'Total messages sent in French channels\nTotal des messages envoyés sur les salons Françaises' },
    { query: 'SELECT * FROM members ORDER BY en_msg DESC LIMIT 20', key: 'en_msg', title: 'Total messages sent in English channels\nTotal des messages envoyés sur les salons Anglaises' },
    { query: 'SELECT * FROM members ORDER BY pings DESC LIMIT 20', key: 'pings', title: 'Most pinged users\nUtilisateurs les plus sollicités' },
    { query: 'SELECT * FROM members ORDER BY msg_per_day DESC LIMIT 20', key: 'msg_per_day', title: 'Average messages per day since joined\nMessages moyens par jour depuis rejoindre', formatFunc: (x) => Number(x).toFixed(2) },
    { query: 'SELECT * FROM members ORDER BY total_msg DESC LIMIT 20', key: 'total_msg', title: 'Total messages sent in all channels\nTotal des messages envoyés sur tous les salons' },
  ]
  const leaderboardPromises = leaderboards.map(async (leaderboard) => {
    const { rows } = await pool.query(leaderboard.query)
    const leaderboardString = generateLeaderboard(rows, leaderboard.key, leaderboard.formatFunc)
    return { title: leaderboard.title, description: leaderboardString }
  })
  const generatedLeaderboards = await Promise.all(leaderboardPromises)
  await Promise.all(generatedLeaderboards.map(({ title, description }) => 
    sendLeaderboardEmbed(channel, title, description)
  ))
  const { rows } = await pool.query(`
    SELECT id, name, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day,
    rank() OVER (ORDER BY total_msg DESC) AS total_msg_rank,
    rank() OVER (ORDER BY en_msg DESC) AS en_msg_rank,
    rank() OVER (ORDER BY fr_msg DESC) AS fr_msg_rank,
    rank() OVER (ORDER BY other_msg DESC) AS other_msg_rank,
    rank() OVER (ORDER BY pings DESC) AS pings_rank,
    rank() OVER (ORDER BY msg_per_day DESC) AS msg_per_day_rank
    FROM members
  `)
  const combinedRanks = rows.map(row => ({ name: row.name, rankSum: ['total_msg_rank', 'en_msg_rank', 'fr_msg_rank', 'other_msg_rank', 'pings_rank', 'msg_per_day_rank'].reduce((sum, key) => sum + Number(row[key]), 0) })).sort((a, b) => a.rankSum - b.rankSum).slice(0, 20)
  const overallRankString = generateLeaderboard(combinedRanks, 'rankSum', x => (x / 6).toFixed(2))
  await sendLeaderboardEmbed(channel, 'Overall rank from all leaderboards\nClassement général de tous les classements', overallRankString)
}


module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  let serverAllMsg = serverEnMsg = serverFrMsg = serverOtMsg = memberAllMsg = memberEnMsg = memberFrMsg = memberOtMsg = 0
  let memberCountAll = memberCount0Msg = memberCount1Msg = memberCount10Msg = memberCount100Msg = memberCounEnMsg = memberCounFrMsg = memberCounOtMsg = memberCountEnFrMsg = memberCounAllMsg = 0
  pool.query('SELECT * FROM members', [], (err, members) => {
    if (err) throw err
    memberCountAll = members.rowCount
    members.rows.forEach((member) => {
      if (member.total_msg === 0) memberCount0Msg++
      if (member.total_msg > 0 && member.total_msg < 11) memberCount1Msg++
      if (member.total_msg > 10 && member.total_msg < 100) memberCount10Msg++
      if (member.total_msg > 99) memberCount100Msg++
      if (member.en_msg > 0 && member.fr_msg === 0) memberCounEnMsg++
      if (member.en_msg === 0 && member.fr_msg > 0) memberCounFrMsg++
      if (member.en_msg === 0 && member.fr_msg === 0 && member.other_msg > 0) memberCounOtMsg++
      if (member.en_msg > 0 && member.fr_msg > 0) memberCountEnFrMsg++
      if (member.en_msg > 0 && member.fr_msg > 0 && member.other_msg > 0) memberCounAllMsg++
      memberAllMsg += member.total_msg
      memberEnMsg += member.en_msg
      memberFrMsg += member.fr_msg
      memberOtMsg += member.other_msg
    })
  })
  const channel = await client.channels.fetch(nconf.get('CHANNEL_LEADERBOARD'))
  const messages = await channel.messages.fetch({ limit: 12, cache: false })
  await messages.forEach(message => message.delete())
  const links = [
    `${baseUrl}?${frChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?${enChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?${otChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?${allChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`
  ]
  for (let i = 0; i < links.length; i++) {
    await delay(6000)
    const res = await fetch(links[i], nconf.get('USER1'))
    const result = JSON.parse(res)
    if (i === 0) serverFrMsg = result.total_results
    if (i === 1) serverEnMsg = result.total_results
    if (i === 2) serverOtMsg = result.total_results
    if (i === 3) serverAllMsg = result.total_results
  }
  await channel.send(`Out of **${format(memberCountAll)}** users: **${format(memberCount0Msg)}** sent 0 messages, **${format(memberCount1Msg)}** sent 1~10 messages, **${format(memberCount10Msg)}** sent 11~99 messages, **${format(memberCount100Msg)}** sent 100+ messages.\nOut of **${format(memberCount1Msg + memberCount10Msg + memberCount100Msg)}** users who sent a message: **${format(memberCounEnMsg)}** only in English channels, **${format(memberCounFrMsg)}** only in French channels, **${format(memberCounOtMsg)}** only in Other channels,\n**${format(memberCountEnFrMsg)}** in both English and French channels and **${format(memberCounAllMsg)}** in English, French, as well as Other channels.\n\nMessages sent in the server:\nAll channels: **${format(serverAllMsg)}** (**${format(memberAllMsg)}** from users still in the server, **${format(serverAllMsg - memberAllMsg)}** from users no longer in the server)\nEnglish channels: **${format(serverEnMsg)} (${format(memberEnMsg)}** from users still in the server, **${format(serverEnMsg - memberEnMsg)}** from users no longer in the server)\nFrench channels: **${format(serverFrMsg)} (${format(memberFrMsg)}** from users still in the server, **${format(serverFrMsg - memberFrMsg)}** from users no longer in the server)\nOther channels: **${format(serverOtMsg)} (${format(memberOtMsg)}** from users still in the server, **${format(serverOtMsg - memberOtMsg)}** from users no longer in the server)`)
  await generateAndSendLeaderboards(pool, channel)
}