// eslint-disable-next-line no-unused-vars
const { Client, Message, Constants, MessageEmbed } = require('discord.js')
const { unlink, readdir } = require('fs/promises')
const { join } = require('path')
const { OrderModel, UserModel, ConfigModel } = require('../modules/database')
const config = require(join(__dirname, '../../../user/', 'config.js'))

module.exports = {
  names: ['deathend'],
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    if (!config.owners.includes(message.author.id)) return
    await message.delete()

    const logEmbed = new MessageEmbed().setDescription('Aguarde...').setColor('GREEN')
    const logMessage = await message.channel.send(logEmbed)

    const files = await readdir(join(__dirname, '../images/', '/cache/'))
    files.forEach(async file => {
      await unlink(join(__dirname, '../images/', '/cache/', file))
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
      process.exit()
    }, 3000)
  }
}
