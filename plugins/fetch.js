const nconf = require('nconf')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE_URL'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')

const requiredKeys = ['FETCH', 'DATABASE_URL', 'USER', 'SERVER', 'ROLE_IRON', 'ROLE_COPPER', 'ROLE_BRONZE', 'ROLE_SILVER', 'ROLE_GOLD', 'ROLE_CRYSTAL', 'ROLE_DIAMOND', 'ROLE_LEGEND', 'ROLE_EPIC', 'ROLE_OMEGA', 'ROLE_ACHIEVEMENT', 'ROLE_YEAR15', 'ROLE_YEAR16', 'ROLE_YEAR17', 'ROLE_YEAR18', 'ROLE_YEAR19', 'ROLE_YEAR20', 'ROLE_YEAR21', 'ROLE_YEAR22', 'ROLE_YEAR23', 'ROLE_YEAR24']
const baseUrl = `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search`
const frChannels = ['297779639609327617', '364086525799038976', '1270756963575271424', '626165637252907045', '372100313890553856', '534121863857569792', '1079510661471666297', '1022612394905718854']
const enChannels = ['78581046714572800', '364081918116888576', '1270759070793597000', '626165608010088449', '297780920268750858', '534121764045717524']
const otChannels = ['297779810279751680', '356038271140233216', '299523503592439809', '1006449121948868659', '297780878980153344', '297809615490383873', '297779846187188234', '1227717112802578605', '582715083537514526', '678244173006241842', '297779010417590274', '892471107318345749']
const allChannels = [...frChannels, ...enChannels, ...otChannels]

async function fetchWithRetries(url) {
  let retries = 0
  while (retries < 5) {
    try {
      await delay(6000)
      const response = await fetch(url)
      return response
    } catch (err) {
      if (err.statusCode === 429) {
        const retryAfter = err.response.retry_after || 3
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`)
        await delay(retryAfter * 2000)
        retries++
      } else {
        console.error('Error occurred while fetching member:', err)
        process.exit(1)
      }
    }
  }
  console.error('Failed after 5 retries')
  process.exit(1)
}

async function assignRoles(m, totalmsg, firstmsg, roleDate) {
  const iron = nconf.get('ROLE_IRON')
  const copper = nconf.get('ROLE_COPPER')
  const bronze = nconf.get('ROLE_BRONZE')
  const silver = nconf.get('ROLE_SILVER')
  const gold = nconf.get('ROLE_GOLD')
  const crystal = nconf.get('ROLE_CRYSTAL')
  const diamond = nconf.get('ROLE_DIAMOND')
  const legend = nconf.get('ROLE_LEGEND')
  const epic = nconf.get('ROLE_EPIC')
  const omega = nconf.get('ROLE_OMEGA')
  const achievement = nconf.get('ROLE_ACHIEVEMENT')
  const year15 = nconf.get('ROLE_YEAR15')
  const year16 = nconf.get('ROLE_YEAR16')
  const year17 = nconf.get('ROLE_YEAR17')
  const year18 = nconf.get('ROLE_YEAR18')
  const year19 = nconf.get('ROLE_YEAR19')
  const year20 = nconf.get('ROLE_YEAR20')
  const year21 = nconf.get('ROLE_YEAR21')
  const year22 = nconf.get('ROLE_YEAR22')
  const year23 = nconf.get('ROLE_YEAR23')
  const year24 = nconf.get('ROLE_YEAR24')
  switch (true) {
    case totalmsg < 50:
      [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) }); break
    case totalmsg >= 50 && totalmsg < 100:
      [copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(iron)) m.roles.add(iron); break
    case totalmsg >= 100 && totalmsg < 250:
      [iron, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(copper)) m.roles.add(copper); break
    case totalmsg >= 250 && totalmsg < 500:
      [iron, copper, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(bronze)) m.roles.add(bronze); break
    case totalmsg >= 500 && totalmsg < 1000:
      [iron, copper, bronze, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(silver)) m.roles.add(silver); break
    case totalmsg >= 1000 && totalmsg < 2500:
      [iron, copper, bronze, silver, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(gold)) m.roles.add(gold); break
    case totalmsg >= 2500 && totalmsg < 5000:
      [iron, copper, bronze, silver, gold, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(crystal)) m.roles.add(crystal); break
    case totalmsg >= 5000 && totalmsg < 10000:
      [iron, copper, bronze, silver, gold, crystal, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(diamond)) m.roles.add(diamond); break
    case totalmsg >= 10000 && totalmsg < 25000:
      [iron, copper, bronze, silver, gold, crystal, diamond, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(legend)) m.roles.add(legend); break
    case totalmsg >= 25000 && totalmsg < 50000:
      [iron, copper, bronze, silver, gold, crystal, diamond, legend, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(epic)) m.roles.add(epic); break
    case totalmsg >= 50000:
      [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(omega)) m.roles.add(omega); break
    default:
      console.log(m.id); break
  }
  switch (true) {
    case roleDate === 2015:
      [year16, year17, year18, year19, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year15)) m.roles.add(year15); break
    case roleDate === 2016:
      [year15, year17, year18, year19, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year16)) m.roles.add(year16); break
    case roleDate === 2017:
      [year15, year16, year18, year19, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year17)) m.roles.add(year17); break
    case roleDate === 2018:
      [year15, year16, year17, year19, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year18)) m.roles.add(year18); break
    case roleDate === 2019:
      [year15, year16, year17, year18, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year19)) m.roles.add(year19); break
    case roleDate === 2020:
      [year15, year16, year17, year18, year19, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year20)) m.roles.add(year20); break
    case roleDate === 2021:
      [year15, year16, year17, year18, year19, year20, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year21)) m.roles.add(year21); break
    case roleDate === 2022:
      [year15, year16, year17, year18, year19, year20, year21, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year22)) m.roles.add(year22); break
    case roleDate === 2023:
      [year15, year16, year17, year18, year19, year20, year21, year22, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year23)) m.roles.add(year23); break
    case roleDate === 2024:
      [year15, year16, year17, year18, year19, year20, year21, year22, year23].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
      if (!m.roles.cache.has(year24)) m.roles.add(year24); break
    default:
      [year15, year16, year17, year18, year19, year20, year21, year22, year23, year24].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) }); break
  }
  if (firstmsg !== null && !m.roles.cache.has(achievement)) m.roles.add(achievement)
  if (firstmsg === null && m.roles.cache.has(achievement)) m.roles.remove(achievement)
}

async function updateMember(m, totalmsg, pings, enmsg, frmsg, othermsg, refetch) {
  const links = [
    `${baseUrl}?mentions=${m.id}&include_nsfw=true`,
    `${baseUrl}?author_id=${m.id}&${frChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?author_id=${m.id}&${enChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?author_id=${m.id}&${otChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`
  ]
  for (let i = 0; i < links.length; i++) {
    if (refetch === true && totalmsg === enmsg + frmsg + othermsg) continue
    const res = await fetchWithRetries(links[i])
    if (i === 0) pings = JSON.parse(res).total_results
    if (i === 1) frmsg = JSON.parse(res).total_results
    if (i === 2) enmsg = JSON.parse(res).total_results
    if (i === 3) othermsg = JSON.parse(res).total_results
  }
  return { pings, enmsg, frmsg, othermsg }
}

async function fetchMember(m, refetch, data) {
  let name = m.user.globalName ? m.user.globalName : m.user.username
  let created = m.user.createdTimestamp
  let joined = refetch ? Number(data.joined) : m.joinedTimestamp
  let rejoined = m.joinedTimestamp
  let firstmsg = refetch ? Number(data.first_msg) : null
  let totalmsg = refetch ? data.total_msg : 0
  let enmsg = refetch ? data.en_msg : 0
  let frmsg = refetch ? data.fr_msg : 0
  let othermsg = refetch ? data.other_msg : 0
  let pings = refetch ? data.pings : 0
  let msgperday = refetch ? data.msg_per_day : 0
  console.log('\nFetching member:', m.id, name, totalmsg, enmsg, frmsg, othermsg, pings, msgperday, Date.parse(date(created, true)), Date.parse(date(joined, true)), Date.parse(date(rejoined, true)), firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, refetch)
  if (refetch !== true) {
    const resDate = await fetchWithRetries(`${baseUrl}?author_id=${m.id}&channel_id=373576614505611282&include_nsfw=true&sort_by=timestamp&sort_order=asc&offset=0`)
    if (JSON.parse(resDate).total_results !== 0 && date(JSON.parse(resDate).messages[0][0].timestamp, true) < date(joined, true)) joined = JSON.parse(resDate).messages[0][0].timestamp
  }
  const resMessages = await fetchWithRetries(`${baseUrl}?author_id=${m.id}&${allChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true&sort_by=timestamp&sort_order=asc&offset=0`)
  if (JSON.parse(resMessages).total_results === 0) {
    firstmsg = null
    totalmsg = enmsg = frmsg = othermsg = pings = msgperday = 0
  } else {
    firstmsg = JSON.parse(resMessages).messages[0][0].timestamp
    if (refetch !== true && date(JSON.parse(resMessages).messages[0][0].timestamp, true) < date(joined, true)) joined = JSON.parse(resMessages).messages[0][0].timestamp
  }
  if (JSON.parse(resMessages).total_results !== totalmsg || JSON.parse(resMessages).total_results !== enmsg + frmsg + othermsg) {
    totalmsg = JSON.parse(resMessages).total_results
    const newData = await updateMember(m, JSON.parse(resMessages).total_results, pings, enmsg, frmsg, othermsg, refetch)
    pings = newData.pings
    enmsg = newData.enmsg
    frmsg = newData.frmsg
    othermsg = newData.othermsg
  }
  msgperday = Number(totalmsg / ((Date.parse(date()) - Date.parse(date(joined))) / 86400000)).toFixed(3)
  console.log('Fetched  member:', m.id, name, totalmsg, enmsg, frmsg, othermsg, pings, msgperday, Date.parse(date(created, true)), Date.parse(date(joined, true)), Date.parse(date(rejoined, true)), firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, refetch)
  return {name, created: Date.parse(date(created, true)), joined: Date.parse(date(joined, true)), rejoined: Date.parse(date(rejoined, true)), firstmsg: firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, totalmsg, enmsg, frmsg, othermsg, pings, msgperday}
}

async function addNewMembers(g) {
  const sortedMembers = Array.from(g.members.cache.values()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
  for (const m of sortedMembers) {
    try {
      const result = await pool.query('SELECT * FROM members WHERE id = $1', [m.id])
      const daysSinceJoined = (Date.parse(date()) - Date.parse(date(m.joinedTimestamp))) / (1000 * 60 * 60 * 24)
      if (result.rows.length !== 0 || m.id === '78600305175961600' || daysSinceJoined < 14) continue
      const data = await fetchMember(m)
      pool.query('INSERT INTO members (id, name, created, joined, rejoined, first_msg, updated, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [m.id, data.name, data.created, data.joined, data.rejoined, data.firstmsg !== null ? data.firstmsg : null, date(), data.totalmsg, data.enmsg, data.frmsg, data.othermsg, data.pings, data.msgperday], async (err) => {
        if (err) throw err
        await assignRoles(m, data.totalmsg, data.firstmsg, Math.floor((new Date(data.created).getFullYear() + new Date(data.joined).getFullYear() + new Date(data.rejoined).getFullYear() + (data.firstmsg !== null ? new Date(data.firstmsg).getFullYear() : new Date().getFullYear())) / 4))
      })
    } catch (err) {
      console.error('Error occurred while adding members:', err)
      process.exit(1)
    }
  }
}

async function removeOldMembers(g) {
  try {
    const result = await pool.query('SELECT * FROM members')
    for (const m of result.rows) {
      if (!g.members.resolve(m.id)) {
        await pool.query('DELETE FROM members WHERE id = $1', [m.id])
        console.log(`Old member deleted: ${m.id} ${m.name}`)
      }
    }
  } catch (err) {
    console.error('Error occurred while removing members:', err)
    process.exit(1)
  }
}

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  try {
    const guild = await client.guilds.fetch(nconf.get('SERVER'))
    await guild.members.fetch({ force: true })
    await pool.connect()
    await pool.query(`CREATE TABLE IF NOT EXISTS members (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255), created BIGINT, joined BIGINT, rejoined BIGINT, first_msg BIGINT, updated TIMESTAMP, total_msg INTEGER, en_msg INTEGER, fr_msg INTEGER, other_msg INTEGER, pings INTEGER, msg_per_day DECIMAL);`)
    await addNewMembers(guild)
    await removeOldMembers(guild)
    const dbMembers = await pool.query('SELECT * FROM members ORDER BY total_msg DESC')
    const sortedMembers = dbMembers.rows.map(member => guild.members.resolve(member.id)).filter(Boolean)
    for (const m of sortedMembers) {
      const query = await pool.query('SELECT * FROM members WHERE id = $1', [m.id])
      if (query.rows.length === 0) continue
      const result = query.rows[0]
      // Refetch user if total messages sent is 0 and last refetch is more than 30 days ago, or if user has sent messages and last refetch is more than 7 days ago
      const daysSinceLastUpdate = (Date.parse(date()) - Date.parse(date(result.updated))) / (1000 * 60 * 60 * 24)
      if ((result.total_msg === 0 && daysSinceLastUpdate < 30) || daysSinceLastUpdate < 7) continue
      const data = await fetchMember(m, true, result)
      await pool.query('UPDATE members SET name = $2, created = $3, joined = $4, rejoined = $5, first_msg = $6, updated = $7, total_msg = $8, en_msg = $9, fr_msg = $10, other_msg = $11, pings = $12, msg_per_day = $13 WHERE id = $1',
      [m.id, data.name, data.created, data.joined, data.rejoined, data.firstmsg, date(), data.totalmsg, data.enmsg, data.frmsg, data.othermsg, data.pings, data.msgperday])
      await assignRoles(m, data.totalmsg, data.firstmsg, Math.floor((new Date(data.created).getFullYear() + new Date(data.joined).getFullYear() + new Date(data.rejoined).getFullYear() + (data.firstmsg !== null ? new Date(data.firstmsg).getFullYear() : new Date().getFullYear())) / 4))
    }
  } catch (err) {
    console.error('Error occurred:', err)
    process.exit(1)
  } finally {
    console.log('Fetching finished')
    await pool.end()
  }
}
