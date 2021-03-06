// eslint-disable-next-line no-unused-vars
const { Client, Message, Constants, MessageEmbed, CategoryChannel, TextChannel } = require('discord.js')
const { unlink, readdir } = require('fs/promises')
const { join } = require('path')
const { OrderModel, UserModel, ConfigModel, ImageReferencesModel } = require('../../modules/database')
const { getUser } = require('../../utils/database/user')
const { Roles } = require('../../utils/enums')
const config = require(join(__dirname, '../../../../user/', 'config.js'))

module.exports = {
  names: ['deadend'],
  help: {
    visible: false
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    const member = await getUser(message.author.id)
    if (member.details.role < Roles.OWNER) return

    await message.delete().catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error))
    const deathConfirmation = await message.channel.send(
      new MessageEmbed()
        .setTitle('VOCÊ TEM CERTEZA??')
        .setDescription('Este comando irá limpar todos os dados da sua database\n(incluindo os canais de encomenda e imagens cacheadas)')
    )

    await deathConfirmation.react('✅')
    setTimeout(async () => {
      await deathConfirmation.react('❌')
    }, 500)

    const filter = (_reaction, user) => user.id === message.author.id
    const deathCollector = deathConfirmation.createReactionCollector(filter)

    deathCollector.on('collect', async (reaction) => {
      switch (reaction.emoji.name) {
        case '✅': {
          deathCollector.stop('DEAD END!')
          deathConfirmation.edit(deathConfirmation.embeds[0].setTitle('').setDescription('Okay, você quem pediu por isso...'))
            .then(msg => msg.delete({ timeout: 5000 }).catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error)))

          const logEmbed = new MessageEmbed().setDescription('Aguarde...').setColor('GREEN')
          const logMessage = await message.channel.send(logEmbed)
          const CACHE_DIRECTORY = join(__dirname, '../../images/', '/cache/')
          const ARCHIVE_DIRECTORY = join(__dirname, '../../images/', '/archive/')
          try {
            let aidString = ''
            let complexTimeout = 0
            setTimeout(async () => {
              aidString += 'Limpando Cache de Imagens\n'
              const files = await readdir(CACHE_DIRECTORY)
              if (files.length > 0) files.forEach(async file => await unlink(`${CACHE_DIRECTORY}${file}`))
              await logMessage.edit(logEmbed.setDescription(aidString))
              setTimeout(async () => {
                aidString += 'Limpando Imagens Arquivadas\n'
                const files = await readdir(ARCHIVE_DIRECTORY)
                if (files.length > 0) files.forEach(async file => await unlink(`${ARCHIVE_DIRECTORY}${file}`))
                await logMessage.edit(logEmbed.setDescription(aidString))
                setTimeout(async () => {
                  aidString += 'Limpando "Referências de Imagens" da Database\n'
                  await ImageReferencesModel.deleteMany({}).exec()
                  await logMessage.edit(logEmbed.setDescription(aidString))

                  setTimeout(async () => {
                  /**
                   * @type {TextChannel}
                   */
                    const ordersFirstChannel = message.guild.channels.cache.find(channel => !channel.parent ? null : channel.parent.id === config.ordersCategory)
                    if (ordersFirstChannel) {
                      aidString += 'Limpando Canais de Encomendas\n'
                      ordersFirstChannel.parent.children.array().forEach((channel, index) => {
                        setTimeout(async () => {
                          await channel.delete('Dead End!')
                        }, index * 1000)
                      })
                      complexTimeout = ordersFirstChannel.parent.children.array().length
                      await logMessage.edit(logEmbed.setDescription(aidString))
                    }

                    setTimeout(async () => {
                      aidString += 'Limpando Encomendas da Database\n'
                      await OrderModel.deleteMany({}).exec()
                      await logMessage.edit(logEmbed.setDescription(aidString))

                      setTimeout(async () => {
                        aidString += 'Limpando Usuários da Database\n'
                        await UserModel.deleteMany({}).exec()
                        await logMessage.edit(logEmbed.setDescription(aidString))

                        setTimeout(async () => {
                          aidString += 'Limpando Configurações da Database\n'
                          await ConfigModel.deleteMany({}).exec()
                          await logMessage.edit(logEmbed.setDescription(aidString))

                          setTimeout(async () => {
                            await logMessage.edit(logEmbed.setDescription('Obrigado pela paciência :)\nEste bot irá morrer daqui 3 segundos....'))
                              .then(m => m.delete({ timeout: 3000 }).catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error)))
                            process.exit(69)
                          }, 5000)
                        }, 1000)
                      }, 1000)
                    }, complexTimeout * 1000)
                  }, complexTimeout * 1000)
                }, 1000)
              }, 1000)
            }, 1000)
          } catch (error) {
            logMessage.edit(logEmbed.setDescription(`**Ocorreu um erro ao executar o dead end:**\n\`\`"${error.message}"\n\n${error.stack}\`\``))
          }
          break
        }
        case '❌': {
          deathCollector.stop('Boa escolha!')
          deathConfirmation.edit(deathConfirmation.embeds[0].setTitle('').setDescription('Me parece que você ainda tem um pouco de bom senso...'))
            .then(msg => msg.delete({ timeout: 30000 }).catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error)))
          break
        }
      }
    })
  }
}
