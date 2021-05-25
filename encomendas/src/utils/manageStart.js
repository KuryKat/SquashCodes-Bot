/* eslint-disable no-unused-vars */

// Criar uma função unica que será chamada:
// - no evento de adicionar/remover cargos
// - quando um usuário for cadastrado verificar a role dele tbm

const { Collection, GuildMember, Snowflake } = require('discord.js')
const { updateUserRole, updateUserOrders } = require('./database/user')
const { Roles } = require('./enums')
const { join } = require('path')
const { getAllOrders } = require('./database/order')
const config = require(join(__dirname, '../../../user/', 'config.js'))

/**
 *
 * @param {Collection<Snowflake, GuildMember} members
 */
async function cacheRolesAndOrders (members, log) {
  log.info('[ENCOMENDAS] CACHEANDO CARGOS')
  members.map(async m => {
    if (m.user.bot) return

    if (m.roles.cache.has(config.staff_role)) {
      await updateUserRole(m.id, Roles.SELLER)
    } else if (m.roles.cache.has(config.customers_role)) {
      await updateUserRole(m.id, Roles.CUSTOMER)
    } else {
      await updateUserRole(m.id, Roles.MEMBER)
    }

    config.owners.forEach(async o => m.id === o ? await updateUserRole(m.id, Roles.OWNER) : null)
  })

  log.info('[ENCOMENDAS] CARGOS CACHEADOS')

  log.info('[ENCOMENDAS] CACHEANDO ENCOMENDAS')
  getAllOrders()
    .then(orders => {
      orders.forEach(async order => {
        await updateUserOrders(order.customer, order._id)
      })
    })
  log.info('[ENCOMENDAS] ENCOMENDAS CACHEADAS')
}

/**
 * @param {GuildMember} member
 */
async function updateRole (member) {
  if (member.roles.cache.has(config.staff_role)) {
    await updateUserRole(member.id, Roles.SELLER)
  } else if (member.roles.cache.has(config.customers_role)) {
    await updateUserRole(member.id, Roles.CUSTOMER)
  } else {
    await updateUserRole(member.id, Roles.MEMBER)
  }

  config.owners.forEach(async ownerID => member.id === ownerID ? await updateUserRole(member.id, Roles.OWNER) : null)
}

module.exports = { cacheRolesAndOrders, updateRole }
