const { SlashCommandBuilder } = require('@discordjs/builders')
const { GlobalFonts } = require('@napi-rs/canvas')
const { readFile } = require('fs/promises')
const { request } = require('undici')
const canvas = require('@napi-rs/canvas')
const fs = require('fs').promises
const nconf = require('nconf')
const { Pool } = require('pg')
const pool = new Pool({ connectionString: nconf.get('DATABASE'), max: 20 })

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
      const box0 = new canvas.Image()
      box0.src = await readFile('./img/Box0.png')
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
      const gradient = ctx.createLinearGradient(115, 58, 115 + ctx.measureText(user.displayName).width, 58)
      gradient.addColorStop(0, '#f5d76e')
      gradient.addColorStop(0.5, '#e67e22')
      gradient.addColorStop(1, '#e67e22')
      ctx.fillStyle = gradient
      ctx.fillText(user.displayName, 115, 58)

      // Draw the ornament
      ctx.drawImage(ornament, 100, 15, ctx.measureText(user.displayName).width + 30, 70)

      // Draw the info
      const gradientText = ctx.createLinearGradient(0, 0, c.width, 0)
      gradientText.addColorStop(0, '#7a8e7c')
      gradientText.addColorStop(1, '#7a8e7c')
      ctx.fillStyle = gradientText
      ctx.fillText('Messages', 42, 157)
      ctx.fillText('Info', 354, 157)

      ctx.font = '20px Jura'
      ctx.fillText(`All: ${userStats.total_msg} (#${userIndex + 1})`, 22, 195)
      ctx.fillText(`EN: ${userStats.en_msg} (#${getRank(members.rows, 'en_msg', user.id)})`, 22, 230)
      ctx.fillText(`FR: ${userStats.fr_msg} (#${getRank(members.rows, 'fr_msg', user.id)})`, 22, 265)
      ctx.fillText(`Other: ${userStats.other_msg} (#${getRank(members.rows, 'other_msg', user.id)})`, 22, 300)
      ctx.fillText(`Daily: ${userStats.msg_per_day.replace(/(\.\d{0,2}).*$/, '$1')} (#${getRank(members.rows, 'msg_per_day', user.id)})`, 22, 335)
      ctx.fillText(`Pings: ${userStats.pings} (#${getRank(members.rows, 'pings', user.id)})`, 22, 370)

      ctx.fillText(`Born: ${user.user.createdAt.toLocaleDateString('en-CA')}`, 284, 195)
      ctx.fillText(`Joined: ${user.joinedTimestamp ? new Date(user.joinedTimestamp).toLocaleDateString('en-CA') : 'Unknown'}`, 284, 230)

      // Draw the boxes
      ctx.drawImage(box1, 10, 100, 230, 290)
      ctx.drawImage(box1, 270, 100, 230, 290)
      ctx.drawImage(box0, 530, 100, 230, 290)

      // Draw the avatar
      ctx.beginPath()
      ctx.arc(50, 50, 40, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.clip()
      const { body } = await request(user.displayAvatarURL({ format: 'png' }))
      const avatar = new canvas.Image()
      avatar.src = Buffer.from(await body.arrayBuffer())
      ctx.drawImage(avatar, 10, 10, 80, 80)

      await fs.writeFile('./info.png', Buffer.from(c.toDataURL('image/png').split(',')[1], 'base64'))
      await interaction.editReply({ files: ['./info.png'] })
      await fs.unlink('./info.png')
    })
  }
}

function getRank(members, field, userId) {
  members.sort((a, b) => b[field] - a[field])
  return members.findIndex(member => member.id === userId) + 1
}