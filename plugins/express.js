const express = require('express')
const nconf = require('nconf')
const path = require('path')

module.exports = () => {
  if (nconf.get('LOCAL')) return
  const app = express()
  const port = nconf.get('PORT') || 5000
  app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('port', port)
    .listen(port, () => console.log(`Express connected on port ${port}`))
}