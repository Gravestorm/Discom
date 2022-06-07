const express = require('express')
const nconf = require('nconf')
const app = express()

module.exports = () => {
  if (nconf.get('LOCAL')) return
  if (!nconf.get('PORT')) nconf.set('PORT', 5000)
  app.set('port', (nconf.get('PORT')))
  app.use(express.static(__dirname + '/public'))
  app.set('views', __dirname + '/views')
  app.listen(app.get('port'), () => { console.log('Express connected ', app.get('port')) })
}