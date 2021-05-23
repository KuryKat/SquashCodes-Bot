const { createUser, getUser, updateUser } = require('./user')
const { createOrder, deleteOrder, getOrder, updateOrder } = require('./order')

module.exports = {
  createUser,
  getUser,
  updateUser,
  createOrder,
  deleteOrder,
  getOrder,
  updateOrder
}
