module.exports = (d, x) => {
  if (x === true) return new Date(d ? d : new Date).toLocaleString('LT', { year: 'numeric', month: '2-digit', day: '2-digit' })
  return new Date(d ? d : new Date).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
}