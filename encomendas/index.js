// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js')
const glob = require('glob')
const { ConfigModel } = require('./src/modules/database')
const { cacheRoles } = require('./src/utils/manageRoles')
const { cleanUp } = require('./src/utils/cleanUp')
const _commands = []

const registerCommands = (log) => {
  glob('./encomendas/src/commands/**/*.js', {
    absolute: true
  }, (err, files) => {
    if (err !== null) {
      log.error(`Não foi possivel registrar os comandos: ${err.name} - ${err.message}`)
    }
    if (files.length === 0) {
      return log.warn('Nenhum comando foi registrado.')
    }
    log.info(`Serão carregados: ${files.length} comandos!`)
    files.forEach((file, index) => {
      const cmd = require(file)
      _commands.push({
        commandNames: cmd.names,
        Execute: cmd.exe
      })
      log.info(`${index + 1}: ${file} carregado.`)
    })
    log.info('\n')
  })
}

const registerEvents = (client, log) => {
  glob('./encomendas/src/events/**/*.js', {
    absolute: true
  }, (err, files) => {
    if (err !== null) {
      return log.error(`Não foi possivel registrar os eventos: ${err.name} - ${err.message}`)
    }
    if (files.length === 0) {
      return log.warn('Nenhum evento foi registrado.')
    }
    log.info(`Serão carregados: ${files.length} eventos!`)
    files.forEach((file, index) => {
      require(file)(client)
      log.info(`${index + 1}: ${file} carregado.`)
    })
    log.info('\n')
  })
}

/**
 *
 * @param {Client} client
 */
module.exports = async function encomendas (client, config, log) {
  async function start (members) {
    let started = await ConfigModel.findById('started')
    if (!started) {
      started = new ConfigModel({ _id: 'started' })
      started.value = 1
      await started.save()
    }

    cleanUp(async () => {
      started.value = 0
      started.save()
    }, log)

    if (!started.value) {
      started.value = 1
      started.save()
    }

    await cacheRoles(members, log)
  }

  registerCommands(log)
  registerEvents(client, log)

  client.on('ready', async () => {
    const guild = await client.guilds.fetch(config.guild)
    const members = await guild.members.fetch()
    start(members)
    log.info('[ENCOMENDAS] SISTEMA ONLINE!')
  })

  client.on('message', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) {
      return
    }

    const args = message.content
      .slice((config.prefix).length)
      .trim()
      .split(/ +/)

    const command = args.shift().toLowerCase()

    if (command === undefined) {
      return
    }

    const commandFound = _commands.find(commandObj =>
      commandObj.commandNames.findIndex(name => name === command) !== -1)
    if (commandFound === undefined) {
      return
    }

    try {
      commandFound.Execute(client, args, message)
    } catch (error) {
      log.error(error)
    }
  })
}
