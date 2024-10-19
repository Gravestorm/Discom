module.exports = (d, x) => new Date(d || Date.now()).toLocaleString('LT', {
  timeZone: x ? 'UTC' : 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  ...(x && { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})