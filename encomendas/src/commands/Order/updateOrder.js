// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants, MessageAttachment, TextChannel } = require('discord.js')
const { Roles, OrderHeaders } = require('../../utils/enums')
const { updateOrderImage } = require('../../utils/imageManipulator')

const { join } = require('path')
const { getUser } = require('../../utils/database/user')
const { ImageReferencesModel } = require('../../modules/database')
const { getOrder, updateOrder } = require('../../utils/database/order')
const { CommandStatus } = require('../../utils/usefulObjects')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['updateOrder', 'uo', 'update'],
  help: {
    description: 'Atualiza uma encomenda e adiciona um novo changelog \n**[Necessário ser Staffer]**',
    visible: true,
    module: 'Encomendas',
    status: CommandStatus.FIX,
    usage: ['[ID] [Cabeçalho] "[Atualização]"']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
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
    const commandUse = `**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Cabeçalhos:**\n${Object.keys(OrderHeaders).map((header, index) => `${header} - ${Object.values(OrderHeaders)[index]}`).join('\n')}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

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
            message.delete({ timeout: 2000 })
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
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const dbReferencesManager = await ImageReferencesModel.findById({ _id: orderID }).exec()
    const currentHeader = dbReferencesManager.references.header.value

    if (headerEnum < currentHeader) {
      return await message.channel.send(
        errorEmbed
          .setDescription(`**O cabeçalho não pode ser anterior ao atual, ja que este foi interrompido! :(**\n\n${commandUse}`)
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 2000 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const updatedImageBuffer = await updateOrderImage(order._id, Number(headerEnum), changelog)
    const updatedOrderImage = new MessageAttachment(updatedImageBuffer, `order-${order._id}.png`)

    /**
     * @type {TextChannel}
     */
    const logChannel = message.guild.channels.cache.get(order.logImage.channel)
    const logMessage = (await logChannel.messages.fetch()).get(order.logImage.message)

    setTimeout(async () => {
      await logChannel.send(`<@${order.customer}>`).then(async m => await m.delete())
      await logMessage.delete()
      const logImageMessage = await logChannel.send(updatedOrderImage)
      await updateOrder(order._id, 'logImage:message', logImageMessage.id)
    }, 900)
  }
}
