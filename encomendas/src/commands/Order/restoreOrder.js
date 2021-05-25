// eslint-disable-next-line no-unused-vars
const { Client, Message } = require('discord.js')
const { CommandStatus } = require('../../utils/objectParser')

module.exports = {
  names: ['restoreOrder', 'ro', 'restore'],
  help: {
    description: 'Restaura uma encomenda e atualiza/retoma ela **[Necessário ser Staffer]**',
    visible: true,
    module: 'Order',
    status: CommandStatus.WIP,
    usage: ['[ID]']
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: function (client, args, message) {
    // TODO: comando para restaurar encomendas arquivadas (seja por finalizada ou por entregue)
    // Modelo do comando:
    // !ro [ID]
  }
}
