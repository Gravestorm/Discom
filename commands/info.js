const { SlashCommandBuilder } = require('@discordjs/builders')
const { GlobalFonts, createCanvas, Image } = require('@napi-rs/canvas')
const { readFile } = require('fs/promises')
const { request } = require('undici')
const nconf = require('nconf')
const { Pool } = require('pg')
const date = require('../helpers/date')
const requiredKeys = ['DATABASE_URL']

module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('Displays information about a user or yourself')
    .addUserOption(option => option.setName('user').setDescription('Select a user')),
  async execute(interaction) {
    if (!requiredKeys.every(key => nconf.get(key))) return
    await interaction.deferReply()
    const pool = new Pool({ connectionString: nconf.get('DATABASE_URL'), max: 20 })
    const user = interaction.options.getMember('user') || interaction.member
    try {
      const members = await pool.query('SELECT * FROM members ORDER BY total_msg DESC')
      const userIndex = members.rows.findIndex(member => member.id === user.id)
      const userStats = members.rows[userIndex]
      if (!userStats) return interaction.editReply('no')
      const c = createCanvas(940, 400)
      const ctx = c.getContext('2d')
      await Promise.all([
        GlobalFonts.registerFromPath('./Jura.ttf', 'Jura'),
        loadImage(ctx, './img/Background.png', 0, 0, c.width, c.height),
        drawUserInfo(ctx, user),
        drawBoxes(ctx, userStats, members.rows, user),
        drawAvatar(ctx, user)
      ])
      const buffer = c.toBuffer('image/png')
      await interaction.editReply({ files: [buffer] })
    } catch (err) {
      await interaction.editReply(err.toString())
    }
  }
}

async function loadImage(ctx, path, x, y, width, height) {
  const img = new Image()
  img.src = await readFile(path)
  ctx.drawImage(img, x, y, width, height)
}

function drawUserInfo(ctx, user) {
  ctx.font = '30px Jura'
  const gradient = ctx.createLinearGradient(130, 0, ctx.measureText(user.displayName).width + 130, 0)
  gradient.addColorStop(0, '#f5d76e')
  gradient.addColorStop(1, '#e67e22')
  ctx.fillStyle = gradient
  ctx.fillText(user.displayName, 130, 63)
  return loadImage(ctx, './img/Ornament.png', 100, -5, ctx.measureText(user.displayName).width + 65, 95)
}

function drawBoxes(ctx, userStats, members, user) {
  const boxes = [
    { image: './img/Box1.png', x: 10, y: 90, width: 230, height: 300, title: 'Messages', data: getMessageData },
    { image: './img/Box2.png', x: 270, y: 90, width: 230, height: 300, title: 'Info', data: getInfoData },
    { image: './img/Box3.png', x: 530, y: 90, width: 230, height: 300, title: 'Awards', data: (ctx, user) => getAwardsData(ctx, user) }
  ]
  return Promise.all(boxes.map(async (box, index) => {
    await loadImage(ctx, box.image, box.x, box.y, box.width, box.height)
    if (box.title !== 'Awards') drawBoxContent(ctx, box, userStats, members, index)
    else await box.data(ctx, user)
  }))
}

function drawBoxContent(ctx, box, userStats, members, index) {
  ctx.font = '28px Jura'
  const gradient = ctx.createLinearGradient(box.x + 14, 0, box.x + 180, 0)
  gradient.addColorStop(0, '#bdc9be')
  gradient.addColorStop(1, '#6d8e70')
  ctx.fillStyle = gradient
  ctx.fillText(box.title, box.x + 38 + index * 20, box.y + 60)
  ctx.font = '18px Jura'
  const data = box.data(userStats, members)
  data.forEach((item, i) => { ctx.fillText(item, box.x + 12, box.y + 92 + i * 30) })
}

function getMessageData(userStats, members) {
  const getRank = (field) => members.findIndex(m => m[field] === userStats[field]) + 1
  return [
    `Rank: #${((getRank('total_msg') + getRank('en_msg') + getRank('fr_msg') + getRank('other_msg') + getRank('msg_per_day_joined') + getRank('pings')) / 6).toFixed(2)}`,
    `All: ${userStats.total_msg} (#${getRank('total_msg')})`,
    `EN: ${userStats.en_msg} (#${getRank('en_msg')})`,
    `FR: ${userStats.fr_msg} (#${getRank('fr_msg')})`,
    `Other: ${userStats.other_msg} (#${getRank('other_msg')})`,
    `Daily: ${userStats.msg_per_day_joined.toFixed(2)} (#${getRank('msg_per_day_joined')})`,
    `Pings: ${userStats.pings} (#${getRank('pings')})`
  ]
}

function getInfoData(userStats, members) {
  const getRank = (field) => members.filter(m => m[field] !== null).sort((a, b) => a[field] - b[field]).findIndex(m => m.id === userStats.id) + 1
  return [
    `Account Created:`, `${date(userStats.created, true)} (#${getRank('created')})`,
    `Server Joined:`, `${userStats.joined ? date(userStats.joined, true) : 'Unknown'} (#${getRank('joined')})`,
    `First Message:`, `${userStats.first_msg ? date(userStats.first_msg, true) : 'NaN'} (#${getRank('first_msg')})`,
    ...(date(userStats.joined, true) !== date(userStats.rejoined, true) ? [ `Server Rejoined:`, `${userStats.rejoined ? date(userStats.rejoined, true) : 'Unknown'} (#${getRank('rejoined')})` ] : [])
  ]
}

async function getAwardsData(ctx, user) {
  const Roles = [...user.roles.cache.values()].filter(role => role.icon !== null)
  let gridSize, iconSize, horizontalPadding, verticalPadding
  if (Roles.length <= 9) {
    [gridSize, iconSize, horizontalPadding, verticalPadding] = [3, 50, 15, 20]
  } else if (Roles.length <= 16) {
    [gridSize, iconSize, horizontalPadding, verticalPadding] = [4, 40, 10, 15]
  } else if (Roles.length <= 25) {
    [gridSize, iconSize, horizontalPadding, verticalPadding] = [5, 30, 10, 12]
  } else if (Roles.length <= 36) {
    [gridSize, iconSize, horizontalPadding, verticalPadding] = [6, 25, 7, 10]
  } else {
    [gridSize, iconSize, horizontalPadding, verticalPadding] = [7, 22, 5, 4]
  }
  const drawRoleIcon = async (role, index) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    const x = 554 + col * (iconSize + horizontalPadding)
    const y = 170 + row * (iconSize + verticalPadding)
    const { body } = await request(role.iconURL({ dynamic: false }))
    const roleImage = new Image()
    roleImage.src = Buffer.from(await body.arrayBuffer())
    ctx.drawImage(roleImage, x, y, iconSize, iconSize)
  }
  await Promise.all(Roles.slice(0, 56).map(drawRoleIcon))
}

async function drawAvatar(ctx, user) {
  ctx.beginPath()
  ctx.arc(50, 50, 40, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.clip()
  const { body } = await request(user.displayAvatarURL({ format: 'png' }))
  const avatar = new Image()
  avatar.src = Buffer.from(await body.arrayBuffer())
  ctx.drawImage(avatar, 10, 10, 80, 80)
}