const express = require('express')
const nconf = require('nconf')
const app = express()
const requiredKeys = ['LOCAL']

module.exports = () => {
  if (requiredKeys.every(key => nconf.get(key))) return
  if (!nconf.get('PORT')) nconf.set('PORT', 5000)
  app.set('port', (nconf.get('PORT')))
  app.use(express.static(__dirname + '/public'))
  app.set('views', __dirname + '/views')
  app.listen(app.get('port'), () => { console.log('Express connected ', app.get('port')) })
}