const { EmbedBuilder } = require('discord.js')
const nconf = require('nconf')
const random = require('randomcolor')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')

function format(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

module.exports = async (client) => {
  if (!nconf.get('USER') || !nconf.get('DATABASE') || !nconf.get('SERVER') || !nconf.get('CHANNEL_LEADERBOARD')) return
  let tT = tEN = tFR = tOT = tC = tJ = tF = tM = tP = tR = ''
  let serverT = serverEN = serverFR = serverOT = totalT = totalEN = totalFR = totalOT = 0
  let users = user0 = user1 = user10 = user100 = userEN = userFR = userOT = userENFR = userALL = 0
  let uris = [`https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?channel_id=78581046714572800&channel_id=364081918116888576&channel_id=626165608010088449&channel_id=534121764045717524&channel_id=297780920268750858&include_nsfw=true`,
  `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?channel_id=297779639609327617&channel_id=364086525799038976&channel_id=626165637252907045&channel_id=534121863857569792&channel_id=372100313890553856&include_nsfw=true`,
  `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?channel_id=297779810279751680&channel_id=356038271140233216&channel_id=299523503592439809&channel_id=297809615490383873&channel_id=297779846187188234&channel_id=892471107318345749&channel_id=582715083537514526&channel_id=297779010417590274&channel_id=678244173006241842&include_nsfw=true`,
  `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?channel_id=78581046714572800&channel_id=364081918116888576&channel_id=626165608010088449&channel_id=534121764045717524&channel_id=297780920268750858&channel_id=297779639609327617&channel_id=364086525799038976&channel_id=626165637252907045&channel_id=534121863857569792&channel_id=372100313890553856&channel_id=297779810279751680&channel_id=356038271140233216&channel_id=299523503592439809&channel_id=297809615490383873&channel_id=297779846187188234&channel_id=892471107318345749&channel_id=582715083537514526&channel_id=297779010417590274&channel_id=678244173006241842&include_nsfw=true`]

  pool.query('SELECT * FROM members', [], (err, members) => {
    if (err) throw err
    users = members.rowCount
    members.rows.forEach((m) => {
      if (m.total_msg === 0) user0++
      if (m.total_msg > 0 && m.total_msg < 11) user1++
      if (m.total_msg > 10 && m.total_msg < 100) user10++
      if (m.total_msg > 99) user100++
      if (m.en_msg > 0 && m.fr_msg === 0) userEN++
      if (m.en_msg === 0 && m.fr_msg > 0) userFR++
      if (m.en_msg === 0 && m.fr_msg === 0 && m.other_msg > 0) userOT++
      if (m.en_msg > 0 && m.fr_msg > 0) userENFR++
      if (m.en_msg > 0 && m.fr_msg > 0 && m.other_msg > 0) userALL++
      totalT += m.total_msg
      totalEN += m.en_msg
      totalFR += m.fr_msg
      totalOT += m.other_msg
    })
  })

  pool.query('SELECT * FROM members ORDER BY created ASC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tC += `1️⃣ [1;2m[1;31m${date(m.created, true)}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tC += `2️⃣ [1;34m${date(m.created, true)}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tC += `3️⃣ [1;35m${date(m.created, true)}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tC += `4️⃣ [1;33m${date(m.created, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tC += `5️⃣ [1;33m${date(m.created, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tC += `6️⃣ [1;32m${date(m.created, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tC += `7️⃣ [1;32m${date(m.created, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tC += `8️⃣ [1;32m${date(m.created, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tC += `9️⃣ [1;32m${date(m.created, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tC += `🔟 [1;32m${date(m.created, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tC += `#️⃣ [1;36m${date(m.created, true)}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY rejoined ASC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tJ += `1️⃣ [1;2m[1;31m${date(m.joined, true)}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tJ += `2️⃣ [1;34m${date(m.joined, true)}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tJ += `3️⃣ [1;35m${date(m.joined, true)}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tJ += `4️⃣ [1;33m${date(m.joined, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tJ += `5️⃣ [1;33m${date(m.joined, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tJ += `6️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tJ += `7️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tJ += `8️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tJ += `9️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tJ += `🔟 [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tJ += `#️⃣ [1;36m${date(m.joined, true)}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY first_msg ASC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tF += `1️⃣ [1;2m[1;31m${date(m.first_msg, true)}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tF += `2️⃣ [1;34m${date(m.joined, true)}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tF += `3️⃣ [1;35m${date(m.joined, true)}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tF += `4️⃣ [1;33m${date(m.joined, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tF += `5️⃣ [1;33m${date(m.joined, true)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tF += `6️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tF += `7️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tF += `8️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tF += `9️⃣ [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tF += `🔟 [1;32m${date(m.joined, true)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tF += `#️⃣ [1;36m${date(m.joined, true)}[0m ${m.name}\n`
    })
  })

  pool.query(
    'SELECT id, name, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day, ' +
    'rank() OVER (ORDER BY total_msg DESC) AS total_msg_rank, ' +
    'rank() OVER (ORDER BY en_msg DESC) AS en_msg_rank, ' +
    'rank() OVER (ORDER BY fr_msg DESC) AS fr_msg_rank, ' +
    'rank() OVER (ORDER BY other_msg DESC) AS other_msg_rank, ' +
    'rank() OVER (ORDER BY pings DESC) AS pings_rank, ' +
    'rank() OVER (ORDER BY msg_per_day DESC) AS msg_per_day_rank ' +
    'FROM members', [], (err, members) => {
    if (err) throw err
    const combinedRanks = []
    members.rows.forEach((row) => {
      const rankSum = Number(row.total_msg_rank) + Number(row.en_msg_rank) + Number(row.fr_msg_rank) + Number(row.other_msg_rank) + Number(row.pings_rank) + Number(row.msg_per_day_rank)
      combinedRanks.push({ name: row.name, rankSum })
    })
    const top20 = combinedRanks.sort((a, b) => a.rankSum - b.rankSum).slice(0, 20)
    top20.forEach((m, i) => {
      if (i === 0) tR += `1️⃣ [1;2m[1;31m${(m.rankSum / 6).toFixed(2)}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tR += `2️⃣ [1;34m${(m.rankSum / 6).toFixed(2)}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tR += `3️⃣ [1;35m${(m.rankSum / 6).toFixed(2)}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tR += `4️⃣ [1;33m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tR += `5️⃣ [1;33m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tR += `6️⃣ [1;32m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tR += `7️⃣ [1;32m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tR += `8️⃣ [1;32m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tR += `9️⃣ [1;32m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tR += `🔟 [1;32m${(m.rankSum / 6).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tR += `#️⃣ [1;36m${(m.rankSum / 6).toFixed(2)}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY other_msg DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tOT += `1️⃣ [1;2m[1;31m${m.other_msg}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tOT += `2️⃣ [1;34m${m.other_msg}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tOT += `3️⃣ [1;35m${m.other_msg}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tOT += `4️⃣ [1;33m${m.other_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tOT += `5️⃣ [1;33m${m.other_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tOT += `6️⃣ [1;32m${m.other_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tOT += `7️⃣ [1;32m${m.other_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tOT += `8️⃣ [1;32m${m.other_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tOT += `9️⃣ [1;32m${m.other_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tOT += `🔟 [1;32m${m.other_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tOT += `#️⃣ [1;36m${m.other_msg}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY fr_msg DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tFR += `1️⃣ [1;2m[1;31m${m.fr_msg}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tFR += `2️⃣ [1;34m${m.fr_msg}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tFR += `3️⃣ [1;35m${m.fr_msg}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tFR += `4️⃣ [1;33m${m.fr_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tFR += `5️⃣ [1;33m${m.fr_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tFR += `6️⃣ [1;32m${m.fr_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tFR += `7️⃣ [1;32m${m.fr_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tFR += `8️⃣ [1;32m${m.fr_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tFR += `9️⃣ [1;32m${m.fr_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tFR += `🔟 [1;32m${m.fr_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tFR += `#️⃣ [1;36m${m.fr_msg}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY en_msg DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tEN += `1️⃣ [1;2m[1;31m${m.en_msg}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tEN += `2️⃣ [1;34m${m.en_msg}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tEN += `3️⃣ [1;35m${m.en_msg}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tEN += `4️⃣ [1;33m${m.en_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tEN += `5️⃣ [1;33m${m.en_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tEN += `6️⃣ [1;32m${m.en_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tEN += `7️⃣ [1;32m${m.en_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tEN += `8️⃣ [1;32m${m.en_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tEN += `9️⃣ [1;32m${m.en_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tEN += `🔟 [1;32m${m.en_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tEN += `#️⃣ [1;36m${m.en_msg}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY pings DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tP += `1️⃣ [1;2m[1;31m${m.pings}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tP += `2️⃣ [1;34m${m.pings}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tP += `3️⃣ [1;35m${m.pings}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tP += `4️⃣ [1;33m${m.pings}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tP += `5️⃣ [1;33m${m.pings}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tP += `6️⃣ [1;32m${m.pings}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tP += `7️⃣ [1;32m${m.pings}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tP += `8️⃣ [1;32m${m.pings}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tP += `9️⃣ [1;32m${m.pings}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tP += `🔟 [1;32m${m.pings}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tP += `#️⃣ [1;36m${m.pings}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY msg_per_day DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tM += `1️⃣ [1;2m[1;31m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tM += `2️⃣ [1;34m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tM += `3️⃣ [1;35m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tM += `4️⃣ [1;33m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tM += `5️⃣ [1;33m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tM += `6️⃣ [1;32m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tM += `7️⃣ [1;32m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tM += `8️⃣ [1;32m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tM += `9️⃣ [1;32m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tM += `🔟 [1;32m${Number(m.msg_per_day).toFixed(2)}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tM += `#️⃣ [1;36m${Number(m.msg_per_day).toFixed(2)}[0m ${m.name}\n`
    })
  })

  pool.query('SELECT * FROM members ORDER BY total_msg DESC LIMIT 20', [], (err, members) => {
    if (err) throw err
    members.rows.forEach((m, i) => {
      if (i === 0) tT += `1️⃣ [1;2m[1;31m${m.total_msg}[0m [1;37m<<< [0m[1;31m${m.name}[0m [1;37m>>>[0m\n`
      if (i === 1) tT += `2️⃣ [1;34m${m.total_msg}[0m [1;37m<<[0m [1;34m${m.name}[0m [1;37m>>[0m\n`
      if (i === 2) tT += `3️⃣ [1;35m${m.total_msg}[0m [1;37m<[0m [1;35m${m.name}[0m [1;37m>[0m\n`
      if (i === 3) tT += `4️⃣ [1;33m${m.total_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 4) tT += `5️⃣ [1;33m${m.total_msg}[0m [1;37m[[0m [1;33m${m.name}[0m [1;37m][0m\n`
      if (i === 5) tT += `6️⃣ [1;32m${m.total_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 6) tT += `7️⃣ [1;32m${m.total_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 7) tT += `8️⃣ [1;32m${m.total_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 8) tT += `9️⃣ [1;32m${m.total_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n`
      if (i === 9) tT += `🔟 [1;32m${m.total_msg}[0m [1;37m[[0m [1;32m${m.name}[0m [1;37m][0m\n[1;37m---[0m\n`
      if (i > 9 && i < 20) tT += `#️⃣ [1;36m${m.total_msg}[0m ${m.name}\n`
    })
  })

  await client.channels.fetch(nconf.get('CHANNEL_LEADERBOARD')).then(async c => {
    await c.messages.fetch({ limit: 11, cache: false }).then(m => m.forEach(m => m.delete()))
    for (let i = 0; i < uris.length; i++) {
      await delay(6000)
      await fetch(uris[i]).then(res => {
        if (i === 0) serverEN = JSON.parse(res).total_results
        if (i === 1) serverFR = JSON.parse(res).total_results
        if (i === 2) serverOT = JSON.parse(res).total_results
        if (i === 3) serverT = JSON.parse(res).total_results
      }).catch(err => { throw err })
    }

    await c.send(`Out of **${format(users)}** users: **${format(user0)}** sent 0 messages, **${format(user1)}** sent 1~10 messages, **${format(user10)}** sent 11~99 messages, **${format(user100)}** sent 100+ messages.\nOut of **${format(user1 + user10 + user100)}** users who sent a message: **${format(userEN)}** only in English channels, **${format(userFR)}** only in French channels, **${format(userOT)}** only in Other channels,\n**${format(userENFR)}** in both English and French channels and **${format(userALL)}** in English, French, as well as Other channels.\n\nMessages sent in the server:\nAll channels: **${format(serverT)}** (**${format(totalT)}** from users still in the server, **${format(serverT - totalT)}** from users no longer in the server)\nEnglish channels: **${format(serverEN)} (${format(totalEN)}** from users still in the server, **${format(serverEN - totalEN)}** from users no longer in the server)\nFrench channels: **${format(serverFR)} (${format(totalFR)}** from users still in the server, **${format(serverFR - totalFR)}** from users no longer in the server)\nOther channels: **${format(serverOT)} (${format(totalOT)}** from users still in the server, **${format(serverOT - totalOT)}** from users no longer in the server)`)
    await c.send({ embeds: [new EmbedBuilder().setTitle('Oldest account creation date\nDate de création de compte la plus ancienne').setDescription(`\`\`\`ansi\n${tC}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Oldest server join date\nDate d\'adhésion au serveur la plus ancienne').setDescription(`\`\`\`ansi\n${tJ}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Oldest first message sent\nPremier message envoyé le plus ancien').setDescription(`\`\`\`ansi\n${tF}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Overall rank\nClassement général').setDescription(`\`\`\`ansi\n${tR}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Total messages sent in Other channels\nTotal des messages envoyés sur les salons Autres').setDescription(`\`\`\`ansi\n${tOT}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Total messages sent in French channels\nTotal des messages envoyés sur les salons Françaises').setDescription(`\`\`\`ansi\n${tFR}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Total messages sent in English channels\nTotal des messages envoyés sur les salons Anglaises').setDescription(`\`\`\`ansi\n${tEN}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Most pinged users\nUtilisateurs les plus sollicités').setDescription(`\`\`\`ansi\n${tP}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Average messages per day since account creation\nMessages moyens par jour depuis la création du compte').setDescription(`\`\`\`ansi\n${tM}\`\`\``).setColor(random())] })
    await c.send({ embeds: [new EmbedBuilder().setTitle('Total messages sent in all channels\nTotal des messages envoyés sur tous les salons').setDescription(`\`\`\`ansi\n${tT}\`\`\``).setColor(random())] })
  })
}