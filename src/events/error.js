module.exports = {
  event: 'error',
  execute (_client, log, [e]) {
    log.error(e)
    // '```' + e + '```')
  }
}
