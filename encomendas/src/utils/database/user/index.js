const { getUser: getDiscordUser } = require('../../../modules/discord-api')
const { UserModel } = require('../../../modules/database')
const { User } = require('../../usefulObjects')

async function createUser (id) {
  const newUser = await getDiscordUser(id)
  if (newUser.bot) return
  const createdUser = new UserModel({ _id: newUser.id, ...newUser })
  return new User(await createdUser.save())
}

async function getUser (id, populateOrders) {
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
  try {
    const user = await getUser(id)
    user.details.role = newRole
    await UserModel.updateOne({ _id: id }, user).exec()
    return true
  } catch (err) {
    return false
  }
}

async function updateUserOrders (id, orderID) {
  try {
    const user = await getUser(id)
    user.orders.push(orderID)
    user.orders = [...new Set(user.orders)]
    await UserModel.updateOne({ _id: id }, user).exec()
    return true
  } catch (err) {
    return false
  }
}

module.exports = {
  getUser, updateUserRole, updateUserOrders
}
