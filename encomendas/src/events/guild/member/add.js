// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js')
const { updateRole } = require('../../../utils/manageRoles')

/**
 *
 * @param {Client} client
 */
module.exports = function (client) {
  client.on('guildMemberAdd', (newMember) => {
    updateRole(newMember)
  })
}
