const nconf = require('nconf')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE'), max: 20 })
const date = require('../helpers/date')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')

async function AddNewMembers(g) {
  for (const m of g.members.cache.values()) {
    pool.query('SELECT * FROM members WHERE id = $1', [m.id], async (err, member) => {
      if (err) throw err
      if (member.rows.length === 0) {
        pool.query('INSERT INTO members (id, name, created, updated, total_msg, en_msg, fr_msg, other_msg, pings, msg_per_day) VALUES ($1, $2, $3, $4, 0, 0, 0, 0, 0, 0)', [m.id, m.displayName, date(m.user.createdTimestamp), date()], (err) => {
          if (err) throw err
          console.log('New member added:', m.id, m.displayName)
        })
      }
    })
  }
}

async function RemoveOldMembers(g) {
  pool.query('SELECT * FROM members', [], async (err, member) => {
    if (err) throw err
    const m = member
    if (!g.members.resolve(m.id)) {
      pool.query('DELETE FROM members WHERE id = $1', [m.id], (err) => {
        if (err) throw err
        console.log('Old member deleted')
      })
    }
  })
}

module.exports = async (client) => {
  if (!nconf.get('USER') || !nconf.get('DATABASE') || !nconf.get('SERVER') || !nconf.get('ROLE_IRON') || !nconf.get('ROLE_COPPER') || !nconf.get('ROLE_BRONZE') || !nconf.get('ROLE_SILVER') || !nconf.get('ROLE_GOLD') || !nconf.get('ROLE_CRYSTAL') || !nconf.get('ROLE_DIAMOND') || !nconf.get('ROLE_LEGEND') || !nconf.get('ROLE_EPIC') || !nconf.get('ROLE_OMEGA')) return
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

  client.guilds.fetch(nconf.get('SERVER')).then(async (g) => {
    await g.members.fetch({ force: true })
    await pool.connect()
    await AddNewMembers(g)
    await RemoveOldMembers(g)
    for (const m of g.members.cache.values()) {
      try {
        const result = await pool.query('SELECT * FROM members WHERE id = $1', [m.id])
        if (result.rows.length === 0) continue
        let data = result.rows[0]
        if ((data.total_msg === 0 && (Date.parse(date()) - Date.parse(data.updated)) / (1000 * 60 * 60 * 24) < 30) || (Date.parse(date()) - Date.parse(data.updated)) / (1000 * 60 * 60 * 24) < 7) continue
        await delay(6000)
        await fetch(`https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?author_id=${m.id}&channel_id=78581046714572800&channel_id=364081918116888576&channel_id=626165608010088449&channel_id=534121764045717524&channel_id=297780920268750858&channel_id=297779639609327617&channel_id=364086525799038976&channel_id=626165637252907045&channel_id=534121863857569792&channel_id=372100313890553856&channel_id=297779810279751680&channel_id=356038271140233216&channel_id=299523503592439809&channel_id=297809615490383873&channel_id=297779846187188234&channel_id=892471107318345749&channel_id=582715083537514526&channel_id=297779010417590274&channel_id=678244173006241842&include_nsfw=true`).then(async res => {
          console.log(m.id, m.displayName, JSON.parse(res).total_results)

          if (JSON.parse(res).total_results === 0) return data.total_msg = data.en_msg = data.fr_msg = data.other_msg = data.pings = data.msg_per_day = 0

          data.total_msg = JSON.parse(res).total_results

          data.msg_per_day = Number(data.total_msg / ((Date.parse(date()) - Date.parse(date(data.created))) / 86400000)).toFixed(6)

          if (JSON.parse(res).total_results !== data.total_msg || JSON.parse(res).total_results !== data.en_msg + data.fr_msg + data.other_msg) {
            let links = [`https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?mentions=${m.id}&include_nsfw=true`,
            `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?author_id=${m.id}&channel_id=78581046714572800&channel_id=364081918116888576&channel_id=626165608010088449&channel_id=534121764045717524&channel_id=297780920268750858&include_nsfw=true`,
            `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?author_id=${m.id}&channel_id=297779639609327617&channel_id=364086525799038976&channel_id=626165637252907045&channel_id=534121863857569792&channel_id=372100313890553856&include_nsfw=true`,
            `https://discord.com/api/v9/guilds/${nconf.get('SERVER')}/messages/search?author_id=${m.id}&channel_id=297779810279751680&channel_id=356038271140233216&channel_id=299523503592439809&channel_id=297809615490383873&channel_id=297779846187188234&channel_id=892471107318345749&channel_id=582715083537514526&channel_id=297779010417590274&channel_id=678244173006241842&include_nsfw=true`]
            for (let i = 0; i < links.length; i++) {
              if (data.total_msg === data.en_msg + data.fr_msg + data.other_msg) continue
              await delay(6000)
              await fetch(links[i]).then(res => {
                if (i === 0) data.pings = JSON.parse(res).total_results
                if (i === 1) data.en_msg = JSON.parse(res).total_results
                if (i === 2) data.fr_msg = JSON.parse(res).total_results
                if (i === 3) data.other_msg = JSON.parse(res).total_results
              }).catch(err => { throw err })
            }
          }
          const d = data.total_msg
          switch (true) {
            case d < 50:
              [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) }); break
            case d >= 50 && d < 100:
              [copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(iron)) m.roles.add(iron); break
            case d >= 100 && d < 250:
              [iron, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(copper)) m.roles.add(copper); break
            case d >= 250 && d < 500:
              [iron, copper, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(bronze)) m.roles.add(bronze); break
            case d >= 500 && d < 1000:
              [iron, copper, bronze, gold, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(silver)) m.roles.add(silver); break
            case d >= 1000 && d < 2500:
              [iron, copper, bronze, silver, crystal, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(gold)) m.roles.add(gold); break
            case d >= 2500 && d < 5000:
              [iron, copper, bronze, silver, gold, diamond, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(crystal)) m.roles.add(crystal); break
            case d >= 5000 && d < 10000:
              [iron, copper, bronze, silver, gold, crystal, legend, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(diamond)) m.roles.add(diamond); break
            case d >= 10000 && d < 25000:
              [iron, copper, bronze, silver, gold, crystal, diamond, epic, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(legend)) m.roles.add(legend); break
            case d >= 25000 && d < 50000:
              [iron, copper, bronze, silver, gold, crystal, diamond, legend, omega].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(epic)) m.roles.add(epic); break
            case d >= 50000:
              [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic].some(r => { if (m.roles.cache.has(r)) m.roles.remove(r) })
              if (!m.roles.cache.has(omega)) m.roles.add(omega); break
            default: break
          }
        }).catch(err => { throw err })

        pool.query('UPDATE members SET name = $2, updated = $3, total_msg = $4, en_msg = $5, fr_msg = $6, other_msg = $7, pings = $8, msg_per_day = $9 WHERE id = $1', [m.id, m.displayName, date(), data.total_msg, data.en_msg, data.fr_msg, data.other_msg, data.pings, data.msg_per_day], (err) => {
          if (err) throw err
          console.log('Member updated:', data.id, data.name)
        })
      } catch (err) {
        console.error(err)
      }
    }
  })
}