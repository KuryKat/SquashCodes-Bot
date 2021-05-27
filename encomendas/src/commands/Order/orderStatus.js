// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants, MessageAttachment } = require('discord.js')

const { join } = require('path')
const { getUser } = require('../../utils/database/user')
const { getOrder } = require('../../utils/database/order')
const { getFromCache } = require('../../utils/imageManipulator')
const { CommandStatus } = require('../../utils/objectParser')
const { Roles } = require('../../utils/enums')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['orderstatus', 'os', 'status'],
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
    const commandUse = `**Uso(s) do comando:**\n${module.exports.names.map(name => `${config.prefix}${name}`).join('\n')}\n\n**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

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
    const member = await getUser(message.author.id, true)
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

    const imageCache = await getFromCache(order._id)
    const orderImage = new MessageAttachment(imageCache, `order-${order._id}.png`)

    if (member.details.role === Roles.CUSTOMER) {
      if (message.channel.id !== order.logImage.channel) {
        return await message.channel.send(
          errorEmbed
            .setDescription(`**Você não pode utilizar esse comando aqui! :(**\n\n**Utilize em <#${order.logImage.channel}> para ver o status de sua encomenda!**`)
        ).then(msg =>
          msg.delete({ timeout: 60000 })
            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            .then(() =>
              message.delete({ timeout: 100 })
                .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            )
        )
      }
      await message.reply(`Aqui está o status da encomenda #${order._id}`, orderImage)
    } else if (member.details.role > Roles.CUSTOMER) {
      await message.reply(`Aqui está o status da encomenda #${order._id}`, orderImage)
    } else {
      return await message.channel.send(
        errorEmbed
          .setDescription('**Você não pode utilizar esse comando! :(**')
      ).then(msg =>
        msg.delete({ timeout: 60000 })
          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          .then(() =>
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }
  }
}
