const fetch = require('request-promise')
const nconf = require('nconf')

module.exports = async (link) => {
  return fetch({ url: link, headers: { Accept: '*/*', 'Accept-Language': 'en-US,en;q=0.9,lt;q=0.8', Authorization: nconf.get('USER'), Connection: 'close', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42' } })
}