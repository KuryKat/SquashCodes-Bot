module.exports = {
  event: 'debug',
  execute (_client, log, [e]) {
    log.debug(e)
    // '```' + e + '```')
  }
}
