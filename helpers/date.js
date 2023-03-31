module.exports = (d) => {
  return new Date(d ? d : new Date).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
}