const promise = require('bluebird')

module.exports = (ms) => {
  return new promise(resolve => setTimeout(resolve, ms))
}