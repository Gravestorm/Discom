const { SlashCommandBuilder } = require('@discordjs/builders')
const { GlobalFonts } = require('@napi-rs/canvas')
const { readFile } = require('fs/promises')
const { request } = require('undici')
const canvas = require('@napi-rs/canvas')
const fs = require('fs').promises
const nconf = require('nconf')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE'), max: 20 })
const date = require('../helpers/date')

module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('Displays information about a user or yourself')
    .addUserOption(option => option.setName('user').setDescription('Select a user')),
  async execute(interaction) {
    if (!nconf.get('DATABASE')) return
    await interaction.deferReply()
    const user = interaction.options.getMember('user') ? interaction.options.getMember('user') : interaction.member
    pool.query('SELECT * FROM members ORDER BY total_msg DESC', async (err, members) => {
      if (err) throw err
      const userIndex = members.rows.findIndex(member => member.id === user.id)
      const userStats = members.rows[userIndex]
      if (!userStats) return interaction.editReply('no')

      // Generate the fancy profile image
      const c = canvas.createCanvas(940, 400)
      const ctx = c.getContext('2d')

      // Load the font and images
      GlobalFonts.registerFromPath('./Jura.ttf', 'Jura')
      const background = new canvas.Image()
      background.src = await readFile('./img/Background.png')
      const ornament = new canvas.Image()
      ornament.src = await readFile('./img/Ornament.png')
      const box1 = new canvas.Image()
      box1.src = await readFile('./img/Box1.png')
      const box2 = new canvas.Image()
      box2.src = await readFile('./img/Box2.png')
      const box3 = new canvas.Image()
      box3.src = await readFile('./img/Box3.png')

      // Draw the background
      ctx.drawImage(background, 0, 0, c.width, c.height)

      // Draw the username
      ctx.font = '30px Jura'
      const gradientUsername = ctx.createLinearGradient(130, 0, ctx.measureText(user.displayName).width + 130, 0)
      gradientUsername.addColorStop(0, '#f5d76e')
      gradientUsername.addColorStop(1, '#e67e22')
      ctx.fillStyle = gradientUsername
      ctx.fillText(user.displayName, 130, 63)

      // Draw the ornament
      ctx.drawImage(ornament, 100, -5, ctx.measureText(user.displayName).width + 65, 95)

      // Draw the first box
      ctx.drawImage(box1, 10, 90, 230, 300)
      ctx.font = '28px Jura'
      const gradientText1 = ctx.createLinearGradient(22, 0, 180, 0)
      gradientText1.addColorStop(0, '#bdc9be')
      gradientText1.addColorStop(1, '#6d8e70')
      ctx.fillStyle = gradientText1
      ctx.fillText('Messages', 48, 147)

      ctx.font = '18px Jura'
      ctx.fillText(`Rank: #${((userIndex + 1 + getRank(members.rows, 'en_msg', user.id) + getRank(members.rows, 'fr_msg', user.id) + getRank(members.rows, 'other_msg', user.id) + getRank(members.rows, 'msg_per_day', user.id) + getRank(members.rows, 'pings', user.id)) / 6).toFixed(2)}`, 22, 182)
      ctx.fillText(`All: ${userStats.total_msg} (#${userIndex + 1})`, 22, 217)
      ctx.fillText(`EN: ${userStats.en_msg} (#${getRank(members.rows, 'en_msg', user.id)})`, 22, 247)
      ctx.fillText(`FR: ${userStats.fr_msg} (#${getRank(members.rows, 'fr_msg', user.id)})`, 22, 277)
      ctx.fillText(`Other: ${userStats.other_msg} (#${getRank(members.rows, 'other_msg', user.id)})`, 22, 307)
      ctx.fillText(`Daily: ${userStats.msg_per_day.replace(/(\.\d{0,2}).*$/, '$1')} (#${getRank(members.rows, 'msg_per_day', user.id)})`, 22, 337)
      ctx.fillText(`Pings: ${userStats.pings} (#${getRank(members.rows, 'pings', user.id)})`, 22, 367)

      // Draw the second box
      ctx.drawImage(box2, 270, 90, 230, 300)
      ctx.font = '28px Jura'
      const gradientText2 = ctx.createLinearGradient(284, 0, 450, 0)
      gradientText2.addColorStop(0, '#bdc9be')
      gradientText2.addColorStop(1, '#6d8e70')
      ctx.fillStyle = gradientText2
      ctx.fillText('Info', 358, 150)

      ctx.font = '18px Jura'
      ctx.fillText(`Account Created:`, 284, 177)
      ctx.fillText(`${date(userStats.created, true)} (#${ getRank(members.rows, 'created', user.id)})`, 284, 202)
      ctx.fillText(`Server Joined:`, 284, 232)
      ctx.fillText(`${userStats.joined ? date(userStats.joined, true) : 'Unknown'} (#${getRank(members.rows, 'joined', user.id)})`, 284, 257)
      ctx.fillText(`First Message:`, 284, 287)
      ctx.fillText(`${userStats.first_msg ? date(userStats.first_msg, true) : 'NaN'} (#${getRank(members.rows, 'first_msg', user.id)})`, 284, 312)
      if (date(userStats.joined, true) !== date(userStats.rejoined, true)) {
        ctx.fillText(`Server Rejoined:`, 284, 342)
        ctx.fillText(`${userStats.rejoined ? date(userStats.rejoined, true) : 'Unknown'} (#${getRank(members.rows, 'rejoined', user.id)})`, 284, 367)
      }

      // Draw the third box
      ctx.drawImage(box3, 530, 90, 230, 300)
      ctx.font = '28px Jura'
      const gradientText3 = ctx.createLinearGradient(564, 0, 720, 0)
      gradientText3.addColorStop(0, '#bdc9be')
      gradientText3.addColorStop(1, '#6d8e70')
      ctx.fillStyle = gradientText3
      ctx.fillText('Awards', 594, 150)

      const Roles = [...user.roles.cache.values()]
      let iconsFetched = 0
      let gridSize
      let iconSize
      let horizontalPadding
      let verticalPadding
      switch (true) {
        case Roles.length <= 9:
          gridSize = 3
          iconSize = 50
          horizontalPadding = 15
          verticalPadding = 20
          break
        case Roles.length <= 16:
          gridSize = 4
          iconSize = 40
          horizontalPadding = 10
          verticalPadding = 15
          break
        case Roles.length <= 25:
          gridSize = 5
          iconSize = 30
          horizontalPadding = 10
          verticalPadding = 12
          break
        case Roles.length <= 36:
          gridSize = 6
          iconSize = 25
          horizontalPadding = 7
          verticalPadding = 10
          break
        default:
          gridSize = 7
          iconSize = 22
          horizontalPadding = 5
          verticalPadding = 4
          break
      }

      for (let i = 0; i < Roles.length && iconsFetched < 56; i++) {
        if (Roles[i].icon === null) continue
        const row = Math.floor(iconsFetched / gridSize)
        const col = iconsFetched % gridSize
        const x = 554 + col * (iconSize + horizontalPadding)
        const y = 170 + row * (iconSize + verticalPadding)
        const { body } = await request(Roles[i].iconURL({ dynamic: false }), { method: 'GET' })
        const roleImage = new canvas.Image()
        roleImage.src = Buffer.from(await body.arrayBuffer())
        ctx.drawImage(roleImage, x, y, iconSize, iconSize)
        iconsFetched++
      }

      // Draw the avatar
      ctx.beginPath()
      ctx.arc(50, 50, 40, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()
      const { body } = await request(user.displayAvatarURL({ format: 'png' }))
      const avatar = new canvas.Image()
      avatar.src = Buffer.from(await body.arrayBuffer())
      ctx.drawImage(avatar, 10, 10, 80, 80)

      await fs.writeFile(`${user.id}.png`, Buffer.from(c.toDataURL('image/png').split(',')[1], 'base64'))
      await interaction.editReply({ files: [`${user.id}.png`] })
      await fs.unlink(`${user.id}.png`)
    })
  }
}

function getRank(members, field, userId) {
  if (['created', 'joined', 'rejoined', 'first_msg'].includes(field)) {
    members = members.filter(member => member[field] !== null)
    members.sort((a, b) => a[field] - b[field])
  } else {
    members.sort((a, b) => b[field] - a[field])
  }
  return members.findIndex(member => member.id === userId) + 1
}