// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants } = require('discord.js')
const { join } = require('path')
const { CommandStatus } = require('../../utils/usefulObjects')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

/**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
 */
// eslint-disable-next-line no-unused-vars
const commandLike = (client, args, message) => {}
class HelpData {
  constructor ({ description, visible, module, status, usage }) {
    this.description = description
    this.visible = visible
    this.module = module
    this.status = status
    this.usage = usage
  }
}

const prefix = config.prefix

module.exports = {
  names: ['ehelp'],
  help: {
    description: 'Mostra todos os comandos sobre o sistema de encomendas!',
    visible: true,
    module: 'Utilidades',
    status: CommandStatus.ONLINE,
    usage: ['', '{comando}']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   * @param {{ _commands: {commandNames: String[], Execute: commandLike, helpData: HelpData}[]}} param3
   */
  exe: async function (client, args, message, { _commands }) {
    const baseEmbed = new MessageEmbed()
      .setTitle('📝 SquashCodes - Encomenda')
      .setTimestamp()
      .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
      .setColor(config.colour)

    const errorEmbed = new MessageEmbed()
      .setTitle('📝 SquashCodes - Encomenda')
      .setTimestamp()
      .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
      .setColor(config.err_colour)

    async function unknownCommand () {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Comando Desconhecido! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    if (args.length === 0) {
      await allCommands()
    } else {
      await specificCommand()
    }

    async function specificCommand () {
      const command = args.shift().toLowerCase()
      const cmd = _commands.find(x => x.commandNames.findIndex(name => name.toLowerCase() === command) !== -1)

      if (!cmd) {
        return await unknownCommand()
      }

      let cmdMetadata = cmd.helpData

      if (!cmdMetadata) {
        cmdMetadata = new HelpData()
      }

      if (!cmdMetadata.visible) {
        return await unknownCommand()
      }

      if (!cmdMetadata.description) {
        cmdMetadata.description = ''
      }

      const embed = baseEmbed
        .setDescription(`**Comando: ${cmd.commandNames[0]}**\n${cmdMetadata.description}`)

      if (!cmdMetadata.usage) {
        cmdMetadata.usage = ['']
      }
      let usage = ''
      for (const argusage of cmdMetadata.usage) {
        usage += prefix + (cmd.commandNames[0]) + ' ' + argusage + '\n'
      }

      if (!cmdMetadata.status) {
        cmdMetadata.status = CommandStatus.UNDEFINED
      }

      embed.addField('Status do comando:', `${cmdMetadata.status} **${Object.keys(CommandStatus).find((s, index) => index === Object.values(CommandStatus).findIndex(s => s === cmdMetadata.status))}**`)
      embed.addField('Uso(s) do comando:', usage)

      if (cmd.commandNames && cmd.commandNames.length > 1) {
        let aliases = ''
        cmd.commandNames.forEach(alias => {
          aliases += alias + '\n'
        })
        embed.addField('Apelidos (outros nomes do comando):', aliases)
      }

      return await message.channel.send(embed)
        .then(msg =>
          msg.delete({ timeout: 60000 })
            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            .then(() =>
              message.delete({ timeout: 2000 })
                .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            )
        )
        .catch(console.error)
    }

    async function allCommands () {
      const embed = baseEmbed
        .setDescription('**Comandos do sistema de encomendas:**\nUse: `' + prefix + module.exports.names[0] + ' {nome do comando}` para mais informações.')

      const commandModules = []

      for (const cmd of _commands) {
        let helpData = cmd.helpData

        if (!helpData) {
          helpData = new HelpData()
        }

        if (!helpData.visible) {
          continue
        }

        helpData.module = helpData.module ?? 'Default'

        const moduleIndex = commandModules.findIndex(x => x.module === helpData.module)

        if (moduleIndex === -1) {
          commandModules.push({
            module: helpData.module,
            commands: [cmd.commandNames[0]]
          })
        } else {
          commandModules[moduleIndex].commands.push(cmd.commandNames[0])
        }
      }

      const embedFields = []

      for (const module of commandModules) {
        let cmdsname = ''

        module.commands.forEach(cmd => {
          cmdsname += `\`${cmd}\` `
        })

        embedFields.push({
          name: '**' + module.module + '**',
          value: cmdsname,
          inline: false
        })
      }

      embed.addFields(embedFields)
      return await message.channel.send(embed)
        .then(msg =>
          msg.delete({ timeout: 60000 })
            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            .then(() =>
              message.delete({ timeout: 2000 })
                .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            )
        )
        .catch(console.error)
    }
  }
}
