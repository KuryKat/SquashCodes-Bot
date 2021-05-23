// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js')
const { updateRole } = require('../../../utils/manageStart')

/**
 *
 * @param {Client} client
 */
module.exports = function (client) {
  client.on('guildMemberUpdate', (_oldMember, newMember) => {
    updateRole(newMember)
  })
}
