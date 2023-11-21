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
      const gradientUsername = ctx.createLinearGradient(130, 0, ctx.measureText(user.displayName).width + 130, 0)
      gradientUsername.addColorStop(0, '#f5d76e')
      gradientUsername.addColorStop(1, '#e67e22')
      ctx.fillStyle = gradientUsername
      ctx.fillText(user.displayName, 130, 65)

      // Draw the ornament
      ctx.drawImage(ornament, 100, 0, ctx.measureText(user.displayName).width + 65, 95)

      // Draw the Messages text
      ctx.font = '30px Jura'
      const gradientText1 = ctx.createLinearGradient(22, 0, 200, 0)
      gradientText1.addColorStop(0, '#a4b3a5')
      gradientText1.addColorStop(1, '#6d8e70')
      ctx.fillStyle = gradientText1
      ctx.fillText('Messages', 42, 157)

      ctx.font = '20px Jura'
      ctx.fillText(`All: ${userStats.total_msg} (#${userIndex + 1})`, 22, 195)
      ctx.fillText(`EN: ${userStats.en_msg} (#${getRank(members.rows, 'en_msg', user.id)})`, 22, 230)
      ctx.fillText(`FR: ${userStats.fr_msg} (#${getRank(members.rows, 'fr_msg', user.id)})`, 22, 265)
      ctx.fillText(`Other: ${userStats.other_msg} (#${getRank(members.rows, 'other_msg', user.id)})`, 22, 300)
      ctx.fillText(`Daily: ${userStats.msg_per_day.replace(/(\.\d{0,2}).*$/, '$1')} (#${getRank(members.rows, 'msg_per_day', user.id)})`, 22, 335)
      ctx.fillText(`Pings: ${userStats.pings} (#${getRank(members.rows, 'pings', user.id)})`, 22, 370)

      ctx.font = '30px Jura'
      const gradientText2 = ctx.createLinearGradient(284, 0, 500, 0)
      gradientText2.addColorStop(0, '#a4b3a5')
      gradientText2.addColorStop(1, '#6d8e70')
      ctx.fillStyle = gradientText2
      ctx.fillText('Info', 354, 157)

      await interaction.member.guild.members.fetch({ force: true })
      const sortedCreated = [...interaction.member.guild.members.cache.values()].sort((a, b) => (a.user.createdTimestamp || 0) - (b.user.createdTimestamp || 0))
      const sortedJoined = [...interaction.member.guild.members.cache.values()].sort((a, b) => (a.joinedTimestamp || 0) - (b.joinedTimestamp || 0))
      const rankCreated = sortedCreated.findIndex(member => member.user.id === user.id) + 1
      const rankJoined = sortedJoined.findIndex(member => member.user.id === user.id) + 1

      ctx.font = '20px Jura'
      ctx.fillText(`Rank: #${((userIndex + 1 + getRank(members.rows, 'en_msg', user.id) + getRank(members.rows, 'fr_msg', user.id) + getRank(members.rows, 'other_msg', user.id) + getRank(members.rows, 'msg_per_day', user.id) + getRank(members.rows, 'pings', user.id)) / 6).toFixed(2)}`, 284, 195)
      ctx.fillText(`Born: ${new Date(user.user.createdTimestamp).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })}`, 284, 230)
      ctx.fillText(`Join: ${user.joinedTimestamp ? new Date(user.joinedTimestamp).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Unknown'}`, 284, 265)
      ctx.fillText(`Born Rank: #${rankCreated}`, 284, 300)
      ctx.fillText(`Join Rank: #${rankJoined}`, 284, 335)

      // Draw the boxes
      ctx.drawImage(box1, 10, 100, 230, 290)
      ctx.drawImage(box2, 270, 100, 230, 290)
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

      await fs.writeFile(`${user.id}.png`, Buffer.from(c.toDataURL('image/png').split(',')[1], 'base64'))
      await interaction.editReply({ files: [`${user.id}.png`] })
      await fs.unlink(`${user.id}.png`)
    })
  }
}

function getRank(members, field, userId) {
  members.sort((a, b) => b[field] - a[field])
  return members.findIndex(member => member.id === userId) + 1
}