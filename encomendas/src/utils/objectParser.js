class User {
  /**
   *
   * @param {{_id: String, username: String, discriminator: String, orders: String[], details: UserDetails}} param0
   * @param {Boolean} populateCustomer
   * @param {Boolean} populateResponsibles
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
  constructor ({ role }) {
    this.role = role
  }
}

class Order {
  /**
   *
   * @param {{_id: String, name: String, description: String, customer: String, price: String, responsibles: String[]}} param0
   * @param {Boolean} populateCustomer
   * @param {Boolean} populateResponsibles
   */
  constructor ({
    _id,
    messageID,
    name,
    description,
    customer,
    price,
    responsibles
  }, populateCustomer, populateResponsibles) {
    this._id = _id
    this.messageID = messageID
    this.name = name
    this.description = description
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

module.exports = {
  User, Order
}
