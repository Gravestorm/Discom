const fetch = require('request-promise')
const nconf = require('nconf')

module.exports = async (link, token) => {
  return fetch({ url: link, headers: { Accept: '*/*', 'Accept-Language': 'en-US,en;q=0.9,lt;q=0.8', Authorization: token ? token : nconf.get('USER1'), Connection: 'close', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42' } })
}