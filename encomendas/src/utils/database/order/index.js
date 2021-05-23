const { getUser } = require('../user')
const { OrderModel } = require('../../../modules/database')
const IDGenerator = require('../../IDgenerator')
const { Order } = require('../../objectParser')

const IDManager = new IDGenerator(1)

async function createOrder (newOrder) {
  await getUser(newOrder.customer)
  newOrder.responsibles.map(async x => await getUser(x))

  const createdOrder = new OrderModel({ _id: IDManager.value, ...newOrder })
  IDManager.next()
  return new Order(await createdOrder.save(), false, false)
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

  return new Order(await query.exec(), populateCustomer, populateResponsibles)
}

/**
 * @param {String} id
 * @param {'messageID' | 'name' | 'description' | 'price' | 'responsibles'} updateItem Item that gonna be updated
 */
async function updateOrder (id, updateItem, newValue) {
  const itemToUpdate = await OrderModel.findById(id).exec()
  itemToUpdate[updateItem] = newValue
  return new Order(await itemToUpdate.save())
}

async function deleteOrder (id) {
  throw new Error('Not Implemented')
}

module.exports = {
  createOrder, getOrder, updateOrder, deleteOrder
}
