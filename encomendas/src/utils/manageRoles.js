/* eslint-disable no-unused-vars */

// Criar uma função unica que será chamada:
// - no evento de adicionar/remover cargos
// - quando um usuário for cadastrado verificar a role dele tbm

const { Collection, GuildMember, Snowflake } = require('discord.js')
const { updateUser } = require('./database/user')
const { Roles } = require('./rolesEnum')
const { join } = require('path')
const config = require(join(__dirname, '../../../user/', 'config.js'))

/**
 *
 * @param {Collection<Snowflake, GuildMember} members
 */
async function cacheRoles (members, log) {
  log.info('[ENCOMENDAS] CACHEANDO CARGOS')
  members.map(async m => {
    if (m.user.bot) return

    if (m.roles.cache.has(config.staff_role)) {
      await updateUser(m.id, Roles.SELLER)
    } else {
      await updateUser(m.id, Roles.MEMBER)
    }
    config.owners.forEach(async o => m.id === o ? await updateUser(m.id, Roles.OWNER) : null)
  })

  log.info('[ENCOMENDAS] CARGOS CACHEADOS')
}

/**
 * @param {GuildMember} member
 */
async function updateRole (member) {
  if (member.roles.cache.has(config.staff_role)) {
    await updateUser(member.id, Roles.SELLER)
  } else {
    await updateUser(member.id, Roles.MEMBER)
  }

  config.owners.forEach(async ownerID => member.id === ownerID ? await updateUser(member.id, Roles.OWNER) : null)
}

module.exports = { cacheRoles, updateRole }
