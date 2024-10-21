const nconf = require('nconf')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE_URL'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')
const requiredKeys = ['FETCH', 'DATABASE_URL', 'SERVER', 'ROLE_IRON', 'ROLE_COPPER', 'ROLE_BRONZE', 'ROLE_SILVER', 'ROLE_GOLD', 'ROLE_CRYSTAL', 'ROLE_DIAMOND', 'ROLE_LEGEND', 'ROLE_EPIC', 'ROLE_OMEGA', 'ROLE_ACHIEVEMENT', 'ROLE_YEAR15', 'ROLE_YEAR16', 'ROLE_YEAR17', 'ROLE_YEAR18', 'ROLE_YEAR19', 'ROLE_YEAR20', 'ROLE_YEAR21', 'ROLE_YEAR22', 'ROLE_YEAR23', 'ROLE_YEAR24']
const baseUrl = `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search`
const frChannels = ['297779639609327617', '364086525799038976', '1270756963575271424', '626165637252907045', '372100313890553856', '534121863857569792', '1079510661471666297', '1022612394905718854']
const enChannels = ['78581046714572800', '364081918116888576', '1270759070793597000', '626165608010088449', '297780920268750858', '534121764045717524']
const otChannels = ['297779810279751680', '356038271140233216', '299523503592439809', '1006449121948868659', '297780878980153344', '297809615490383873', '297779846187188234', '1227717112802578605', '582715083537514526', '678244173006241842', '297779010417590274', '892471107318345749']
const allChannels = [...frChannels, ...enChannels, ...otChannels]

async function fetchWithRetries(url, token, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await delay(6000)
      return await fetch(url, token)
    } catch (err) {
      if (err.statusCode === 429) {
        const retryAfter = err.response.retry_after || 3
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`)
        await delay(retryAfter * 2000)
      } else {
        throw err
      }
    }
  }
  throw new Error('Failed after 5 retries')
}

async function assignRoles(member, totalmsg, firstmsg, roleDate) {
  const roles = {
    iron: nconf.get('ROLE_IRON'),
    copper: nconf.get('ROLE_COPPER'),
    bronze: nconf.get('ROLE_BRONZE'),
    silver: nconf.get('ROLE_SILVER'),
    gold: nconf.get('ROLE_GOLD'),
    crystal: nconf.get('ROLE_CRYSTAL'),
    diamond: nconf.get('ROLE_DIAMOND'),
    legend: nconf.get('ROLE_LEGEND'),
    epic: nconf.get('ROLE_EPIC'),
    omega: nconf.get('ROLE_OMEGA'),
    achievement: nconf.get('ROLE_ACHIEVEMENT'),
    year: {
      2015: nconf.get('ROLE_YEAR15'),
      2016: nconf.get('ROLE_YEAR16'),
      2017: nconf.get('ROLE_YEAR17'),
      2018: nconf.get('ROLE_YEAR18'),
      2019: nconf.get('ROLE_YEAR19'),
      2020: nconf.get('ROLE_YEAR20'),
      2021: nconf.get('ROLE_YEAR21'),
      2022: nconf.get('ROLE_YEAR22'),
      2023: nconf.get('ROLE_YEAR23'),
      2024: nconf.get('ROLE_YEAR24'),
    }
  }
  const updateRoles = (removeRoles, addRole) => {
    removeRoles.forEach(role => member.roles.cache.has(role) && member.roles.remove(role))
    if (addRole && !member.roles.cache.has(addRole)) member.roles.add(addRole)
  }
  const msgThresholds = [
    { min: 50000, add: roles.omega, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic] },
    { min: 25000, add: roles.epic, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.omega] },
    { min: 10000, add: roles.legend, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.epic, roles.omega] },
    { min: 5000,  add: roles.diamond, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.legend, roles.epic, roles.omega] },
    { min: 2500,  add: roles.crystal, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 1000,  add: roles.gold, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 500,   add: roles.silver, remove: [roles.iron, roles.copper, roles.bronze, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 250,   add: roles.bronze, remove: [roles.iron, roles.copper, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 100,   add: roles.copper, remove: [roles.iron, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 50,    add: roles.iron, remove: [roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] },
    { min: 0,     add: null, remove: [roles.iron, roles.copper, roles.bronze, roles.silver, roles.gold, roles.crystal, roles.diamond, roles.legend, roles.epic, roles.omega] }
  ]
  const threshold = msgThresholds.find(thresh => totalmsg >= thresh.min)
  if (threshold) updateRoles(threshold.remove, threshold.add)
  const years = Object.keys(roles.year).map(Number).sort((a, b) => b - a)
  years.forEach(year => {
    if (roleDate === year) updateRoles(years.filter(y => y !== year).map(y => roles.year[y]), roles.year[year])
  })
  if (firstmsg !== null && !member.roles.cache.has(roles.achievement)) member.roles.add(roles.achievement)
  if (firstmsg === null && member.roles.cache.has(roles.achievement)) member.roles.remove(roles.achievement)
}

async function fetchMemberData(member, totalmsg, pings, enmsg, frmsg, othermsg, refetch, token) {
  const links = [
    `${baseUrl}?mentions=${member.id}&include_nsfw=true`,
    `${baseUrl}?author_id=${member.id}&${frChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?author_id=${member.id}&${enChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`,
    `${baseUrl}?author_id=${member.id}&${otChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true`
  ]
  for (let i = 0; i < links.length; i++) {
    if (refetch === true && totalmsg === enmsg + frmsg + othermsg) continue
    const res = await fetchWithRetries(links[i], token)
    const result = JSON.parse(res)
    if (i === 0) pings = result.total_results
    if (i === 1) frmsg = result.total_results
    if (i === 2) enmsg = result.total_results
    if (i === 3) othermsg = result.total_results
  }
  return { pings, enmsg, frmsg, othermsg }
}

async function fetchMember(member, refetch, data, token) {
  let name = member.user.globalName || member.user.username
  let created = member.user.createdTimestamp
  let joined = refetch ? Number(data.joined) : member.joinedTimestamp
  let rejoined = member.joinedTimestamp
  let firstmsg = refetch ? Number(data.first_msg) : null
  let totalmsg = refetch ? data.total_msg : 0
  let enmsg = refetch ? data.en_msg : 0
  let frmsg = refetch ? data.fr_msg : 0
  let othermsg = refetch ? data.other_msg : 0
  let pings = refetch ? data.pings : 0
  let msgperdaycreated = refetch ? data.msg_per_day_created : 0
  let msgperdayjoined = refetch ? data.msg_per_day_joined : 0
  console.log('Fetching member:', member.id, name, totalmsg, enmsg, frmsg, othermsg, pings, msgperdaycreated, msgperdayjoined, Date.parse(date(created, true)), Date.parse(date(joined, true)), Date.parse(date(rejoined, true)), firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, refetch ? data.updated : refetch)
  if (!refetch) {
    const resDate = await fetchWithRetries(`${baseUrl}?author_id=${member.id}&channel_id=373576614505611282&include_nsfw=true&sort_by=timestamp&sort_order=asc&offset=0`, token)
    const dateResult = JSON.parse(resDate)
    if (dateResult.total_results !== 0 && date(dateResult.messages[0][0].timestamp, true) < date(joined, true)) joined = dateResult.messages[0][0].timestamp
  }
  const resMessages = await fetchWithRetries(`${baseUrl}?author_id=${member.id}&${allChannels.map(id => `channel_id=${id}`).join('&')}&include_nsfw=true&sort_by=timestamp&sort_order=asc&offset=0`, token)
  const messagesResult = JSON.parse(resMessages)
  if (messagesResult.total_results === 0) {
    firstmsg = null
    totalmsg = enmsg = frmsg = othermsg = pings = msgperdaycreated = msgperdayjoined = 0
  } else {
    firstmsg = messagesResult.messages[0][0].timestamp
    if (!refetch && date(firstmsg, true) < date(joined, true)) joined = firstmsg
  }
  if (messagesResult.total_results !== totalmsg || messagesResult.total_results !== enmsg + frmsg + othermsg) {
    totalmsg = messagesResult.total_results
    const newData = await fetchMemberData(member, totalmsg, pings, enmsg, frmsg, othermsg, refetch, token)
    pings = newData.pings
    enmsg = newData.enmsg
    frmsg = newData.frmsg
    othermsg = newData.othermsg
  }
  msgperdaycreated = Number(totalmsg / ((Date.parse(date()) - Date.parse(date(created))) / 86400000)).toFixed(3)
  msgperdayjoined = Number(totalmsg / ((Date.parse(date()) - Date.parse(date(joined))) / 86400000)).toFixed(3)
  console.log('Fetched member: ', member.id, name, totalmsg, enmsg, frmsg, othermsg, pings, msgperdaycreated, msgperdayjoined, Date.parse(date(created, true)), Date.parse(date(joined, true)), Date.parse(date(rejoined, true)), firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, refetch)
  return {name, created: Date.parse(date(created, true)), joined: Date.parse(date(joined, true)), rejoined: Date.parse(date(rejoined, true)), firstmsg: firstmsg !== null ? Date.parse(date(firstmsg, true)) : null, totalmsg, enmsg, frmsg, othermsg, pings, msgperdaycreated, msgperdayjoined}
}

async function addNewMembers(guild) {
  const sortedMembers = Array.from(guild.members.cache.values()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
  for (const member of sortedMembers) {
    try {
      const result = await pool.query('SELECT * FROM members WHERE id = $1', [member.id])
      const daysSinceJoined = (Date.parse(date()) - Date.parse(date(member.joinedTimestamp))) / (1000 * 60 * 60 * 24)
      if (result.rows.length !== 0 || member.id === '78600305175961600' || daysSinceJoined < 7) continue
      const data = await fetchMember(member, false, undefined, nconf.get('USER1'))
      await pool.query('INSERT INTO members (id, name, created, joined, rejoined, first_msg, updated, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day_created, msg_per_day_joined) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [member.id, data.name, data.created, data.joined, data.rejoined, data.firstmsg !== null ? data.firstmsg : null, date(), data.totalmsg, data.enmsg, data.frmsg, data.othermsg, data.pings, data.msgperdaycreated, data.msgperdayjoined])
      await assignRoles(member, data.totalmsg, data.firstmsg, Math.floor((new Date(data.created).getFullYear() + new Date(data.joined).getFullYear() + new Date(data.rejoined).getFullYear() + (data.firstmsg !== null ? new Date(data.firstmsg).getFullYear() : new Date().getFullYear())) / 4))
    } catch (err) {
      console.error('Error occurred while adding members:', err)
      process.exit(1)
    }
  }
}

async function removeOldMembers(guild) {
  const result = await pool.query('SELECT * FROM members')
  for (const member of result.rows) {
    try {
      if (!guild.members.resolve(member.id)) {
        await pool.query('DELETE FROM members WHERE id = $1', [member.id])
        console.log(`Old member deleted: ${member.id} ${member.name}`)
      }
    } catch (err) {
      console.error('Error occurred while removing members:', err)
      process.exit(1)
    }
  }
}

async function updateMember(member, token) {
  const query = await pool.query('SELECT * FROM members WHERE id = $1', [member.id])
  if (query.rows.length === 0) return
  const result = query.rows[0]
  const data = await fetchMember(member, true, result, token)
  await pool.query('UPDATE members SET name = $2, created = $3, joined = $4, rejoined = $5, first_msg = $6, updated = $7, total_msg = $8, en_msg = $9, fr_msg = $10, other_msg = $11, pings = $12, msg_per_day_created = $13, msg_per_day_joined = $14 WHERE id = $1',
    [member.id, data.name, data.created, data.joined, data.rejoined, data.firstmsg, date(), data.totalmsg, data.enmsg, data.frmsg, data.othermsg, data.pings, data.msgperdaycreated, data.msgperdayjoined])
  await assignRoles(member, data.totalmsg, data.firstmsg, Math.floor((new Date(data.created).getFullYear() + new Date(data.joined).getFullYear() + new Date(data.rejoined).getFullYear() + (data.firstmsg !== null ? new Date(data.firstmsg).getFullYear() : new Date().getFullYear())) / 4))
}

async function updateMembers(inactiveMembers, activeMembers) {
  const totalMembers = Math.max(inactiveMembers.length, activeMembers.length)
  for (let i = 0; i < totalMembers; i++) {
    const inactivePromise = i < inactiveMembers.length ? updateMember(inactiveMembers[i], nconf.get('USER1')) : Promise.resolve()
    const activePromise = i < activeMembers.length ? updateMember(activeMembers[i], nconf.get('USER2')) : Promise.resolve()
    await Promise.all([inactivePromise, activePromise])
  }
}

module.exports = async (client) => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  try {
    const guild = await client.guilds.fetch(nconf.get('SERVER'))
    await guild.members.fetch({ force: true })
    await pool.connect()
    await pool.query(`CREATE TABLE IF NOT EXISTS members (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255), created BIGINT, joined BIGINT, rejoined BIGINT, first_msg BIGINT, updated TIMESTAMP, total_msg INTEGER, en_msg INTEGER, fr_msg INTEGER, other_msg INTEGER, pings INTEGER, msg_per_day_created DECIMAL, msg_per_day_joined DECIMAL);`)
    await addNewMembers(guild)
    await removeOldMembers(guild)
    const { rows: inactiveMembers } = await pool.query('SELECT * FROM members WHERE total_msg = 0 ORDER BY updated ASC')
    const { rows: activeMembers } = await pool.query('SELECT * FROM members WHERE total_msg > 0 ORDER BY updated ASC')
    const inactiveMembersSorted = inactiveMembers.map(member => guild.members.resolve(member.id)).filter(Boolean)
    const activeMembersSorted = activeMembers.map(member => guild.members.resolve(member.id)).filter(Boolean)
    await updateMembers(inactiveMembersSorted, activeMembersSorted)
  } catch (err) {
    console.error('Error occurred:', err)
    process.exit(1)
  } finally {
    console.log('Fetching finished')
    await pool.end()
  }
}