const Roles = {
  MEMBER: 0,
  CUSTOMER: 1,
  SELLER: 2,
  OWNER: 3
}

const OrderHeaders = {
  MAKEORDER: 0,
  DEVELOPMENT: 1,
  DELIVER: 2,
  OTHER: 3
}

const OrderStatus = {
  OPEN: 0,
  DEVELOPMENT: 1
}

const OrderFinishStatus = {
  DELIVERED: 0,
  CANCELED: 1
}

Object.freeze(Roles)
Object.freeze(OrderHeaders)
Object.freeze(OrderStatus)
Object.freeze(OrderFinishStatus)

module.exports = { OrderHeaders, Roles, OrderFinishStatus, OrderStatus }
