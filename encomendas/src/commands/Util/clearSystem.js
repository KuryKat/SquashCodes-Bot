// eslint-disable-next-line no-unused-vars
const { Client, Message, Constants, MessageEmbed } = require('discord.js')
const { unlink, readdir } = require('fs/promises')
const { join } = require('path')
const { OrderModel, UserModel, ConfigModel } = require('../../modules/database')
const { getUser } = require('../../utils/database/user')
const { Roles } = require('../../utils/enums')

module.exports = {
  names: ['deathend'],
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
    const logEmbed = new MessageEmbed().setDescription('Aguarde...').setColor('GREEN')
    const logMessage = await message.channel.send(logEmbed)

    try {
      const files = await readdir(join(__dirname, '../../images/', '/cache/'))
      files.forEach(async file => {
        await unlink(join(__dirname, '../../images/', '/cache/', file))
      })
      let aidString = 'Limpando Cache de Imagens\n'
      await logMessage.edit(logEmbed.setDescription(aidString))

      aidString += 'Limpando Encomendas da Database\n'
      await OrderModel.deleteMany({})
      await logMessage.edit(logEmbed.setDescription(aidString))

      aidString += 'Limpando Usuários da Database\n'
      await UserModel.deleteMany({})
      await logMessage.edit(logEmbed.setDescription(aidString))

      aidString += 'Limpando Configurações da Database\n'
      await ConfigModel.deleteMany({})
      await logMessage.edit(logEmbed.setDescription(aidString))

      setTimeout(async () => {
        await logMessage.edit(logEmbed.setDescription('Obrigado pela paciência :)\nEste bot irá morrer daqui 3 segundos....'))
          .then(m => m.delete({ timeout: 3000 }).catch(error => error.code === Constants.APIErrors.UNKNOWN_MESSAGE ? null : console.error(error)))
        process.exit(69)
      }, 5000)
    } catch (error) {
      logMessage.edit(logEmbed.setDescription(`**Ocorreu um erro ao executar o deathend:**\n\`\`"${error.code}:${error.message}"\`\``))
    }
  }
}
