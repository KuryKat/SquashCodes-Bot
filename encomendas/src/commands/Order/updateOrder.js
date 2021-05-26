// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants } = require('discord.js')
const { Roles, OrderHeaders } = require('../../utils/enums')
// const { updateOrderImage } = require('../../utils/imageManipulator')

const { join } = require('path')
const { getUser } = require('../../utils/database/user')
const { ConfigModel } = require('../../modules/database')
const { getOrder } = require('../../utils/database/order')
const { CommandStatus } = require('../../utils/objectParser')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['updateorder', 'uo', 'update'],
  help: {
    description: 'Atualiza uma encomenda e adiciona um novo changelog \n**[Necessário ser Staffer]**',
    visible: true,
    module: 'Encomendas',
    status: CommandStatus.WIP,
    usage: ['[ID] [Cabeçalho] "[Atualização]"']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    // TODO: comando para atualizar as encomendas e adicionar novos changelogs
    // Modelo do comando:
    // !uo [ID] [Header Enum] "[Update Message]"

    // const baseEmbed = new MessageEmbed()
    //   .setTitle('📝 SquashCodes - Encomenda')
    //   .setTimestamp()
    //   .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
    //   .setColor(config.colour)

    const errorEmbed = new MessageEmbed()
      .setTitle('📝 SquashCodes - Encomenda')
      .setTimestamp()
      .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
      .setColor(config.err_colour)

    const member = await getUser(message.author.id)
    if (member.details.role < Roles.SELLER) {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Você não está autorizado a utilizar esse comando! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const regex = /"[^"]+"|[\S]+/g
    const parsedArgs = []
    const commandUse = `**Uso(s) do comando:**\n${module.exports.names.map(name => `${config.prefix}${name}`).join('\n')}\n\n**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Cabeçalhos:**\n${Object.keys(OrderHeaders).map((header, index) => `${header} - ${Object.values(OrderHeaders)[index]}`).join('\n')}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

    const argsMatched = args.join(' ').match(regex)

    if (!argsMatched) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**Você deve me fornecer as informações necessárias! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    argsMatched.forEach(element => {
      if (!element) return
      return parsedArgs.push(element.replace(/"/g, ''))
    })

    const orderID = parsedArgs[0]
    const headerEnum = parsedArgs[1]
    const changelog = parsedArgs[2]

    if (!orderID || !headerEnum || !changelog) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**Você deve me fornecer as informações necessárias! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const order = await getOrder(orderID)

    if (!order) {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Encomenda Desconhecida! :(**\nEla pode não existir ou pode ter sido arquivada')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const dbHeader = ConfigModel.findById({ _id: orderID, type: 'header' })
    const currentHeader = dbHeader.value

    if (headerEnum < currentHeader) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**O cabeçalho não pode ser anterior ao atual, ja que este foi interrompido! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    // TODO: Continuar comando de atualizar encomendas!
  }
}
