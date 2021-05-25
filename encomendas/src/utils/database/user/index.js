const { getUser: getDiscordUser } = require('../../../modules/discord-api')
const { UserModel } = require('../../../modules/database')
const { User } = require('../../objectParser')

async function createUser (id) {
  const newUser = await getDiscordUser(id)
  if (newUser.bot) return
  const createdUser = new UserModel({ _id: newUser.id, ...newUser })
  return new User(await createdUser.save())
}

async function getUser (id, populateOrders = false) {
  let query = UserModel.findById(id)
  if (populateOrders) {
    query = query
      .populate('orders')
  }

  let foundUser = await query.exec()

  if (!foundUser) {
    foundUser = await createUser(id)
  }

  return new User(foundUser, populateOrders)
}

async function updateUserRole (id, newRole) {
  const user = await getUser(id)
  user.details.role = newRole
  return await UserModel.updateOne({ _id: id }, user)
}

async function updateUserOrders (id, orderID) {
  const user = await getUser(id)
  user.orders.push(orderID)
  user.orders = [...new Set(user.orders)]
  return await UserModel.updateOne({ _id: id }, user)
}

module.exports = {
  createUser, getUser, updateUserRole, updateUserOrders
}
