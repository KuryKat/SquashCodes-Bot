// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants } = require('discord.js')
const { CommandStatus } = require('../../utils/usefulObjects')

const { join } = require('path')
const { getOrder, updateOrderStatus } = require('../../utils/database/order')
const { getUser } = require('../../utils/database/user')
const { Roles } = require('../../utils/enums')
const { restoreOrderImage } = require('../../utils/imageManipulator')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['restoreOrder', 'ro', 'restore'],
  help: {
    description: 'Restaura uma encomenda e atualiza/retoma ela \n**[Necessário ser Staffer]**',
    visible: true,
    module: 'Encomendas',
    status: CommandStatus.ONLINE,
    usage: ['[ID]']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
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

    const member = await getUser(message.author.id)
    if (member.details.role < Roles.SELLER) {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Você não está autorizado a utilizar esse comando! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const regex = /"[^"]+"|[\S]+/g
    const parsedArgs = []
    const commandUse = `**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

    const argsMatched = args.join(' ').match(regex)

    if (!argsMatched) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**Você deve me fornecer as informações necessárias! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    argsMatched.forEach(element => {
      if (!element) return
      return parsedArgs.push(element.replace(/"/g, ''))
    })

    const orderID = parsedArgs[0]

    if (!orderID) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**Você deve me fornecer as informações necessárias! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const order = await getOrder(orderID)
    if (!order) {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Encomenda Desconhecida! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    if (order.status === 'open' | order.status === 'development') {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Você não pode reabrir uma encomenda que não foi finalizada! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const restoredOrder = await updateOrderStatus(order._id, 'development')
    await restoreOrderImage(restoredOrder._id)
    return await message.channel.send(
      baseEmbed
        .setDescription(`Encomenda restaurada! :)\nA encomenda \`\`#${restoredOrder._id}\`\` foi restaurada para o status "${restoredOrder.status}"!`)
    )
  }
}
