// eslint-disable-next-line no-unused-vars
const { Client, MessageEmbed } = require('discord.js')
const glob = require('glob')
const { ConfigModel } = require('./src/modules/database')
const { cacheRolesAndOrders } = require('./src/utils/manageStart')
const { cleanUp } = require('./src/utils/cleanUp')
const { CommandStatus } = require('./src/utils/objectParser')
const _commands = []

// TODO: pedido do cliente, atualizar regras de negócio:
//  - Todas encomendas devem ser criadas em canais separados
//  - o Comando de status pode ser utilizado pelos staffers em qualquer canal e pelo cliente no canal da encomenda!

// TODO: Ler todo o código e verificar tudo!
// Testar mais de 3 vezes qualquer tipo de bug que pode ser causado
// Tentar quebrar o comando de alguma forma (pedir ajuda ao shiba)
// Verificar se a lógica está bem executada e se existem problemas de lógica (principalmente no "newOrder.js")

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
    log.console(`Serão carregados: ${files.length} comandos!`)
    files.forEach((file, index) => {
      const cmd = require(file)
      _commands.push({
        commandNames: cmd.names,
        Execute: cmd.exe,
        helpData: cmd.help
      })
      log.console(`${index + 1}: ${file} carregado.`)
    })

    _commands.forEach(command => {
      if (!command.helpData.status) {
        command.helpData.status = CommandStatus.UNDEFINED
      }
    })

    log.console('\n')
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
    log.console(`Serão carregados: ${files.length} eventos!`)
    files.forEach((file, index) => {
      require(file)(client)
      log.console(`${index + 1}: ${file} carregado.`)
    })
    log.console('\n')
  })
}

/**
 *
 * @param {Client} client
 * @param {import('leekslazylogger')} log
 * @param {import('leeks.js')} leeks
 */
module.exports = async function encomendas (client, config, log, leeks) {
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

    await cacheRolesAndOrders(members, log)
  }

  registerCommands(log)
  registerEvents(client, log)

  client.on('ready', async () => {
    const guild = await client.guilds.fetch(config.guild)
    const members = await guild.members.fetch()
    start(members)
    log.info(leeks.colors.greenBright(leeks.styles.bold('[ENCOMENDAS] SISTEMA ONLINE!')))
  })

  client.on('message', async message => {
    if (message.guild.id !== config.guild) return
    if (!message.author) return
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
      let alert
      switch (commandFound.helpData.status) {
        case CommandStatus.ONLINE:
          break
        case CommandStatus.WIP:
          alert = 'Este comando está em WIP (Work In Progress), ele pode não funcionar corretamente ou então pode estar sendo feito ainda!'
          break
        case CommandStatus.FIX:
          alert = 'Este comando está em FIX, ele pode não funcionar corretamente por estar em reforma/conserto!'
          break
        case CommandStatus.UNDEFINED:
          alert = 'Este comando está ❓❓, ele pode ❓❓❓!'
          break
      }

      if (alert) {
        const baseEmbed = new MessageEmbed()
          .setTitle('📝 SquashCodes - Encomenda')
          .setTimestamp()
          .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
          .setColor(config.warn_colour)

        await message.channel.send(
          baseEmbed
            .setDescription(`**Aviso**\nO comando: "\`\`${command}\`\`" retornou um alerta sobre sua execução!\n\n**Alerta:** *${alert}*`)
        )
      }

      if (commandFound.commandNames[0] === 'ehelp') {
        return commandFound.Execute(client, args, message, { _commands })
      }

      commandFound.Execute(client, args, message)
    } catch (error) {
      log.error(error)
    }
  })
}
