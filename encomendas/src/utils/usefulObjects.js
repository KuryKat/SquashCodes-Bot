class User {
  /**
   *
   * @param {{_id: String, username: String, discriminator: String, orders: String[], details: UserDetails}} param0
   * @param {Boolean} populateOrders
   */
  constructor ({
    _id,
    username,
    discriminator,
    orders,
    details
  }, populateOrders) {
    this._id = _id
    this.username = username
    this.discriminator = discriminator
    if (populateOrders) {
      this.orders = orders.map((x) => new Order(x, false))
    } else {
      this.orders = orders
    }
    this.details = new UserDetails(details)
  }
}

class UserDetails {
  /**
   *
   * @param {{role: Number}} param0
   */
  constructor ({ role }) {
    this.role = role
  }
}

class Order {
  /**
   *
   * @param {{_id: String, name: String, description: String, logImage: OrderLogImage, status: 'open' | 'development' | 'delivered' | 'canceled', customer: String, price: String, responsibles: String[]}} param0
   * @param {Boolean} populateCustomer
   * @param {Boolean} populateResponsibles
   */
  constructor ({
    _id,
    name,
    description,
    logImage,
    status,
    customer,
    price,
    responsibles
  }, populateCustomer, populateResponsibles) {
    this._id = _id
    this.name = name
    this.description = description
    this.logImage = new OrderLogImage(logImage)
    this.status = status
    if (populateCustomer) {
      this.customer = new User(customer, false)
    } else {
      this.customer = customer
    }
    this.price = price
    if (populateResponsibles) {
      this.responsibles = responsibles.map(x => new User(x, false))
    } else {
      this.responsibles = responsibles
    }
  }
}

class OrderLogImage {
  /**
   *
   * @param {{channel: String, message: String}} param0
   */
  constructor ({ channel, message }) {
    this.channel = channel
    this.message = message
  }
}

const CommandStatus = {
  UNDEFINED: '❓',
  ONLINE: '🟢',
  WIP: '🟡',
  FIX: '🔴'
}

const headers = {
  MAKEORDER: 'Primeira fase de desenvolvimento - Encomendar pedido',
  DEVELOPMENT: 'Segunda fase de desenvolvimento - Desenvolver pedido',
  DELIVER: 'Terceira fase de desenvolvimento - Entregar pedido',
  OTHER: 'Outros'
}

module.exports = {
  User, Order, CommandStatus, headers
}
