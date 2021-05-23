
const cleanUp = (callback, log) => {
  process.on('cleanup', async () => {
    await callback()
    process.exit()
  })

  process.on('exit', () => {
    log.info('Bye bye~!')
  })

  process.on('SIGINT', () => {
    log.warn('Ctrl-C...')
    process.emit('cleanup')
  })

  process.on('uncaughtException', err => {
    log.warn('Uncaught Exception...')
    log.error(err)
    process.emit('cleanup')
  })

  process.on('unhandledRejection', err => {
    log.warn('Unhandled Rejection...')
    log.error(err)
    process.emit('cleanup')
  })
}

module.exports = { cleanUp }
