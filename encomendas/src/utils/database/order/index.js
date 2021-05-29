const { getUser } = require('../user')
const { OrderModel } = require('../../../modules/database')
const IDGenerator = require('../../IDgenerator')
const { Order } = require('../../usefulObjects')

const IDManager = new IDGenerator(1)

async function createOrder (newOrder) {
  await getUser(newOrder.customer)
  newOrder.responsibles.map(async x => await getUser(x))

  const createdOrder = new OrderModel({ _id: IDManager.value, ...newOrder })
  IDManager.next()
  return new Order(await createdOrder.save(), false, false)
}

async function getAllOrders () {
  return (await OrderModel.find({}).exec()).map(order => new Order(order))
}

async function getOrder (id, populateCustomer, populateResponsibles) {
  let query = OrderModel.findById(id)

  if (populateCustomer) {
    query = query
      .populate('customer')
  }

  if (populateResponsibles) {
    query = query
      .populate('responsibles')
  }

  const foundOrder = await query.exec()
  if (!foundOrder) return

  return new Order(foundOrder, populateCustomer, populateResponsibles)
}

/**
 * @param {String} id
 * @param {'logImage:message' | 'logImage:channel' | 'name' | 'description' | 'price' | 'responsibles'} updateItem Item that gonna be updated
 */
async function updateOrder (id, updateItem, newValue) {
  const itemToUpdate = await OrderModel.findById(id).exec()

  if (updateItem.startsWith('logImage')) {
    updateItem = updateItem.slice(updateItem.indexOf(':')).replace(':', '')
    itemToUpdate.logImage[updateItem] = newValue
    return new Order(await itemToUpdate.save())
  }

  itemToUpdate[updateItem] = newValue
  return new Order(await itemToUpdate.save())
}

/**
 * @param {String} id
 * @param {'open' | 'development' | 'delivered' | 'canceled'} status
 */
async function updateOrderStatus (id, status) {
  const itemToUpdate = await OrderModel.findById(id).exec()

  itemToUpdate.status = status
  return new Order(await itemToUpdate.save())
}

module.exports = {
  createOrder,
  getOrder,
  updateOrder,
  getAllOrders,
  updateOrderStatus
}
