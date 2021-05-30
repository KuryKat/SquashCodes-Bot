// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants, MessageAttachment } = require('discord.js')

const { join } = require('path')
const { getUser } = require('../../utils/database/user')
const { getOrder } = require('../../utils/database/order')
const { getCachedImage } = require('../../utils/imageManipulator')
const { CommandStatus } = require('../../utils/usefulObjects')
const { Roles } = require('../../utils/enums')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['orderStatus', 'os', 'status'],
  help: {
    description: 'Verifica o status atual de uma encomenda \n**[Necessário ser o Cliente ou Staffer]**',
    visible: true,
    module: 'Encomendas',
    status: CommandStatus.FIX,
    usage: ['', '[ID]']
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

    const regex = /"[^"]+"|[\S]+/g
    const parsedArgs = []
    const commandUse = `**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`
    const member = await getUser(message.author.id, true)

    let orderID = message.channel.name.slice(message.channel.name.indexOf('id'), message.channel.name.indexOf('-encomenda')).replace('id-', '')

    if (!orderID) {
      if (member.details.role === Roles.CUSTOMER) {
        return await message.channel.send(
          errorEmbed
            .setDescription(
          `**Você não pode utilizar esse comando neste canal! :(**\n\nVocê precisa utilizar no canal de alguma encomenda sua:\n${
            member.orders.length < 1
            ? '*Você não possui nenhuma encomenda!*\nAbra um ticket usando ``!suporte`` para encomendar algo com nossa equipe!'
            : member.orders.map(order => `<#${order.logImage.channel}>`).join('\n')
          }`)
        )
      } else if (member.details.role < Roles.CUSTOMER) {
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

      orderID = parsedArgs[0]
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

    const imageCache = await getCachedImage(order._id) || await getCachedImage(order._id, true)
    const orderImage = new MessageAttachment(imageCache, `order-${order._id}.png`)
    await message.reply(`Aqui está o status da encomenda #${order._id}`, orderImage)
  }
}
