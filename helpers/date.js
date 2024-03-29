module.exports = (d, x) => {
  if (x === true) return new Date(d ? d : new Date).toLocaleDateString('LT', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' })
  return new Date(d ? d : new Date).toLocaleString('LT', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
}