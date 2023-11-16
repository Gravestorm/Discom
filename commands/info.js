const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageAttachment } = require('discord.js')
const { GlobalFonts } = require('@napi-rs/canvas')
const { readFile } = require('fs/promises')
const { request } = require('undici')
const canvas = require('@napi-rs/canvas')
const nconf = require('nconf')

module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('Displays information about a user or yourself')
    .addUserOption(option => option.setName('user').setDescription('Select a user')),
  async execute(interaction) {
    if (!nconf.get('USER') || !nconf.get('DATABASE')) return
    await interaction.deferReply({ ephemeral: true })
    const user = interaction.options.getMember('user') ? interaction.options.getMember('user') : interaction.member
    const userData = data.find(d => d.ID === user.id)
    if (!userData) return
    userData.N = user.displayName.replace('"', '')
    userData.R = 0
    const d = userData.T
    switch (true) {
      case d < 100:
        [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) }); break
      case d >= 100 && d < 250:
        [copper, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(iron)) user.roles.add(iron); break
      case d >= 250 && d < 500:
        [iron, bronze, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(copper)) user.roles.add(copper); break
      case d >= 500 && d < 1000:
        [iron, copper, silver, gold, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(bronze)) user.roles.add(bronze); break
      case d >= 1000 && d < 2500:
        [iron, copper, bronze, gold, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(silver)) user.roles.add(silver); break
      case d >= 2500 && d < 5000:
        [iron, copper, bronze, silver, crystal, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(gold)) user.roles.add(gold); break
      case d >= 5000 && d < 10000:
        [iron, copper, bronze, silver, gold, diamond, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(crystal)) user.roles.add(crystal); break
      case d >= 10000 && d < 25000:
        [iron, copper, bronze, silver, gold, crystal, legend, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(diamond)) user.roles.add(diamond); break
      case d >= 25000 && d < 50000:
        [iron, copper, bronze, silver, gold, crystal, diamond, epic, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(legend)) user.roles.add(legend); break
      case d >= 50000 && d < 100000:
        [iron, copper, bronze, silver, gold, crystal, diamond, legend, omega].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(epic)) user.roles.add(epic); break
      case d >= 100000:
        [iron, copper, bronze, silver, gold, crystal, diamond, legend, epic].some(r => { if (user.roles.cache.has(r)) user.roles.remove(r) })
        if (!user.roles.cache.has(omega)) user.roles.add(omega); break
      default: break
    }
    //await interaction.editReply({ content: 'User fetched successfully.', ephemeral: true })
    let RankT = RankEN = RankFR = RankOT = RankC = RankM = RankP = RankR = 0
    await data.sort((a, b) => { return Number(b.T) - Number(a.T) })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; if (data[i].ID === user.id) RankT = i + 1 }
    await data.sort((a, b) => { return Number(b.EN) - Number(a.EN) })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; if (data[i].ID === user.id) RankEN = i + 1 }
    await data.sort((a, b) => { return Number(b.FR) - Number(a.FR) })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; if (data[i].ID === user.id) RankFR = i + 1 }
    await data.sort((a, b) => { return Number(b.OT) - Number(a.OT) })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; if (data[i].ID === user.id) RankOT = i + 1 }
    await data.sort((a, b) => { return Number(a.C) - Number(b.C) })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; if (data[i].ID === user.id) RankC = i + 1 }
    await data.sort((a, b) => { return b.M - a.M })
    for (let i = 0; i < data.length; i++) { data[i].R += i + 1; data[i].R = data[i].R / 6; if (data[i].ID === user.id) RankM = i + 1 }
    //await data.sort((a, b) => { return b.P - a.P })
    //for (let i = 0; i < data.length; i++) { data[i].R += i + 1; data[i].R = data[i].R / 7; if (data[i].ID === user.id) RankP = i + 1 }
    await data.sort((a, b) => { return a.R - b.R })
    for (let i = 0; i < data.length; i++) { if (data[i].ID === user.id) { RankR = i + 1; break } }
    // userData.N userData.T userData.EN userData.FR userData.OT userData.C userData.M userData.P userData.R
    // RankT RankEN RankFR RankOT RankC RankM RankP RankR

    /*GlobalFonts.registerFromPath('./Jura.ttf', 'Jura')
    const c = canvas.createCanvas(940, 400)
    const ctx = c.getContext('2d')

    const background = new canvas.Image()
    background.src = await readFile('./Background.png')
    ctx.drawImage(background, 0, 0, c.width, c.height)

    //ctx.fillStyle = '#d6d6da'
    //ctx.font = '20px Jura'
    //ctx.fillText('BADGES', 751, 30)

    ctx.font = '30px Jura'
    const gradient = ctx.createLinearGradient(115, 58, 115 + ctx.measureText(user.username).width, 58)
    gradient.addColorStop(0, '#8005fc')
    gradient.addColorStop(0.5, '#d6d6da')
    gradient.addColorStop(1, '#073bae')
    ctx.fillStyle = gradient
    ctx.fillText(user.username, 115, 58)

    const ornament = new canvas.Image()
    ornament.src = fs.readFileSync('./Ornament.png')
    ctx.drawImage(ornament, 100, 15, ctx.measureText(user.username).width + 30, 70)

    const box0 = new canvas.Image()
    box0.src = fs.readFileSync('./Box0.png')
    const box1 = new canvas.Image()
    box1.src = fs.readFileSync('./Box1.png')
    const box2 = new canvas.Image()
    box2.src = fs.readFileSync('./Box2.png')
    const box3 = new canvas.Image()
    box3.src = fs.readFileSync('./Box3.png')
    ctx.drawImage(box1, 10, 100, 200, 290)
    ctx.drawImage(box0, 250, 100, 200, 290)
    ctx.drawImage(box0, 490, 100, 200, 290)

    ctx.beginPath()
    ctx.arc(50, 50, 40, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    const { body } = await request(user.displayAvatarURL({ format: 'png' }))
    const avatar = new canvas.Image()
    avatar.src = Buffer.from(await body.arrayBuffer())
    ctx.drawImage(avatar, 10, 10, 80, 80)

    const attachment = new MessageAttachment(c.toBuffer('image/png'), 'profile-image.png')*/
    //await interaction.editReply({ files: [attachment] })
  }
}