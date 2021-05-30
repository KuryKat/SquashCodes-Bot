// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants, MessageAttachment } = require('discord.js')
const { CommandStatus } = require('../../utils/usefulObjects')
const { getUser } = require('../../utils/database/user')
const { getOrder, updateOrderStatus, updateOrder } = require('../../utils/database/order')

const { join } = require('path')
const { Roles, OrderFinishStatus } = require('../../utils/enums')
const { finishOrderImage } = require('../../utils/imageManipulator')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['finishOrder', 'fo', 'finish'],
  help: {
    description: 'Finaliza uma encomenda e arquiva ela como "entregue" ou "cancelada"\n**[Necessário ser Staffer]**',
    visible: true,
    module: 'Encomendas',
    status: CommandStatus.WIP,
    usage: ['[ID] [Status]']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    const DELIVERED_MESSAGE = 'Entregamos seu pedido, a Squash Codes agradece!'
    const CANCELED_MESSAGE = 'Seu pedido foi cancelado'

    const errorEmbed = new MessageEmbed()
      .setTitle('📝 SquashCodes - Encomenda')
      .setTimestamp()
      .setFooter('SquashCodes', message.guild.iconURL({ dynamic: true }))
      .setColor(config.err_colour)

    const member = await getUser(message.author.id, true)
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
    const commandUse = `**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Status:**\n${Object.keys(OrderFinishStatus).map((header, index) => `${header} - ${Object.values(OrderFinishStatus)[index]}`).join('\n')}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

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
    const status = parsedArgs[1]

    if (!orderID || !status) {
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

    if (order.status === 'delivered' || order.status === 'canceled') {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**Esta encomenda ja foi finalizada! :(**\nEla está registrada como \`${order.status}\` então por isso não pode ser finalizada!`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    let imageBuffer
    switch (Number(status)) {
      case OrderFinishStatus.DELIVERED:
        await updateOrderStatus(orderID, 'delivered')
        imageBuffer = await finishOrderImage(orderID, DELIVERED_MESSAGE, 'delivered')
        break
      case OrderFinishStatus.CANCELED:
        await updateOrderStatus(orderID, 'canceled')
        imageBuffer = await finishOrderImage(orderID, CANCELED_MESSAGE, 'canceled')
        break
      default:
        return await message.channel.send(
          errorEmbed
            .setDescription(`**Status Inválido! :(**\nPrecisa ser um dos Status listados no uso do comando!\n\n${commandUse}`)
        ).then(msg =>
          msg.delete({ timeout: 60000 })
            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            .then(() =>
              message.delete({ timeout: 2000 })
                .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            )
        )
    }

    const orderImage = new MessageAttachment(imageBuffer, `order-${order._id}.png`)
    const orderChannel = message.guild.channels.cache.get(order.logImage.channel)
    const logMessage = (await orderChannel.messages.fetch()).get(order.logImage.message)

    setTimeout(async () => {
      await orderChannel.send(`<@${order.customer}>`).then(async m => await m.delete())
      await logMessage.delete()
      const logImageMessage = await orderChannel.send(orderImage)
      await updateOrder(order._id, 'logImage:message', logImageMessage.id)
    }, 900)
  }
}
