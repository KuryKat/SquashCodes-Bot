// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed, Constants, MessageAttachment } = require('discord.js')

const { createOrder, updateOrder } = require('../../utils/database/order')
const { getUser, updateUserOrders } = require('../../utils/database/user')
const { createOrderImage } = require('../../utils/imageManipulator')
const { Roles } = require('../../utils/enums')
const { join } = require('path')
const { CommandStatus } = require('../../utils/objectParser')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['newOrder', 'no', 'new'],
  help: {
    description: 'Cria uma nova encomenda com as informações fornecidas **[Necessário ser Staffer]**',
    visible: true,
    module: 'Order',
    status: CommandStatus.ONLINE,
    usage: ['"[Nome]" "[Descrição]" [Valor] @[Cliente] @[Responsáveis]']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    // TODO: Validação de cargos para garantir melhor segurança na hora de criar a encomenda
    // Exemplo: Verificar se os responsáveis mencionados tem o cargo da Staff

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
            message.delete({ timeout: 100 })
              .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
          )
      )
    }

    const regex = /"[^"]+"|[\S]+/g
    const parsedArgs = []
    const commandUse = `**Uso do comando:**\n${module.exports.names.map(name => `${config.prefix}${name}`).join('\n')}\n\n**Informações necessárias:**\n${module.exports.help.usage[0]}\n\n**Nota: Use as aspas para pode definir textos extensos contendo espaços!!**`

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

    const orderName = parsedArgs[0]
    const orderDescription = parsedArgs[1]
    const orderPrice = parsedArgs[2]
    const orderCustomer = message.mentions.members.first()
    const orderResponsibles = [...new Set(message.mentions.members.first(3).splice(1))]

    /**
     *
     * @param {String} value Valor que será comparado
     * @param {String} valueName Nome do valor
     * @param {'a' | 'o'} pronom Pronome do Valor
     * @param {Boolean} hasLengthCompare Tem comparação de tamanho?
     * @param {Number} length Tamanho para ser comparado
     * @param {Boolean} hasRegexCompare Tem comparação de Regex?
     * @param {RegExp} regex Regex pra ser comparado
     * @param {[{name: String | any, value: String | any, inline: Boolean}]} regexFormatFields Formato escrito do padrão validado pelo Regex
     * @param {String} regexExplanation Explicação do Regex
     * @returns {Promise<Message | void>}
     */
    async function checkvalues (value, valueName, pronom, hasLengthCompare, length, hasRegexCompare, regex = /^.$/, regexFormatFields, regexExplanation = 'Corresponde a qualquer caractere, exceto quebras de linha', callback) {
      if (!value) {
        return await message.channel.send(
          errorEmbed
            .setDescription(`**Você deve me fornecer ${pronom} ${valueName} do pedido! :(**\n\n${commandUse}`)
        ).then(msg =>
          msg.delete({ timeout: 60000 })
            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            .then(() =>
              message.delete({ timeout: 100 })
                .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
            )
        )
      }

      if (hasLengthCompare) {
        if (value.length > length) {
          return await message.channel.send(
            errorEmbed
              .setDescription(`**${pronom.toUpperCase()} ${valueName} do pedido não pode ser maior que ${length} caracteres! :(**\n${pronom.toUpperCase()} ${valueName} especificad${pronom} foi: **${value}**\n\n${commandUse}`)
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

      if (hasRegexCompare) {
        if (!regex.test(value)) {
          return await message.channel.send(
            errorEmbed
              .setDescription(`**${pronom.toUpperCase()} ${valueName} do pedido deve seguir o formato padrão! :(**\n${pronom.toUpperCase()} ${valueName} especificad${pronom} foi: **${value}**\n\n${commandUse}\n\n**Formato Padrão:**`)
              .addFields(regexFormatFields)
              .addField('Explicação', `*O verificador de formato ${regexExplanation}*`)
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

      callback()
    }

    await checkvalues(orderName, 'nome', 'o', true, 20, null, null, null, null, async () => {
      await checkvalues(orderDescription, 'descrição', 'a', true, 100, null, null, null, null, async () => {
        await checkvalues(
          orderPrice,
          'preço',
          'o',
          false,
          null,
          true,
          /^(R\$|\$|€)([1-9]\d{0,2}((\.\d{3})*|\d*))(,\d{2})?$/,
          [
            {
              name: 'BRL:',
              value: 'R$xxx.xxx,xx',
              inline: true
            },
            {
              name: 'USD:',
              value: '$xxx.xxx,xx',
              inline: true
            },
            {
              name: 'EUR:',
              value: '€xxx.xxx,xx',
              inline: true
            }
          ],
          'verifica o tipo da moeda e quantidade de números em relação a pontuação utilizada!\n\n**Notas:**\n- Se você necessita adicionar centavos, adicione uma vírgula e até DOIS números após ela!\n- Se você adicionar um ponto (".") ele vai exigir que você adicione pontos em cada unidade, por exemplo: R$10.000.000\n- Se você simplesmente escrever sem pontos ele também aceita, por exemplo R$10000000',
          async () => {
            await checkvalues(orderCustomer, 'cliente', 'o', false, null, false, null, null, null, async () => {
              if (orderCustomer.user.bot) {
                return await message.channel.send(
                  errorEmbed
                    .setDescription(`**O cliente não pode ser um BOT, o ${orderCustomer.user.username} é um! :(**\n\n${commandUse}`)
                ).then(msg =>
                  msg.delete({ timeout: 60000 })
                    .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                    .then(() =>
                      message.delete({ timeout: 100 })
                        .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                    )
                )
              }

              let responsibleBot = false
              orderResponsibles.map(async responsible => {
                if (responsible.id === orderCustomer.id) {
                  return await message.channel.send(
                    errorEmbed
                      .setDescription(`**O responsável e o cliente não podem ser as mesmas pessoas! :(**\n\n${commandUse}`)
                  ).then(msg =>
                    msg.delete({ timeout: 60000 })
                      .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                      .then(() =>
                        message.delete({ timeout: 100 })
                          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                      ))
                }

                if (responsible.user.bot) {
                  responsibleBot = true
                  return await message.channel.send(
                    errorEmbed
                      .setDescription(`**O responsável não pode ser um BOT, o ${responsible.user.username} é um! :(**\n\n${commandUse}`)
                  ).then(msg =>
                    msg.delete({ timeout: 60000 })
                      .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                      .then(() =>
                        message.delete({ timeout: 100 })
                          .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                      )
                  )
                }
              })

              if (responsibleBot) return

              if (orderResponsibles.length === 0 || !orderResponsibles) {
                return await message.channel.send(
                  errorEmbed
                    .setDescription(`**Você deve me fornecer os responsáveis do pedido, mencione eles! :(**\n\n${commandUse}`)
                ).then(msg =>
                  msg.delete({ timeout: 60000 })
                    .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                    .then(() =>
                      message.delete({ timeout: 100 })
                        .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                    )
                )
              }

              const confirmOrder = await message.channel.send(
                baseEmbed
                  .setDescription('**Deseja confirmar essa nova encomenda?** \n\n✅ - Confirmar\n❌ - Cancelar')
                  .addFields([
                    {
                      name: 'Nome:',
                      value: orderName,
                      inline: true
                    },
                    {
                      name: 'Descrição:',
                      value: orderDescription,
                      inline: true
                    },
                    {
                      name: 'Cliente:',
                      value: `<@${orderCustomer.id}>`,
                      inline: false
                    },
                    {
                      name: 'Preço:',
                      value: orderPrice,
                      inline: false
                    },
                    {
                      name: 'Responsáveis:',
                      value: orderResponsibles.map(x => `<@${x.id}>`).join('\n')
                    }
                  ])
              )
              await confirmOrder.react('✅')
              setTimeout(async () => {
                await confirmOrder.react('❌')
              }, 500)
              const filter = (_reaction, user) => user.id === message.author.id
              const confirmCollector = confirmOrder.createReactionCollector(filter)
              baseEmbed.fields = []
              confirmCollector.on('collect', async (reaction) => {
                switch (reaction.emoji.name) {
                  case '✅': {
                    confirmCollector.stop('Confirmado')
                    const order = await createOrder({
                      name: orderName,
                      description: orderDescription,
                      price: orderPrice,
                      customer: orderCustomer.id,
                      responsibles: orderResponsibles.map(x => x.id)
                    })
                    await confirmOrder.edit(
                      baseEmbed
                        .setDescription(`**Encomenda Confirmada com sucesso!**\nNúmero do pedido: #${order._id}`)
                        .addFields([
                          {
                            name: 'Nome:',
                            value: order.name,
                            inline: true
                          },
                          {
                            name: 'Descrição:',
                            value: order.description,
                            inline: true
                          },
                          {
                            name: 'Cliente:',
                            value: `<@${order.customer}>`,
                            inline: false
                          },
                          {
                            name: 'Preço:',
                            value: order.price,
                            inline: false
                          },
                          {
                            name: 'Responsáveis:',
                            value: order.responsibles.map(x => `<@${x}>`).join('\n')
                          }
                        ])
                    )
                    const orderChannel = message.guild.channels.cache.get(config.ordersChannel)
                    const imageBuffer = await createOrderImage(order._id)
                    const orderImage = new MessageAttachment(imageBuffer, `order-${order._id}.png`)
                    await orderChannel.send('╔══════════════════════════════════╗')
                    await updateUserOrders(orderCustomer.id, order._id)
                    await orderChannel.send(`<@${orderCustomer.id}>`).then(async m => await m.delete())
                    const orderChangelogMessage = await orderChannel.send(orderImage)
                    await orderChannel.send('╚══════════════════════════════════╝')
                    await updateOrder(order._id, 'messageID', orderChangelogMessage.id)

                    message.delete({ timeout: 1000 })
                      .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                    break
                  }
                  case '❌': {
                    confirmCollector.stop('Cancelado')
                    await confirmOrder.edit(
                      baseEmbed
                        .setDescription('**Encomenda Cancelada com sucesso!**')
                    ).then(msg =>
                      msg.delete({ timeout: 60000 })
                        .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                        .then(() =>
                          message.delete({ timeout: 100 })
                            .catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
                        )
                    )
                    break
                  }
                }
              })
            })
          }
        )
      })
    })
  }
}
