const nconf = require('nconf')
const delay = require('../helpers/delay')
const fetch = require('../helpers/fetch')
const fs = require('node:fs')
const stats = JSON.parse(fs.readFileSync('stats.json'))
const requiredKeys = ['STATS']

module.exports = async () => {
  if (!requiredKeys.every(key => nconf.get(key))) return
  let datename = ['17-04', '17-05', '17-06', '17-07', '17-08', '17-09', '17-10', '17-11', '17-12',
    '18-01', '18-02', '18-03', '18-04', '18-05', '18-06', '18-07', '18-08', '18-09', '18-10', '18-11', '18-12',
    '19-01', '19-02', '19-03', '19-04', '19-05', '19-06', '19-07', '19-08', '19-09', '19-10', '19-11', '19-12',
    '20-01', '20-02', '20-03', '20-04', '20-05', '20-06', '20-07', '20-08', '20-09', '20-10', '20-11', '20-12',
    '21-01', '21-02', '21-03', '21-04', '21-05', '21-06', '21-07', '21-08', '21-09', '21-10', '21-11', '21-12',
    '22-01', '22-02', '22-03', '22-04', '22-05', '22-06', '22-07', '22-08', '22-09', '22-10', '22-11', '22-12',
    '23-01', '23-02', '23-03']
  let dates = [
    '&min_id=297475139174400000&max_id=308346775142400000&include_nsfw=true',
    '&min_id=308346775142400000&max_id=319580798976000000&include_nsfw=true',
    '&min_id=319580798976000000&max_id=330452434944000000&include_nsfw=true',
    '&min_id=330452434944000000&max_id=341686458777600000&include_nsfw=true',
    '&min_id=341686458777600000&max_id=352920482611200000&include_nsfw=true',
    '&min_id=352920482611200000&max_id=363792118579200000&include_nsfw=true',
    '&min_id=363792118579200000&max_id=375041241907200000&include_nsfw=true',
    '&min_id=375041241907200000&max_id=385912877875200000&include_nsfw=true',
    '&min_id=385912877875200000&max_id=397146901708800000&include_nsfw=true',
    '&min_id=397146901708800000&max_id=408380925542400000&include_nsfw=true',
    '&min_id=408380925542400000&max_id=418527785779200000&include_nsfw=true',
    '&min_id=418527785779200000&max_id=429746710118400000&include_nsfw=true',
    '&min_id=429746710118400000&max_id=440618346086400000&include_nsfw=true',
    '&min_id=440618346086400000&max_id=451852369920000000&include_nsfw=true',
    '&min_id=451852369920000000&max_id=462724005888000000&include_nsfw=true',
    '&min_id=462724005888000000&max_id=473958029721600000&include_nsfw=true',
    '&min_id=473958029721600000&max_id=485192053555200000&include_nsfw=true',
    '&min_id=485192053555200000&max_id=496063689523200000&include_nsfw=true',
    '&min_id=496063689523200000&max_id=507312812851200000&include_nsfw=true',
    '&min_id=507312812851200000&max_id=518184448819200000&include_nsfw=true',
    '&min_id=518184448819200000&max_id=529418472652800000&include_nsfw=true',
    '&min_id=529418472652800000&max_id=540652496486400000&include_nsfw=true',
    '&min_id=540652496486400000&max_id=550799356723200000&include_nsfw=true',
    '&min_id=550799356723200000&max_id=562018281062400000&include_nsfw=true',
    '&min_id=562018281062400000&max_id=572889917030400000&include_nsfw=true',
    '&min_id=572889917030400000&max_id=584123940864000000&include_nsfw=true',
    '&min_id=584123940864000000&max_id=594995576832000000&include_nsfw=true',
    '&min_id=594995576832000000&max_id=606229600665600000&include_nsfw=true',
    '&min_id=606229600665600000&max_id=617463624499200000&include_nsfw=true',
    '&min_id=617463624499200000&max_id=628335260467200000&include_nsfw=true',
    '&min_id=628335260467200000&max_id=639584383795200000&include_nsfw=true',
    '&min_id=639584383795200000&max_id=650456019763200000&include_nsfw=true',
    '&min_id=650456019763200000&max_id=661690043596800000&include_nsfw=true',
    '&min_id=661690043596800000&max_id=672924067430400000&include_nsfw=true',
    '&min_id=672924067430400000&max_id=683433315532800000&include_nsfw=true',
    '&min_id=683433315532800000&max_id=694652239872000000&include_nsfw=true',
    '&min_id=694652239872000000&max_id=705523875840000000&include_nsfw=true',
    '&min_id=705523875840000000&max_id=716757899673600000&include_nsfw=true',
    '&min_id=716757899673600000&max_id=727629535641600000&include_nsfw=true',
    '&min_id=727629535641600000&max_id=738863559475200000&include_nsfw=true',
    '&min_id=738863559475200000&max_id=750097583308800000&include_nsfw=true',
    '&min_id=750097583308800000&max_id=760969219276800000&include_nsfw=true',
    '&min_id=760969219276800000&max_id=772218342604800000&include_nsfw=true',
    '&min_id=772218342604800000&max_id=783089978572800000&include_nsfw=true',
    '&min_id=783089978572800000&max_id=794324002406400000&include_nsfw=true',
    '&min_id=794324002406400000&max_id=805558026240000000&include_nsfw=true',
    '&min_id=805558026240000000&max_id=815704886476800000&include_nsfw=true',
    '&min_id=815704886476800000&max_id=826923810816000000&include_nsfw=true',
    '&min_id=826923810816000000&max_id=837795446784000000&include_nsfw=true',
    '&min_id=837795446784000000&max_id=849029470617600000&include_nsfw=true',
    '&min_id=849029470617600000&max_id=859901106585600000&include_nsfw=true',
    '&min_id=859901106585600000&max_id=871135130419200000&include_nsfw=true',
    '&min_id=871135130419200000&max_id=882369154252800000&include_nsfw=true',
    '&min_id=882369154252800000&max_id=893240790220800000&include_nsfw=true',
    '&min_id=893240790220800000&max_id=904489913548800000&include_nsfw=true',
    '&min_id=904489913548800000&max_id=915361549516800000&include_nsfw=true',
    '&min_id=915361549516800000&max_id=926595573350400000&include_nsfw=true',
    '&min_id=926595573350400000&max_id=937829597184000000&include_nsfw=true',
    '&min_id=937829597184000000&max_id=947976457420800000&include_nsfw=true',
    '&min_id=947976457420800000&max_id=959195381760000000&include_nsfw=true',
    '&min_id=959195381760000000&max_id=970067017728000000&include_nsfw=true',
    '&min_id=970067017728000000&max_id=981301041561600000&include_nsfw=true',
    '&max_id=981301041561600000&min_id=970067017728000000&include_nsfw=true',
    '&max_id=992172677529600000&min_id=981301041561600000&include_nsfw=true',
    '&max_id=1003406701363200000&min_id=992172677529600000&include_nsfw=true',
    '&max_id=1014640725196800000&min_id=1003406701363200000&include_nsfw=true',
    '&max_id=1025512361164800000&min_id=1014640725196800000&include_nsfw=true',
    '&max_id=1036761484492800000&min_id=1025512361164800000&include_nsfw=true',
    '&max_id=1047633120460800000&min_id=1036761484492800000&include_nsfw=true',
    '&max_id=1058867144294400000&min_id=1047633120460800000&include_nsfw=true',
    '&max_id=1070101168128000000&min_id=1058867144294400000&include_nsfw=true',
    '&max_id=1080248028364800000&min_id=1070101168128000000&include_nsfw=true',
    '&max_id=1091466952704000000&min_id=1080248028364800000&include_nsfw=true'
  ]
  let channels = ['78581046714572800', '364081918116888576', '626165608010088449', '534121764045717524', '297780920268750858', '297779639609327617', '364086525799038976', '626165637252907045', '534121863857569792', '372100313890553856', '297779810279751680&channel_id=356038271140233216&channel_id=299523503592439809&channel_id=297809615490383873&channel_id=297779846187188234&channel_id=892471107318345749&channel_id=582715083537514526&channel_id=678244173006241842&channel_id=297779010417590274',]
  for (let i = 0; i < dates.length; i++) {
    let genen = monoen = retroen = tempoen = offen = genfr = monofr = retrofr = tempofr = offfr = other = 0
    for (let j = 0; j < channels.length; j++) {
      await delay(6000)
      await fetch(`https://discord.com/api/v9/guilds/78581046714572800/messages/search?channel_id=${channels[j]}&${dates[i]}`).then(res => {
        console.log(channels[j], datename[i], JSON.parse(res).total_results)
        if (j === 0) genen = JSON.parse(res).total_results
        if (j === 1) monoen = JSON.parse(res).total_results
        if (j === 2) retroen = JSON.parse(res).total_results
        if (j === 3) tempoen = JSON.parse(res).total_results
        if (j === 4) offen = JSON.parse(res).total_results
        if (j === 5) genfr = JSON.parse(res).total_results
        if (j === 6) monofr = JSON.parse(res).total_results
        if (j === 7) retrofr = JSON.parse(res).total_results
        if (j === 8) tempofr = JSON.parse(res).total_results
        if (j === 9) offfr = JSON.parse(res).total_results
        if (j === 10) other = JSON.parse(res).total_results
      }).catch(err => { throw err })
    }
    stats.push({ D: datename[i], GenEN: genen, MonoEN: monoen, RetroEN: retroen, TempoEN: tempoen, OffEN: offen, GenFR: genfr, MonoFR: monofr, RetroFR: retrofr, TempoFR: tempofr, OffFR: offfr, Other: other, TotalEN: genen + monoen + retroen + tempoen + offen, TotalFR: genfr + monofr + retrofr + tempofr + offfr })
    fs.writeFileSync('stats.json', JSON.stringify(stats))
  }
}