// eslint-disable-next-line no-unused-vars
const { Client, Message } = require('discord.js')
const { CommandStatus } = require('../../utils/objectParser')

module.exports = {
  names: ['finishOrder', 'fo', 'finish'],
  help: {
    description: 'Finaliza uma encomenda e define ela como entregue ou cancelada **[Necessário ser Staffer]**',
    visible: true,
    module: 'Order',
    status: CommandStatus.WIP,
    usage: ['[ID] [\'Entregue\' | \'Cancelada\']']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: function (client, args, message) {
    // TODO: comando para finalizar encomendas (seja por entregue ou cancelada)
    // Modelo do comando:
    // !fo [ID]
  }
}
