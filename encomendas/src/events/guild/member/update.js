// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js')
const { updateRole } = require('../../../utils/manageStart')
const { join } = require('path')
const config = require(join(__dirname, '../../../../../user/', 'config.js'))
/**
 *
 * @param {Client} client
 */
module.exports = function (client) {
  client.on('guildMemberUpdate', (_oldMember, newMember) => {
    if (newMember.guild.id !== config.guild) return
    if (newMember.user.bot) return
    updateRole(newMember)
  })
}
